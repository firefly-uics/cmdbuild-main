package org.cmdbuild.dao.entrytype.attributetype;


public class GeometryAttributeType extends AbstractAttributeType<Object> {

	public GeometryAttributeType() {
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