package org.cmdbuild.workflow;

import org.apache.commons.lang.Validate;
import org.cmdbuild.dao.legacywrappers.ProcessClassWrapper;
import org.cmdbuild.elements.interfaces.ProcessType;
import org.cmdbuild.services.auth.UserContext;

/**
 * Wrapper for the CMWorkflowEngine on top of the legacy UserContext
 */
public class WorkflowEngineWrapper implements CMWorkflowEngine {

	private final UserContext userCtx;

	public WorkflowEngineWrapper(UserContext userCtx) {
		this.userCtx = userCtx;
	}

	@Override
	public CMProcessClass findProcessClass(Object idOrName) {
		Validate.notNull(idOrName);
		final ProcessType processType = findProcessType(idOrName);
		return new ProcessClassWrapper(processType);
	}

	private ProcessType findProcessType(final Object idOrName) {
		final ProcessType processType;
		if (idOrName instanceof String) {
			final String name = (String) idOrName;
			processType = userCtx.processTypes().get(name);
		} else {
			final int id = ((Number) idOrName).intValue();
			processType = userCtx.processTypes().get(id);
		}
		return processType;
	}

}
