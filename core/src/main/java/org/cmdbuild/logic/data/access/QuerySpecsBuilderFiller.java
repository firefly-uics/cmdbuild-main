package org.cmdbuild.logic.data.access;

import static org.cmdbuild.dao.driver.postgres.Const.SystemAttributes.Id;
import static org.cmdbuild.dao.query.clause.AnyAttribute.anyAttribute;
import static org.cmdbuild.dao.query.clause.QueryAliasAttribute.attribute;
import static org.cmdbuild.dao.query.clause.join.Over.over;
import static org.cmdbuild.dao.query.clause.where.AndWhereClause.and;
import static org.cmdbuild.dao.query.clause.where.InOperatorAndValue.in;
import static org.cmdbuild.dao.query.clause.where.NullOperatorAndValue.isNull;
import static org.cmdbuild.dao.query.clause.where.SimpleWhereClause.condition;
import static org.cmdbuild.dao.query.clause.where.TrueWhereClause.trueWhereClause;
import static org.cmdbuild.logic.mapping.json.Constants.Filters.ATTRIBUTE_KEY;
import static org.cmdbuild.logic.mapping.json.Constants.Filters.CQL_KEY;
import static org.cmdbuild.logic.mapping.json.Constants.Filters.FULL_TEXT_QUERY_KEY;
import static org.cmdbuild.logic.mapping.json.Constants.Filters.RELATION_CARDS_KEY;
import static org.cmdbuild.logic.mapping.json.Constants.Filters.RELATION_CARD_ID_KEY;
import static org.cmdbuild.logic.mapping.json.Constants.Filters.RELATION_DESTINATION_KEY;
import static org.cmdbuild.logic.mapping.json.Constants.Filters.RELATION_DOMAIN_DIRECTION;
import static org.cmdbuild.logic.mapping.json.Constants.Filters.RELATION_DOMAIN_KEY;
import static org.cmdbuild.logic.mapping.json.Constants.Filters.RELATION_KEY;
import static org.cmdbuild.logic.mapping.json.Constants.Filters.RELATION_TYPE_ANY;
import static org.cmdbuild.logic.mapping.json.Constants.Filters.RELATION_TYPE_KEY;
import static org.cmdbuild.logic.mapping.json.Constants.Filters.RELATION_TYPE_NOONE;
import static org.cmdbuild.logic.mapping.json.Constants.Filters.RELATION_TYPE_ONEOF;

import java.util.List;
import java.util.Map;

import org.apache.commons.lang.RandomStringUtils;
import org.cmdbuild.common.collect.Mapper;
import org.cmdbuild.cql.sqlbuilder.CQLFacadeCompiler;
import org.cmdbuild.cql.sqlbuilder.NaiveCmdbuildSQLBuilder.SourceClassCallback;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.entrytype.CMDomain;
import org.cmdbuild.dao.entrytype.CMEntryType;
import org.cmdbuild.dao.query.QuerySpecsBuilder;
import org.cmdbuild.dao.query.clause.OrderByClause;
import org.cmdbuild.dao.query.clause.OrderByClause.Direction;
import org.cmdbuild.dao.query.clause.QueryAliasAttribute;
import org.cmdbuild.dao.query.clause.QueryDomain.Source;
import org.cmdbuild.dao.query.clause.alias.Alias;
import org.cmdbuild.dao.query.clause.alias.NameAlias;
import org.cmdbuild.dao.query.clause.where.WhereClause;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.logger.Log;
import org.cmdbuild.logic.data.QueryOptions;
import org.cmdbuild.logic.mapping.SorterMapper;
import org.cmdbuild.logic.mapping.json.JsonAttributeFilterBuilder;
import org.cmdbuild.logic.mapping.json.JsonFullTextQueryBuilder;
import org.cmdbuild.logic.mapping.json.JsonSorterMapper;
import org.cmdbuild.logic.validation.json.JsonFilterValidator;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.common.collect.Lists;

public class QuerySpecsBuilderFiller {

	private static final String DEFAULT_SORTING_ATTRIBUTE_NAME = "Description";

	private final CMDataView dataView;
	private final QueryOptions queryOptions;

	private CMClass sourceClass;

	public QuerySpecsBuilderFiller(final CMDataView dataView, final QueryOptions queryOptions, final String className) {
		this.dataView = dataView;
		this.queryOptions = queryOptions;
		this.sourceClass = dataView.findClass(className);
	}
	
	public CMClass getSourceClass() {
		return sourceClass;
	}

	public QuerySpecsBuilder create() {
		final Mapper<JSONArray, List<QueryAliasAttribute>> attributeSubsetMapper = new JsonAttributeSubsetMapper(
				sourceClass);
		final List<QueryAliasAttribute> attributeSubsetForSelect = attributeSubsetMapper.map(queryOptions
				.getAttributes());
		final QuerySpecsBuilder querySpecsBuilder = newQuerySpecsBuilder(attributeSubsetForSelect, sourceClass) //
				.from(sourceClass);
		try {
			fillQuerySpecsBuilderWithFilterOptions(querySpecsBuilder);
		} catch (final JSONException ex) {
			Log.CMDBUILD.error("Bad filter. The filter is {} ", queryOptions.getFilter().toString());
		}
		querySpecsBuilder //
				.limit(queryOptions.getLimit()) //
				.offset(queryOptions.getOffset());
		addSortingOptions(querySpecsBuilder, sourceClass);
		return querySpecsBuilder;
	}

	private QuerySpecsBuilder newQuerySpecsBuilder(final List<QueryAliasAttribute> attributeSubsetForSelect,
			final CMEntryType entryType) {
		if (attributeSubsetForSelect.isEmpty()) {
			return dataView.select(anyAttribute(entryType));
		}
		final Object[] attributesArray = new QueryAliasAttribute[attributeSubsetForSelect.size()];
		attributeSubsetForSelect.toArray(attributesArray);
		return dataView.select(attributesArray);
	}

	private void addSortingOptions(final QuerySpecsBuilder querySpecsBuilder, final CMClass sourceClass) {
		final SorterMapper sorterMapper = new JsonSorterMapper(sourceClass, queryOptions.getSorters());
		final List<OrderByClause> clauses = sorterMapper.deserialize();
		if (clauses.isEmpty()) {
			if (sourceClass.getAttribute(DEFAULT_SORTING_ATTRIBUTE_NAME) != null) {
				querySpecsBuilder.orderBy(attribute(sourceClass, DEFAULT_SORTING_ATTRIBUTE_NAME), Direction.ASC);
			}
		} else {
			for (final OrderByClause clause : clauses) {
				querySpecsBuilder.orderBy(clause.getAttribute(), clause.getDirection());
			}
		}
	}

	/**
	 * TODO: split into different private methods
	 */
	private void fillQuerySpecsBuilderWithFilterOptions(final QuerySpecsBuilder querySpecsBuilder) throws JSONException {
		final List<WhereClause> whereClauses = Lists.newArrayList();
		final JSONObject filterObject = queryOptions.getFilter();
		new JsonFilterValidator(queryOptions.getFilter()).validate();

		// CQL filter
		if (filterObject.has(CQL_KEY)) {
			Log.CMDBUILD.info("Filter is a CQL filter");
			final String cql = filterObject.getString(CQL_KEY);
			final Map<String, Object> context = queryOptions.getParameters();
			CQLFacadeCompiler.compileAndFill(cql, context, querySpecsBuilder, new SourceClassCallback() {
				@Override
				public void set(final CMClass source) {
					sourceClass = source;
				}
			});
			return;
		}

		// filter on attributes of the source class
		if (filterObject.has(ATTRIBUTE_KEY)) {
			final JsonAttributeFilterBuilder attributeFilterBuilder = new JsonAttributeFilterBuilder(
					filterObject.getJSONObject(ATTRIBUTE_KEY), sourceClass, dataView);
			whereClauses.add(attributeFilterBuilder.build());
		}

		// full text query on attributes of the source class
		if (filterObject.has(FULL_TEXT_QUERY_KEY)) {
			final JsonFullTextQueryBuilder jsonFullTextQueryBuilder = new JsonFullTextQueryBuilder(
					filterObject.getString(FULL_TEXT_QUERY_KEY), sourceClass);
			whereClauses.add(jsonFullTextQueryBuilder.build());
		}

		// filter on relations
		if (filterObject.has(RELATION_KEY)) {
			querySpecsBuilder.distinct();
			final JSONArray conditions = filterObject.getJSONArray(RELATION_KEY);
			for (int i = 0; i < conditions.length(); i++) {

				final JSONObject condition = conditions.getJSONObject(i);
				final String domainName = condition.getString(RELATION_DOMAIN_KEY);
				final String sourceString = condition.getString(RELATION_DOMAIN_DIRECTION);
				final CMDomain domain = dataView.findDomain(domainName);
				final String destinationName = condition.getString(RELATION_DESTINATION_KEY);
				final CMClass destinationClass = dataView.findClass(destinationName);
				final boolean left = condition.getString(RELATION_TYPE_KEY).equals(RELATION_TYPE_NOONE);
				final Alias destinationAlias = NameAlias
						.as(String.format("DST-%s-%s", destinationName, randomString()));
				final Alias domainAlias = NameAlias
						.as(String.format("DOM-%s-%s", domainName, randomString()));

				if (left) {
					querySpecsBuilder.leftJoin(destinationClass, destinationAlias, over(domain, domainAlias),
							getSourceFrom(sourceString));
				} else {
					querySpecsBuilder.join(destinationClass, destinationAlias, over(domain, domainAlias),
							getSourceFrom(sourceString));
				}

				final String conditionType = condition.getString(RELATION_TYPE_KEY);

				if (conditionType.equals(RELATION_TYPE_ONEOF)) {
					final JSONArray cards = condition.getJSONArray(RELATION_CARDS_KEY);
					final List<Long> oneOfIds = Lists.newArrayList();

					for (int j = 0; j < cards.length(); j++) {
						final JSONObject card = cards.getJSONObject(j);
						oneOfIds.add(card.getLong(RELATION_CARD_ID_KEY));
					}
					whereClauses.add( //
							condition( //
									attribute(destinationAlias, Id.getDBName()), //
									in(oneOfIds.toArray())));

				} else if (conditionType.equals(RELATION_TYPE_NOONE)) {
					whereClauses.add( //
							condition( //
									attribute(destinationAlias, Id.getDBName()), //
									isNull()));
				} else if (conditionType.equals(RELATION_TYPE_ANY)) {
					/**
					 * Should be empty. WhereClauses not added because I can
					 * detect if a card is in relation with ANY card, using only
					 * the JOIN clause
					 */
				}

			}
		}
		if (!whereClauses.isEmpty()) {
			querySpecsBuilder.where(and(whereClauses));
		} else {
			querySpecsBuilder.where(trueWhereClause());
		}
	}

	private Source getSourceFrom(final String source) {
		return Source._1.name().equals(source) ? Source._1 : Source._2;
	}

	private String randomString() {
		return RandomStringUtils.randomAscii(10);
	}

}