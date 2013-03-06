package org.cmdbuild.cql.compiler.impl;

import org.cmdbuild.cql.compiler.from.ClassDeclaration;
import org.cmdbuild.elements.interfaces.ITable;
import org.cmdbuild.services.auth.UserContext;
import org.cmdbuild.services.auth.UserOperations;

public class ClassDeclarationImpl extends CQLElementImpl implements ClassDeclaration {

	String name;
	int id = -1;
	String as;

	@Override
	public boolean equals(final Object obj) {
		if (obj == null)
			return false;
		if (!(obj instanceof ClassDeclarationImpl))
			return false;
		final ClassDeclarationImpl o = (ClassDeclarationImpl) obj;
		if (name != null) {
			if (!name.equals(o.name))
				return false;
		} else if (o.name != null)
			return false;
		if (id != o.id)
			return false;
		if (as != null) {
			if (!as.equals(o.as))
				return false;
		} else if (o.as != null)
			return false;

		return true;
	}

	@Override
	public String getAs() {
		return as;
	}

	@Override
	public int getId() {
		return id;
	}

	@Override
	public String getName() {
		return name;
	}

	@Override
	public boolean isClass(final String name) {
		return (this.name != null && this.name.equals(name)) || (this.as != null && this.as.equals(name));
	}

	@Override
	public void setAs(final String classAs) {
		this.as = classAs;
	}

	@Override
	public void setId(final int classId) {
		this.id = classId;
		check();
	}

	@Override
	public void setName(final String className) {
		this.name = className;
		check();
	}

	private ITable getClassTable() {
		return getClassTable(null);
	}

	// Needed when we have no user/role but we want to have the class name
	public String getClassName() {
		return getClassTable().getName();
	}

	public ITable getClassTable(UserContext userCtx) {
		if (userCtx == null) {
			userCtx = UserContext.systemContext();
		}
		if (id > 0) {
			return UserOperations.from(userCtx).tables().get(id);
		} else {
			return UserOperations.from(userCtx).tables().get(name);
		}
	}

	public DomainDeclarationImpl searchDomain(final String domainNameOrRef) {
		for (final CQLElementImpl c : children) {
			if (c instanceof DomainDeclarationImpl) {
				final DomainDeclarationImpl d = (DomainDeclarationImpl) c;
				final DomainDeclarationImpl out = d.searchDomain(domainNameOrRef);
				if (out != null) {
					return out;
				}
			}
		}
		return null;
	}

	/*
	 * This will throw a NotFoundException if the classId or className are not
	 * found in the SchemaCache
	 */
	public void check() {
		if (FactoryImpl.CmdbuildCheck) {
			getClassTable();
			if (!this.children.isEmpty()) {
				for (final CQLElementImpl c : this.children) {
					if (c instanceof DomainDeclarationImpl) {
						((DomainDeclarationImpl) c).check();
					}
				}
			}
		}
	}
}
