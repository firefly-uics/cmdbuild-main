package org.cmdbuild.workflow.extattr;

import org.cmdbuild.workflow.operation.ActivityDO;
import org.json.JSONException;
import org.json.JSONObject;

public class OpenAttachment extends AbstractCmdbuildExtendedAttribute {

	@Override
	protected void addCustomParams(ActivityDO activityDO, JSONObject object,
			ExtendedAttributeConfigParams eacp) throws JSONException {
		object.put("labelId", "open_attachment");
	}

	public String extendedAttributeName() {
		return "openAttachment";
	}
	
}
