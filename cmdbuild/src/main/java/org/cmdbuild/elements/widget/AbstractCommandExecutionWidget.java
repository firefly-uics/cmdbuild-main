package org.cmdbuild.elements.widget;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.cmdbuild.utils.template.TemplateResolver;
import org.cmdbuild.utils.template.TemplateResolverImpl;

public abstract class AbstractCommandExecutionWidget extends Widget {

	public static class ExecuteCommandAction implements WidgetAction {

		private static final long DEAFULT_TIMEOUT_MS = 30000L;

		private final String command;
		private final long timeout;

		public ExecuteCommandAction(final String command) {
			this(command, DEAFULT_TIMEOUT_MS);
		}

		public ExecuteCommandAction(final String command, long timeout) {
			this.command = command;
			this.timeout = timeout;
		}

		@Override
		public String execute() throws Exception {
			final ExecutorService execService = Executors.newSingleThreadExecutor();
			final Future<String> future = execService.submit(new Callable<String>() {
				@Override
				public String call() throws Exception {
					final Process proc = Runtime.getRuntime().exec(command);
					proc.waitFor();
					return stdOutAsString(proc);
				}
			});
			try {
				return future.get(timeout, TimeUnit.MILLISECONDS);
			} catch (ExecutionException e) {
				throw e;
			} catch (TimeoutException e) {
				execService.shutdownNow();
				throw e;
			}
		}

		private String stdOutAsString(Process proc) throws IOException {
			InputStream is = proc.getInputStream();
			InputStreamReader isr = new InputStreamReader(is);
			BufferedReader br = new BufferedReader(isr);
			StringBuilder buffer = new StringBuilder();
			String line = null;
			while ((line = br.readLine()) != null) {
				buffer.append(line).append("\n");
			}
			return buffer.toString();
		}
	};

	@Override
	protected WidgetAction getActionCommand(final String action, final Map<String, Object> params, final Map<String, Object> dsVars) {
		final TemplateResolver tr = TemplateResolverImpl.newInstance(params, dsVars);
		final String command = getCommandLine(tr);
		return new ExecuteCommandAction(command);
	}

	protected abstract String getCommandLine(TemplateResolver tr);
}