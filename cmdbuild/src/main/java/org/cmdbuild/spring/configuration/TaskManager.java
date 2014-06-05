package org.cmdbuild.spring.configuration;

import org.cmdbuild.auth.UserStore;
import org.cmdbuild.config.DatabaseConfiguration;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.dao.view.DBDataView;
import org.cmdbuild.data.store.DataViewStore;
import org.cmdbuild.data.store.DataViewStore.StorableConverter;
import org.cmdbuild.data.store.Store;
import org.cmdbuild.data.store.task.DefaultTaskStore;
import org.cmdbuild.data.store.task.TaskDefinition;
import org.cmdbuild.data.store.task.TaskDefinitionConverter;
import org.cmdbuild.data.store.task.TaskParameter;
import org.cmdbuild.data.store.task.TaskParameterConverter;
import org.cmdbuild.data.store.task.TaskStore;
import org.cmdbuild.dms.DmsConfiguration;
import org.cmdbuild.logic.taskmanager.AsynchronousEventTask;
import org.cmdbuild.logic.taskmanager.AsynchronousEventTaskJobFactory;
import org.cmdbuild.logic.taskmanager.ConnectorTask;
import org.cmdbuild.logic.taskmanager.ConnectorTaskJobFactory;
import org.cmdbuild.logic.taskmanager.DefaultAttributeValueAdapter;
import org.cmdbuild.logic.taskmanager.DefaultLogicAndObserverConverter;
import org.cmdbuild.logic.taskmanager.DefaultLogicAndObserverConverter.ObserverFactory;
import org.cmdbuild.logic.taskmanager.DefaultLogicAndSchedulerConverter;
import org.cmdbuild.logic.taskmanager.DefaultLogicAndStoreConverter;
import org.cmdbuild.logic.taskmanager.DefaultObserverFactory;
import org.cmdbuild.logic.taskmanager.DefaultSchedulerFacade;
import org.cmdbuild.logic.taskmanager.DefaultSynchronousEventFacade;
import org.cmdbuild.logic.taskmanager.DefaultTaskManagerLogic;
import org.cmdbuild.logic.taskmanager.LogicAndObserverConverter;
import org.cmdbuild.logic.taskmanager.LogicAndSchedulerConverter;
import org.cmdbuild.logic.taskmanager.ReadEmailTask;
import org.cmdbuild.logic.taskmanager.ReadEmailTaskJobFactory;
import org.cmdbuild.logic.taskmanager.SchedulerFacade;
import org.cmdbuild.logic.taskmanager.StartWorkflowTask;
import org.cmdbuild.logic.taskmanager.StartWorkflowTaskJobFactory;
import org.cmdbuild.logic.taskmanager.SynchronousEventFacade;
import org.cmdbuild.logic.taskmanager.TaskManagerLogic;
import org.cmdbuild.logic.taskmanager.TransactionalTaskManagerLogic;
import org.cmdbuild.services.event.DefaultObserverCollector;
import org.cmdbuild.spring.annotations.ConfigurationComponent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;

import com.google.common.base.Supplier;

@ConfigurationComponent
public class TaskManager {

	@Autowired
	private Api api;

	@Autowired
	private Data data;

	@Autowired
	private DatabaseConfiguration databaseConfiguration;

	@Autowired
	private Dms dms;

	@Autowired
	private DmsConfiguration dmsConfiguration;

	@Autowired
	private Email email;

	@Autowired
	private Other other;

	@Autowired
	private Scheduler scheduler;

	@Autowired
	private DBDataView systemDataView;

	@Autowired
	private User user;

	@Autowired
	private UserStore userStore;

	@Autowired
	private Workflow workflow;

	@Bean
	public TaskManagerLogic taskManagerLogic() {
		final TaskManagerLogic defaultTaskManagerLogic = new DefaultTaskManagerLogic(defaultLogicAndStoreConverter(),
				defaultTaskStore(), defaultSchedulerTaskFacade(), defaultSynchronousEventFacade());
		return new TransactionalTaskManagerLogic(defaultTaskManagerLogic);
	}

	@Bean
	protected SchedulerFacade defaultSchedulerTaskFacade() {
		return new DefaultSchedulerFacade(scheduler.defaultSchedulerService(), defaultLogicAndSchedulerConverter());
	}

	@Bean
	public DefaultObserverCollector defaultObserverCollector() {
		return new DefaultObserverCollector();
	}

	@Bean
	protected DefaultLogicAndStoreConverter defaultLogicAndStoreConverter() {
		return new DefaultLogicAndStoreConverter();
	}

	@Bean
	protected TaskStore defaultTaskStore() {
		return new DefaultTaskStore(dataViewSchedulerJobStore(), dataViewSchedulerJobParameterStore());
	}

	@Bean
	protected Store<TaskDefinition> dataViewSchedulerJobStore() {
		return DataViewStore.newInstance(systemDataView, schedulerJobConverter());
	}

	@Bean
	protected StorableConverter<TaskDefinition> schedulerJobConverter() {
		return new TaskDefinitionConverter();
	}

	@Bean
	protected Store<TaskParameter> dataViewSchedulerJobParameterStore() {
		return DataViewStore.newInstance(systemDataView, schedulerJobParameterStoreConverter());
	}

	@Bean
	protected StorableConverter<TaskParameter> schedulerJobParameterStoreConverter() {
		return new TaskParameterConverter();
	}

	@Bean
	protected LogicAndSchedulerConverter defaultLogicAndSchedulerConverter() {
		final DefaultLogicAndSchedulerConverter converter = new DefaultLogicAndSchedulerConverter();
		converter.register(AsynchronousEventTask.class, asynchronousEventTaskJobFactory());
		converter.register(ConnectorTask.class, connectorTaskJobFactory());
		converter.register(ReadEmailTask.class, readEmailTaskJobFactory());
		converter.register(StartWorkflowTask.class, startWorkflowTaskJobFactory());
		return converter;
	}

	@Bean
	protected AsynchronousEventTaskJobFactory asynchronousEventTaskJobFactory() {
		return new AsynchronousEventTaskJobFactory( //
				data.systemDataView(), //
				email.emailAccountStore(), //
				email.emailServiceFactory(), //
				email.emailTemplateLogic(), //
				defaultTaskStore(), //
				defaultLogicAndStoreConverter() //
		);
	}

	@Bean
	protected ConnectorTaskJobFactory connectorTaskJobFactory() {
		return new ConnectorTaskJobFactory( //
				data.systemDataView(), //
				other.dataSourceHelper(), //
				defaultAttributeValueAdapter(),//
				email.emailAccountStore(), //
				email.emailServiceFactory(), //
				email.emailTemplateLogic() //
		);
	}

	@Bean
	protected DefaultAttributeValueAdapter defaultAttributeValueAdapter() {
		return new DefaultAttributeValueAdapter(data.systemDataView(), data.lookupStore());
	}

	@Bean
	protected ReadEmailTaskJobFactory readEmailTaskJobFactory() {
		return new ReadEmailTaskJobFactory( //
				email.emailAccountStore(), //
				email.emailServiceFactory(), //
				email.subjectHandler(), //
				email.emailPersistence(), //
				workflow.systemWorkflowLogicBuilder() //
						.build(), //
				dms.dmsLogic(), //
				data.systemDataView(), //
				email.emailTemplateLogic() //
		);
	}

	@Bean
	protected StartWorkflowTaskJobFactory startWorkflowTaskJobFactory() {
		return new StartWorkflowTaskJobFactory(workflow.systemWorkflowLogicBuilder().build());
	}

	@Bean
	protected SynchronousEventFacade defaultSynchronousEventFacade() {
		return new DefaultSynchronousEventFacade(defaultObserverCollector(), logicAndObserverConverter());
	}

	@Bean
	protected LogicAndObserverConverter logicAndObserverConverter() {
		return new DefaultLogicAndObserverConverter(observerFactory());
	}

	@Bean
	protected ObserverFactory observerFactory() {
		return new DefaultObserverFactory( //
				userStore, //
				api.systemFluentApi(), //
				workflow.systemWorkflowLogicBuilder().build(), //
				email.emailAccountStore(), //
				email.emailServiceFactory(), //
				email.emailTemplateLogic(), //
				data.systemDataView(), //
				new Supplier<CMDataView>() {

					@Override
					public CMDataView get() {
						return user.userDataView();
					}

				}

		);
	}
}
