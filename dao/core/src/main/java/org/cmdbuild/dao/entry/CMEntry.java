package org.cmdbuild.dao.entry;

import org.cmdbuild.dao.entrytype.CMEntryType;
import org.joda.time.DateTime;

/**
 * Immutable data store entry
 */
public interface CMEntry extends CMValueSet {

	interface CMEntryDefinition extends CMValueSet {
		CMEntryDefinition set(String key, Object value);
		/**
		 * Save the entry if something has changed
		 */
		CMEntry save();
	}

	CMEntryType getType();

	Long getId();

	String getUser();
	DateTime getBeginDate();
	DateTime getEndDate();
}
