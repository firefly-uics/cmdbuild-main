package org.cmdbuild.logic.email;

import static com.google.common.base.Suppliers.memoize;
import static com.google.common.collect.FluentIterable.from;
import static com.google.common.collect.Iterables.concat;
import static com.google.common.collect.Iterables.contains;
import static java.util.Arrays.asList;
import static org.apache.commons.lang3.StringUtils.EMPTY;
import static org.apache.commons.lang3.StringUtils.defaultIfBlank;
import static org.apache.commons.lang3.builder.ToStringStyle.SHORT_PREFIX_STYLE;
import static org.cmdbuild.common.utils.guava.Suppliers.firstNotNull;
import static org.cmdbuild.common.utils.guava.Suppliers.nullOnException;
import static org.cmdbuild.data.store.email.EmailStatus.DRAFT;
import static org.cmdbuild.data.store.email.EmailStatus.OUTGOING;
import static org.cmdbuild.data.store.email.EmailStatus.SENT;
import static org.cmdbuild.services.email.Predicates.isDefault;
import static org.cmdbuild.services.email.Predicates.named;

import java.net.URL;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.Validate;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.cmdbuild.common.utils.UnsupportedProxyFactory;
import org.cmdbuild.data.store.Storable;
import org.cmdbuild.data.store.Store;
import org.cmdbuild.data.store.StoreSupplier;
import org.cmdbuild.data.store.email.EmailOwnerGroupable;
import org.cmdbuild.data.store.email.EmailStatus;
import org.cmdbuild.exception.CMDBException;
import org.cmdbuild.exception.CMDBWorkflowException;
import org.cmdbuild.notification.Notifier;
import org.cmdbuild.services.email.EmailAccount;
import org.cmdbuild.services.email.EmailService;
import org.cmdbuild.services.email.EmailServiceFactory;
import org.cmdbuild.services.email.ForwardingEmailService;
import org.cmdbuild.services.email.SubjectHandler;
import org.joda.time.DateTime;

import com.google.common.base.Function;
import com.google.common.base.Predicate;
import com.google.common.base.Supplier;
import com.google.common.collect.ForwardingObject;

public class DefaultEmailLogic implements EmailLogic {

	public static abstract class ForwardingEmail extends ForwardingObject implements Email {

		@Override
		protected abstract Email delegate();

		@Override
		public Long getId() {
			return delegate().getId();
		}

		@Override
		public String getFromAddress() {
			return delegate().getFromAddress();
		}

		@Override
		public String getToAddresses() {
			return delegate().getToAddresses();
		}

		@Override
		public String getCcAddresses() {
			return delegate().getCcAddresses();
		}

		@Override
		public String getBccAddresses() {
			return delegate().getBccAddresses();
		}

		@Override
		public String getSubject() {
			return delegate().getSubject();
		}

		@Override
		public String getContent() {
			return delegate().getContent();
		}

		@Override
		public DateTime getDate() {
			return delegate().getDate();
		}

		@Override
		public EmailStatus getStatus() {
			return delegate().getStatus();
		}

		@Override
		public Long getActivityId() {
			return delegate().getActivityId();
		}

		@Override
		public String getNotifyWith() {
			return delegate().getNotifyWith();
		}

		@Override
		public boolean isNoSubjectPrefix() {
			return delegate().isNoSubjectPrefix();
		}

		@Override
		public String getAccount() {
			return delegate().getAccount();
		}

		@Override
		public boolean isTemporary() {
			return delegate().isTemporary();
		}

		@Override
		public String getTemplate() {
			return delegate().getTemplate();
		}

		@Override
		public boolean isKeepSynchronization() {
			return delegate().isKeepSynchronization();
		}

		@Override
		public boolean isPromptSynchronization() {
			return delegate().isPromptSynchronization();
		}

	}

	private static class EmailImpl implements Email {

		public static class Builder implements org.apache.commons.lang3.builder.Builder<Email> {

			private Long id;
			private String fromAddress;
			private String toAddresses;
			private String ccAddresses;
			private String bccAddresses;
			private String subject;
			private String content;
			private String notifyWith;
			private DateTime date;
			private EmailStatus status;
			private Long activityId;
			private boolean noSubjectPrefix;
			private String account;
			private boolean temporary;
			private String template;
			private boolean keepSynchronization;
			private boolean promptSynchronization;

			private Builder() {
				// use factory method
			}

			@Override
			public Email build() {
				return new EmailImpl(this);
			}

			public Builder withId(final Long id) {
				this.id = id;
				return this;
			}

			public Builder withFromAddress(final String fromAddress) {
				this.fromAddress = fromAddress;
				return this;
			}

			public Builder withToAddresses(final String toAddresses) {
				this.toAddresses = toAddresses;
				return this;
			}

			public Builder withCcAddresses(final String ccAddresses) {
				this.ccAddresses = ccAddresses;
				return this;
			}

			public Builder withBccAddresses(final String bccAddresses) {
				this.bccAddresses = bccAddresses;
				return this;
			}

			public Builder withSubject(final String subject) {
				this.subject = subject;
				return this;
			}

			public Builder withContent(final String content) {
				this.content = content;
				return this;
			}

			public Builder withNotifyWith(final String notifyWith) {
				this.notifyWith = notifyWith;
				return this;
			}

			public Builder withDate(final DateTime date) {
				this.date = date;
				return this;
			}

			public Builder withStatus(final EmailStatus status) {
				this.status = status;
				return this;
			}

			public Builder withActivityId(final Long activityId) {
				this.activityId = activityId;
				return this;
			}

			public Builder withNoSubjectPrefix(final boolean noSubjectPrefix) {
				this.noSubjectPrefix = noSubjectPrefix;
				return this;
			}

			public Builder withAccount(final String account) {
				this.account = account;
				return this;
			}

			public Builder withTemplate(final String template) {
				this.template = template;
				return this;
			}

			public Builder withKeepSynchronization(final boolean keepSynchronization) {
				this.keepSynchronization = keepSynchronization;
				return this;
			}

			public Builder withPromptSynchronization(final boolean promptSynchronization) {
				this.promptSynchronization = promptSynchronization;
				return this;
			}

		}

		public static Builder newInstance() {
			return new Builder();
		}

		private final Long id;
		private final String fromAddress;
		private final String toAddresses;
		private final String ccAddresses;
		private final String bccAddresses;
		private final String subject;
		private final String content;
		private final String notifyWith;
		private final DateTime date;
		private final EmailStatus status;
		private final Long activityId;
		private final boolean noSubjectPrefix;
		private final String account;
		private final boolean temporary;
		private final String template;
		private final boolean keepSynchronization;
		private final boolean promptSynchronization;

		private EmailImpl(final Builder builder) {
			this.id = builder.id;
			this.fromAddress = builder.fromAddress;
			this.toAddresses = builder.toAddresses;
			this.ccAddresses = builder.ccAddresses;
			this.bccAddresses = builder.bccAddresses;
			this.subject = builder.subject;
			this.content = builder.content;
			this.notifyWith = builder.notifyWith;
			this.date = builder.date;
			this.status = builder.status;
			this.activityId = builder.activityId;
			this.noSubjectPrefix = builder.noSubjectPrefix;
			this.account = builder.account;
			this.temporary = builder.temporary;
			this.template = builder.template;
			this.keepSynchronization = builder.keepSynchronization;
			this.promptSynchronization = builder.promptSynchronization;
		}

		@Override
		public Long getId() {
			return id;
		}

		@Override
		public String getFromAddress() {
			return fromAddress;
		}

		@Override
		public String getToAddresses() {
			return toAddresses;
		}

		@Override
		public String getCcAddresses() {
			return ccAddresses;
		}

		@Override
		public String getBccAddresses() {
			return bccAddresses;
		}

		@Override
		public String getSubject() {
			return subject;
		}

		@Override
		public String getContent() {
			return content;
		}

		@Override
		public DateTime getDate() {
			return date;
		}

		@Override
		public EmailStatus getStatus() {
			return status;
		}

		@Override
		public Long getActivityId() {
			return activityId;
		}

		@Override
		public String getNotifyWith() {
			return notifyWith;
		}

		@Override
		public boolean isNoSubjectPrefix() {
			return noSubjectPrefix;
		}

		@Override
		public String getAccount() {
			return account;
		}

		@Override
		public boolean isTemporary() {
			return temporary;
		}

		@Override
		public String getTemplate() {
			return template;
		}

		@Override
		public boolean isKeepSynchronization() {
			// TODO Auto-generated method stub
			return false;
		}

		@Override
		public boolean isPromptSynchronization() {
			// TODO Auto-generated method stub
			return false;
		}

		@Override
		public boolean equals(final Object obj) {
			if (this == obj) {
				return true;
			}

			if (!(obj instanceof Email)) {
				return false;
			}

			final Email other = Email.class.cast(obj);
			return new EqualsBuilder() //
					.append(this.getId(), other.getId()) //
					.append(this.getFromAddress(), other.getFromAddress()) //
					.append(this.getToAddresses(), other.getToAddresses()) //
					.append(this.getCcAddresses(), other.getCcAddresses()) //
					.append(this.getBccAddresses(), other.getBccAddresses()) //
					.append(this.getSubject(), other.getSubject()) //
					.append(this.getContent(), other.getContent()) //
					.append(this.getDate(), other.getDate()) //
					.append(this.getStatus(), other.getStatus()) //
					.append(this.getActivityId(), other.getActivityId()) //
					.append(this.getNotifyWith(), other.getNotifyWith()) //
					.append(this.isNoSubjectPrefix(), other.isNoSubjectPrefix()) //
					.append(this.getAccount(), other.getAccount()) //
					.append(this.isTemporary(), other.isTemporary()) //
					.append(this.getTemplate(), other.getTemplate()) //
					.append(this.isKeepSynchronization(), other.isKeepSynchronization()) //
					.append(this.isPromptSynchronization(), other.isPromptSynchronization()) //
					.isEquals();
		}

		@Override
		public int hashCode() {
			return new HashCodeBuilder() //
					.append(id) //
					.append(fromAddress) //
					.append(toAddresses) //
					.append(ccAddresses) //
					.append(bccAddresses) //
					.append(subject) //
					.append(content) //
					.append(date) //
					.append(status) //
					.append(activityId) //
					.append(notifyWith) //
					.append(noSubjectPrefix) //
					.append(account) //
					.append(temporary) //
					.append(template) //
					.append(keepSynchronization) //
					.append(promptSynchronization) //
					.toHashCode();
		}

		@Override
		public final String toString() {
			return ToStringBuilder.reflectionToString(this, SHORT_PREFIX_STYLE).toString();
		}

	}

	private static final Function<Email, org.cmdbuild.data.store.email.Email> LOGIC_TO_STORE = new Function<Email, org.cmdbuild.data.store.email.Email>() {

		@Override
		public org.cmdbuild.data.store.email.Email apply(final Email input) {
			final org.cmdbuild.data.store.email.Email output = new org.cmdbuild.data.store.email.Email(input.getId());
			output.setFromAddress(input.getFromAddress());
			output.setToAddresses(input.getToAddresses());
			output.setCcAddresses(input.getCcAddresses());
			output.setBccAddresses(input.getBccAddresses());
			output.setSubject(input.getSubject());
			output.setContent(input.getContent());
			output.setNotifyWith(input.getNotifyWith());
			output.setDate(input.getDate());
			output.setStatus(input.getStatus());
			output.setActivityId(input.getActivityId());
			output.setNoSubjectPrefix(input.isNoSubjectPrefix());
			output.setAccount(input.getAccount());
			output.setTemplate(input.getTemplate());
			output.setKeepSynchronization(input.isKeepSynchronization());
			output.setPromptSynchronization(input.isPromptSynchronization());
			return output;
		}

	};

	private static final Function<org.cmdbuild.data.store.email.Email, Email> STORE_TO_LOGIC = new Function<org.cmdbuild.data.store.email.Email, Email>() {

		@Override
		public Email apply(final org.cmdbuild.data.store.email.Email input) {
			return EmailImpl.newInstance() //
					.withId(input.getId()) //
					.withFromAddress(input.getFromAddress()) //
					.withToAddresses(input.getToAddresses()) //
					.withCcAddresses(input.getCcAddresses()) //
					.withBccAddresses(input.getBccAddresses()) //
					.withSubject(input.getSubject()) //
					.withContent(input.getContent()) //
					.withNotifyWith(input.getNotifyWith()) //
					.withDate(input.getDate()) //
					.withStatus(input.getStatus()) //
					.withActivityId(input.getActivityId()) //
					.withNoSubjectPrefix(input.isNoSubjectPrefix()) //
					.withAccount(input.getAccount()) //
					.withTemplate(input.getTemplate()) //
					.withKeepSynchronization(input.isKeepSynchronization()) //
					.withPromptSynchronization(input.isPromptSynchronization()) //
					.build();
		}

	};

	private static final EmailService EMAIL_SERVICE_FOR_INVALID_PROCESS_ID = new ForwardingEmailService() {

		private final EmailService UNSUPPORTED = UnsupportedProxyFactory.of(EmailService.class).create();

		@Override
		protected EmailService delegate() {
			return UNSUPPORTED;
		}

	};

	private final Store<org.cmdbuild.data.store.email.Email> emailStore;
	private final Store<org.cmdbuild.data.store.email.Email> temporaryEmailStore;
	private final EmailServiceFactory emailServiceFactory;
	private final Store<EmailAccount> emailAccountStore;
	private final SubjectHandler subjectHandler;
	private final Notifier notifier;

	public DefaultEmailLogic( //
			final Store<org.cmdbuild.data.store.email.Email> emailStore, //
			final Store<org.cmdbuild.data.store.email.Email> store, //
			final EmailServiceFactory emailServiceFactory, //
			final Store<EmailAccount> emailAccountStore, //
			final SubjectHandler subjectHandler, //
			final Notifier notifier //
	) {
		this.emailStore = emailStore;
		this.emailServiceFactory = emailServiceFactory;
		this.emailAccountStore = emailAccountStore;
		this.subjectHandler = subjectHandler;
		this.notifier = notifier;
		this.temporaryEmailStore = store;
	}

	@Override
	public Long create(final Email email) {
		final org.cmdbuild.data.store.email.Email storableEmail = LOGIC_TO_STORE.apply(new ForwardingEmail() {

			@Override
			protected Email delegate() {
				return email;
			}

			@Override
			public Long getId() {
				return isTemporary() ? generateId() : super.getId();
			}

			private int generateId() {
				return UUID.randomUUID().hashCode();
			}

			@Override
			public EmailStatus getStatus() {
				/*
				 * newly created e-mails are always drafts
				 */
				return DRAFT;
			}

		});
		final Storable stored = storeOf(email).create(storableEmail);
		final Long id = Long.parseLong(stored.getIdentifier());
		return id;
	}

	@Override
	public Iterable<Email> readAll(final Long processCardId) {
		return from(concat( //
				from(emailStore.readAll(EmailOwnerGroupable.of(processCardId))) //
						.transform(STORE_TO_LOGIC), //
				from(temporaryEmailStore.readAll()) //
						.filter(new Predicate<org.cmdbuild.data.store.email.Email>() {

							@Override
							public boolean apply(final org.cmdbuild.data.store.email.Email input) {
								return ObjectUtils.equals(processCardId, input.getActivityId());
							}

						}) //
						.transform(STORE_TO_LOGIC) //
						.transform(new Function<Email, Email>() {

							@Override
							public Email apply(final Email input) {
								return new ForwardingEmail() {

									@Override
									protected Email delegate() {
										return input;
									}

									@Override
									public boolean isTemporary() {
										return true;
									}

								};
							}

						})) //
		);
	}

	@Override
	public Email read(final Email email) {
		final org.cmdbuild.data.store.email.Email read = storeOf(email).read(LOGIC_TO_STORE.apply(email));
		return new ForwardingEmail() {

			@Override
			protected Email delegate() {
				return STORE_TO_LOGIC.apply(read);
			}

			@Override
			public boolean isTemporary() {
				return email.isTemporary();
			}

		};
	}

	@Override
	public void update(final Email email) {
		final Email read = read(email);
		Validate.isTrue( //
				contains(asList(DRAFT, OUTGOING), read.getStatus()), //
				"cannot update e-mail '%s' due to an invalid status", read);
		if (DRAFT.equals(email.getStatus())) {
			Validate.isTrue( //
					contains(asList(DRAFT, OUTGOING), email.getStatus()), //
					"cannot update e-mail due to an invalid new status", email.getStatus());
		} else if (OUTGOING.equals(email.getStatus())) {
			Validate.isTrue( //
					contains(asList(OUTGOING), email.getStatus()), //
					"cannot update e-mail due to an invalid new status", email.getStatus());
		}

		final org.cmdbuild.data.store.email.Email storable = LOGIC_TO_STORE.apply(email);
		storeOf(email).update(storable);

		if (OUTGOING.equals(email.getStatus())) {
			send(read(email));
		}
	}

	private void send(final Email email) {
		try {
			final Supplier<EmailAccount> accountSupplier = accountSupplierOf(email);
			final Email toBeUpdated = new ForwardingEmail() {

				@Override
				protected Email delegate() {
					return email;
				}

				@Override
				public String getFromAddress() {
					return defaultIfBlank(super.getFromAddress(), accountSupplier.get().getAddress());
				}

				@Override
				public String getSubject() {
					final org.cmdbuild.data.store.email.Email storable = LOGIC_TO_STORE.apply(delegate());
					final String subject;
					if (subjectHandler.parse(storable.getSubject()).hasExpectedFormat()) {
						subject = storable.getSubject();
					} else {
						subject = defaultIfBlank(subjectHandler.compile(storable).getSubject(), EMPTY);
					}
					return subject;
				}

				@Override
				public EmailStatus getStatus() {
					return SENT;
				}

			};

			final org.cmdbuild.data.store.email.Email storable = LOGIC_TO_STORE.apply(toBeUpdated);
			emailService(storable.getActivityId(), accountSupplier).send(storable, attachmentsOf(toBeUpdated));
			storeOf(email).update(storable);
		} catch (final CMDBException e) {
			notifier.warn(e);
		} catch (final Throwable e) {
			notifier.warn(CMDBWorkflowException.WorkflowExceptionType.WF_EMAIL_NOT_SENT.createException());
		}
	}

	private Supplier<EmailAccount> accountSupplierOf(final Email email) {
		final Supplier<EmailAccount> defaultAccountSupplier = memoize(nullOnException(defaultAccountSupplier()));
		final Supplier<EmailAccount> emailAccountSupplier = nullOnException(StoreSupplier.of(EmailAccount.class,
				emailAccountStore, named(email.getAccount())));
		final Supplier<EmailAccount> accountSupplier = memoize(firstNotNull(asList(emailAccountSupplier,
				defaultAccountSupplier)));
		return accountSupplier;
	}

	private Map<URL, String> attachmentsOf(final Email read) {
		// TODO Auto-generated method stub
		return Collections.emptyMap();
	}

	private EmailService emailService(final Long processCardId, final Supplier<EmailAccount> emailAccountSupplier) {
		final boolean isValid = (processCardId != null) && (processCardId > 0);
		if (!isValid) {
			logger.warn("invalid process id, returning a safe email service");
		}
		final EmailService emailService;
		if (isValid) {
			emailService = emailServiceFactory.create(emailAccountSupplier);
		} else {
			emailService = EMAIL_SERVICE_FOR_INVALID_PROCESS_ID;
		}
		return emailService;
	}

	private StoreSupplier<EmailAccount> defaultAccountSupplier() {
		return StoreSupplier.of(EmailAccount.class, emailAccountStore, isDefault());
	}

	@Override
	public void delete(final Email email) {
		final Email read = read(email);
		Validate.isTrue( //
				contains(asList(DRAFT), read.getStatus()), //
				"cannot delete e-mail '%s' due to an invalid status", read);

		final org.cmdbuild.data.store.email.Email storable = LOGIC_TO_STORE.apply(email);
		storeOf(email).delete(storable);
	}

	private Store<org.cmdbuild.data.store.email.Email> storeOf(final Email email) {
		return email.isTemporary() ? temporaryEmailStore : emailStore;
	}

}
