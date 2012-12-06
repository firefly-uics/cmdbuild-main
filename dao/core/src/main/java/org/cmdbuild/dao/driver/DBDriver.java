package org.cmdbuild.dao.driver;

import java.util.Collection;

import org.cmdbuild.dao.entry.DBEntry;
import org.cmdbuild.dao.entrytype.DBAttribute;
import org.cmdbuild.dao.entrytype.DBClass;
import org.cmdbuild.dao.entrytype.DBDomain;
import org.cmdbuild.dao.function.DBFunction;
import org.cmdbuild.dao.query.CMQueryResult;
import org.cmdbuild.dao.query.QuerySpecs;
import org.cmdbuild.dao.view.DBDataView.DBAttributeDefinition;
import org.cmdbuild.dao.view.DBDataView.DBClassDefinition;

/**
 * Interface for a generic database driver.
 */
public interface DBDriver {

	interface DomainDefinition {

		String getName();

		DBClass getClass1();

		DBClass getClass2();

		String getDirectDescription();

		String getInverseDescription();

		String getCardinality();

	}

	/**
	 * Finds all available classes.
	 * 
	 * @return a collection containing all available classes.
	 */
	Collection<DBClass> findAllClasses();

	/**
	 * Finds a class by its id.
	 * 
	 * @param id
	 *            is the required class's id.
	 * @return the requested {@link DBClass} or {@code null} if no class has
	 *         been found.
	 */
	DBClass findClassById(Long id);

	/**
	 * Finds a class by its name.
	 * 
	 * @param name
	 *            is the required class's name.
	 * @return the requested {@link DBClass} or {@code null} if no class has
	 *         been found.
	 */
	DBClass findClassByName(String name);

	/**
	 * Creates a new class.
	 * 
	 * @param definition
	 *            contains the definition needed for creating the new class.
	 * 
	 * @return the created class.
	 */
	DBClass createClass(DBClassDefinition definition);

	/**
	 * Updated an existing class.
	 * 
	 * @param definition
	 *            contains the definition needed for updating the existing
	 *            class.
	 * 
	 * @return the created class.
	 */
	DBClass updateClass(DBClassDefinition definition);

	/**
	 * Creates a new attribute.
	 * 
	 * @param definition
	 *            contains the definition needed for creating the new attribute.
	 * 
	 * @return the created attribute.
	 */
	DBAttribute createAttribute(DBAttributeDefinition definition);

	/**
	 * Updates an existing attribute.
	 * 
	 * @param definition
	 *            contains the definition needed for updating the existing
	 *            attribute.
	 * 
	 * @return the created attribute.
	 */
	DBAttribute updateAttribute(DBAttributeDefinition adaptDefinition);

	/**
	 * Delete an existing attribute.
	 * 
	 * @param dbAttribute
	 *            the existing attribute.
	 */
	void deleteAttribute(DBAttribute dbAttribute);

	void deleteClass(DBClass dbClass);

	Collection<DBDomain> findAllDomains();

	DBDomain findDomainById(Long id);

	DBDomain findDomainByName(String name);

	Collection<DBFunction> findAllFunctions();

	DBFunction findFunctionByName(String name);

	// TODO Allow more than two classes
	DBDomain createDomain(DomainDefinition domainDefinition);

	void deleteDomain(DBDomain dbDomain);

	Long create(DBEntry entry);

	void update(DBEntry entry);

	void delete(DBEntry entry);

	CMQueryResult query(QuerySpecs query);

	/*
	 * add parameters for query and executeStatement? note: SQL available only
	 * to the System user, not even to admin!
	 * 
	 * CMQueryResult query(String language, String query); // "CQL",
	 * "from Table ..."
	 * 
	 * void executeStatement(String language, String statement); // "SQL",
	 * "CREATE TABLE ..."
	 * 
	 * void executeScript(String language, String script); // "SQL",
	 * "classpath:/createdb.sql"
	 */

}
