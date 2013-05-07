package integration.logic.data;

import static org.apache.commons.lang.StringUtils.EMPTY;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.Assert.assertThat;

import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.entrytype.CMDomain;
import org.cmdbuild.model.data.Domain.DomainBuilder;
import org.junit.Before;
import org.junit.Test;

public class DomainDefinitionTest extends DataDefinitionLogicTest {

	private static final String DOMAIN_NAME = "foo";
	private static final String FIRST_CLASS_NAME = "First";
	private static final String SECOND_CLASS_NAME = "Second";
	private static final String ANOTHER_FIRST_CLASS_NAME = "Another" + FIRST_CLASS_NAME;
	private static final String ANOTHER_SECOND_CLASS_NAME = "Another" + SECOND_CLASS_NAME;

	private CMClass class1;
	private CMClass class2;

	@Before
	public void createClasses() throws Exception {
		class1 = dataDefinitionLogic().createOrUpdate(a(newClass(FIRST_CLASS_NAME)));
		class2 = dataDefinitionLogic().createOrUpdate(a(newClass(SECOND_CLASS_NAME)));
	}

	@Test
	public void createStandardDomainHasSomeDefaults() {
		// given
		dataDefinitionLogic().createOrUpdate(a(newDomain()));

		// when
		final CMDomain domain = dataView().findDomain(DOMAIN_NAME);

		// then
		assertThat(domain.getName(), equalTo(DOMAIN_NAME));
		assertThat(domain.getDescription(), equalTo(DOMAIN_NAME));
		assertThat(domain.getClass1(), equalTo(class1));
		assertThat(domain.getClass2(), equalTo(class2));
		assertThat(domain.getDescription1(), equalTo(EMPTY));
		assertThat(domain.getDescription2(), equalTo(EMPTY));
		assertThat(domain.getCardinality(), equalTo("N:N"));
		assertThat(domain.isActive(), equalTo(true));
		assertThat(domain.holdsHistory(), equalTo(true));
	}

	@Test
	public void createDomainWithCardinality_N_N() {
		// given
		dataDefinitionLogic().createOrUpdate(a(newDomain().withCardinality("N:N")));

		// when
		final CMDomain domain = dataView().findDomain(DOMAIN_NAME);

		// then
		assertThat(domain.getCardinality(), equalTo("N:N"));
	}

	@Test
	public void createDomainWithCardinality_1_N() {
		// given
		dataDefinitionLogic().createOrUpdate(a(newDomain().withCardinality("1:N")));

		// when
		final CMDomain domain = dataView().findDomain(DOMAIN_NAME);

		// then
		assertThat(domain.getCardinality(), equalTo("1:N"));
	}

	@Test
	public void createDomainWithCardinality_N_1() {
		// given
		dataDefinitionLogic().createOrUpdate(a(newDomain().withCardinality("N:1")));

		// when
		final CMDomain domain = dataView().findDomain(DOMAIN_NAME);

		// then
		assertThat(domain.getCardinality(), equalTo("N:1"));
	}

	@Test
	public void createDomainWithCardinality_1_1() {
		// given
		dataDefinitionLogic().createOrUpdate(a(newDomain().withCardinality("1:1")));

		// when
		final CMDomain domain = dataView().findDomain(DOMAIN_NAME);

		// then
		assertThat(domain.getCardinality(), equalTo("1:1"));
	}

	@Test
	public void createDomainWithNonEmptyDescriptions() {
		// given
		dataDefinitionLogic().createOrUpdate(a(newDomain().withDirectDescription("foo").withInverseDescription("bar")));

		// when
		final CMDomain domain = dataView().findDomain(DOMAIN_NAME);

		// then
		assertThat(domain.getDescription1(), equalTo("foo"));
		assertThat(domain.getDescription2(), equalTo("bar"));
	}

	@Test
	public void domainCanBeMasterDetail() {
		// given
		dataDefinitionLogic().createOrUpdate(a(newDomain() //
				.thatIsMasterDetail(true) //
				.withMasterDetailDescription("this is a master-detail domain")));

		// when
		final CMDomain domain = dataView().findDomain(DOMAIN_NAME);

		// then
		assertThat(domain.isMasterDetail(), equalTo(true));
		assertThat(domain.getMasterDetailDescription(), equalTo("this is a master-detail domain"));
	}

	@Test
	public void classesAndCardinalityCannotBeChanged() {
		// given
		dataDefinitionLogic().createOrUpdate(a(newDomain()));
		final CMClass anotherClass1 = dataDefinitionLogic().createOrUpdate(a(newClass(ANOTHER_FIRST_CLASS_NAME)));
		final CMClass anotherClass2 = dataDefinitionLogic().createOrUpdate(a(newClass(ANOTHER_SECOND_CLASS_NAME)));
		dataDefinitionLogic().createOrUpdate(a(newDomain() //
				.withIdClass1(anotherClass1.getId()) //
				.withIdClass2(anotherClass2.getId())));

		// when
		final CMDomain domain = dataView().findDomain(DOMAIN_NAME);

		// then
		assertThat(domain.getName(), equalTo(DOMAIN_NAME));
		assertThat(domain.getClass1(), equalTo(class1));
		assertThat(domain.getClass2(), equalTo(class2));
		assertThat(domain.getCardinality(), equalTo("N:N"));
	}

	@Test
	public void descriptionsCanBeChanged() {
		// given
		dataDefinitionLogic().createOrUpdate(a(newDomain()));
		dataDefinitionLogic().createOrUpdate(a(newDomain() //
				.withDirectDescription("foo") //
				.withInverseDescription("bar")));

		// when
		final CMDomain domain = dataView().findDomain(DOMAIN_NAME);

		// then
		assertThat(domain.getDescription1(), equalTo("foo"));
		assertThat(domain.getDescription2(), equalTo("bar"));
	}

	@Test
	public void domainCreatedAndDeleted() {
		// given
		dataDefinitionLogic().createOrUpdate(a(newDomain()));
		dataDefinitionLogic().deleteDomainByName(DOMAIN_NAME);

		// when
		final CMDomain domain = dataView().findDomain(DOMAIN_NAME);

		// then
		assertThat(domain, is(nullValue()));
	}

	/*
	 * Utilities
	 */

	protected DomainBuilder newDomain() {
		return super.newDomain(DOMAIN_NAME) //
				.withIdClass1(class1.getId()) //
				.withIdClass2(class2.getId()) //
				.thatIsActive(true);
	}

}