package org.cmdbuild.dao.attribute;

import java.util.Map;

import org.cmdbuild.dao.entrytype.attributetype.BooleanAttributeType;
import org.cmdbuild.dao.entrytype.attributetype.CMAttributeType;
import org.cmdbuild.elements.interfaces.BaseSchema;

public class BooleanAttribute extends DaoWrapperAttribute {

	private static CMAttributeType<?> BOOLEAN_TYPE = new BooleanAttributeType();

	public BooleanAttribute(BaseSchema schema, String name, Map<String, String> meta) {
		super(schema, name, meta);
		daoType = BOOLEAN_TYPE;
	}

	@Override
	public AttributeType getType() {
		return AttributeType.BOOLEAN;
	}
}