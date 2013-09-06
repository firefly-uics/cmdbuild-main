package org.cmdbuild.spring.configuration;

import static org.cmdbuild.spring.util.Constants.PROTOTYPE;

import org.cmdbuild.auth.AuthenticationService;
import org.cmdbuild.auth.UserStore;
import org.cmdbuild.auth.user.OperationUser;
import org.cmdbuild.common.Builder;
import org.cmdbuild.config.WorkflowConfiguration;
import org.cmdbuild.dao.view.DBDataView;
import org.cmdbuild.dao.view.user.UserDataView;
import org.cmdbuild.dao.view.user.privileges.RowAndColumnPrivilegeFetcher;
import org.cmdbuild.data.store.lookup.LookupStore;
import org.cmdbuild.logger.WorkflowLogger;
import org.cmdbuild.logic.data.access.SoapDataAccessLogicBuilder;
import org.cmdbuild.logic.data.access.UserDataAccessLogicBuilder;
import org.cmdbuild.logic.workflow.UserWorkflowLogicBuilder;
import org.cmdbuild.services.FilesStore;
import org.cmdbuild.spring.annotations.ConfigurationComponent;
import org.cmdbuild.workflow.DataViewWorkflowPersistence.DataViewWorkflowPersistenceBuilder;
import org.cmdbuild.workflow.DefaultWorkflowEngine;
import org.cmdbuild.workflow.DefaultWorkflowEngine.DefaultWorkflowEngineBuilder;
import org.cmdbuild.workflow.ProcessDefinitionManager;
import org.cmdbuild.workflow.WorkflowPersistence;
import org.cmdbuild.workflow.WorkflowTypesConverter;
import org.cmdbuild.workflow.service.CMWorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Scope;

@ConfigurationComponent
public class User {

	@Autowired
	@Qualifier("default")
	private AuthenticationService authenticationService;

	@Autowired
	private FilesStore filesStore;

	@Autowired
	private LockCard lockCard;

	@Autowired
	private LookupStore lookupStore;

	@Autowired
	private ProcessDefinitionManager processDefinitionManager;

	@Autowired
	private RowAndColumnPrivilegeFetcher rowAndColumnPrivilegeFetcher;

	@Autowired
	private DBDataView systemDataView;

	@Autowired
	private UserStore userStore;

	@Autowired
	private WorkflowConfiguration workflowConfiguration;

	@Autowired
	private CMWorkflowService workflowService;

	@Autowired
	private WorkflowLogger workflowLogger;

	@Autowired
	private WorkflowTypesConverter workflowTypesConverter;

	@Bean
	@Scope(PROTOTYPE)
	@Qualifier("soap")
	public SoapDataAccessLogicBuilder soapDataAccessLogicBuilder() {
		return new SoapDataAccessLogicBuilder( //
				systemDataView, //
				lookupStore, //
				userDataView(), //
				userStore.getUser(), //
				lockCard.emptyLockCardManager());
	}

	@Bean
	@Scope(PROTOTYPE)
	@Qualifier("user")
	public UserDataAccessLogicBuilder userDataAccessLogicBuilder() {
		return new UserDataAccessLogicBuilder( //
				systemDataView, //
				lookupStore, //
				userDataView(), //
				userStore.getUser(), //
				lockCard.userLockCardManager());
	}

	@Bean
	@Scope(PROTOTYPE)
	@Qualifier("user")
	public UserDataView userDataView() {
		return new UserDataView( //
				systemDataView, //
				userStore.getUser().getPrivilegeContext(), //
				rowAndColumnPrivilegeFetcher, //
				userStore.getUser());
	}

	@Bean
	@Scope(PROTOTYPE)
	@Qualifier("user")
	protected Builder<DefaultWorkflowEngine> userWorkflowEngineBuilder() {
		final OperationUser operationUser = userStore.getUser();
		return new DefaultWorkflowEngineBuilder() //
				.withOperationUser(operationUser) // FIXME use system user
				.withPersistence(userWorkflowPersistence()) //
				.withService(workflowService) //
				.withTypesConverter(workflowTypesConverter) //
				.withEventListener(workflowLogger) //
				.withAuthenticationService(authenticationService);
	}

	@Bean
	@Scope(PROTOTYPE)
	protected WorkflowPersistence userWorkflowPersistence() {
		final OperationUser operationUser = userStore.getUser();
		return new DataViewWorkflowPersistenceBuilder() //
				.withPrivilegeContext(operationUser.getPrivilegeContext()) //
				.withOperationUser(operationUser) //
				.withDataView(userDataView()) //
				.withProcessDefinitionManager(processDefinitionManager) //
				.withLookupStore(lookupStore) //
				.withWorkflowService(workflowService) //
				.build();
	}

	@Bean
	@Scope(PROTOTYPE)
	@Qualifier("user")
	public UserWorkflowLogicBuilder userWorkflowLogicBuilder() {
		return new UserWorkflowLogicBuilder( //
				userStore.getUser().getPrivilegeContext(), //
				userWorkflowEngineBuilder(), //
				userDataView(), //
				systemDataView, //
				lookupStore, //
				workflowConfiguration, //
				filesStore);
	}

}