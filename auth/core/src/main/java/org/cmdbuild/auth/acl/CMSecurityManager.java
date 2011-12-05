package org.cmdbuild.auth.acl;


public interface CMSecurityManager {

	boolean hasPrivilege(CMPrivilege privilege);

	/**
	 * Returns if the user has administrator privileges.
	 * 
	 * Administrators are those users that can change the system
	 * configuration, manage users, groups, their menus and ACLs.
	 * 
	 * @return if the user has administrator privileges
	 */
	boolean hasAdministratorPrivileges();

	/**
	 * Returns if the user has database designer privileges.
	 * 
	 * Database Designers can change the DB schema.
	 * 
	 * @return {@link hasAdministratorPrivileges()}
	 */
	public boolean hasDatabaseDesignerPrivileges();



	boolean hasPrivilege(CMPrivilege requested, CMPrivilegedObject privilegedObject);

	boolean hasReadAccess(CMPrivilegedObject privilegedObject);

	boolean hasWriteAccess(CMPrivilegedObject privilegedObject);



	/**
	 * Reports currently use SQL for queries, so there is no way to
	 * give safe access to user data only. It has to fall back to
	 * {@link hasAdministratorPrivileges()}.
	 * 
	 * @return {@link hasAdministratorPrivileges()}
	 */
	//boolean hasReportDesignerPrivileges();

	/**
	 * Returns if the user has workflow designer privileges.
	 * 
	 * Workflow Designers can change the process definition.
	 * 
	 * @return {@link hasAdministratorPrivileges()}
	 */	
	//boolean hasWorkflowDesignerPrivileges();
}
