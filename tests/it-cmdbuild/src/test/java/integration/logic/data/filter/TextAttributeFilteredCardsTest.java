package integration.logic.data.filter;

import static com.google.common.collect.Iterables.get;
import static com.google.common.collect.Iterables.size;
import static org.junit.Assert.assertEquals;

import org.cmdbuild.dao.entry.CMCard;
import org.cmdbuild.dao.entrytype.DBAttribute;
import org.cmdbuild.dao.entrytype.attributetype.TextAttributeType;
import org.cmdbuild.logic.data.QueryOptions;
import org.cmdbuild.logic.mappers.json.Constants.FilterOperator;
import org.json.JSONObject;
import org.junit.Test;

/**
 * In this class there are tests that filter cards for the attribute with type
 * text.
 */
public class TextAttributeFilteredCardsTest extends FilteredCardsFixture {

	private static final String TEXT_ATTRIBUTE = "attr";

	@Override
	protected void initializeDatabaseData() {
		final DBAttribute createdAttribute = addAttributeToClass(TEXT_ATTRIBUTE, new TextAttributeType(), createdClass);

		dbDataView().newCard(createdClass) //
				.setCode("foo") //
				.setDescription("desc_foo") //
				.set(createdAttribute.getName(), "").save();
		dbDataView().newCard(createdClass) //
				.setCode("bar") //
				.setDescription("desc_bar") //
				.set(createdAttribute.getName(), "TexTual_AttriBUte_Value") //
				.save();
		dbDataView().newCard(createdClass) //
				.setCode("baz") //
				.setDescription("desc_baz") //
				.set(createdAttribute.getName(), null) //
				.save();
		dbDataView().newCard(createdClass) //
				.setCode("zzz") //
				.setDescription("desc_zzz") //
				.set(createdAttribute.getName(), "TEst") //
				.save();
	}

	@Test
	public void fetchFilteredCardsWithEqualOperator() throws Exception {
		// given
		final JSONObject filterObjectForEmptyResult = buildAttributeFilter(TEXT_ATTRIBUTE, FilterOperator.EQUAL, "aaa");
		final QueryOptions queryOptionsForEmptyResult = createQueryOptions(10, 0, null, filterObjectForEmptyResult);

		final JSONObject filterObject = buildAttributeFilter(TEXT_ATTRIBUTE, FilterOperator.EQUAL, "TEst");
		final QueryOptions queryOptions = createQueryOptions(10, 0, null, filterObject);

		// when
		final Iterable<CMCard> fetchedCards1 = dataAccessLogic.fetchCards(createdClass.getName(),
				queryOptionsForEmptyResult);
		final Iterable<CMCard> fetchedCards2 = dataAccessLogic.fetchCards(createdClass.getName(), queryOptions);

		// then
		assertEquals(0, size(fetchedCards1));
		assertEquals(1, size(fetchedCards2));
	}

	@Test
	public void fetchFilteredCardsWithDifferentOperator() throws Exception {
		// given
		final JSONObject filterObject = buildAttributeFilter(TEXT_ATTRIBUTE, FilterOperator.NOT_EQUAL, "aaa");
		final QueryOptions queryOptions = createQueryOptions(10, 0, null, filterObject);

		// when
		final Iterable<CMCard> fetchedCards = dataAccessLogic.fetchCards(createdClass.getName(), queryOptions);

		// then
		assertEquals(4, size(fetchedCards));
	}

	@Test
	public void fetchFilteredCardsWithNullOperator() throws Exception {
		// given
		final JSONObject filterObject = buildAttributeFilter(TEXT_ATTRIBUTE, FilterOperator.NULL);
		final QueryOptions queryOptions = createQueryOptions(10, 0, null, filterObject);

		// when
		final Iterable<CMCard> fetchedCards = dataAccessLogic.fetchCards(createdClass.getName(), queryOptions);

		// then
		assertEquals(1, size(fetchedCards));
	}

	@Test
	public void fetchFilteredCardsWithContainsOperator() throws Exception {
		// given
		final JSONObject filterObject = buildAttributeFilter(TEXT_ATTRIBUTE, FilterOperator.CONTAIN, "tuaL_");
		final QueryOptions queryOptions = createQueryOptions(10, 0, null, filterObject);

		// when
		final Iterable<CMCard> fetchedCards = dataAccessLogic.fetchCards(createdClass.getName(), queryOptions);

		// then
		assertEquals(1, size(fetchedCards));
		assertEquals("bar", get(fetchedCards, 0).getCode());
	}

	@Test
	public void fetchFilteredCardsWithDoesNotContainOperator() throws Exception {
		// given
		final JSONObject filterObject = buildAttributeFilter(TEXT_ATTRIBUTE, FilterOperator.NOT_CONTAIN, "tuaL_");
		final QueryOptions queryOptions = createQueryOptions(10, 0, null, filterObject);

		// when
		final Iterable<CMCard> fetchedCards = dataAccessLogic.fetchCards(createdClass.getName(), queryOptions);

		// then
		assertEquals(3, size(fetchedCards));
	}

	@Test
	public void resultsOfContainUnionNotContainMustBeComplementary() throws Exception {
		// given
		final JSONObject notContainFilterObject = buildAttributeFilter(TEXT_ATTRIBUTE, FilterOperator.NOT_CONTAIN,
				"tuaL_");
		final JSONObject containFilterObject = buildAttributeFilter(TEXT_ATTRIBUTE, FilterOperator.CONTAIN, "tuaL_");
		final QueryOptions notContainQueryOptions = createQueryOptions(10, 0, null, notContainFilterObject);
		final QueryOptions containQueryOptions = createQueryOptions(10, 0, null, containFilterObject);

		// when
		final Iterable<CMCard> notContainFetchedCards = dataAccessLogic.fetchCards(createdClass.getName(),
				notContainQueryOptions);
		final Iterable<CMCard> containFetchedCards = dataAccessLogic.fetchCards(createdClass.getName(),
				containQueryOptions);

		// then
		assertEquals(4, size(notContainFetchedCards) + size(containFetchedCards));
	}

	@Test
	public void fetchFilteredCardsWithBeginsOperator() throws Exception {
		// given
		final JSONObject filterObject = buildAttributeFilter(TEXT_ATTRIBUTE, FilterOperator.BEGIN, "te");
		final QueryOptions queryOptions = createQueryOptions(10, 0, null, filterObject);

		// when
		final Iterable<CMCard> fetchedCards = dataAccessLogic.fetchCards(createdClass.getName(), queryOptions);

		// then
		assertEquals(2, size(fetchedCards));
	}

	@Test
	public void fetchFilteredCardsWithNotBeginsOperator() throws Exception {
		// given
		final JSONObject filterObject = buildAttributeFilter(TEXT_ATTRIBUTE, FilterOperator.NOT_BEGIN, "te");
		final QueryOptions queryOptions = createQueryOptions(10, 0, null, filterObject);

		// when
		final Iterable<CMCard> fetchedCards = dataAccessLogic.fetchCards(createdClass.getName(), queryOptions);

		// then
		assertEquals(2, size(fetchedCards));
	}

	@Test
	public void fetchFilteredCardsWithEndsOperator() throws Exception {
		// given
		final JSONObject filterObject = buildAttributeFilter(TEXT_ATTRIBUTE, FilterOperator.END, "st");
		final QueryOptions queryOptions = createQueryOptions(10, 0, null, filterObject);

		// when
		final Iterable<CMCard> fetchedCards = dataAccessLogic.fetchCards(createdClass.getName(), queryOptions);

		// then
		assertEquals(1, size(fetchedCards));
	}

	@Test
	public void fetchFilteredCardsWithNotEndsOperator() throws Exception {
		// given
		final JSONObject filterObject = buildAttributeFilter(TEXT_ATTRIBUTE, FilterOperator.NOT_END, "st");
		final QueryOptions queryOptions = createQueryOptions(10, 0, null, filterObject);

		// when
		final Iterable<CMCard> fetchedCards = dataAccessLogic.fetchCards(createdClass.getName(), queryOptions);

		// then
		assertEquals(3, size(fetchedCards));
	}

}
