package org.cmdbuild.logic.scheduler;

import static org.cmdbuild.dao.query.clause.AnyAttribute.anyAttribute;
import static org.cmdbuild.dao.query.clause.QueryAliasAttribute.attribute;
import static org.cmdbuild.dao.query.clause.where.EqualsOperatorAndValue.eq;
import static org.cmdbuild.dao.query.clause.where.SimpleWhereClause.condition;
import static org.cmdbuild.logic.scheduler.Constants.CRON_EXP_ATTRIBUTE_NAME;
import static org.cmdbuild.logic.scheduler.Constants.DESCRIPTION_ATTRIBUTE_NAME;
import static org.cmdbuild.logic.scheduler.Constants.DETAIL_ATTRIBUTE_NAME;
import static org.cmdbuild.logic.scheduler.Constants.NOTES_ATTRIBUTE_NAME;
import static org.cmdbuild.logic.scheduler.Constants.SCHEDULER_CLASS_NAME;

import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.Validate;
import org.cmdbuild.common.Builder;
import org.cmdbuild.dao.entry.CMCard;
import org.cmdbuild.dao.entry.CMCard.CMCardDefinition;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.query.CMQueryResult;
import org.cmdbuild.dao.query.CMQueryRow;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.exception.ORMException.ORMExceptionType;
import org.cmdbuild.services.scheduler.SchedulerService;
import org.cmdbuild.services.scheduler.job.StartProcessJob;
import org.cmdbuild.services.scheduler.trigger.JobTrigger;
import org.cmdbuild.services.scheduler.trigger.RecurringTrigger;
import org.springframework.transaction.annotation.Transactional;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

public class DefaultSchedulerLogic implements SchedulerLogic {

	public static class DefaultScheduledJob implements ScheduledJob {

		public static class ScheduledJobBuilder implements Builder<DefaultScheduledJob> {

			private String cronExpression;
			private String detail;
			private Long jobId;
			private String description;
			private Map<String, String> params;

			private ScheduledJobBuilder() {

			}

			@Override
			public DefaultScheduledJob build() {
				Validate.notNull(cronExpression);
				Validate.notNull(detail);
				return new DefaultScheduledJob(this);
			}

			public ScheduledJobBuilder withDetail(final String detail) {
				this.detail = detail;
				return this;
			}

			public ScheduledJobBuilder withParams(final Map<String, String> params) {
				this.params = params;
				return this;
			}

			public ScheduledJobBuilder withCronExpression(final String cronExpression) {
				this.cronExpression = cronExpression;
				return this;
			}

			public ScheduledJobBuilder withDescription(final String description) {
				this.description = description;
				return this;
			}

			public ScheduledJobBuilder withId(final Long jobId) {
				this.jobId = jobId;
				return this;
			}

		}

		public static ScheduledJobBuilder newScheduledJob() {
			return new ScheduledJobBuilder();
		}

		private final String cronExpression;
		private final String detail;
		private final Long jobId;
		private final String description;
		private final Map<String, String> params;

		private DefaultScheduledJob(final ScheduledJobBuilder scheduledJobBuilder) {
			this.cronExpression = scheduledJobBuilder.cronExpression;
			this.detail = scheduledJobBuilder.detail;
			this.params = scheduledJobBuilder.params;
			this.jobId = scheduledJobBuilder.jobId;
			this.description = scheduledJobBuilder.description;
		}

		@Override
		public Long getId() {
			return jobId;
		}

		@Override
		public String getDescription() {
			return description;
		}

		@Override
		public String getCronExpression() {
			return cronExpression;
		}

		@Override
		public String getDetail() {
			return detail;
		}

		@Override
		public Map<String, String> getParams() {
			return params;
		}

	}

	private final CMDataView view;
	private final SchedulerService schedulerService;

	public DefaultSchedulerLogic(final CMDataView view, final SchedulerService schedulerService) {
		this.view = view;
		this.schedulerService = schedulerService;
	}

	@Override
	public Iterable<ScheduledJob> findAllScheduledJobs() {
		final List<ScheduledJob> scheduledJobs = Lists.newArrayList();
		final CMClass schedulerClass = view.findClass(SCHEDULER_CLASS_NAME);
		final CMQueryResult result = view.select(anyAttribute(schedulerClass)) //
				.from(schedulerClass) //
				.run();
		for (final CMQueryRow row : result) {
			final CMCard card = row.getCard(schedulerClass);
			scheduledJobs.add(createScheduledJobFrom(card));
		}
		return scheduledJobs;
	}

	@Override
	public Iterable<ScheduledJob> findJobsByDetail(final String detail) {
		final List<ScheduledJob> scheduledJobs = Lists.newArrayList();
		final CMClass schedulerClass = view.findClass(SCHEDULER_CLASS_NAME);
		final CMQueryResult result = view.select(anyAttribute(schedulerClass)) //
				.from(schedulerClass) //
				.where(condition(attribute(schedulerClass, DETAIL_ATTRIBUTE_NAME), eq(detail))) //
				.run();
		for (final CMQueryRow row : result) {
			final CMCard card = row.getCard(schedulerClass);
			scheduledJobs.add(createScheduledJobFrom(card));
		}
		return scheduledJobs;
	}

	private DefaultScheduledJob createScheduledJobFrom(final CMCard jobCard) {
		return DefaultScheduledJob.newScheduledJob() //
				.withCronExpression((String) jobCard.get(CRON_EXP_ATTRIBUTE_NAME)) //
				.withDetail((String) jobCard.get(DETAIL_ATTRIBUTE_NAME)) //
				.withDescription(jobCard.get(DESCRIPTION_ATTRIBUTE_NAME) != null ? //
				(String) jobCard.get(DESCRIPTION_ATTRIBUTE_NAME)
						: StringUtils.EMPTY) //
				.withId(jobCard.getId()) //
				.withParams(fromStringToParamsMap(jobCard)) //
				.build();
	}

	private Map<String, String> fromStringToParamsMap(final CMCard jobCard) {
		final Map<String, String> params = Maps.newHashMap();
		final Object paramBlockObject = jobCard.get(NOTES_ATTRIBUTE_NAME);
		if (paramBlockObject != null) {
			final String paramBlock = (String) paramBlockObject;
			for (final String paramLine : paramBlock.split("\n")) {
				final String[] paramArray = paramLine.split("=", 2);
				if (paramArray.length == 2) {
					params.put(paramArray[0], paramArray[1]);
				}
			}
		}
		return params;
	}

	@Override
	public ScheduledJob findJobById(final Long jobId) {
		final CMClass schedulerClass = view.findClass(SCHEDULER_CLASS_NAME);
		final CMCard fetchedCard = view.select(anyAttribute(schedulerClass)) //
				.from(schedulerClass) //
				.where(condition(attribute(schedulerClass, "Id"), eq(jobId))) //
				.run().getOnlyRow().getCard(schedulerClass);
		return createScheduledJobFrom(fetchedCard);
	}

	@Override
	@Transactional
	public ScheduledJob createAndStart(final ScheduledJob scheduledJob) {
		final CMClass schedulerClass = view.findClass(SCHEDULER_CLASS_NAME);
		final CMCardDefinition jobToCreate = view.createCardFor(schedulerClass);
		final CMCard createdJobCard = jobToCreate.set(DETAIL_ATTRIBUTE_NAME, scheduledJob.getDetail()) //
				.setDescription(scheduledJob.getDescription()) //
				.set(CRON_EXP_ATTRIBUTE_NAME, scheduledJob.getCronExpression()) //
				.set(NOTES_ATTRIBUTE_NAME, fromParamsMapToString(scheduledJob.getParams())) //
				.save();
		final ScheduledJob createdScheduledJob = createScheduledJobFrom(createdJobCard);
		addJobToSchedulerService(createdScheduledJob);
		return createdScheduledJob;
	}

	@Override
	public String fromParamsMapToString(final Map<String, String> params) {
		final StringBuilder paramBlock = new StringBuilder();
		if (params != null) {
			for (final String key : params.keySet()) {
				final String value = params.get(key);
				if (value == null || value.contains("\n")) {
					throw ORMExceptionType.ORM_TYPE_ERROR.createException();
				}
				paramBlock.append(key).append("=").append(value).append("\n");
			}
		}
		return paramBlock.toString();
	}

	private void addJobToSchedulerService(final ScheduledJob shceuldedJob) {
		final StartProcessJob startJob = new StartProcessJob(shceuldedJob.getId());
		startJob.setDetail(shceuldedJob.getDetail());
		startJob.setParams(shceuldedJob.getParams());
		final JobTrigger jobTrigger = new RecurringTrigger(shceuldedJob.getCronExpression());
		schedulerService.addJob(startJob, jobTrigger);
	}

	@Override
	@Transactional
	public void update(final ScheduledJob jobToUpdate) {
		schedulerService.removeJob(new StartProcessJob(jobToUpdate.getId()));
		final CMClass schedulerClass = view.findClass(SCHEDULER_CLASS_NAME);
		final CMCard cardToUpdate = view.select(anyAttribute(schedulerClass)) //
				.from(schedulerClass) //
				.where(condition(attribute(schedulerClass, "Id"), eq(jobToUpdate.getId()))) //
				.run().getOnlyRow().getCard(schedulerClass);
		final CMCardDefinition mutableCard = view.update(cardToUpdate);
		mutableCard.set(CRON_EXP_ATTRIBUTE_NAME, jobToUpdate.getCronExpression()) //
				.setDescription(jobToUpdate.getDescription()) //
				.set(NOTES_ATTRIBUTE_NAME, fromParamsMapToString(jobToUpdate.getParams())) //
				.save();
		addJobToSchedulerService(jobToUpdate);
	}

	@Override
	@Transactional
	public void delete(final Long jobId) {
		final CMClass schedulerClass = view.findClass(SCHEDULER_CLASS_NAME);
		final CMCard cardToDelete = view.select(anyAttribute(schedulerClass)) //
				.from(schedulerClass) //
				.where(condition(attribute(schedulerClass, "Id"), eq(jobId))) //
				.run().getOnlyRow().getCard(schedulerClass);
		view.delete(cardToDelete);
		schedulerService.removeJob(new StartProcessJob(jobId));
	}

}