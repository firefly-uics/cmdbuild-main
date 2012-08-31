package org.cmdbuild.dao.entrytype.attributetype;

import java.math.BigDecimal;

import org.apache.commons.lang.Validate;


public class DecimalAttributeType extends AbstractAttributeType<BigDecimal> {

	public final Integer precision;
	public final Integer scale;

	public DecimalAttributeType() {
		this.precision = null;
		this.scale = null;
	}

	public DecimalAttributeType(final Integer precision, final Integer scale) {
		Validate.isTrue(precision > 0);
		Validate.isTrue(scale >= 0 && precision >= scale);
		this.precision = precision;
		this.scale = scale;
	}

	@Override
	public void accept(CMAttributeTypeVisitor visitor) {
		visitor.visit(this);
	}

	@Override
	protected BigDecimal convertNotNullValue(Object value) {
		BigDecimal decimalValue;
		if (value instanceof BigDecimal) {
			decimalValue = (BigDecimal) value;
		} else if (value instanceof String) {
			String stringValue = (String) value;
			if (stringValue.isEmpty()) {
				decimalValue = null;
			} else {
				// Throws NumberFormatException if the number cannot be parsed
				decimalValue = new BigDecimal(stringValue);
			}
		} else if (value instanceof Double) {
			decimalValue = new BigDecimal((Double) value);
		} else {
			throw new IllegalArgumentException();
		}
		return decimalValue;
	}
}