package org.cmdbuild.workflow;

import static java.lang.String.format;
import static org.apache.commons.lang.ArrayUtils.indexOf;
import static org.apache.commons.lang.ArrayUtils.remove;
import static org.apache.commons.lang.StringUtils.EMPTY;
import static org.apache.commons.lang.StringUtils.defaultIfBlank;
import static org.cmdbuild.common.utils.Arrays.addDistinct;
import static org.cmdbuild.common.utils.Arrays.append;
import static org.cmdbuild.elements.interfaces.Process.ProcessAttributes.ActivityDefinitionId;
import static org.cmdbuild.elements.interfaces.Process.ProcessAttributes.ActivityInstanceId;
import static org.cmdbuild.elements.interfaces.Process.ProcessAttributes.AllActivityPerformers;
import static org.cmdbuild.elements.interfaces.Process.ProcessAttributes.CurrentActivityPerformers;
import static org.cmdbuild.elements.interfaces.Process.ProcessAttributes.FlowStatus;
import static org.cmdbuild.elements.interfaces.Process.ProcessAttributes.ProcessInstanceId;
import static org.cmdbuild.elements.interfaces.Process.ProcessAttributes.UniqueProcessDefinition;
import static org.cmdbuild.workflow.Utils.lookupForFlowStatus;

import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.lang.Validate;
import org.cmdbuild.common.Builder;
import org.cmdbuild.dao.entry.CMCard;
import org.cmdbuild.dao.entry.CMCard.CMCardDefinition;
import org.cmdbuild.logger.Log;
import org.cmdbuild.logic.TemporaryObjectsBeforeSpringDI;
import org.cmdbuild.workflow.WorkflowPersistence.ProcessCreation;
import org.cmdbuild.workflow.WorkflowPersistence.ProcessUpdate;
import org.cmdbuild.workflow.service.WSActivityInstInfo;
import org.cmdbuild.workflow.service.WSProcessInstInfo;
import org.slf4j.Logger;
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;

class WorkflowUpdateHelper {

	private static final Marker marker = MarkerFactory.getMarker(WorkflowUpdateHelper.class.getName());
	private static final Logger logger = Log.PERSISTENCE;

	public static class WorkflowUpdateHelperBuilder implements Builder<WorkflowUpdateHelper> {

		private CMCardDefinition cardDefinition;
		private WSProcessInstInfo processInstInfo;
		private CMCard card;
		private CMProcessInstance processInstance;
		private ProcessDefinitionManager processDefinitionManager;

		@Override
		public WorkflowUpdateHelper build() {
			return new WorkflowUpdateHelper(this);
		}

		private WorkflowUpdateHelperBuilder withCardDefinition(final CMCardDefinition value) {
			cardDefinition = value;
			return this;
		}

		public WorkflowUpdateHelperBuilder withProcessInstInfo(final WSProcessInstInfo value) {
			processInstInfo = value;
			return this;
		}

		public WorkflowUpdateHelperBuilder withCard(final CMCard value) {
			card = value;
			return this;
		}

		public WorkflowUpdateHelperBuilder withProcessInstance(final CMProcessInstance value) {
			processInstance = value;
			return this;
		}

		public WorkflowUpdateHelperBuilder withProcessDefinitionManager(final ProcessDefinitionManager value) {
			processDefinitionManager = value;
			return this;
		}

	}

	public static WorkflowUpdateHelperBuilder newInstance(final CMCardDefinition cardDefinition) {
		return new WorkflowUpdateHelperBuilder() //
				.withCardDefinition(cardDefinition);
	}

	private static final String UNRESOLVABLE_PARTICIPANT_GROUP = EMPTY;

	private final CMCardDefinition cardDefinition;
	private final WSProcessInstInfo processInstInfo;
	private final CMCard card;
	private final CMProcessInstance processInstance;
	private final ProcessDefinitionManager processDefinitionManager;

	private String code;
	private String uniqueProcessDefinition;
	private String processInstanceId;
	private String[] activityInstanceIds;
	private String[] activityDefinitionIds;
	private String[] currentActivityPerformers;
	private String[] allActivityPerformers;

	private WorkflowUpdateHelper(final WorkflowUpdateHelperBuilder builder) {
		this.cardDefinition = builder.cardDefinition;
		this.processInstInfo = builder.processInstInfo;
		this.card = builder.card;
		this.processInstance = builder.processInstance;
		this.processDefinitionManager = builder.processDefinitionManager;

		logger.debug(marker, "setting internal values");
		if (card != null) {
			this.code = String.class.cast(card.getCode());
			this.uniqueProcessDefinition = card.get(UniqueProcessDefinition.dbColumnName(), String.class);
			this.processInstanceId = card.get(ProcessInstanceId.dbColumnName(), String.class);
			this.activityInstanceIds = card.get(ActivityInstanceId.dbColumnName(), String[].class);
			this.activityDefinitionIds = card.get(ActivityDefinitionId.dbColumnName(), String[].class);
			this.currentActivityPerformers = card.get(CurrentActivityPerformers.dbColumnName(), String[].class);
			this.allActivityPerformers = card.get(AllActivityPerformers.dbColumnName(), String[].class);
		} else {
			logger.debug(marker, "card not found, setting default values");
			this.activityInstanceIds = ArrayUtils.EMPTY_STRING_ARRAY;
			this.activityDefinitionIds = ArrayUtils.EMPTY_STRING_ARRAY;
			this.currentActivityPerformers = ArrayUtils.EMPTY_STRING_ARRAY;
			this.allActivityPerformers = ArrayUtils.EMPTY_STRING_ARRAY;
		}
		logger.debug(marker, "getting stored activity instance ids", activityInstanceIds);
		logger.debug(marker, "getting stored activity definition ids", activityDefinitionIds);
		logger.debug(marker, "getting stored current activity performers", currentActivityPerformers);
		logger.debug(marker, "getting stored all activity performers", allActivityPerformers);
	}

	public CMCard save() {
		cardDefinition.setCode(code);
		cardDefinition.set(UniqueProcessDefinition.dbColumnName(), uniqueProcessDefinition);
		cardDefinition.set(ProcessInstanceId.dbColumnName(), processInstanceId);
		cardDefinition.set(ActivityInstanceId.dbColumnName(), activityInstanceIds);
		cardDefinition.set(ActivityDefinitionId.dbColumnName(), activityDefinitionIds);
		cardDefinition.set(CurrentActivityPerformers.dbColumnName(), currentActivityPerformers);
		cardDefinition.set(AllActivityPerformers.dbColumnName(), allActivityPerformers);
		return cardDefinition.save();
	}

	public WorkflowUpdateHelper initialize() {
		processInstanceId = processInstInfo.getProcessInstanceId();
		activityInstanceIds = ArrayUtils.EMPTY_STRING_ARRAY;
		activityDefinitionIds = ArrayUtils.EMPTY_STRING_ARRAY;
		currentActivityPerformers = ArrayUtils.EMPTY_STRING_ARRAY;
		allActivityPerformers = ArrayUtils.EMPTY_STRING_ARRAY;
		return this;
	}

	public WorkflowUpdateHelper fillForCreation(final ProcessCreation processCreation) throws CMWorkflowException {
		logger.info(marker, "filling process card for creation");
		updateCreationData(processCreation);
		return this;
	}

	private void updateCreationData(final ProcessCreation processCreation) {
		if (processCreation.state() != ProcessCreation.NO_STATE) {
			logger.debug(marker, "updating state");
			final Object id = Long.valueOf(lookupForFlowStatus(processCreation.state()).getId());
			cardDefinition.set(FlowStatus.dbColumnName(), id);
		}

		if (processCreation.processInstanceInfo() != ProcessCreation.NO_PROCESS_INSTANCE_INFO) {
			logger.debug(marker, "updating process instance info");
			final WSProcessInstInfo info = processCreation.processInstanceInfo();
			final String value = format("%s#%s#%s", info.getPackageId(), info.getPackageVersion(),
					info.getProcessDefinitionId());
			uniqueProcessDefinition = value;
		}
	}

	public WorkflowUpdateHelper fillForModification(final ProcessUpdate processUpdate) throws CMWorkflowException {
		logger.info(marker, "filling process card for modification");
		updateModificationData(processUpdate);
		return this;
	}

	private void updateModificationData(final ProcessUpdate processUpdate) throws CMWorkflowException {
		updateCreationData(processUpdate);
		if (processUpdate.values() != ProcessUpdate.NO_VALUES) {
			logger.debug(marker, "updating values");
			for (final Entry<String, ?> entry : processUpdate.values().entrySet()) {
				logger.debug(marker, "updating process attribute '{}' with value '{}'", entry.getKey(),
						entry.getValue());
				cardDefinition.set(entry.getKey(), entry.getValue());
			}
		}
		if (processUpdate.addActivities() != ProcessUpdate.NO_ACTIVITIES) {
			logger.debug(marker, "adding activities");
			for (final WSActivityInstInfo activityInstanceInfo : processUpdate.addActivities()) {
				logger.debug(marker, "adding activity '{}' '{}'", //
						activityInstanceInfo.getActivityDefinitionId(), //
						activityInstanceInfo.getActivityInstanceId());
				addActivity(activityInstanceInfo);
			}
		}
		if (processUpdate.activities() != ProcessUpdate.NO_ACTIVITIES) {
			logger.debug(marker, "setting activities");
			final WSActivityInstInfo[] activityInfos = processUpdate.activities();
			removeClosedActivities(activityInfos);
			addNewActivities(activityInfos);
			updateCodeWithFirstActivityInfo();
		}
	}

	private void addActivity(final WSActivityInstInfo activityInfo) throws CMWorkflowException {
		Validate.notNull(activityInfo);
		Validate.notNull(activityInfo.getActivityInstanceId());
		final String participantGroup = extractActivityParticipantGroup(activityInfo);
		if (participantGroup != UNRESOLVABLE_PARTICIPANT_GROUP) {
			activityInstanceIds = append(activityInstanceIds, activityInfo.getActivityInstanceId());
			activityDefinitionIds = append(activityDefinitionIds, activityInfo.getActivityDefinitionId());

			currentActivityPerformers = append(currentActivityPerformers, participantGroup);
			allActivityPerformers = addDistinct(allActivityPerformers, participantGroup);
			updateCodeWithFirstActivityInfo();
		}
	}

	private String extractActivityParticipantGroup(final WSActivityInstInfo activityInfo) throws CMWorkflowException {
		final CMActivity activity = processDefinitionManager.getActivity(processInstance,
				activityInfo.getActivityDefinitionId());
		final ActivityPerformer performer = activity.getFirstNonAdminPerformer();
		final String group;
		switch (performer.getType()) {
		case ROLE:
			group = performer.getValue();
			break;
		case EXPRESSION:
			final String expression = performer.getValue();
			final Set<String> names = evaluatorFor(expression).getNames();
			if (activityInfo.getParticipants().length == 0) {
				/*
				 * an arbitrary expression in a non-starting activity, so should
				 * be a single name
				 */
				final Iterator<String> namesItr = names.iterator();
				group = namesItr.hasNext() ? namesItr.next() : UNRESOLVABLE_PARTICIPANT_GROUP;
			} else {
				final String maybeParticipantGroup = activityInfo.getParticipants()[0];
				group = names.contains(maybeParticipantGroup) ? maybeParticipantGroup : UNRESOLVABLE_PARTICIPANT_GROUP;
			}
			break;
		default:
			group = UNRESOLVABLE_PARTICIPANT_GROUP;
		}
		return group;
	}

	private ActivityPerformerExpressionEvaluator evaluatorFor(final String expression) throws CMWorkflowException {
		final ActivityPerformerExpressionEvaluator evaluator = new BshActivityPerformerExpressionEvaluator(expression);
		final Map<String, Object> rawWorkflowVars = TemporaryObjectsBeforeSpringDI.getWorkflowService() //
				.getProcessInstanceVariables(processInstance.getProcessInstanceId());
		evaluator.setVariables(rawWorkflowVars);
		return evaluator;
	}

	private void removeClosedActivities(final WSActivityInstInfo[] activityInfos) throws CMWorkflowException {
		logger.debug(marker, "removing closed activivities");

		logger.debug(marker, "building actual activities list");
		final Set<String> newActivityInstInfoIds = new HashSet<String>(activityInfos.length);
		for (final WSActivityInstInfo ai : activityInfos) {
			logger.debug(marker, "adding activity '{}' to actual list", ai.getActivityInstanceId());
			newActivityInstInfoIds.add(ai.getActivityInstanceId());
		}

		logger.debug(marker, "removing persisted activities not contained in actual activities list");
		for (final String oldActInstId : activityInstanceIds) {
			final boolean contained = newActivityInstInfoIds.contains(oldActInstId);
			logger.debug(marker, "persisted activity '{}' is contained in actual list? {}", oldActInstId, contained);
			if (!contained) {
				removeActivity(oldActInstId);
			}
		}
	}

	public void removeActivity(final String activityInstanceId) throws CMWorkflowException {
		logger.info(marker, "removing persisted activity '{}'", activityInstanceId);
		final int index = indexOf(activityInstanceIds, activityInstanceId);
		logger.debug(marker, "index of '{}' is '{}'", activityInstanceId, index);
		if (index != ArrayUtils.INDEX_NOT_FOUND) {
			activityInstanceIds = String[].class.cast(remove(activityInstanceIds, index));
			activityDefinitionIds = String[].class.cast(remove(activityDefinitionIds, index));
			currentActivityPerformers = String[].class.cast(remove(currentActivityPerformers, index));

			logger.debug(marker, "new activity instance ids: '{}'", activityInstanceIds);
			logger.debug(marker, "new activity definition ids: '{}'", activityDefinitionIds);
			logger.debug(marker, "new activity instance performers: '{}'", currentActivityPerformers);

			updateCodeWithFirstActivityInfo();
		}
	}

	private void addNewActivities(final WSActivityInstInfo[] activityInfos) throws CMWorkflowException {
		final Set<String> oldActivityInstanceIds = new HashSet<String>();
		for (final String aiid : activityInstanceIds) {
			oldActivityInstanceIds.add(aiid);
		}
		for (final WSActivityInstInfo ai : activityInfos) {
			if (oldActivityInstanceIds.contains(ai.getActivityInstanceId())) {
				continue;
			}
			addActivity(ai);
		}
	}

	private void updateCodeWithFirstActivityInfo() throws CMWorkflowException {
		final List<? extends CMActivityInstance> activities = processInstance.getActivities();
		if (activities.isEmpty()) {
			code = null;
		} else {
			final CMActivity firstActivity = activities.get(0).getDefinition();
			final String label = defaultIfBlank(firstActivity.getDescription(), EMPTY);
			if (activities.size() > 1) {
				code = format("%s, ...", label);
			} else {
				code = label;
			}
		}
	}

}
