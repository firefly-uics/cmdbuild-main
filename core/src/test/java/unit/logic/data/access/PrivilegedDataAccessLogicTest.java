package unit.logic.data.access;

import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyString;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import org.cmdbuild.auth.acl.CMPrivilegedObject;
import org.cmdbuild.auth.acl.PrivilegeContext;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.exception.AuthException;
import org.cmdbuild.logic.data.access.DataAccessLogic;
import org.cmdbuild.logic.data.access.PrivilegedDataAccessLogic;
import org.cmdbuild.model.data.Card;
import org.junit.Test;

public class PrivilegedDataAccessLogicTest {

	@Test
	public void eachCardIsVerifiedBeforeMassiveUpdate() throws Exception {
		// given
		final DataAccessLogic delegate = mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final Collection<Card> cards = new ArrayList<>();
		cards.add(Card.newInstance() //
				.withClassName("foo") //
				.build());
		cards.add(Card.newInstance() //
				.withClassName("bar") //
				.build());
		final CMClass foo = mock(CMClass.class);
		final CMClass bar = mock(CMClass.class);
		doReturn(foo).doReturn(bar) //
				.when(delegate).findClass(anyString());
		doReturn(true) //
				.when(privilegeContext).hasWriteAccess(any(CMPrivilegedObject.class));

		// when
		underTest.updateCards(cards);

		// then
		verify(delegate).findClass(eq("foo"));
		verify(privilegeContext).hasWriteAccess(eq(foo));
		verify(delegate).findClass(eq("bar"));
		verify(privilegeContext).hasWriteAccess(eq(bar));
		verify(delegate).updateCards(eq(cards));
		verifyNoMoreInteractions(delegate, privilegeContext);
	}

	@Test
	public void classHasNoWritePrivilegesOnMassiveUpdate() throws Exception {
		// given
		final DataAccessLogic delegate = mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final Collection<Card> cards = new ArrayList<>();
		cards.add(Card.newInstance() //
				.withClassName("foo") //
				.build());
		final CMClass foo = mock(CMClass.class);
		doReturn(foo) //
				.when(delegate).findClass(anyString());
		doReturn(false) //
				.when(privilegeContext).hasWriteAccess(any(CMPrivilegedObject.class));

		try {
			// when
			underTest.updateCards(cards);
		} catch (final AuthException e) {
			// then
			verify(delegate).findClass(eq("foo"));
			verify(privilegeContext).hasWriteAccess(eq(foo));
			verifyNoMoreInteractions(delegate, privilegeContext);
		}
	}

	@Test
	public void classNotFoundOnMassiveUpdate() throws Exception {
		// given
		final DataAccessLogic delegate = mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final Collection<Card> cards = new ArrayList<>();
		cards.add(Card.newInstance() //
				.withClassName("foo") //
				.build());
		doReturn(null) //
				.when(delegate).findClass(anyString());

		try {
			// when
			underTest.updateCards(cards);
		} catch (final AuthException e) {
			// then
			verify(delegate).findClass(eq("foo"));
			verifyNoMoreInteractions(delegate, privilegeContext);
		}
	}

	@Test
	public void fetchedCardIsVerifiedBeforeUpdate() throws Exception {
		// given
		final DataAccessLogic delegate = mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final Card card = Card.newInstance() //
				.withClassName("foo") //
				.build();
		final Map<String, Object> attributes = new HashMap<>();
		final CMClass foo = mock(CMClass.class);
		doReturn(foo) //
				.when(delegate).findClass(anyString());
		doReturn(true) //
				.when(privilegeContext).hasWriteAccess(any(CMPrivilegedObject.class));

		// when
		underTest.updateFetchedCard(card, attributes);

		// then
		verify(delegate).findClass(eq("foo"));
		verify(privilegeContext).hasWriteAccess(eq(foo));
		verify(delegate).updateFetchedCard(card, attributes);
		verifyNoMoreInteractions(delegate, privilegeContext);
	}

	@Test
	public void fetchedCardClassHasNoWritePrivilegesOnUpdate() throws Exception {
		// given
		final DataAccessLogic delegate = mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final Card card = Card.newInstance() //
				.withClassName("foo") //
				.build();
		final Map<String, Object> attributes = new HashMap<>();
		final CMClass foo = mock(CMClass.class);
		doReturn(foo) //
				.when(delegate).findClass(anyString());
		doReturn(false) //
				.when(privilegeContext).hasWriteAccess(any(CMPrivilegedObject.class));

		try {
			// when
			underTest.updateFetchedCard(card, attributes);
		} catch (final AuthException e) {
			// then
			verify(delegate).findClass(eq("foo"));
			verify(privilegeContext).hasWriteAccess(eq(foo));
			verifyNoMoreInteractions(delegate, privilegeContext);
		}
	}

	@Test
	public void fetchedCardClassNotFoundOnUpdate() throws Exception {
		// given
		final DataAccessLogic delegate = mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final Card card = Card.newInstance() //
				.withClassName("foo") //
				.build();
		final Map<String, Object> attributes = new HashMap<>();
		doReturn(null) //
				.when(delegate).findClass(anyString());

		try {
			// when
			underTest.updateFetchedCard(card, attributes);
		} catch (final AuthException e) {
			// then
			verify(delegate).findClass(eq("foo"));
			verifyNoMoreInteractions(delegate, privilegeContext);
		}
	}

}
