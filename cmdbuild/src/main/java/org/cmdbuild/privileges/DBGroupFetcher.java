package org.cmdbuild.privileges;

import static org.cmdbuild.dao.query.clause.AnyAttribute.anyAttribute;
import static org.cmdbuild.dao.query.clause.QueryAliasAttribute.attribute;
import static org.cmdbuild.dao.query.clause.alias.Utils.as;
import static org.cmdbuild.dao.query.clause.where.EqualsOperatorAndValue.eq;
import static org.cmdbuild.dao.query.clause.where.SimpleWhereClause.condition;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.apache.commons.lang.Validate;
import org.cmdbuild.auth.GroupFetcher;
import org.cmdbuild.auth.acl.CMGroup;
import org.cmdbuild.auth.acl.DefaultPrivileges;
import org.cmdbuild.auth.acl.GroupImpl;
import org.cmdbuild.auth.acl.GroupImpl.GroupImplBuilder;
import org.cmdbuild.auth.acl.NullGroup;
import org.cmdbuild.auth.acl.PrivilegePair;
import org.cmdbuild.dao.CardStatus;
import org.cmdbuild.dao.entry.CMCard;
import org.cmdbuild.dao.entry.CMCard.CMCardDefinition;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.query.CMQueryResult;
import org.cmdbuild.dao.query.CMQueryRow;
import org.cmdbuild.dao.query.clause.alias.Alias;
import org.cmdbuild.dao.query.clause.alias.EntryTypeAlias;
import org.cmdbuild.dao.reference.EntryTypeReference;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.logic.TemporaryObjectsBeforeSpringDI;
import org.cmdbuild.privileges.fetchers.PrivilegeFetcher;
import org.cmdbuild.privileges.fetchers.factories.PrivilegeFetcherFactory;

import com.google.common.collect.Lists;

public class DBGroupFetcher implements GroupFetcher {

	private final CMDataView view;
	private static final String ROLE_CLASS_NAME = "Role";

	public DBGroupFetcher(final CMDataView view) {
		Validate.notNull(view);
		this.view = view;
	}

	@Override
	public Map<Long, CMGroup> fetchAllGroupIdToGroup() {
		final CMClass roleClass = view.findClass(ROLE_CLASS_NAME);
		final Map<Long, CMGroup> groupCards = new HashMap<Long, CMGroup>();
		final Alias groupClassAlias = EntryTypeAlias.canonicalAlias(roleClass);
		final CMQueryResult groupRows = view.select(anyAttribute(roleClass)) //
				.from(roleClass, as(groupClassAlias)).run();
		for (final CMQueryRow row : groupRows) {
			final CMCard groupCard = row.getCard(groupClassAlias);
			final CMGroup group = buildCMGroupFromGroupCard(groupCard);
			groupCards.put(groupCard.getId(), group);
		}
		return groupCards;
	}

	private String[] getDisabledModules(final CMCard groupCard) {
		final Object disabledModules = groupCard.get(groupDisabledModulesAttribute());
		if (disabledModules != null) {
			return (String[]) disabledModules;
		}
		return new String[0];
	}

	/*
	 * TODO Add report privileges
	 */
	private List<PrivilegePair> fetchAllPrivilegesForGroup(final Long groupId) {
		final List<PrivilegePair> allPrivileges = Lists.newArrayList();
		final Iterable<PrivilegeFetcherFactory> factories = TemporaryObjectsBeforeSpringDI
				.getPrivilegeFetcherFactories();
		for (final PrivilegeFetcherFactory factory : factories) {
			factory.setGroupId(groupId);
			final PrivilegeFetcher fetcher = factory.create();
			final Iterable<PrivilegePair> list = fetcher.fetch();
			allPrivileges.addAll(Lists.newArrayList(list));
		}
		return allPrivileges;
	}

	@Override
	public Iterable<CMGroup> fetchAllGroups() {
		final Map<Long, CMGroup> groupIdToGroup = fetchAllGroupIdToGroup();
		return groupIdToGroup.values();
	}

	@Override
	public CMGroup fetchGroupWithId(final Long groupId) {
		try {
			final CMCard groupCard = fetchGroupCardFromId(groupId);
			return buildCMGroupFromGroupCard(groupCard);
		} catch (final NoSuchElementException ex) {
			return new NullGroup(groupId);
		}
	}

	@Override
	public CMGroup fetchGroupWithName(final String groupName) {
		try {
			final CMCard groupCard = fetchGroupCardFromName(groupName);
			return buildCMGroupFromGroupCard(groupCard);
		} catch (final NoSuchElementException ex) {
			return new NullGroup();
		}
	}

	@Override
	public CMGroup changeGroupStatusTo(final Long groupId, final boolean isActive) {
		final CMCard groupCard = fetchGroupCardFromId(groupId);
		final CMCardDefinition modifiableCard = view.update(groupCard);
		if (isActive) {
			modifiableCard.set("Active", CardStatus.ACTIVE.value());
		} else {
			modifiableCard.set("Active", CardStatus.INACTIVE.value());
		}
		final CMCard modifiedGroupCard = modifiableCard.save();
		return buildCMGroupFromGroupCard(modifiedGroupCard);
	}

	private CMCard fetchGroupCardFromId(final Long groupId) {
		final CMClass roleClass = view.findClass(ROLE_CLASS_NAME);
		final Alias groupClassAlias = EntryTypeAlias.canonicalAlias(roleClass);
		final CMQueryRow row = view.select(anyAttribute(roleClass)) //
				.from(roleClass, as(groupClassAlias)) //
				.where(condition(attribute(roleClass, "Id"), eq(groupId))) //
				.run().getOnlyRow();
		final CMCard groupCard = row.getCard(groupClassAlias);
		return groupCard;
	}

	private CMCard fetchGroupCardFromName(final String groupName) {
		final CMClass roleClass = view.findClass(ROLE_CLASS_NAME);
		final Alias groupClassAlias = EntryTypeAlias.canonicalAlias(roleClass);
		final CMQueryRow row = view.select(anyAttribute(roleClass)) //
				.from(roleClass, as(groupClassAlias)) //
				.where(condition(attribute(roleClass, "Code"), eq(groupName))) //
				.run().getOnlyRow();
		final CMCard groupCard = row.getCard(groupClassAlias);
		return groupCard;
	}

	private CMGroup buildCMGroupFromGroupCard(final CMCard groupCard) {
		final Long groupId = groupCard.getId();
		final List<PrivilegePair> allPrivileges = fetchAllPrivilegesForGroup(groupId);
		final Object groupDescription = groupCard.get(groupDescriptionAttribute());
		final GroupImplBuilder groupBuilder = GroupImpl.newInstance().withId(groupId)
				.withName(groupCard.get(groupNameAttribute()).toString())
				.withDescription(groupDescription != null ? groupDescription.toString() : null);
		final boolean groupIsGod = Boolean.TRUE.equals(groupCard.get(groupIsGodAttribute()));
		if (groupIsGod) {
			groupBuilder.withPrivilege(new PrivilegePair(DefaultPrivileges.GOD));
		} else {
			groupBuilder.withPrivileges(allPrivileges);
			for (final String moduleName : getDisabledModules(groupCard)) {
				groupBuilder.withoutModule(moduleName);
			}
		}
		final EntryTypeReference classReference = (EntryTypeReference) groupCard.get(groupStartingClassAttribute());
		if (classReference != null) {
			groupBuilder.withStartingClassId(classReference.getId());
		}
		final Object emailAddress = groupCard.get(groupEmailAttribute());
		groupBuilder.withEmail(emailAddress != null ? emailAddress.toString() : null);
		groupBuilder.active((Boolean) groupCard.get("Active"));
		groupBuilder.administrator(groupIsGod);
		return groupBuilder.build();
	}

	private String groupNameAttribute() {
		return "Code";
	}

	private String groupEmailAttribute() {
		return "Email";
	}

	private String groupDescriptionAttribute() {
		return "Description";
	}

	private String groupIsGodAttribute() {
		return "Administrator";
	}

	private String groupDisabledModulesAttribute() {
		return "DisabledModules";
	}

	private String groupStartingClassAttribute() {
		return "startingClass";
	}

}
