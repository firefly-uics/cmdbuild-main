package unit.auth;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.only;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.withSettings;

import org.cmdbuild.auth.ClientRequestAuthenticator;
import org.cmdbuild.auth.ClientRequestAuthenticator.ClientRequest;
import org.cmdbuild.auth.ClientRequestAuthenticator.Response;
import org.cmdbuild.auth.DefaultAuthenticationService;
import org.cmdbuild.auth.DefaultAuthenticationService.ClientAuthenticatorResponse;
import org.cmdbuild.auth.DefaultAuthenticationService.Configuration;
import org.cmdbuild.auth.DefaultAuthenticationService.PasswordCallback;
import org.cmdbuild.auth.Login;
import org.cmdbuild.auth.PasswordAuthenticator;
import org.cmdbuild.auth.UserFetcher;
import org.cmdbuild.auth.UserStore;
import org.cmdbuild.auth.user.AnonymousUser;
import org.cmdbuild.auth.user.AuthenticatedUser;
import org.cmdbuild.auth.user.CMUser;
import org.cmdbuild.auth.user.OperationUser;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import com.google.common.collect.Sets;

@RunWith(MockitoJUnitRunner.class)
public class AuthenticationServiceTest {

	private static final Login LOGIN = Login.newInstance("Any User");
	private static final Login WRONG_LOGIN = Login.newInstance("Inexistent User");
	private static final String PASSWORD = "cleartext password";
	private static final String WRONG_PASSWORD = "wrong password";
	private static final AuthenticatedUser ANONYMOUS_USER = new AnonymousUser();

	@Mock
	private PasswordAuthenticator passwordAuthenticatorMock;
	@Mock
	private ClientRequestAuthenticator clientRequestAuthenticatorMock;
	@Mock
	private UserFetcher userFectcherMock;
	@Mock
	private UserStore userStoreMock;
	@Mock
	private CMUser user;

	/*
	 * Constructor and setters
	 */

	@Test(expected = java.lang.IllegalArgumentException.class)
	public void configurationMustBeNotNull() {
		final DefaultAuthenticationService as = new DefaultAuthenticationService(null);
	}

	@Test(expected = java.lang.IllegalArgumentException.class)
	public void passwordAuthenticatorsMustBeNotNull() {
		final DefaultAuthenticationService as = new DefaultAuthenticationService();
		as.setPasswordAuthenticators((PasswordAuthenticator[]) null);
	}

	@Test(expected = java.lang.IllegalArgumentException.class)
	public void passwordAuthenticatorsMustHaveNotNullElements() {
		final DefaultAuthenticationService as = new DefaultAuthenticationService();
		as.setPasswordAuthenticators(new PasswordAuthenticator[] { null });
	}

	@Test(expected = java.lang.IllegalArgumentException.class)
	public void clientRequestAuthenticatorsMustBeNotNull() {
		final DefaultAuthenticationService as = new DefaultAuthenticationService();
		as.setClientRequestAuthenticators((ClientRequestAuthenticator[]) null);
	}

	@Test(expected = java.lang.IllegalArgumentException.class)
	public void clientRequestAuthenticatorsMustHaveNotNullElements() {
		final DefaultAuthenticationService as = new DefaultAuthenticationService();
		as.setClientRequestAuthenticators(new ClientRequestAuthenticator[] { null });
	}

	@Test(expected = java.lang.IllegalArgumentException.class)
	public void userFetchersMustBeNotNull() {
		final DefaultAuthenticationService as = new DefaultAuthenticationService();
		as.setUserFetchers((UserFetcher[]) null);
	}

	@Test(expected = java.lang.IllegalArgumentException.class)
	public void userFetchersMustHaveNotNullElements() {
		final DefaultAuthenticationService as = new DefaultAuthenticationService();
		as.setUserFetchers(new UserFetcher[] { null });
	}

	@Test(expected = java.lang.IllegalArgumentException.class)
	public void userStoreMustBeNotNull() {
		final DefaultAuthenticationService as = new DefaultAuthenticationService();
		as.setUserStore(null);
	}

	/*
	 * Login and password
	 */

	@Test
	public void passwordAuthReturnsAnonymousUserIfNoAuthenticatorIsDefined() {
		final DefaultAuthenticationService as = emptyAuthenticatorService();
		assertTrue(as.authenticate(LOGIN, PASSWORD).isAnonymous());
		assertTrue(as.authenticate(LOGIN, WRONG_PASSWORD).isAnonymous());
	}

	@Test
	public void passwordAuthReturnsAnonymousUserOnAuthFailure() {
		// given
		final DefaultAuthenticationService as = mockedAuthenticatorService();
		when(passwordAuthenticatorMock.checkPassword(LOGIN, PASSWORD)).thenReturn(Boolean.TRUE);

		// when
		final AuthenticatedUser wrongPasswordUser = as.authenticate(LOGIN, WRONG_PASSWORD);
		final AuthenticatedUser wrongLoginUser = as.authenticate(WRONG_LOGIN, PASSWORD);

		// then
		assertTrue(wrongPasswordUser.isAnonymous());
		assertTrue(wrongLoginUser.isAnonymous());
		verify(passwordAuthenticatorMock, times(1)).checkPassword(LOGIN, WRONG_PASSWORD);
		verify(passwordAuthenticatorMock, times(1)).checkPassword(WRONG_LOGIN, PASSWORD);
		verify(userFectcherMock, never()).fetchUser(any(Login.class));
		verify(passwordAuthenticatorMock, never()).getPasswordChanger(any(Login.class));
	}

	@Test
	public void passwordAuthReturnsAnonymousUserOnUserFetchFailure() {
		// given
		final DefaultAuthenticationService as = mockedAuthenticatorService();
		when(passwordAuthenticatorMock.checkPassword(LOGIN, PASSWORD)).thenReturn(Boolean.TRUE);
		final AuthenticatedUser authUser = as.authenticate(LOGIN, PASSWORD);

		// when
		assertTrue(authUser.isAnonymous());

		// then
		verify(passwordAuthenticatorMock, only()).checkPassword(any(Login.class), anyString());
		verify(userFectcherMock, only()).fetchUser(any(Login.class));
	}

	@Test
	public void passwordAuthReturnsAnAuthenticatedUserOnSuccess() {
		// given
		final DefaultAuthenticationService as = mockedAuthenticatorService();
		when(passwordAuthenticatorMock.checkPassword(LOGIN, PASSWORD)).thenReturn(Boolean.TRUE);
		when(userFectcherMock.fetchUser(LOGIN)).thenReturn(user);
		final AuthenticatedUser authUser = as.authenticate(LOGIN, PASSWORD);

		// when
		assertThat(authUser, is(not(anonymousUser())));

		// then
		verify(passwordAuthenticatorMock, times(1)).checkPassword(LOGIN, PASSWORD);
		verify(userFectcherMock, only()).fetchUser(LOGIN);
	}

	/*
	 * Login and PasswordCallback
	 */

	@Test
	public void passwordCallbackAuthDoesNothingIfNoAuthenticatorIsDefined() {
		// given
		final DefaultAuthenticationService as = emptyAuthenticatorService();
		final PasswordCallback pwc = mock(PasswordCallback.class);

		// when
		as.authenticate(LOGIN, pwc);

		// then
		verify(pwc, never()).setPassword(anyString());
	}

	@Test
	public void passwordCallbackAuthDoesNotSetCallbackObjectPasswordOnAuthFailure() {
		// given
		final DefaultAuthenticationService as = mockedAuthenticatorService();
		final PasswordCallback pwc = mock(PasswordCallback.class);

		// when
		as.authenticate(WRONG_LOGIN, pwc);

		// then
		verify(pwc, never()).setPassword(anyString());
		verify(passwordAuthenticatorMock, only()).fetchUnencryptedPassword(WRONG_LOGIN);
		verify(userFectcherMock, never()).fetchUser(any(Login.class));
	}

	@Test
	public void passwordCallbackAuthDoesNotSetCallbackObjectPasswordOnFetchFailure() {
		// given
		final DefaultAuthenticationService as = mockedAuthenticatorService();
		final PasswordCallback pwc = mock(PasswordCallback.class);
		when(passwordAuthenticatorMock.fetchUnencryptedPassword(LOGIN)).thenReturn(PASSWORD);

		// when
		as.authenticate(LOGIN, pwc);

		// then
		verify(pwc, never()).setPassword(anyString());
		verify(passwordAuthenticatorMock, only()).fetchUnencryptedPassword(LOGIN);
		verify(userFectcherMock, only()).fetchUser(LOGIN);
	}

	@Test
	public void passwordCallbackAuthSetsCallbackObjectPasswordOnSuccess() {
		// given
		final DefaultAuthenticationService as = mockedAuthenticatorService();
		final PasswordCallback pwc = mock(PasswordCallback.class);
		when(passwordAuthenticatorMock.fetchUnencryptedPassword(LOGIN)).thenReturn(PASSWORD);
		when(userFectcherMock.fetchUser(LOGIN)).thenReturn(user);

		// when
		as.authenticate(LOGIN, pwc);

		// then
		verify(pwc, only()).setPassword(PASSWORD);
		verify(passwordAuthenticatorMock, times(1)).fetchUnencryptedPassword(LOGIN);
		verify(userFectcherMock, only()).fetchUser(LOGIN);
		verify(passwordAuthenticatorMock, times(1)).getPasswordChanger(LOGIN);
	}

	/*
	 * ClientRequest
	 */

	@Test
	public void clientRequestAuthReturnsAnonymousUserIfNoAuthenticatorIsDefined() {
		// given
		final DefaultAuthenticationService as = emptyAuthenticatorService();
		final ClientRequest request = mock(ClientRequest.class);
		final ClientAuthenticatorResponse authResponse = as.authenticate(request);

		// when
		assertTrue(authResponse.getUser().isAnonymous());

		// then
		verify(request, never()).getHeader(anyString());
		verify(request, never()).getParameter(anyString());
	}

	@Test
	public void clientRequestAuthReturnsAnonymousUserOnAuthFailure() {
		// given
		final DefaultAuthenticationService as = mockedAuthenticatorService();
		final ClientRequest request = mock(ClientRequest.class);
		when(clientRequestAuthenticatorMock.authenticate(request)).thenReturn(null);
		final ClientAuthenticatorResponse authResponse = as.authenticate(request);

		// when
		assertTrue(authResponse.getUser().isAnonymous());

		// then
		verify(clientRequestAuthenticatorMock, only()).authenticate(request);
		verify(userFectcherMock, never()).fetchUser(any(Login.class));
	}

	@Test
	public void clientRequestAuthReturnsAnonymousUserOnUserFetchFailure() {
		// given
		final DefaultAuthenticationService as = mockedAuthenticatorService();
		final ClientRequest request = mock(ClientRequest.class);
		when(clientRequestAuthenticatorMock.authenticate(request)).thenReturn(Response.newLoginResponse(LOGIN));
		final ClientAuthenticatorResponse authResponse = as.authenticate(request);

		// when
		assertTrue(authResponse.getUser().isAnonymous());

		// then
		verify(clientRequestAuthenticatorMock, only()).authenticate(request);
		verify(userFectcherMock, only()).fetchUser(LOGIN);
	}

	@Test
	public void clientRequestAuthReturnsAnAuthenticatedUserOnSuccess() {
		// given
		final DefaultAuthenticationService as = mockedAuthenticatorService();
		final ClientRequest request = mock(ClientRequest.class);
		when(clientRequestAuthenticatorMock.authenticate(request)).thenReturn(Response.newLoginResponse(LOGIN));
		when(userFectcherMock.fetchUser(LOGIN)).thenReturn(user);
		final ClientAuthenticatorResponse authResponse = as.authenticate(request);

		// when
		assertThat(authResponse.getUser(), is(not(anonymousUser())));

		// then
		verify(clientRequestAuthenticatorMock, only()).authenticate(request);
		verify(userFectcherMock, only()).fetchUser(LOGIN);
	}

	@Test
	public void clientRequestAuthCopiesTheAuthenticatorRedirectUrl() {
		// given
		final DefaultAuthenticationService as = mockedAuthenticatorService();
		final ClientRequest request = mock(ClientRequest.class);
		final String redirectUrl = "http://www.example.com/";
		when(clientRequestAuthenticatorMock.authenticate(request))
				.thenReturn(Response.newRedirectResponse(redirectUrl));

		// when
		final ClientAuthenticatorResponse authResponse = as.authenticate(request);

		// then
		assertThat(authResponse.getRedirectUrl(), is(redirectUrl));
	}

	/*
	 * Configuration
	 */

	@Test
	public void configurationFiltersPasswordAuthenticators() {
		// given
		final PasswordAuthenticator namedAuthenticatorMock = mock(PasswordAuthenticator.class, withSettings().name("b"));
		when(namedAuthenticatorMock.getName()).thenReturn("a");
		final Configuration conf = mock(Configuration.class);
		when(conf.getActiveAuthenticators()).thenReturn(Sets.newHashSet("a"));
		final DefaultAuthenticationService as = new DefaultAuthenticationService(conf);

		// when
		as.setPasswordAuthenticators(passwordAuthenticatorMock, namedAuthenticatorMock);
		as.authenticate(LOGIN, PASSWORD);

		// then
		verify(passwordAuthenticatorMock, never()).checkPassword(any(Login.class), anyString());
		verify(namedAuthenticatorMock, times(1)).checkPassword(any(Login.class), anyString());
	}

	@Test
	public void configurationFiltersPasswordCallbackAuthenticators() {
		// given
		final PasswordAuthenticator namedAuthenticatorMock = mock(PasswordAuthenticator.class, withSettings().name("b"));
		when(namedAuthenticatorMock.getName()).thenReturn("a");
		final Configuration conf = mock(Configuration.class);
		when(conf.getActiveAuthenticators()).thenReturn(Sets.newHashSet("a"));
		final DefaultAuthenticationService as = new DefaultAuthenticationService(conf);

		// when
		as.setPasswordAuthenticators(passwordAuthenticatorMock, namedAuthenticatorMock);
		as.authenticate(LOGIN, mock(PasswordCallback.class));

		// then
		verify(passwordAuthenticatorMock, never()).fetchUnencryptedPassword(any(Login.class));
		verify(namedAuthenticatorMock, times(1)).fetchUnencryptedPassword(any(Login.class));
	}

	@Test
	public void configurationFiltersClientRequestAuthenticators() {
		// given
		final Configuration conf = mock(Configuration.class);
		when(conf.getActiveAuthenticators()).thenReturn(Sets.newHashSet("a"));
		final ClientRequestAuthenticator namedAuthenticatorMock = mock(ClientRequestAuthenticator.class);
		when(namedAuthenticatorMock.getName()).thenReturn("a");
		final DefaultAuthenticationService as = new DefaultAuthenticationService(conf);

		// when
		as.setClientRequestAuthenticators(clientRequestAuthenticatorMock, namedAuthenticatorMock);
		as.authenticate(mock(ClientRequest.class));

		// then
		verify(clientRequestAuthenticatorMock, never()).authenticate(any(ClientRequest.class));
		verify(namedAuthenticatorMock, times(1)).authenticate(any(ClientRequest.class));
	}

	@Test
	public void serviceUsersCannotUseLoginPasswordAuthentication() {
		// given
		final Configuration conf = mock(Configuration.class);
		when(conf.getActiveAuthenticators()).thenReturn(null);
		when(conf.getServiceUsers()).thenReturn(Sets.newHashSet(LOGIN.getValue()));
		final DefaultAuthenticationService as = new DefaultAuthenticationService(conf);
		as.setPasswordAuthenticators(passwordAuthenticatorMock);

		// when
		as.authenticate(LOGIN, PASSWORD);
		as.authenticate(LOGIN, mock(PasswordCallback.class));

		// then
		verify(passwordAuthenticatorMock, never()).checkPassword(LOGIN, PASSWORD);
		verify(passwordAuthenticatorMock, times(1)).fetchUnencryptedPassword(LOGIN);
	}

	/*
	 * Impersonate
	 */

	@Ignore("Impersonate not implemented correctly yet")
	@Test
	public void impersonateIsAllowedOnlyToAdministratorsAndServiceUsers() {
		final Configuration conf = mock(Configuration.class);
		when(conf.getServiceUsers()).thenReturn(Sets.newHashSet("service"));
		final DefaultAuthenticationService as = mockedAuthenticatorService(conf);

		final OperationUser operationUserMock = mock(OperationUser.class);
		when(userStoreMock.getUser()).thenReturn(operationUserMock);
		when(userFectcherMock.fetchUser(LOGIN)).thenReturn(user);

		when(operationUserMock.hasAdministratorPrivileges()).thenReturn(true);
		as.impersonate(LOGIN);

		reset(operationUserMock);
		when(operationUserMock.getAuthenticatedUser().getName()).thenReturn("service");
		as.impersonate(LOGIN);

		reset(operationUserMock);
		try {
			as.impersonate(LOGIN);
			fail("Should have thrown");
		} catch (final UnsupportedOperationException e) {
			// Should throw
		}
	}

	@Test
	public void anExistingUserCanBeImpersonated() {
		// given
		final DefaultAuthenticationService as = mockedAuthenticatorService();
		final OperationUser operationUserMock = mock(OperationUser.class);
		when(operationUserMock.hasAdministratorPrivileges()).thenReturn(true);
		when(userStoreMock.getUser()).thenReturn(operationUserMock);
		when(userFectcherMock.fetchUser(LOGIN)).thenReturn(user);

		// when
		assertThat(as.impersonate(LOGIN), is(operationUserMock));

		// then
		verify(operationUserMock, times(1)).impersonate(user);
	}

	/*
	 * Utility methods
	 */

	private DefaultAuthenticationService emptyAuthenticatorService() {
		final DefaultAuthenticationService as = new DefaultAuthenticationService();
		as.setUserStore(userStoreMock);
		return as;
	}

	private DefaultAuthenticationService mockedAuthenticatorService(final Configuration conf) {
		final DefaultAuthenticationService as = new DefaultAuthenticationService(conf);
		setupMockedAuthenticationService(as);
		return as;
	}

	private DefaultAuthenticationService mockedAuthenticatorService() {
		final DefaultAuthenticationService as = new DefaultAuthenticationService();
		setupMockedAuthenticationService(as);
		return as;
	}

	private void setupMockedAuthenticationService(final DefaultAuthenticationService as) {
		as.setPasswordAuthenticators(passwordAuthenticatorMock);
		as.setClientRequestAuthenticators(clientRequestAuthenticatorMock);
		as.setUserFetchers(userFectcherMock);
		as.setUserStore(userStoreMock);
	}

	private AuthenticatedUser anonymousUser() {
		return ANONYMOUS_USER;
	}
}