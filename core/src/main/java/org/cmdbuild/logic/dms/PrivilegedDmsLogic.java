package org.cmdbuild.logic.dms;

import static org.cmdbuild.logic.PrivilegeUtils.assure;

import java.io.IOException;
import java.io.InputStream;

import org.cmdbuild.auth.acl.PrivilegeContext;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.dms.MetadataGroup;
import org.cmdbuild.exception.CMDBException;
import org.cmdbuild.exception.DmsException;

public class PrivilegedDmsLogic extends ForwardingDmsLogic {

	private final CMDataView dataView;
	private final PrivilegeContext privilegeContext;

	public PrivilegedDmsLogic(final DmsLogic delegate, final CMDataView dataView,
			final PrivilegeContext privilegeContext) {
		super(delegate);
		this.dataView = dataView;
		this.privilegeContext = privilegeContext;
	}

	private void assureWritePrivilege(final String className) {
		final CMClass fetchedClass = dataView.findClass(className);
		assure(privilegeContext.hasWriteAccess(fetchedClass));
	}

	@Override
	public void upload(final String author, final String className, final Long cardId, final InputStream inputStream,
			final String fileName, final String category, final String description,
			final Iterable<MetadataGroup> metadataGroups) throws IOException, CMDBException {
		assureWritePrivilege(className);
		super.upload(author, className, cardId, inputStream, fileName, category, description, metadataGroups);
	}

	@Override
	public void delete(final String className, final Long cardId, final String fileName) throws DmsException {
		assureWritePrivilege(className);
		super.delete(className, cardId, fileName);
	}

	@Override
	public void updateDescriptionAndMetadata(final String className, final Long cardId, final String filename,
			final String description, final Iterable<MetadataGroup> metadataGroups) {
		assureWritePrivilege(className);
		super.updateDescriptionAndMetadata(className, cardId, filename, description, metadataGroups);
	}

}