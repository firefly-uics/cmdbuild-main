package unit.logic.taskmanager;

import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import java.util.Map;

import org.cmdbuild.logic.taskmanager.DefaultTaskManagerLogic;
import org.cmdbuild.logic.taskmanager.SchedulerFacade;
import org.cmdbuild.logic.taskmanager.StartWorkflowTask;
import org.cmdbuild.logic.taskmanager.Task;
import org.cmdbuild.model.scheduler.SchedulerJob;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;

import com.google.common.collect.Maps;

public class DefaultTaskManagerLogicTest {

	private SchedulerFacade schedulerFacade;
	private DefaultTaskManagerLogic taskManagerLogic;

	@Before
	public void setUp() throws Exception {
		schedulerFacade = mock(SchedulerFacade.class);
		taskManagerLogic = new DefaultTaskManagerLogic(schedulerFacade);
	}

	@Test
	public void startWorkflowTaskAdded() throws Exception {
		// given
		final Map<String, String> values = Maps.newHashMap();
		values.put("foo", "bar");
		values.put("bar", "baz");
		values.put("baz", "foo");
		final StartWorkflowTask task = StartWorkflowTask.newInstance() //
				.withDescription("the description") //
				.withActiveStatus(true) //
				.withProcessClass("Dummy") //
				.withCronExpression("cron expression") //
				.withParameters(values) //
				.build();

		// when
		taskManagerLogic.add(task);

		// then
		final ArgumentCaptor<SchedulerJob> schedulerJobCaptor = ArgumentCaptor.forClass(SchedulerJob.class);
		verify(schedulerFacade).add(schedulerJobCaptor.capture());
		verifyNoMoreInteractions(schedulerFacade);

		final SchedulerJob capturedForStore = schedulerJobCaptor.getAllValues().get(0);
		assertThat(capturedForStore.getDescription(), equalTo("the description"));
		assertThat(capturedForStore.getDetail(), equalTo("Dummy"));
		assertThat(capturedForStore.getLegacyParameters(), equalTo(values));
	}

	@Test
	public void startWorkflowTaskDeleted() throws Exception {
		// given
		final StartWorkflowTask task = StartWorkflowTask.newInstance() //
				.withId(42L) //
				.build();

		// when
		taskManagerLogic.delete(task);

		// then
		final ArgumentCaptor<SchedulerJob> schedulerJobCaptor = ArgumentCaptor.forClass(SchedulerJob.class);
		verify(schedulerFacade).delete(schedulerJobCaptor.capture());
		verifyNoMoreInteractions(schedulerFacade);

		final SchedulerJob capturedForStore = schedulerJobCaptor.getAllValues().get(0);
		assertThat(capturedForStore.getId(), equalTo(42L));
	}

	@Test(expected = IllegalArgumentException.class)
	public void cannotDeleteTaskWithoutAnId() throws Exception {
		// given
		final Task task = mock(Task.class);
		when(task.getId()) //
				.thenReturn(null);

		// when
		taskManagerLogic.delete(task);
	}

}
