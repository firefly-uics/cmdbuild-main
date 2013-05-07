package org.cmdbuild.logic.email;

import static org.cmdbuild.dao.query.clause.AnyAttribute.anyAttribute;
import static org.cmdbuild.dao.query.clause.QueryAliasAttribute.attribute;
import static org.cmdbuild.dao.query.clause.where.AndWhereClause.and;
import static org.cmdbuild.dao.query.clause.where.EqualsOperatorAndValue.eq;
import static org.cmdbuild.dao.query.clause.where.OrWhereClause.or;
import static org.cmdbuild.dao.query.clause.where.SimpleWhereClause.condition;

import java.io.IOException;
import java.util.List;

import org.cmdbuild.config.EmailProperties;
import org.cmdbuild.dao.entry.CMCard;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.query.CMQueryResult;
import org.cmdbuild.dao.query.CMQueryRow;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.data.converter.EmailConverter;
import org.cmdbuild.data.store.DataViewStore;
import org.cmdbuild.data.store.DataViewStore.StorableConverter;
import org.cmdbuild.data.store.Store.Storable;
import org.cmdbuild.exception.CMDBException;
import org.cmdbuild.listeners.RequestListener;
import org.cmdbuild.logic.Logic;
import org.cmdbuild.model.Email;
import org.cmdbuild.model.Email.EmailStatus;
import org.cmdbuild.services.email.EmailService;

import com.google.common.collect.Lists;

public class EmailLogic implements Logic {

	private final CMDataView view;

	public EmailLogic(final CMDataView view) {
		this.view = view;
	}

	public Iterable<Email> getEmails(final Long processCardId) {
		final DataViewStore<Email> emailStore = buildStore(processCardId);
		retrieveEmailsFromServer();
		final List<Email> emails = Lists.newArrayList();
		for (final Email email : emailStore.list()) {
			emails.add(email);
		}
		return emails;
	}

	// FIXME: the EmailService uses the old dao
	/**
	 * It fetches mails from mailserver and store them into the cmdbuild
	 * database
	 */
	private void retrieveEmailsFromServer() {
		try {
			EmailService.syncEmail();
		} catch (final CMDBException e) {
			RequestListener.getCurrentRequest().pushWarning(e);
		} catch (final IOException e) {
			throw new RuntimeException("Error rietrieving emails", e);
		}
	}

	public void sendOutgoingAndDraftEmails(final Long processCardId) {
		final CMClass emailClass = view.findClass("Email");
		final Integer draftLookupId = getDraftLookupEmailStatusId();
		final Integer outgoingLookupId = getOutgoingLookupEmailStatusId();
		final CMQueryResult result = view.select(anyAttribute(emailClass)) //
				.from(emailClass) //
				.where(and(condition(attribute(emailClass, "Activity"), eq(processCardId)), //
						or(condition(attribute(emailClass, "EmailStatus"), eq(draftLookupId)), //
								condition(attribute(emailClass, "EmailStatus"), eq(outgoingLookupId))))) //
				.run();
		final List<CMCard> emailCardsToBeSent = Lists.newArrayList();
		for (final CMQueryRow row : result) {
			final CMCard cardToSend = row.getCard(emailClass);
			emailCardsToBeSent.add(cardToSend);
		}
		sendEmailsAndChangeStatusToSent(emailCardsToBeSent, processCardId);
	}

	private void sendEmailsAndChangeStatusToSent(final List<CMCard> emailCardsToSend, final Long processId) {
		final DataViewStore<Email> emailStore = buildStore(processId);
		final StorableConverter<Email> converter = new EmailConverter(processId.intValue());
		for (final CMCard emailCard : emailCardsToSend) {
			final Email emailToSend = converter.convert(emailCard);
			emailToSend.setFromAddress(EmailProperties.getInstance().getEmailAddress());
			try {
				sendEmail(emailToSend);
				emailToSend.setStatus(EmailStatus.SENT);
			} catch (final CMDBException ex) {
				RequestListener.getCurrentRequest().pushWarning(ex);
				emailToSend.setStatus(EmailStatus.OUTGOING);
			}
			emailStore.update(emailToSend);
		}
	}

	private static void sendEmail(final Email email) {
		EmailService.sendEmail(email);
	}

	private Integer getDraftLookupEmailStatusId() {
		return getEmailStatusLookupWithName(EmailStatus.DRAFT);
	}

	private Integer getOutgoingLookupEmailStatusId() {
		return getEmailStatusLookupWithName(EmailStatus.OUTGOING);
	}

	private Integer getEmailStatusLookupWithName(final EmailStatus emailStatus) {
		final CMClass lookupClass = view.findClass("LookUp");
		final CMQueryRow row = view.select(anyAttribute(lookupClass)) //
				.from(lookupClass) //
				.where(condition(attribute(lookupClass, "Description"), eq(emailStatus.getLookupName()))) //
				.run().getOnlyRow();
		return row.getCard(lookupClass).getId().intValue();
	}

	public void deleteEmail(final Long processCardId, final Long emailId) {
		final DataViewStore<Email> emailStore = buildStore(processCardId);
		emailStore.delete(getFakeStorable(emailId));
	}

	private static Storable getFakeStorable(final Long emailId) {
		return new Storable() {
			@Override
			public String getIdentifier() {
				return emailId.toString();
			}
		};
	}

	public void saveEmail(final Long processCardId, final Email email) {
		final DataViewStore<Email> emailStore = buildStore(processCardId);
		if (email.getId() == null) {
			emailStore.create(email);
			email.setStatus(EmailStatus.DRAFT);
		} else {
			emailStore.update(email);
		}
	}

	private DataViewStore<Email> buildStore(final Long processId) {
		final StorableConverter<Email> converter = new EmailConverter(processId.intValue());
		return new DataViewStore<Email>(view, converter);
	}

}