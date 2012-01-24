package integration.widget;

import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.containsString;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.only;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.concurrent.TimeoutException;

import org.cmdbuild.elements.widget.Ping;
import org.cmdbuild.elements.widget.AbstractCommandExecutionWidget.ExecuteCommandAction;
import org.cmdbuild.utils.template.TemplateResolver;
import org.junit.Test;

public class PingWidgetTest {

	private class PingTestDouble extends Ping {
		@Override
		public String getCommandLine(TemplateResolver tr) {
			return super.getCommandLine(tr);
		}
	};

	private static final String LOCALHOST;
	private static final String LOCALIP;

	static {
		InetAddress local;
		try {
			local = InetAddress.getLocalHost();
		} catch (UnknownHostException e) {
			local = null;
		}
		if (local != null) {
			LOCALHOST = local.getHostName();
			LOCALIP = local.getHostAddress();
		} else {
			LOCALHOST = "localhost";
			LOCALIP = "127.0.0.1";
		}
	}

	@Test
	public void pingsLocalNumericAddress() throws Exception {
		assertPingsAddress(LOCALIP);
	}

	@Test
	public void pingsLocalhost() throws Exception {
		assertPingsAddress(LOCALHOST);
	}

	// FIXME: very bad test and design
	@Test(timeout=3000, expected=TimeoutException.class)
	public void actionThrowsOnTimeoutExpired() throws Exception {
		TemplateResolver tr = mock(TemplateResolver.class);
		PingTestDouble pingWidget = new PingTestDouble();
		pingWidget.setCount(10);
		when(tr.simpleEval(anyString())).thenReturn(LOCALIP);
		String command = pingWidget.getCommandLine(tr);

		ExecuteCommandAction action = new ExecuteCommandAction(command, 100L);

		action.execute();
	}

	@Test
	public void addressIsConsideredATemplate() throws Exception {
		TemplateResolver tr = mock(TemplateResolver.class);
		PingTestDouble pingWidget = new PingTestDouble();
		pingWidget.setAddress(LOCALHOST);

		pingWidget.getCommandLine(tr);

		verify(tr, only()).simpleEval(LOCALHOST);
	}

	/*
	 * Utils
	 */

	@SuppressWarnings("unchecked")
	private void assertPingsAddress(final String address) throws Exception {
		String result = (String) newPingWidget(address, 1).executeAction(null, null, null);
		assertThat(result.toLowerCase(), allOf(containsString("byte"), containsString("ms"), containsString("ping")));
	}

	private Ping newPingWidget(final String address, int count) {
		Ping pingWidget = new Ping();
		pingWidget.setAddress(address);
		pingWidget.setCount(count);
		return pingWidget;
	}
}