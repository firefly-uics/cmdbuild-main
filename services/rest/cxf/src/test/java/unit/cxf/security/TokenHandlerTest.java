package unit.cxf.security;

import static com.google.common.base.Predicates.alwaysTrue;
import static com.google.common.base.Predicates.not;
import static java.util.Arrays.asList;
import static org.apache.cxf.message.Message.PROTOCOL_HEADERS;
import static org.cmdbuild.service.rest.cxf.security.TokenHandler.TOKEN_HEADER;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;
import static org.mockito.Matchers.anyString;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.apache.cxf.jaxrs.model.ClassResourceInfo;
import org.apache.cxf.message.Message;
import org.cmdbuild.common.collect.ChainablePutMap;
import org.cmdbuild.service.rest.cxf.security.TokenHandler;
import org.junit.Test;

import com.google.common.base.Predicate;

public class TokenHandlerTest {

	private static final Map<String, List<String>> EMPTY_HEADERS = Collections.emptyMap();

	private static final ClassResourceInfo DUMMY_CLASS_RESOURCE_INFO = new ClassResourceInfo(TokenHandlerTest.class);

	private static final Predicate<Class<?>> IS_UNAUTHORIZED = alwaysTrue();
	private static final Predicate<Class<?>> IS_AUTHORIZED = not(IS_UNAUTHORIZED);

	@Test
	public void NullResponseForUnauthorizedServiceAndNoToken() throws Exception {
		// given
		final TokenHandler tokenHandler = new TokenHandler(IS_UNAUTHORIZED);
		final Message message = mock(Message.class);
		doReturn(EMPTY_HEADERS) //
				.when(message).get(anyString());

		// when
		final Response response = tokenHandler.handleRequest(message, DUMMY_CLASS_RESOURCE_INFO);

		// then
		verify(message).get(eq(PROTOCOL_HEADERS));
		assertThat(response, equalTo(null));
	}

	@Test
	public void NullResponseForUnauthorizedServiceAndToken() throws Exception {
		// given
		final TokenHandler tokenHandler = new TokenHandler(IS_UNAUTHORIZED);
		final Message message = mock(Message.class);
		doReturn(headersWithToken()) //
				.when(message).get(anyString());

		// when
		final Response response = tokenHandler.handleRequest(message, DUMMY_CLASS_RESOURCE_INFO);

		// then
		verify(message).get(eq(PROTOCOL_HEADERS));
		assertThat(response, equalTo(null));
	}

	@Test
	public void UnauthorizedResponseForAuthorizedServiceAndNoToken() throws Exception {
		// given
		final TokenHandler tokenHandler = new TokenHandler(IS_AUTHORIZED);
		final Message message = mock(Message.class);
		doReturn(EMPTY_HEADERS) //
				.when(message).get(anyString());

		// when
		final Response response = tokenHandler.handleRequest(message, DUMMY_CLASS_RESOURCE_INFO);

		// then
		verify(message).get(eq(PROTOCOL_HEADERS));
		assertThat(response.getStatus(), equalTo(Status.UNAUTHORIZED.getStatusCode()));
	}

	@Test
	public void NullResponseForAuthorizedServiceAndToken() throws Exception {
		// given
		final TokenHandler tokenHandler = new TokenHandler(IS_AUTHORIZED);
		final Message message = mock(Message.class);
		doReturn(headersWithToken()) //
				.when(message).get(anyString());

		// when
		final Response response = tokenHandler.handleRequest(message, DUMMY_CLASS_RESOURCE_INFO);

		// then
		verify(message).get(eq(PROTOCOL_HEADERS));
		assertThat(response, equalTo(null));
	}

	private Map<String, List<String>> headersWithToken() {
		return ChainablePutMap.of(new HashMap<String, List<String>>()) //
				.chainablePut(TOKEN_HEADER, asList("foo"));
	}

}
