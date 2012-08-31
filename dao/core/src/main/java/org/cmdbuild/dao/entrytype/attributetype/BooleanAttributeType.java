package org.cmdbuild.dao.entrytype.attributetype;


public class BooleanAttributeType extends AbstractAttributeType<Boolean> {

	public BooleanAttributeType() {
	}

	@Override
	public void accept(CMAttributeTypeVisitor visitor) {
		visitor.visit(this);
	}

	@Override
	protected Boolean convertNotNullValue(Object value) {
		final Boolean booleanValue;
		if (value instanceof Boolean) {
			booleanValue = (Boolean) value;
		} else if (value instanceof String) {
			String stringValue = (String) value;
			if (stringValue.isEmpty()) {
				booleanValue = null;
			} else {
				booleanValue = Boolean.valueOf(stringValue);
			}
		} else {
			throw new IllegalArgumentException();
		}
		return booleanValue;
	}
}
