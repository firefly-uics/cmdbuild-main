package org.cmdbuild.dao.query.clause.where;

import org.cmdbuild.dao.query.clause.QueryAliasAttribute;

public class SimpleWhereClause implements WhereClause {

	private final QueryAliasAttribute attribute;
	private final OperatorAndValue operator;

	private SimpleWhereClause(final QueryAliasAttribute attribute, final OperatorAndValue operator) {
		this.attribute = attribute;
		this.operator = operator;
	}

	public QueryAliasAttribute getAttribute() {
		return attribute;
	}

	public OperatorAndValue getOperator() {
		return operator;
	}

	@Override
	public void accept(final WhereClauseVisitor visitor) {
		visitor.visit(this);
	}

	public static WhereClause condition(final QueryAliasAttribute attribute, final OperatorAndValue operator) {
		return new SimpleWhereClause(attribute, operator);
	}

}
