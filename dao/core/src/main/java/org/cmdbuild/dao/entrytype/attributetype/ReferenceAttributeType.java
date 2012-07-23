package org.cmdbuild.dao.entrytype.attributetype;


public class ReferenceAttributeType extends AbstractAttributeType<Object> {

	public ReferenceAttributeType() {
	}

	@Override
	public void accept(CMAttributeTypeVisitor visitor) {
		visitor.visit(this);
	}

	@Override
	protected Object convertNotNullValue(Object value) {
		throw new UnsupportedOperationException("Not implemented yet");
	}
}
