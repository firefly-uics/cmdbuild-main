package org.cmdbuild.dao.entrytype.attributetype;

import org.apache.commons.lang.StringUtils;

public abstract class AbstractReferenceAttributeType extends AbstractAttributeType<Long> {

	@Override
	protected Long convertNotNullValue(final Object value) {
		if (value instanceof Number) {
			return Number.class.cast(value).longValue();
		} else if (value instanceof String) {
			final Long converted;
			if (StringUtils.isBlank(String.class.cast(value))) {
				converted = null;
			} else {
				converted = Long.parseLong(String.class.cast(value));
			}
			return converted;
		} else {
			throw illegalValue(value);
		}
	}

}
