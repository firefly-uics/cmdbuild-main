package utils;

import java.util.List;
import java.util.Map;

import org.cmdbuild.auth.password.NaivePasswordHandler;
import org.cmdbuild.auth.password.PasswordHandler;
import org.cmdbuild.dao.driver.DBDriver;
import org.cmdbuild.dao.entry.DBCard;
import org.cmdbuild.dao.entry.DBRelation;
import org.cmdbuild.dao.entrytype.DBClass;
import org.cmdbuild.dao.entrytype.DBDomain;
import org.cmdbuild.dao.reference.EntryTypeReference;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

public class UserRolePrivilegeFixture {

	private static final String USER_CLASS = "User";
	private static final String ROLE_CLASS = "Role";
	private static final String GRANT_CLASS = "Grant";
	private static final String USER_ROLE_DOMAIN = "UserRole";
	private static final String USERNAME_ATTRIBUTE = "Username";
	private static final String PASSWORD_ATTRIBUTE = "Password";
	private static final String EMAIL_ATTRIBUTE = "Email";
	private static final String DEFAULT_GROUP_ATTRIBUTE = "DefaultGroup";
	private static final PasswordHandler digester = new NaivePasswordHandler();

	private final List<Long> insertedGroupIds = Lists.newArrayList();
	private final List<Long> insertedUserIds = Lists.newArrayList();
	private final Map<Long, List<Long>> userIdToGroupIds = Maps.newHashMap();

	private final DBDriver driver;

	public UserRolePrivilegeFixture(DBDriver driver) {
		this.driver = driver;
	}

	public DBCard insertUserWithUsernameAndPassword(final String username, final String password) {
		final DBClass users = driver.findClassByName(USER_CLASS);
		final DBCard user = DBCard.newInstance(driver, users);
		final DBCard insertedUser = user.set(USERNAME_ATTRIBUTE, username) //
				.set(PASSWORD_ATTRIBUTE, digester.encrypt(password)) //
				.set(EMAIL_ATTRIBUTE, username + "@example.com").save();
		insertedUserIds.add(insertedUser.getId());
		return insertedUser;
	}

	public DBCard insertRoleWithCode(final String code) {
		final DBClass roles = driver.findClassByName(ROLE_CLASS);
		final DBCard group = DBCard.newInstance(driver, roles);
		final DBCard insertedGroup = (DBCard) group.setCode(code).save();
		insertedGroupIds.add(insertedGroup.getId());
		return insertedGroup;
	}

	public DBCard insertPrivilege(final Long roleId, final DBClass clazz, final String mode) {
		final DBClass grantClass = driver.findClassByName(GRANT_CLASS);
		final DBCard privilege = DBCard.newInstance(driver, grantClass);
		final DBCard insertedGrant = privilege.set("IdRole", roleId) //
				.set("IdGrantedClass", EntryTypeReference.newInstance(clazz.getId())) //
				.set("Mode", mode) //
				.save();
		return insertedGrant;
	}

	public DBRelation insertBindingBetweenUserAndRole(final DBCard user, final DBCard role) {
		final DBDomain userRoleDomain = driver.findDomainByName(USER_ROLE_DOMAIN);
		final DBRelation relation = DBRelation.newInstance(driver, userRoleDomain);
		relation.setCard1(user);
		relation.setCard2(role);

		List<Long> groupIds = userIdToGroupIds.get(user.getId());
		if (groupIds == null) {
			groupIds = Lists.newArrayList();
		}
		groupIds.add(role.getId());
		userIdToGroupIds.put(user.getId(), groupIds);

		return relation.save();
	}

	public DBRelation insertBindingBetweenUserAndRole(final DBCard user, final DBCard role, final boolean isDefault) {
		final DBDomain userRoleDomain = driver.findDomainByName(USER_ROLE_DOMAIN);
		final DBRelation relation = DBRelation.newInstance(driver, userRoleDomain);
		relation.setCard1(user);
		relation.setCard2(role);
		relation.set(DEFAULT_GROUP_ATTRIBUTE, isDefault);

		List<Long> groupIds = userIdToGroupIds.get(user.getId());
		if (groupIds == null) {
			groupIds = Lists.newArrayList();
		}
		groupIds.add(role.getId());
		userIdToGroupIds.put(user.getId(), groupIds);

		return relation.save();
	}

	public Map<Long, List<Long>> userIdToGroupIds() {
		return userIdToGroupIds;
	}

}
