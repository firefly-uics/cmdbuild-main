package org.cmdbuild.servlets.json.serializers;

import org.cmdbuild.model.DomainTreeNode;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class DomainTreeNodeJSONMapper {

	private static final String 
		CHILD_NODES = "childNodes",
		DIRECT = "direct",
		DOMAIN_NAME = "domainName",
		ID = "id",
		ID_PARENT = "idParent",
		ID_GROUP = "idGroup",
		TARGET_CLASS_NAME = "targetClassName",
		TARGET_CLASS_DESCRIPTION = "targetClassDescription",
		TYPE = "type";

	public static DomainTreeNode deserialize(JSONObject jsonTreeNode) throws JSONException {
		DomainTreeNode treeNode = new DomainTreeNode();

		treeNode.setDirect(readBooleanOrNull(jsonTreeNode, DIRECT));
		treeNode.setTargetClassName(readStringOrNull(jsonTreeNode, TARGET_CLASS_NAME));
		treeNode.setTargetClassDescription(readStringOrNull(jsonTreeNode, TARGET_CLASS_DESCRIPTION));
		treeNode.setDomainName(readStringOrNull(jsonTreeNode,DOMAIN_NAME));
		treeNode.setType(readStringOrNull(jsonTreeNode,TYPE));
		treeNode.setId(readLongOrNull(jsonTreeNode,ID));
		treeNode.setIdParent(readLongOrNull(jsonTreeNode,ID_PARENT));
		treeNode.setIdGroup(readLongOrNull(jsonTreeNode,ID_GROUP));

		JSONArray jsonChildNodes = new JSONArray();
		if (jsonTreeNode.has(CHILD_NODES)) {
			jsonChildNodes = (JSONArray) jsonTreeNode.get(CHILD_NODES);
		}

		for (int i=0, l=jsonChildNodes.length(); i<l; ++i) {
			JSONObject jsonChild = (JSONObject) jsonChildNodes.get(i);
			treeNode.addChildNode(deserialize(jsonChild));
		}

		return treeNode;
	}

	public static JSONObject serialize(DomainTreeNode treeNode) throws JSONException {
		JSONObject jsonTreeNode = new JSONObject();

		jsonTreeNode.put(DIRECT, treeNode.isDirect());
		jsonTreeNode.put(TARGET_CLASS_NAME, treeNode.getTargetClassName());
		jsonTreeNode.put(TARGET_CLASS_DESCRIPTION, treeNode.getTargetClassDescription());
		jsonTreeNode.put(DOMAIN_NAME, treeNode.getDomainName());
		jsonTreeNode.put(TYPE, treeNode.getType());
		jsonTreeNode.put(ID, treeNode.getId());
		jsonTreeNode.put(ID_PARENT, treeNode.getIdParent());
		jsonTreeNode.put(ID_GROUP, treeNode.getIdGroup());

		JSONArray jsonChildNodes = new JSONArray();
		for (DomainTreeNode child: treeNode.getChildNodes()) {
			jsonChildNodes.put(serialize(child));
		}

		jsonTreeNode.put(CHILD_NODES, jsonChildNodes);

		return jsonTreeNode;
	}

	private static Boolean readBooleanOrNull(JSONObject src, String key) throws JSONException {
		if (src.has(key)) {
			return src.getBoolean(key);
		} else {
			return null;
		}
	}

	private static String readStringOrNull(JSONObject src, String key) throws JSONException {
		if (src.has(key)) {
			return src.getString(key);
		} else {
			return null;
		}
	}

	private static Long readLongOrNull(JSONObject src, String key) throws JSONException {
		if (src.has(key)) {
			return src.getLong(key);
		} else {
			return null;
		}
	}
}