package org.cmdbuild.dao.view.user.privileges;

import java.util.Map;

import org.cmdbuild.dao.entrytype.CMEntryType;
import org.cmdbuild.dao.query.clause.alias.Alias;
import org.cmdbuild.dao.query.clause.where.WhereClause;

public interface RowAndColumnPrivilegeFetcher {

	/**
	 * Returns all {@link WhereClause}s related to the specified
	 * {@link CMEntryType}.
	 * 
	 * @param entryType
	 * 
	 * @return all {@link WhereClause}s related to the specified
	 *         {@link CMEntryType}.
	 */
	Iterable<? extends WhereClause> fetchPrivilegeFiltersFor(CMEntryType entryType);

	Iterable<? extends WhereClause> fetchPrivilegeFiltersFor(CMEntryType entryType, CMEntryType entryTypeForClauses,
			Alias entryTypeForClausesAlias);

	/**
	 * This method fetches column privileges for the currently logged user.
	 * 
	 * @param entryType
	 * @return
	 */
	Map<String, String> fetchAttributesPrivilegesFor(CMEntryType entryType);

}
