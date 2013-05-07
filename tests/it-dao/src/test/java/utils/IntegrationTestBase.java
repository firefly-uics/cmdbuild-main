package utils;

import org.cmdbuild.auth.acl.NullGroup;
import org.cmdbuild.auth.context.NullPrivilegeContext;
import org.cmdbuild.auth.user.AnonymousUser;
import org.cmdbuild.auth.user.OperationUser;
import org.cmdbuild.dao.driver.DBDriver;
import org.cmdbuild.dao.view.DBDataView;
import org.cmdbuild.data.store.DataViewStore;
import org.cmdbuild.data.store.lookup.DataViewLookupStore;
import org.cmdbuild.data.store.lookup.Lookup;
import org.cmdbuild.data.store.lookup.LookupStorableConverter;
import org.cmdbuild.data.store.lookup.LookupStore;
import org.cmdbuild.spring.SpringIntegrationUtils;
import org.junit.After;
import org.junit.BeforeClass;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

/**
 * Class containing methods for initializing the integration tests database
 */
public abstract class IntegrationTestBase {

	protected static final DBInitializer dbInitializer = new DBInitializer();

	private final DBDriver testDriver;
	private final DBDataView dbView;

	protected IntegrationTestBase() {
		this.testDriver = createTestDriver();
		this.dbView = new DBDataView(testDriver);
	}

	/**
	 * Override if you need to decorate the default.
	 */
	protected DBDriver createBaseDriver() {
		return dbInitializer.getDriver();
	}

	/**
	 * Override if you don't need/want the rollback driver.
	 */
	protected DBDriver createTestDriver() {
		return new GenericRollbackDriver(createBaseDriver());
	}

	public DBDriver dbDriver() {
		return testDriver;
	}

	public DBDataView dbDataView() {
		return dbView;
	}

	public OperationUser operationUser() {
		return new OperationUser(new AnonymousUser(), new NullPrivilegeContext(), new NullGroup());
	}

	public LookupStore lookupStore() {
		final DataViewStore<Lookup> store = new DataViewStore<Lookup>(dbView, new LookupStorableConverter());
		return new DataViewLookupStore(store);
	}

	@BeforeClass
	public static void initialize() {
		final ApplicationContext applicationContext = new ClassPathXmlApplicationContext("application-context.xml");
		new SpringIntegrationUtils().setApplicationContext(applicationContext);

		dbInitializer.initialize();
	}

	@After
	public final void rollback() {
		if (testDriver instanceof GenericRollbackDriver) {
			GenericRollbackDriver.class.cast(testDriver).rollback();
		}
	}

}