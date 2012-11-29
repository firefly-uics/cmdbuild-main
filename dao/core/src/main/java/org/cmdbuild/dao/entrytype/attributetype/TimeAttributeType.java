package org.cmdbuild.dao.entrytype.attributetype;

import org.cmdbuild.common.Constants;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;


public class TimeAttributeType extends AbstractDateAttributeType {

	public TimeAttributeType() {
	}

	@Override
	public void accept(CMAttributeTypeVisitor visitor) {
		visitor.visit(this);
	}

	protected DateTimeFormatter[] getFormatters() {
		return new DateTimeFormatter[] {
			DateTimeFormat.forPattern(Constants.TIME_PARSING_PATTERN),
			DateTimeFormat.forPattern(Constants.SOAP_ALL_DATES_PARSING_PATTERN)
		};
	}
}