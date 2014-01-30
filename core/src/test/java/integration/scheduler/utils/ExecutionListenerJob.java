package integration.scheduler.utils;

import java.util.Date;

import org.cmdbuild.services.scheduler.job.CMJob;

public class ExecutionListenerJob implements CMJob {

	private Date lastExecutionTime = null;
	private int totalExecutions = 0;

	public boolean hasBeenExecuted() {
		return (totalExecutions > 0);
	}

	public Date getLastExecutionTime() {
		return lastExecutionTime;
	}

	public int getTotalExecutions() {
		return totalExecutions;
	}

	@Override
	public void execute() {
		lastExecutionTime = new Date();
		++totalExecutions;
	}

	@Override
	public String getName() {
		return String.valueOf(this.hashCode());
	}
}
