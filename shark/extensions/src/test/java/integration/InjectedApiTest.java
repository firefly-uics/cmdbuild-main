package integration;

import static org.mockito.Matchers.any;
import static org.mockito.Matchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static utils.EventManagerMatchers.isActivity;
import static utils.XpdlTestUtils.randomName;

import org.cmdbuild.api.fluent.Card;
import org.cmdbuild.workflow.xpdl.XpdlActivity;
import org.cmdbuild.workflow.xpdl.XpdlDocument.ScriptLanguage;
import org.cmdbuild.workflow.xpdl.XpdlProcess;
import org.junit.Before;
import org.junit.Test;

import utils.AbstractLocalSharkServiceTest;
import utils.MockSharkWorkflowApi;

public class InjectedApiTest extends AbstractLocalSharkServiceTest {

	private XpdlProcess process;

	@Before
	public void createAndUploadPackage() throws Exception {
		process = xpdlDocument.createProcess(randomName());
	}

	@Test
	public void apiSuccessfullyCalled() throws Exception {
		final XpdlActivity scriptActivity = process.createActivity(randomName());
		scriptActivity.setScriptingType(ScriptLanguage.JAVA, //
				"cmdb.newCard(\"Funny\")" //
						+ ".with(\"Code\", \"code\")" //
						+ ".create();");

		final XpdlActivity noImplActivity = process.createActivity(randomName());

		process.createTransition(scriptActivity, noImplActivity);

		uploadXpdlAndStartProcess(process).getProcessInstanceId();
		verify(eventManager).activityClosed(argThat(isActivity(scriptActivity)));

		verify(MockSharkWorkflowApi.fluentApiExecutor).create(any(Card.class));
		verifyNoMoreInteractions(MockSharkWorkflowApi.fluentApiExecutor);
	}

}
