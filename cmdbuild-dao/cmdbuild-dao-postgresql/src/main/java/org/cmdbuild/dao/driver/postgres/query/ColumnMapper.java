package org.cmdbuild.dao.driver.postgres.query;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.cmdbuild.dao.driver.postgres.Const;
import org.cmdbuild.dao.driver.postgres.Utils;
import org.cmdbuild.dao.entrytype.CMAttribute;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.entrytype.CMDomain;
import org.cmdbuild.dao.entrytype.CMEntryType;
import org.cmdbuild.dao.query.QuerySpecs;
import org.cmdbuild.dao.query.clause.AnyAttribute;
import org.cmdbuild.dao.query.clause.QueryAliasAttribute;
import org.cmdbuild.dao.query.clause.QueryDomain;
import org.cmdbuild.dao.query.clause.alias.Alias;
import org.cmdbuild.dao.query.clause.join.JoinClause;

/**
 * Holds the information about which attribute to query for every alias and
 * entry type of that alias. Also it is used to keep a mapping between the
 * alias attributes and the position in the select clause.
 */
public class ColumnMapper {

	public static class EntryTypeAttribute {
		public final String name;
		public final Alias alias;
		public final Integer index;

		private EntryTypeAttribute(final String name, final Alias alias, final Integer index) {
			this.name = name;
			this.alias = alias;
			this.index = index;
		}
	}

	private static class AliasAttributes {
		private final Map<CMEntryType, List<EntryTypeAttribute>> map;

		private AliasAttributes(final Set<? extends CMEntryType> types) {
			map = new HashMap<CMEntryType, List<EntryTypeAttribute>>();
			for (CMEntryType t : types) {
				map.put(t, new ArrayList<EntryTypeAttribute>());
			}
		}

		void addAttribute(final String attributeName, final Alias attributeAlias, final Integer index) {
			addAttribute(attributeName, attributeAlias, index, null);
		}

		void addAttribute(final String attributeName, final Alias attributeAlias, final Integer index, final CMEntryType type) {
			for (CMEntryType currentType : map.keySet()) {
				final String currentName;
				if (type == null || currentType.equals(type)) {
					currentName = attributeName;
				} else {
					currentName = null;
				}
				final EntryTypeAttribute eta = new EntryTypeAttribute(currentName, attributeAlias, index);
				map.get(currentType).add(eta);
			}
		}

		Iterable<EntryTypeAttribute> getAttributes(final CMEntryType type) {
			return map.get(type);
		}

		Iterable<CMEntryType> getEntryTypes() {
			return map.keySet();
		}
	}

	private static class AliasStore {
		private final Map<Alias, AliasAttributes> map;

		private AliasStore() {
			map = new HashMap<Alias, AliasAttributes>();
		}

		void addAlias(final Alias alias, final Set<? extends CMEntryType> aliasClasses) {
			map.put(alias, new AliasAttributes(aliasClasses));
		}

		AliasAttributes getAliasAttributes(final Alias entryTypeAlias) {
			return map.get(entryTypeAlias);
		}

		Set<Alias> getAliases() {
			return map.keySet();
		}
	}

	private AliasStore classAliases = new AliasStore();
	private AliasStore domainAliases = new AliasStore();

	private Integer currentIndex;
	private final List<String> selectAttributes;

	ColumnMapper(final QuerySpecs query) {
		currentIndex = 0;
		selectAttributes = new ArrayList<String>();
		fillAliases(query);
	}

	void addClassAlias(final Alias alias, final Set<? extends CMClass> aliasClasses) {
		classAliases.addAlias(alias, aliasClasses);
	}

	void addDomainAlias(final Alias alias, final Set<QueryDomain> aliasQueryDomains) {
		Set<CMDomain> aliasDomains = new HashSet<CMDomain>();
		for (QueryDomain qd : aliasQueryDomains) {
			aliasDomains.add(qd.getDomain());
		}
		domainAliases.addAlias(alias, aliasDomains);
	}

	private AliasAttributes getAliasAttributes(final Alias entryTypeAlias) {
		AliasAttributes out;
		out = classAliases.getAliasAttributes(entryTypeAlias);
		if (out == null) {
			out = domainAliases.getAliasAttributes(entryTypeAlias);
		}
		return out;
	}

	// FIXME Refactor to remove duplicate code
	void addAttribute(final QueryAliasAttribute qa) {
		final Alias typeAlias = qa.getEntryTypeAlias();

		AliasAttributes aliasAttributes = getAliasAttributes(typeAlias);
		if (qa instanceof AnyAttribute) {
			for (CMEntryType type : aliasAttributes.getEntryTypes()) {
				for (CMAttribute attr : type.getAttributes()) {
					final String attributeName = attr.getName();
					final String attributeAlias = String.format("%s#%s", type.getName(), attributeName);
					final Integer usedIndex = addSelectAttribute(typeAlias, attributeAlias, null, null);
					aliasAttributes.addAttribute(attributeName, Alias.as(attributeAlias), usedIndex, type);
				}
			}
		} else {
			final String attributeName = qa.getName();
			final Integer usedIndex = addSelectAttribute(typeAlias, attributeName, null, null);
			aliasAttributes.addAttribute(attributeName, null, usedIndex);
		}
	}

	private Integer addSelectAttribute(final Alias typeAlias, final String attributeName, final String cast, final Alias attributeAlias) {
		final StringBuffer sb = new StringBuffer(Utils.quoteAttribute(typeAlias, attributeName));
		if (cast != null) {
			sb.append(cast);
		}
		if (attributeAlias != null) {
			sb.append(" AS ").append(Utils.quoteAlias(attributeAlias));
		}
		selectAttributes.add(sb.toString());
		return ++currentIndex;
	}

	public Iterable<EntryTypeAttribute> getEntryTypeAttributes(final Alias typeAlias, final CMEntryType type) {
		return getAliasAttributes(typeAlias).getAttributes(type);
	}

	private void fillAliases(QuerySpecs query) {
		addClassAlias(query.getDBFrom().getAlias(), query.getDBFrom().getType().getLeaves());
		for (JoinClause jc : query.getJoins()) {
			addDomainAlias(jc.getDomainAlias(), jc.getQueryDomains());
			addClassAlias(jc.getTargetAlias(), jc.getTargets());
		}
	}

	public void addSystemSelectAttribute(final Alias typeAlias, final Const.SystemAttributes systemAttribute) {
		addSelectAttribute(typeAlias, systemAttribute.getDBName(), systemAttribute.getCastSuffix(), Alias.as(Utils.getSystemAttributeAlias(typeAlias, systemAttribute)));
	}

	public void addUserSelectAttribute(final QueryAliasAttribute a) {
		addAttribute(a);
	}

	public List<String> getSelectAttributes() {
		return selectAttributes;
	}

	public Set<Alias> getClassAliases() {
		return classAliases.getAliases();
	}

	public Set<Alias> getDomainAliases() {
		return domainAliases.getAliases();
	}
}
