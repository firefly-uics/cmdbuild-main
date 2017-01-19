package unit.auth;

import static com.google.common.reflect.Reflection.newProxy;
import static org.cmdbuild.common.utils.PagedElements.empty;
import static org.cmdbuild.common.utils.Reflection.unsupported;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.junit.Assert.assertThat;
import static org.mockito.Matchers.anyBoolean;
import static org.mockito.Matchers.anyInt;
import static org.mockito.Matchers.anyLong;
import static org.mockito.Matchers.anyMapOf;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import java.util.Map;
import java.util.Optional;

import org.cmdbuild.auth.DefaultAuthenticationService;
import org.cmdbuild.auth.UserFetcher;
import org.cmdbuild.auth.user.CMUser;
import org.cmdbuild.auth.user.OperationUser;
import org.cmdbuild.common.utils.PagedElements;
import org.cmdbuild.dao.view.CMDataView;
import org.junit.Test;

import com.google.common.base.Supplier;

public class DefaultAuthenticationServiceTest {

	private static final CMDataView UNUSED_DATAVIEW = newProxy(CMDataView.class, unsupported("should not be used"));
	private static final Supplier<OperationUser> UNUSED_CURRENTUSER =
			newProxy(Supplier.class, unsupported("should not be used"));
	private static final Map<String, Boolean> SORT = newProxy(Map.class, unsupported("should not be used"));

	@Test
	public void emptyUsersListWhenNoUserFetchers() throws Exception {
		// given
		final DefaultAuthenticationService underTest =
				new DefaultAuthenticationService(UNUSED_DATAVIEW, UNUSED_CURRENTUSER);

		// when
		final PagedElements<CMUser> output = underTest.fetchAllUsers(123, 456, SORT, true);

		// then
		assertThat(output, equalTo(empty()));
	}

	@Test
	public void usersListObtainedOnlyFromFirstFetcher() throws Exception {
		// given
		final UserFetcher first = mock(UserFetcher.class);
		final PagedElements<?> outputFromFetcher = mock(PagedElements.class);
		doReturn(outputFromFetcher) //
				.when(first).fetchAllUsers(anyInt(), anyInt(), anyMapOf(String.class, Boolean.class), anyBoolean());
		final UserFetcher second = newProxy(UserFetcher.class, unsupported("should not be used"));
		final DefaultAuthenticationService underTest =
				new DefaultAuthenticationService(UNUSED_DATAVIEW, UNUSED_CURRENTUSER);
		underTest.setUserFetchers(first, second);

		// when
		final Iterable<CMUser> output = underTest.fetchAllUsers(123, 456, SORT, true);

		// then
		verify(first).fetchAllUsers(eq(123), eq(456), eq(SORT), eq(true));
		verifyNoMoreInteractions(first);

		assertThat(output, equalTo(outputFromFetcher));
	}

	@Test
	public void emptyUserPositionWhenNoUserFetchers() throws Exception {
		// given
		final DefaultAuthenticationService underTest =
				new DefaultAuthenticationService(UNUSED_DATAVIEW, UNUSED_CURRENTUSER);

		// when
		final Optional<Long> output = underTest.fetchUserPosition(1L);

		// then
		assertThat(output, equalTo(Optional.empty()));
	}

	@Test
	public void userPositionObtainedOnlyFromFirstFetcher() throws Exception {
		// given
		final UserFetcher first = mock(UserFetcher.class);
		final Optional<Integer> outputFromFetcher = Optional.of(42);
		doReturn(outputFromFetcher) //
				.when(first).fetchUserPosition(anyLong());
		final UserFetcher second = newProxy(UserFetcher.class, unsupported("should not be used"));
		final DefaultAuthenticationService underTest =
				new DefaultAuthenticationService(UNUSED_DATAVIEW, UNUSED_CURRENTUSER);
		underTest.setUserFetchers(first, second);

		// when
		final Optional<Long> output = underTest.fetchUserPosition(1L);

		// then
		verify(first).fetchUserPosition(eq(1L));
		verifyNoMoreInteractions(first);

		assertThat(output, equalTo(outputFromFetcher));
	}

}
