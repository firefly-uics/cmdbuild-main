package org.cmdbuild.logic.data.access;

import static java.util.stream.StreamSupport.stream;
import static org.cmdbuild.exception.AuthException.AuthExceptionType.AUTH_CLASS_NOT_AUTHORIZED;

import java.util.Map;

import org.cmdbuild.auth.acl.PrivilegeContext;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.model.data.Card;

public class PrivilegedDataAccessLogic extends ForwardingDataAccessLogic {

	private final DataAccessLogic delegate;
	private final PrivilegeContext privilegeContext;

	public PrivilegedDataAccessLogic(final DataAccessLogic delegate, final PrivilegeContext privilegeContext) {
		this.delegate = delegate;
		this.privilegeContext = privilegeContext;
	}

	@Override
	protected DataAccessLogic delegate() {
		return delegate;
	}

	@Override
	public void updateCards(final Iterable<Card> cards) {
		stream(cards.spliterator(), false) //
				.forEach(input -> assureWrite(input.getClassName()));
		super.updateCards(cards);
	}

	@Override
	public void updateFetchedCard(final Card card, final Map<String, Object> attributes) {
		assureWrite(card.getClassName());
		super.updateFetchedCard(card, attributes);
	}

	private void assureWrite(final String className) {
		final CMClass found = delegate.findClass(className);
		if ((found == null) || !privilegeContext.hasWriteAccess(found)) {
			throw AUTH_CLASS_NOT_AUTHORIZED.createException(className);
		}
	}

}
