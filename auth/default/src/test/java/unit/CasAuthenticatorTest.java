package unit;

import org.apache.commons.lang.StringUtils;
import org.cmdbuild.auth.ClientRequestAuthenticator;
import org.cmdbuild.auth.ClientRequestAuthenticator.ClientRequest;
import org.cmdbuild.auth.CasAuthenticator;
import org.cmdbuild.auth.CasAuthenticator.CasService;
import org.cmdbuild.auth.CasAuthenticator.Configuration;
import static org.junit.Assert.*;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import org.junit.Ignore;
import static org.mockito.Mockito.*;

import org.junit.Test;

public class CasAuthenticatorTest {

	private static final String REQUEST_URL = "http://cmdbuild.example.com/";

	private final ClientRequest request = mock(ClientRequest.class);
	private final CasService casService = mock(CasService.class);

	@Test(expected = java.lang.IllegalArgumentException.class)
	public void casConfigurationCannotBeNull() {
		CasAuthenticator authenticator = new CasAuthenticator((Configuration) null);
	}

	@Test
	public void doesAuthenticateIfTheTokenIsCorrect() {
		final CasAuthenticator authenticator = new CasAuthenticator(casService);
		final String userForTicket = "i am a user";

		when(casService.getUsernameFromTicket(any(ClientRequest.class))).thenReturn(userForTicket);

		ClientRequestAuthenticator.Response response = authenticator.authenticate(request);

		assertThat(response.getLogin().getValue(), is(userForTicket));
		assertThat(response.getRedirectUrl(), is(nullValue()));
	}

	@Test
	public void redirectToCasServerIfNoCasToken() {
		final CasAuthenticator authenticator = new CasAuthenticator(casService);
		final String redirectUrl = "just a fake redirect url";

		when(request.getRequestUrl()).thenReturn(REQUEST_URL);
		when(casService.getRedirectUrl(any(ClientRequest.class))).thenReturn(redirectUrl);

		ClientRequestAuthenticator.Response response = authenticator.authenticate(request);

		assertThat(response.getLogin(), is(nullValue()));
		assertThat(response.getRedirectUrl(), is(redirectUrl));
	}

	@Ignore
	@Test
	public void redirectToCasServerContainsSkipSso() {
		// How to test it?
	}

	@Test
	public void triesAuthenticationButDoesNotRedirectIfSkipSsoParameterPresent() {
		final CasAuthenticator authenticator = new CasAuthenticator(casService);

		when(request.getParameter(CasAuthenticator.SKIP_SSO_PARAM)).thenReturn(StringUtils.EMPTY);

		ClientRequestAuthenticator.Response response = authenticator.authenticate(request);

		verify(casService, only()).getUsernameFromTicket(any(ClientRequest.class));
	}

}
