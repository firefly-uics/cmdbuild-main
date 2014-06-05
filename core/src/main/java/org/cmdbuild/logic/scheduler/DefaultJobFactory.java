package org.cmdbuild.logic.scheduler;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.lang.builder.ToStringBuilder;
import org.apache.commons.lang.builder.ToStringStyle;
import org.cmdbuild.config.EmailConfiguration;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.data.store.DataViewStore;
import org.cmdbuild.data.store.DataViewStore.StorableConverter;
import org.cmdbuild.data.store.Store;
import org.cmdbuild.data.store.email.EmailAccount;
import org.cmdbuild.data.store.email.EmailAccountStorableConverter;
import org.cmdbuild.data.store.scheduler.SchedulerJobParameterConverter;
import org.cmdbuild.data.store.scheduler.SchedulerJobParameterGroupable;
import org.cmdbuild.exception.CMDBException;
import org.cmdbuild.logic.email.EmailReceivingLogic;
import org.cmdbuild.logic.email.rules.AnswerToExistingMailFactory;
import org.cmdbuild.logic.email.rules.DownloadAttachmentsFactory;
import org.cmdbuild.logic.email.rules.PropertiesMapper;
import org.cmdbuild.logic.email.rules.StartWorkflow.Configuration;
import org.cmdbuild.logic.email.rules.StartWorkflow.Mapper;
import org.cmdbuild.logic.email.rules.StartWorkflowFactory;
import org.cmdbuild.logic.workflow.WorkflowLogic;
import org.cmdbuild.model.email.Email;
import org.cmdbuild.model.scheduler.SchedulerJob;
import org.cmdbuild.model.scheduler.SchedulerJob.Type;
import org.cmdbuild.model.scheduler.SchedulerJobParameter;
import org.cmdbuild.notification.Notifier;
import org.cmdbuild.scheduler.Job;
import org.cmdbuild.services.email.ConfigurableEmailServiceFactory;
import org.cmdbuild.services.email.EmailAccountConfiguration;
import org.cmdbuild.services.email.EmailCallbackHandler.Applicable;
import org.cmdbuild.services.email.EmailCallbackHandler.Rule;
import org.cmdbuild.services.email.EmailService;
import org.cmdbuild.services.scheduler.EmailServiceJob;
import org.cmdbuild.services.scheduler.StartProcessJob;
import org.slf4j.Logger;
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;

import com.google.common.collect.Lists;

public class DefaultJobFactory implements JobFactory {

	private static class SchedulerJobConfiguration {

		private final Iterable<SchedulerJobParameter> parameters;

		public SchedulerJobConfiguration(final Iterable<SchedulerJobParameter> parameters) {
			this.parameters = parameters;
		}

		public String get(final String key) {
			logger.debug("getting key '{}'", key);
			for (final SchedulerJobParameter parameter : parameters) {
				if (parameter.getKey().equals(key)) {
					return parameter.getValue();
				}
			}
			logger.warn("key '{}' not found", key);
			return null;
		}

		public boolean getBoolean(final String key) {
			logger.debug("getting key '{}' as boolean", key);
			return Boolean.parseBoolean(get(key));
		}

	}

	private static final Logger logger = SchedulerLogic.logger;
	private static final Marker marker = MarkerFactory.getMarker(DefaultJobFactory.class.getName());

	private static final String EMAIL_ACCOUNT_NAME = "email.account.name";
	private static final String EMAIL_FILTER = "email.filter";
	private static final String EMAIL_FILTER_FROM_REGEX = EMAIL_FILTER + ".from.regex";
	private static final String EMAIL_FILTER_SUBJECT_REGEX = EMAIL_FILTER + ".subject.regex";
	private static final String EMAIL_RULE = "email.rule";
	private static final String EMAIL_RULE_ATTACHMENTS_ACTIVE = EMAIL_RULE + ".attachments.active";
	private static final String EMAIL_RULE_NOTIFICATION_ACTIVE = EMAIL_RULE + ".notification.active";
	private static final String EMAIL_RULE_WORKFLOW = "email.rule.workflow";
	private static final String EMAIL_RULE_WORKFLOW_ACTIVE = EMAIL_RULE_WORKFLOW + ".active";
	private static final String EMAIL_RULE_WORKFLOW_ADVANCE = EMAIL_RULE_WORKFLOW + ".advance";
	private static final String EMAIL_RULE_WORKFLOW_CLASS_NAME = EMAIL_RULE_WORKFLOW + ".class.name";
	private static final String EMAIL_RULE_WORKFLOW_FIELDS_MAPPING = EMAIL_RULE_WORKFLOW + ".fields.mapping";
	private static final String EMAIL_RULE_WORKFLOW_ATTACHMENTS_SAVE = EMAIL_RULE_WORKFLOW + ".attachments.save";

	private final Notifier LOGGER_NOTIFIER = new Notifier() {

		@Override
		public void warn(final CMDBException e) {
			logger.warn("error while receiving email", e);
		}

	};

	private final WorkflowLogic workflowLogic;

	private final CMDataView dataView;
	private final ConfigurableEmailServiceFactory emailServiceFactory;
	private final AnswerToExistingMailFactory answerToExistingMailFactory;
	private final DownloadAttachmentsFactory downloadAttachmentsFactory;
	private final StartWorkflowFactory startWorkflowFactory;

	public DefaultJobFactory( //
			final WorkflowLogic workflowLogic, //
			final CMDataView systemDataView, //
			final ConfigurableEmailServiceFactory emailServiceFactory, //
			final AnswerToExistingMailFactory answerToExistingMailFactory, //
			final DownloadAttachmentsFactory downloadAttachmentsFactory, //
			final StartWorkflowFactory startWorkflowFactory //
	) {
		this.workflowLogic = workflowLogic;
		this.dataView = systemDataView;
		this.emailServiceFactory = emailServiceFactory;
		this.answerToExistingMailFactory = answerToExistingMailFactory;
		this.downloadAttachmentsFactory = downloadAttachmentsFactory;
		this.startWorkflowFactory = startWorkflowFactory;
	}

	@Override
	public Job create(final SchedulerJob schedulerJob) {
		logger.info("creating job from '{}'", schedulerJob);
		final Job job;
		if (Type.workflow.equals(schedulerJob.getType())) {
			final StartProcessJob startProcessJob = new StartProcessJob(schedulerJob.getIdentifier(), workflowLogic);
			startProcessJob.setDetail(schedulerJob.getDetail());
			startProcessJob.setParams(schedulerJob.getLegacyParameters());
			job = startProcessJob;
		} else if (Type.emailService.equals(schedulerJob.getType())) {
			final SchedulerJobConfiguration configuration = parametersOf(schedulerJob);

			final String emailAccountName = configuration.get(EMAIL_ACCOUNT_NAME);
			final EmailAccount selectedEmailAccount = emailAccountFor(emailAccountName);
			final EmailConfiguration emailConfiguration = emailConfigurationFrom(selectedEmailAccount);
			final EmailService service = emailServiceFactory.create(emailConfiguration);

			final List<Rule> rules = Lists.newArrayList();
			if (configuration.getBoolean(EMAIL_RULE_NOTIFICATION_ACTIVE)) {
				logger.info("adding notification rule");
				rules.add(ruleWithGlobalCondition(answerToExistingMailFactory.create(service), configuration));
			}
			if (configuration.getBoolean(EMAIL_RULE_ATTACHMENTS_ACTIVE)) {
				logger.info("adding attachments rule");
				rules.add(ruleWithGlobalCondition(downloadAttachmentsFactory.create(), configuration));
			}
			if (configuration.getBoolean(EMAIL_RULE_WORKFLOW_ACTIVE)) {
				logger.info("adding start process rule");
				final String className = configuration.get(EMAIL_RULE_WORKFLOW_CLASS_NAME);
				final String mapping = configuration.get(EMAIL_RULE_WORKFLOW_FIELDS_MAPPING);
				final boolean advance = configuration.getBoolean(EMAIL_RULE_WORKFLOW_ADVANCE);
				final boolean saveAttachments = configuration.getBoolean(EMAIL_RULE_WORKFLOW_ATTACHMENTS_SAVE);
				final Configuration _configuration = new Configuration() {

					@Override
					public String getClassName() {
						return className;
					}

					@Override
					public Mapper getMapper() {
						return new PropertiesMapper(mapping);
					}

					@Override
					public boolean advance() {
						return advance;
					}

					@Override
					public boolean saveAttachments() {
						return saveAttachments;
					}

				};
				rules.add(ruleWithGlobalCondition(startWorkflowFactory.create(_configuration), configuration));
			}

			final EmailReceivingLogic emailReceivingLogic = new EmailReceivingLogic(service, rules, LOGGER_NOTIFIER);

			job = new EmailServiceJob(schedulerJob.getIdentifier(), emailReceivingLogic);
		} else {
			logger.warn(marker, "invalid type '{}'", schedulerJob.getType());
			job = null;
		}
		return job;
	}

	private SchedulerJobConfiguration parametersOf(final SchedulerJob schedulerJob) {
		logger.debug("getting parameters for job {}", schedulerJob);
		final Store<SchedulerJobParameter> schedulerJobParameterStore = DataViewStore.newInstance(dataView, //
				SchedulerJobParameterGroupable.of(schedulerJob.getId()), //
				SchedulerJobParameterConverter.of(schedulerJob.getId()));
		final Iterable<SchedulerJobParameter> parameters = schedulerJobParameterStore.list();
		return new SchedulerJobConfiguration(parameters);
	}

	private EmailAccount emailAccountFor(final String emailAccountName) {
		logger.debug("getting email account for name '{}'", emailAccountName);
		final StorableConverter<EmailAccount> emailAccountConverter = new EmailAccountStorableConverter();
		final Store<EmailAccount> emailAccountStore = DataViewStore.newInstance(dataView, emailAccountConverter);
		for (final EmailAccount emailAccount : emailAccountStore.list()) {
			if (emailAccount.getName().equals(emailAccountName)) {
				return emailAccount;
			}
		}
		throw new IllegalArgumentException("email account not found");
	}

	private EmailConfiguration emailConfigurationFrom(final EmailAccount emailAccount) {
		logger.debug("getting email configuration from email account {}", emailAccount);
		return new EmailAccountConfiguration(emailAccount);
	}

	private Rule ruleWithGlobalCondition(final Rule rule, final SchedulerJobConfiguration configuration) {
		logger.debug("creating rule with global condition");
		final String fromExpression = configuration.get(EMAIL_FILTER_FROM_REGEX);
		final String subjectExpression = configuration.get(EMAIL_FILTER_SUBJECT_REGEX);
		final Applicable applicable = new Applicable() {

			@Override
			public boolean applies(final Email email) {
				logger.debug("checking from address");
				final Pattern fromPattern = Pattern.compile(fromExpression);
				final Matcher fromMatcher = fromPattern.matcher(email.getFromAddress());
				if (!fromMatcher.matches()) {
					logger.debug("from address not matching");
					return false;
				}

				logger.debug("checking subject");
				final Pattern subjectPattern = Pattern.compile(subjectExpression);
				final Matcher subjectMatcher = subjectPattern.matcher(email.getSubject());
				if (!subjectMatcher.matches()) {
					logger.debug("subject not matching");
					return false;
				}

				return rule.applies(email);
			}

			@Override
			public String toString() {
				return new ToStringBuilder(this, ToStringStyle.SHORT_PREFIX_STYLE) //
						.append(EMAIL_FILTER_FROM_REGEX, fromExpression) //
						.append(EMAIL_FILTER_SUBJECT_REGEX, subjectExpression) //
						.toString();
			}

		};
		return new RuleWithAdditionalCondition(rule, applicable);
	}

}
