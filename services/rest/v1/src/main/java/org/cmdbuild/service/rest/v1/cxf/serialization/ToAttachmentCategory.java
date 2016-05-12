package org.cmdbuild.service.rest.v1.cxf.serialization;

import static org.cmdbuild.service.rest.v1.model.Models.newAttachmentCategory;

import org.cmdbuild.dms.DocumentTypeDefinition;
import org.cmdbuild.service.rest.v1.model.AttachmentCategory;

import com.google.common.base.Function;

public class ToAttachmentCategory implements Function<DocumentTypeDefinition, AttachmentCategory> {

	@Override
	public AttachmentCategory apply(final DocumentTypeDefinition input) {
		return newAttachmentCategory() //
				.withId(input.getName()) //
				.withDescription(input.getName()) //
				.build();
	}

}