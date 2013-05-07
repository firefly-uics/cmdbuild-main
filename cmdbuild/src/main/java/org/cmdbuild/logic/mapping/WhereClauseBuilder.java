package org.cmdbuild.logic.mapping;

import org.cmdbuild.dao.query.clause.where.WhereClause;

public interface WhereClauseBuilder {

	/**
	 * Method that build a WhereClause object.
	 * 
	 * @return a general WhereClause object.
	 */
	WhereClause build();

}