package org.cmdbuild.logic.data.access;

import org.cmdbuild.auth.user.OperationUser;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.data.store.lookup.LookupStore;
import org.cmdbuild.logic.data.LockLogic;

public class UserDataAccessLogicBuilder extends DataAccessLogicBuilder {

	public UserDataAccessLogicBuilder( //
			final CMDataView systemDataView, //
			final LookupStore lookupStore, //
			final CMDataView dataView, //
			final CMDataView strictDataView, //
			final OperationUser operationUser, //
			final LockLogic lockLogic //
	) {
		super(systemDataView, lookupStore, dataView, strictDataView, operationUser, lockLogic);
	}

}
