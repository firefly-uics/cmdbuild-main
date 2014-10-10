package unit.cxf;

import static com.google.common.collect.Iterables.get;
import static com.google.common.collect.Iterables.size;
import static java.util.Arrays.asList;
import static org.cmdbuild.service.rest.cxf.serialization.FakeId.fakeId;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyLong;
import static org.mockito.Matchers.anyString;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;

import javax.ws.rs.WebApplicationException;

import org.cmdbuild.common.utils.PagedElements;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.logic.data.QueryOptions;
import org.cmdbuild.logic.workflow.WorkflowLogic;
import org.cmdbuild.service.rest.cxf.CxfProcessInstanceActivities;
import org.cmdbuild.service.rest.cxf.ErrorHandler;
import org.cmdbuild.service.rest.model.ProcessActivityWithBasicDetails;
import org.cmdbuild.service.rest.model.ProcessActivityWithFullDetails;
import org.cmdbuild.service.rest.model.ProcessActivityWithFullDetails.AttributeStatus;
import org.cmdbuild.service.rest.model.ResponseMultiple;
import org.cmdbuild.service.rest.model.ResponseSingle;
import org.cmdbuild.workflow.CMActivity;
import org.cmdbuild.workflow.CMWorkflowException;
import org.cmdbuild.workflow.user.UserActivityInstance;
import org.cmdbuild.workflow.user.UserProcessClass;
import org.cmdbuild.workflow.user.UserProcessInstance;
import org.cmdbuild.workflow.xpdl.CMActivityVariableToProcess;
import org.cmdbuild.workflow.xpdl.CMActivityVariableToProcess.Type;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;

public class CxfProcessInstanceActivitiesTest {

	private ErrorHandler errorHandler;
	private WorkflowLogic workflowLogic;

	private CxfProcessInstanceActivities cxfProcessInstanceActivities;

	@Before
	public void setUp() throws Exception {
		errorHandler = mock(ErrorHandler.class);
		workflowLogic = mock(WorkflowLogic.class);
		cxfProcessInstanceActivities = new CxfProcessInstanceActivities(errorHandler, workflowLogic);
	}

	@Test(expected = WebApplicationException.class)
	public void exceptionWhenReadingAllActivitiesButProcessNotFound() throws Exception {
		// given
		doReturn(null) //
				.when(workflowLogic).findProcessClass(anyLong());
		doThrow(WebApplicationException.class) //
				.when(errorHandler).processNotFound(anyLong());

		// when
		cxfProcessInstanceActivities.read(123L, 456L);

		// then
		final InOrder inOrder = inOrder(errorHandler, workflowLogic);
		inOrder.verify(workflowLogic).findProcessClass(eq(123L));
		inOrder.verify(errorHandler).processNotFound(eq(123L));
		inOrder.verifyNoMoreInteractions();
	}

	@Test(expected = WebApplicationException.class)
	public void exceptionWhenReadingAllActivitiesButInstanceNotFound() throws Exception {
		// given
		final UserProcessClass userProcessClass = mock(UserProcessClass.class);
		doReturn(userProcessClass) //
				.when(workflowLogic).findProcessClass(anyLong());
		final PagedElements<UserProcessInstance> noElements = new PagedElements<UserProcessInstance>(null, 0);
		doReturn(noElements) //
				.when(workflowLogic).query(any(CMClass.class), any(QueryOptions.class));
		doThrow(WebApplicationException.class) //
				.when(errorHandler).processInstanceNotFound(anyLong());

		// when
		cxfProcessInstanceActivities.read(123L, 456L);

		// then
		final InOrder inOrder = inOrder(errorHandler, workflowLogic);
		inOrder.verify(workflowLogic).findProcessClass(eq(123L));
		inOrder.verify(workflowLogic).query(userProcessClass, any(QueryOptions.class));
		inOrder.verify(errorHandler).processInstanceNotFound(eq(456L));
		inOrder.verifyNoMoreInteractions();
	}

	@Test
	public void allActivitiesReturned() throws Exception {
		// given
		final UserProcessClass userProcessClass = mock(UserProcessClass.class);
		doReturn(userProcessClass) //
				.when(workflowLogic).findProcessClass(anyLong());
		final UserActivityInstance onlyActivity = mock(UserActivityInstance.class);
		doReturn("foo") //
				.when(onlyActivity).getId();
		doReturn(true) //
				.when(onlyActivity).isWritable();
		final UserProcessInstance onlyInstance = mock(UserProcessInstance.class);
		doReturn(asList(onlyActivity)) //
				.when(onlyInstance).getActivities();
		final PagedElements<UserProcessInstance> pagedElements = new PagedElements<UserProcessInstance>(
				asList(onlyInstance), 1);
		doReturn(pagedElements) //
				.when(workflowLogic).query(any(CMClass.class), any(QueryOptions.class));

		// when
		final ResponseMultiple<ProcessActivityWithBasicDetails> response = cxfProcessInstanceActivities
				.read(123L, 456L);

		// then
		final ArgumentCaptor<QueryOptions> queryOptionsCaptor = ArgumentCaptor.forClass(QueryOptions.class);
		final InOrder inOrder = inOrder(errorHandler, workflowLogic);
		inOrder.verify(workflowLogic).findProcessClass(eq(123L));
		inOrder.verify(workflowLogic).query(eq(userProcessClass), queryOptionsCaptor.capture());
		inOrder.verifyNoMoreInteractions();
		final QueryOptions captured = queryOptionsCaptor.getValue();
		assertThat(captured.getLimit(), equalTo(1));
		assertThat(captured.getOffset(), equalTo(0));
		assertThat(response.getMetadata().getTotal(), equalTo(1L));
		final Iterable<ProcessActivityWithBasicDetails> elements = response.getElements();
		assertThat(size(elements), equalTo(1));
		final ProcessActivityWithBasicDetails firstElement = get(elements, 0);
		assertThat(firstElement.getId(), equalTo(fakeId("foo")));
		assertThat(firstElement.isWritable(), equalTo(true));
	}

	@Test(expected = WebApplicationException.class)
	public void exceptionWhenReadingActivityButProcessNotFound() throws Exception {
		// given
		doReturn(null) //
				.when(workflowLogic).findProcessClass(anyLong());
		doThrow(WebApplicationException.class) //
				.when(errorHandler).processNotFound(anyLong());

		// when
		cxfProcessInstanceActivities.read(123L, 456L, 789L);

		// then
		final InOrder inOrder = inOrder(errorHandler, workflowLogic);
		inOrder.verify(workflowLogic).findProcessClass(eq(123L));
		inOrder.verify(errorHandler).processNotFound(eq(123L));
		inOrder.verifyNoMoreInteractions();
	}

	@Test(expected = WebApplicationException.class)
	public void exceptionWhenReadingActivityButInstanceNotFound() throws Exception {
		// given
		final UserProcessClass userProcessClass = mock(UserProcessClass.class);
		doReturn(userProcessClass) //
				.when(workflowLogic).findProcessClass(anyLong());
		doReturn(null) //
				.when(workflowLogic).getProcessInstance(anyLong(), anyLong());
		doThrow(WebApplicationException.class) //
				.when(errorHandler).processInstanceNotFound(anyLong());

		// when
		cxfProcessInstanceActivities.read(123L, 456L, 789L);

		// then
		final InOrder inOrder = inOrder(errorHandler, workflowLogic);
		inOrder.verify(workflowLogic).findProcessClass(eq(123L));
		inOrder.verify(workflowLogic).getProcessInstance(eq(123L), eq(456L));
		inOrder.verify(errorHandler).processInstanceNotFound(eq(456L));
		inOrder.verifyNoMoreInteractions();
	}

	@Test(expected = WebApplicationException.class)
	public void exceptionWhenReadingActivityButActivityNotFound() throws Exception {
		// given
		final UserProcessClass userProcessClass = mock(UserProcessClass.class);
		doReturn(userProcessClass) //
				.when(workflowLogic).findProcessClass(anyLong());
		final UserProcessInstance userProcessInstance = mock(UserProcessInstance.class);
		doReturn(asList()) //
				.when(userProcessInstance).getActivities();
		doReturn(userProcessInstance) //
				.when(workflowLogic).getProcessInstance(anyLong(), anyLong());
		doThrow(WebApplicationException.class) //
				.when(errorHandler).processActivityNotFound(anyLong());

		// when
		cxfProcessInstanceActivities.read(123L, 456L, 789L);

		// then
		final InOrder inOrder = inOrder(errorHandler, workflowLogic);
		inOrder.verify(workflowLogic).findProcessClass(eq(123L));
		inOrder.verify(workflowLogic).getProcessInstance(eq(123L), eq(456L));
		inOrder.verify(errorHandler).processActivityNotFound(eq(789L));
		inOrder.verifyNoMoreInteractions();
	}

	@Test(expected = WebApplicationException.class)
	public void exceptionWhenReadingActivityButGetDefinitionThrowsException() throws Exception {
		// given
		final UserProcessClass userProcessClass = mock(UserProcessClass.class);
		doReturn(userProcessClass) //
				.when(workflowLogic).findProcessClass(anyLong());
		final UserActivityInstance userActivityInstance = mock(UserActivityInstance.class);
		doReturn("bar") //
				.when(userActivityInstance).getId();
		final CMWorkflowException exception = new CMWorkflowException("dummy");
		doThrow(exception) //
				.when(userActivityInstance).getDefinition();
		final UserProcessInstance userProcessInstance = mock(UserProcessInstance.class);
		doReturn(asList(userActivityInstance)) //
				.when(userProcessInstance).getActivities();
		doReturn(userProcessInstance) //
				.when(workflowLogic).getProcessInstance(anyLong(), anyLong());
		doThrow(WebApplicationException.class) //
				.when(errorHandler).propagate(exception);

		// when
		cxfProcessInstanceActivities.read(123L, 456L, fakeId("bar"));

		// then
		final InOrder inOrder = inOrder(errorHandler, workflowLogic);
		inOrder.verify(workflowLogic).findProcessClass(eq(123L));
		inOrder.verify(workflowLogic).getProcessInstance(eq(123L), eq(456L));
		inOrder.verify(errorHandler).propagate(eq(exception));
		inOrder.verifyNoMoreInteractions();
	}

	@Test
	public void activityReturned() throws Exception {
		// given
		final UserProcessClass userProcessClass = mock(UserProcessClass.class);
		doReturn(userProcessClass) //
				.when(workflowLogic).findProcessClass(anyLong());
		final CMActivity activity = mock(CMActivity.class);
		doReturn("bar") //
				.when(activity).getId();
		doReturn("description") //
				.when(activity).getDescription();
		doReturn("instructions") //
				.when(activity).getInstructions();
		doReturn(asList( //
				new CMActivityVariableToProcess("foo", Type.READ_ONLY), //
				new CMActivityVariableToProcess("bar", Type.READ_WRITE), //
				new CMActivityVariableToProcess("baz", Type.READ_WRITE_REQUIRED) //
				)) //
				.when(activity).getVariables();
		doReturn(activity) //
				.when(workflowLogic).getStartActivity(anyString());
		final UserActivityInstance userActivityInstance = mock(UserActivityInstance.class);
		doReturn("bar") //
				.when(userActivityInstance).getId();
		final CMWorkflowException exception = new CMWorkflowException("dummy");
		doReturn(activity) //
				.when(userActivityInstance).getDefinition();
		final UserProcessInstance userProcessInstance = mock(UserProcessInstance.class);
		doReturn(asList(userActivityInstance)) //
				.when(userProcessInstance).getActivities();
		doReturn(userProcessInstance) //
				.when(workflowLogic).getProcessInstance(anyLong(), anyLong());
		doThrow(WebApplicationException.class) //
				.when(errorHandler).propagate(exception);

		// when
		final ResponseSingle<ProcessActivityWithFullDetails> response = cxfProcessInstanceActivities.read(123L, 456L,
				fakeId("bar"));

		// then
		final InOrder inOrder = inOrder(errorHandler, workflowLogic);
		inOrder.verify(workflowLogic).findProcessClass(eq(123L));
		inOrder.verify(workflowLogic).getProcessInstance(eq(123L), eq(456L));
		inOrder.verifyNoMoreInteractions();
		final ProcessActivityWithFullDetails element = response.getElement();
		assertThat(element.getId(), equalTo(fakeId(activity.getId())));
		assertThat(element.getDescription(), equalTo(activity.getDescription()));
		assertThat(element.getInstructions(), equalTo(activity.getInstructions()));
		final Iterable<AttributeStatus> attributes = element.getAttributes();
		assertThat(size(attributes), equalTo(3));
		final AttributeStatus fooReadOnly = get(attributes, 0);
		assertThat(fooReadOnly.getId(), equalTo(fakeId("foo")));
		assertThat(fooReadOnly.isWritable(), equalTo(false));
		assertThat(fooReadOnly.isMandatory(), equalTo(false));
		final AttributeStatus barWriteableAndNotMandatory = get(attributes, 1);
		assertThat(barWriteableAndNotMandatory.getId(), equalTo(fakeId("bar")));
		assertThat(barWriteableAndNotMandatory.isWritable(), equalTo(true));
		assertThat(barWriteableAndNotMandatory.isMandatory(), equalTo(false));
		final AttributeStatus bazWriteableAndMandatory = get(attributes, 2);
		assertThat(bazWriteableAndMandatory.getId(), equalTo(fakeId("baz")));
		assertThat(bazWriteableAndMandatory.isWritable(), equalTo(true));
		assertThat(bazWriteableAndMandatory.isMandatory(), equalTo(true));
	}

}
