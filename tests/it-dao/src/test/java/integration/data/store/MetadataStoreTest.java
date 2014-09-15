package integration.data.store;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;

import java.util.Collection;

import org.cmdbuild.dao.entrytype.CMAttribute;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.data.store.Store;
import org.cmdbuild.data.store.dao.DataViewStore;
import org.cmdbuild.data.store.metadata.Metadata;
import org.cmdbuild.data.store.metadata.MetadataConverter;
import org.cmdbuild.data.store.metadata.MetadataGroupable;
import org.cmdbuild.logic.data.DataDefinitionLogic;
import org.cmdbuild.logic.data.DefaultDataDefinitionLogic;
import org.cmdbuild.model.data.Attribute;
import org.cmdbuild.model.data.EntryType;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import utils.IntegrationTestBase;

public class MetadataStoreTest extends IntegrationTestBase {

	private MetadataConverter metadataConverter;
	private Store<Metadata> metadataStore;

	private MetadataConverter anotherMetadataConverter;
	private Store<Metadata> anotherMetadataStore;

	@Before
	public void setUp() throws Exception {
		final DataDefinitionLogic dataDefinitionLogic = new DefaultDataDefinitionLogic(dbDataView());

		dataDefinitionLogic.createOrUpdate(newClass("testClass"));
		final CMAttribute testAttribute = dataDefinitionLogic
				.createOrUpdate(newAttribute("testAttribute", "testClass"));
		final CMAttribute anotherTestAttribute = dataDefinitionLogic.createOrUpdate(newAttribute(
				"anotherTestAttribute", "testClass"));

		metadataConverter = MetadataConverter.of(MetadataGroupable.of(testAttribute));
		metadataStore = DataViewStore.newInstance(dbDataView(), //
				MetadataGroupable.of(testAttribute), //
				metadataConverter);

		anotherMetadataConverter = MetadataConverter.of(MetadataGroupable.of(anotherTestAttribute));
		anotherMetadataStore = DataViewStore.newInstance(dbDataView(), //
				MetadataGroupable.of(anotherTestAttribute), //
				anotherMetadataConverter);
	}

	@After
	public void clearMetadataTable() throws Exception {
		final CMClass metadataClass = dbDataView().findClass(metadataConverter.getClassName());
		dbDataView().clear(metadataClass);
	}

	@Test
	public void elementCreatedAndRead() {
		// given
		final Metadata element = Metadata.of("foo", "bar");
		metadataStore.create(element);

		// when
		final Collection<Metadata> list = metadataStore.readAll();

		// then
		assertThat(list.size(), equalTo(1));
		assertThat(list.iterator().next(), equalTo(element));
	}

	@Test
	public void elementsCreatedAndRead() {
		// given
		metadataStore.create(Metadata.of("foo", "bar"));
		metadataStore.create(Metadata.of("bar", "baz"));

		// when
		final Collection<Metadata> list = metadataStore.readAll();

		// then
		assertThat(list.size(), equalTo(2));
		assertThat(list, containsInAnyOrder(Metadata.of("foo", "bar"), Metadata.of("bar", "baz")));
	}

	@Test
	public void elementRead() {
		// given
		metadataStore.create(Metadata.of("foo", "bar"));
		metadataStore.create(Metadata.of("bar", "baz"));

		// when
		final Metadata element = metadataStore.read(Metadata.of("foo"));

		// then
		assertThat(element, equalTo(Metadata.of("foo", "bar")));
	}

	@Test
	public void elementUpdated() {
		// given
		metadataStore.create(Metadata.of("foo", "bar"));
		metadataStore.create(Metadata.of("bar", "baz"));

		// when
		metadataStore.update(Metadata.of("foo", "foobar"));
		final Collection<Metadata> list = metadataStore.readAll();

		// then
		assertThat(list, containsInAnyOrder(Metadata.of("foo", "foobar"), Metadata.of("bar", "baz")));
	}

	@Test
	public void elementDeleted() {
		// given
		metadataStore.create(Metadata.of("foo", "bar"));
		metadataStore.create(Metadata.of("bar", "baz"));

		// when
		metadataStore.delete(Metadata.of("foo"));
		final Collection<Metadata> list = metadataStore.readAll();

		// then
		assertThat(list.size(), equalTo(1));
		assertThat(list, contains(Metadata.of("bar", "baz")));
	}

	@Test
	public void elementsAreGroupedByAttribute() {
		// given
		metadataStore.create(Metadata.of("foo", "1"));
		metadataStore.create(Metadata.of("bar", "1"));
		anotherMetadataStore.create(Metadata.of("foo", "2"));

		// when
		final Collection<Metadata> list = metadataStore.readAll();
		final Collection<Metadata> anotherList = anotherMetadataStore.readAll();

		// then
		assertThat(list.size(), equalTo(2));
		assertThat(list, containsInAnyOrder(Metadata.of("foo", "1"), Metadata.of("bar", "1")));
		assertThat(anotherList.size(), equalTo(1));
		assertThat(anotherList, contains(Metadata.of("foo", "2")));
	}

	/*
	 * Utility
	 */

	private EntryType newClass(final String name) {
		return org.cmdbuild.model.data.EntryType.newClass() //
				.withName(name) //
				.build();
	}

	private Attribute newAttribute(final String name, final String owner) {
		return org.cmdbuild.model.data.Attribute.newAttribute() //
				.withName(name) //
				.withOwnerName(owner) //
				.withType("TEXT") //
				.build();
	}

}
