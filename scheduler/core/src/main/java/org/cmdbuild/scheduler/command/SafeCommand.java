package org.cmdbuild.scheduler.command;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

import org.cmdbuild.scheduler.logging.LoggingSupport;
import org.slf4j.Logger;
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;

public class SafeCommand extends ForwardingCommand {

	private static final Logger logger = LoggingSupport.logger;
	private static final Marker marker = MarkerFactory.getMarker(SafeCommand.class.getName());

	public static SafeCommand safe(final Command delegate) {
		return of(delegate);
	}

	public static SafeCommand of(final Command delegate) {
		final Object proxy = Proxy.newProxyInstance( //
				SafeCommand.class.getClassLoader(), //
				new Class<?>[] { Command.class }, //
				new InvocationHandler() {

					@Override
					public Object invoke(final Object proxy, final Method method, final Object[] args) throws Throwable {
						try {
							return method.invoke(delegate, args);
						} catch (final Throwable e) {
							logger.warn(marker, "error calling method '{}'", method);
							logger.warn(marker, "\tcaused by", e);
							return null;
						}
					}

				});
		final Command proxiedAction = Command.class.cast(proxy);
		return new SafeCommand(proxiedAction);
	}

	private SafeCommand(final Command delegate) {
		super(delegate);
	}

}
