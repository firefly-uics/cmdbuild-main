package integration.driver;

import static org.cmdbuild.dao.query.clause.QueryAliasAttribute.attribute;

import java.util.ArrayList;
import java.util.Collection;
import java.util.UUID;

import org.cmdbuild.dao.driver.CachingDriver;
import org.cmdbuild.dao.driver.DBDriver;
import org.cmdbuild.dao.driver.postgres.PostgresDriver;
import org.cmdbuild.dao.entry.DBCard;
import org.cmdbuild.dao.entry.DBEntry;
import org.cmdbuild.dao.entry.DBRelation;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.entrytype.CMEntryType;
import org.cmdbuild.dao.entrytype.DBClass;
import org.cmdbuild.dao.entrytype.DBDomain;
import org.cmdbuild.dao.query.clause.QueryAliasAttribute;
import org.cmdbuild.dao.query.clause.alias.Alias;
import org.cmdbuild.dao.view.DBDataView;
import org.junit.After;
import org.junit.runners.Parameterized.Parameters;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import utils.GenericRollbackDriver;

import com.google.common.base.Function;
import com.google.common.collect.Iterables;

/**
 * Subclasses using the @RunWith(value = Parameterized.class) annotation will
 * run the tests on every database driver. Otherwise a driver must be specified
 * in the (empty) constructor.
 */
public abstract class DriverFixture {

	protected static ApplicationContext context;

	static {
		context = new ClassPathXmlApplicationContext("structure-test-context.xml");
	}

	@Parameters
	public static Collection<Object[]> data() {
		final Collection<Object[]> params = new ArrayList<Object[]>();
		// TODO specify a generic JDBC driver
		for (final String name : context.getBeanNamesForType(PostgresDriver.class)) {
			final Object[] o = { name };
			params.add(o);
		}
		return params;
	}

	protected final GenericRollbackDriver driver;
	protected final DBDataView view;

	protected DriverFixture(final String driverBeanName) {
		final DBDriver driverToBeTested = context.getBean(driverBeanName, DBDriver.class);
		this.driver = new GenericRollbackDriver(driverToBeTested);
		this.view = new DBDataView(driver);
	}

	@After
	public void rollback() {
		driver.rollback();
		final DBDriver innerDriver = driver.getInnerDriver();
		if (innerDriver instanceof CachingDriver) {
			CachingDriver.class.cast(innerDriver).clearCache();
		}
	}

	/*
	 * Utility methods
	 */

	protected static String uniqueUUID() {
		return UUID.randomUUID().toString();
	}

	protected DBCard insertCardWithCode(final DBClass c, final Object value) {
		return insertCard(c, c.getCodeAttributeName(), value);
	}

	protected DBCard insertCard(final DBClass c, final String key, final Object value) {
		return DBCard.newInstance(driver, c).set(key, value).save();
	}

	protected void insertCards(final DBClass c, final int quantity) {
		for (long i = 0; i < quantity; ++i) {
			DBCard.newInstance(driver, c).setCode(String.valueOf(i)).save();
		}
	}

	protected DBRelation insertRelation(final DBDomain d, final DBCard c1, final DBCard c2) {
		return DBRelation.newInstance(driver, d) //
				.setCard1(c1) //
				.setCard2(c2) //
				.save();
	}

	protected void deleteCard(final DBCard c) {
		deleteEntry(c);
	}

	protected void deleteRelation(final DBRelation r) {
		deleteEntry(r);
	}

	protected void deleteEntry(final DBEntry e) {
		driver.delete(e);
	}

	protected Iterable<String> namesOf(final Iterable<? extends CMEntryType> entityTypes) {
		return Iterables.transform(entityTypes, new Function<CMEntryType, String>() {

			@Override
			public String apply(final CMEntryType input) {
				return input.getName();
			}

		});
	}

	protected QueryAliasAttribute keyAttribute(final CMEntryType et) {
		return attribute(et, et.getKeyAttributeName());
	}

	protected QueryAliasAttribute codeAttribute(final CMClass c) {
		return attribute(c, c.getCodeAttributeName());
	}

	protected QueryAliasAttribute codeAttribute(final Alias alias, final CMClass c) {
		return attribute(alias, c.getCodeAttributeName());
	}

	protected QueryAliasAttribute descriptionAttribute(final CMClass c) {
		return attribute(c, c.getDescriptionAttributeName());
	}

}
