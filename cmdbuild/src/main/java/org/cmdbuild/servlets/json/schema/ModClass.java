package org.cmdbuild.servlets.json.schema;

import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.cmdbuild.elements.AttributeImpl;
import org.cmdbuild.elements.TableTree;
import org.cmdbuild.elements.interfaces.BaseSchema;
import org.cmdbuild.elements.interfaces.DomainFactory;
import org.cmdbuild.elements.interfaces.IAttribute;
import org.cmdbuild.elements.interfaces.IDomain;
import org.cmdbuild.elements.interfaces.ITable;
import org.cmdbuild.elements.interfaces.ITableFactory;
import org.cmdbuild.elements.interfaces.ProcessType;
import org.cmdbuild.elements.interfaces.BaseSchema.CMTableType;
import org.cmdbuild.elements.interfaces.BaseSchema.Mode;
import org.cmdbuild.elements.interfaces.BaseSchema.SchemaStatus;
import org.cmdbuild.elements.interfaces.IAttribute.AttributeType;
import org.cmdbuild.elements.interfaces.IAttribute.FieldMode;
import org.cmdbuild.exception.AuthException;
import org.cmdbuild.exception.CMDBException;
import org.cmdbuild.exception.CMDBWorkflowException;
import org.cmdbuild.exception.NotFoundException;
import org.cmdbuild.exception.ORMException;
import org.cmdbuild.exception.AuthException.AuthExceptionType;
import org.cmdbuild.exception.ORMException.ORMExceptionType;
import org.cmdbuild.logger.Log;
import org.cmdbuild.services.WorkflowService;
import org.cmdbuild.services.auth.UserContext;
import org.cmdbuild.services.meta.MetadataService;
import org.cmdbuild.servlets.json.JSONBase;
import org.cmdbuild.servlets.json.serializers.Serializer;
import org.cmdbuild.servlets.utils.Parameter;
import org.cmdbuild.workflow.WorkflowCache;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class ModClass extends JSONBase {
	
	@JSONExported
	public JSONArray tree(
			@Parameter(value="active", required=false) boolean active,
			ITableFactory tf ) throws JSONException, AuthException {
		TableTree tree =  tf.fullTree().displayable();
		if (active) {
			tree.active();
		}
		JSONObject treeRoot = Serializer.serializeTableTree(tree.exclude(ProcessType.BaseTable).getRootElement());
		JSONArray JSONTree = new JSONArray();
		JSONTree.put(treeRoot);
		return JSONTree;
	}

	@JSONExported
	public JSONArray getSimpleTablesTree(
			@Parameter(value="active", required=false) boolean active,
			ITableFactory tf) throws JSONException, AuthException {
		JSONArray tableList = new JSONArray();
		for (ITable t : tf.list()) {
			if (t.getTableType() == CMTableType.SIMPLECLASS && t.getMode().isDisplayable()
					&& (!active || t.getStatus().isActive())) {
				JSONObject jt = Serializer.serializeTable(t);
				if (jt != null) {
					tableList.put(jt);
				}
			}
		}
		return tableList;		
	}

	@JSONExported
	public JSONObject getSuperClasses(
			JSONObject serializer,
			ITableFactory tf ) throws JSONException, AuthException {
		for(ITable table : tf.fullTree().superclasses().active().exclude(ProcessType.BaseTable)) {
			JSONObject element = new JSONObject();
			element.put("value", table.getId());
			element.put("description", table.getDescription());
			element.put("classname", table.getDBName());
			serializer.append("superclasses", element);
		}
		return serializer;
	}
	
	@JSONExported
	public JSONObject getProcessSuperClasses(
			JSONObject serializer,
			ITableFactory tf ) throws JSONException, AuthException {
		for(ITable table : tf.fullTree().superclasses().active().branch(ProcessType.BaseTable)){
			JSONObject element = new JSONObject();			
			element.put("value", table.getId());
			element.put("description", table.getDescription());
			element.put("classname", table.getDBName());
			serializer.append("superclasses", element);
		}
		return serializer;
	}


	@JSONExported
	public JSONObject getSubclasses(
			JSONObject serializer,
			@Parameter("ClassId") int classId,
			ITableFactory tf ) throws JSONException, AuthException {
		for(ITable table : tf.fullTree().branch(tf.get(classId).getName())) {
			JSONObject element = new JSONObject();
			element.put("classId", table.getId());
			element.put("className", table.getDescription());
			serializer.append("subclasses", element);
		}
		return serializer;
	}

	@JSONExported
	public JSONObject getAllClasses(
			JSONObject serializer,
			@Parameter(value="active", required=false) boolean active,
			UserContext userCtx) throws JSONException, AuthException {
		final Iterable<ITable> allTables = userCtx.tables().list();
		
		for (ITable table: allTables) {
			if (!table.getMode().isDisplayable()) {
				continue;
			}	
			if (active && !isActive(table)) {
				continue;
			}
			final JSONObject jsonTable = Serializer.serializeTable(table);
			serializer.append("classes", jsonTable);
		}
		return serializer;
	}

	@Admin
	@JSONExported
	public JSONObject getAllDomains(
			JSONObject serializer,
			UserContext userCtx) throws JSONException, AuthException {
		final Iterable<IDomain> allDomains = userCtx.domains().list();
		JSONArray jsonDomains = new JSONArray();
		for (IDomain domain: allDomains) {
			if (domain.getMode().isCustom()) {
				jsonDomains.put(Serializer.serializeDomain(domain));
			}
		}
		serializer.put("domains", jsonDomains);
		return serializer;
	}

	private boolean isActive(ITable table) {
		if (!table.getStatus().isActive()) {
			return false;
		}
		// consider a process active if is
		// in the wfcache --> have an XPDL
		if (table.isActivity() && !table.isSuperClass()) {
			try {
				return WorkflowService.getInstance().isEnabled()
						&& WorkflowCache.getInstance().hasProcessClass(
								table.getName());
			} catch (NullPointerException e) {
				// shark configured but connection failed
				return false;
			} catch (CMDBWorkflowException e) {
				return false;
			}
		}
		return true;
	}
	
	@JSONExported
	public JSONObject getAttributeList(
			@Parameter(value="active", required=false) boolean active,
			JSONObject serializer,
			ITable table ) throws JSONException, AuthException {
		serializer.put("rows", Serializer.serializeAttributeList(table, active));
		return serializer;
	}
	
	@JSONExported
	public JSONObject saveOrderCriteria(
			@Parameter(value="records") JSONObject orderCriteria,
			JSONObject serializer,
			ITable table ) throws JSONException, AuthException {
		Map<String, IAttribute> attributes = table.getAttributes();
		for (String keyAttr: attributes.keySet()) {
			IAttribute attribute = attributes.get(keyAttr);
			String attrName = attribute.getName();
			Log.PERSISTENCE.debug(attrName);
			if (attribute.isReserved())
				continue;
			if (orderCriteria.has(attrName)){
				attribute.setClassOrder(orderCriteria.getInt(attrName));
				attribute.save();
			} else {
				attribute.setClassOrder(0);
				attribute.save();
			}
		}
		return serializer;
	}
	
	@JSONExported
	public JSONObject getAttributeTypes(
			ITable table,
			@Parameter("tableType") String tableTypeStirng,
			JSONObject serializer ) throws JSONException, AuthException {
		
		CMTableType tableType = CMTableType.valueOf(tableTypeStirng);
		
		for(AttributeType type : tableType.getAvaiableAttributeList()) {
			if (type.isReserved()) {
				continue;
			}
			JSONObject jatv = new JSONObject();
			jatv.put("name", type.toString());
			jatv.put("value", type.toString());
			serializer.append("types", jatv);
		}
		return serializer;
	}

	@JSONExported
	public JSONObject getFieldModes(
			JSONObject serializer ) throws JSONException, AuthException {
		for(FieldMode type : FieldMode.values()) {
			JSONObject jo = new JSONObject();
			jo.put("fieldmode_value", getTraslation("administration.modClass.attributeProperties.field_"+type.toString().toLowerCase()));
			jo.put("fieldmode",type.getMode());
			serializer.append("modes", jo);
		}
		return serializer;
	}

	@JSONExported
	public JSONObject saveTable(
			JSONObject serializer,
			@Parameter(value="name",required=false) String name,
			@Parameter("description") String description,
			@Parameter(value="inherits",required=false) int idParent,
			@Parameter(value="superclass",required=false) boolean isSuperClass,
			@Parameter(value="isprocess",required=false) boolean isProcess,
			@Parameter(value="tableType",required=false) String tableType,
			@Parameter("active") boolean isActive,
			ITable table ) throws JSONException, CMDBException {
		if (table.isNew()) { // TODO: move it to Table!
			if (tableType != null && tableType.equals("simpletable")) {
				table.setTableType(CMTableType.SIMPLECLASS);
			} else {
				if (idParent > 0) {
					table.setParent(idParent);
				} else {
					if (isProcess) {
						table.setParent(ProcessType.BaseTable);
					} else {
						table.setParent(ITable.BaseTable);
					}
				}
			}

			table.setName(name);
			table.setSuperClass(isSuperClass);
			table.setMode(isSuperClass ? Mode.READ.getModeString() : Mode.WRITE.getModeString());
		}
		if (description.length() == 0)
			description = name;
		table.setDescription(description);
		table.setStatus(SchemaStatus.fromBoolean(isActive));
		table.save();
		JSONObject result = Serializer.serializeTable(table);

		serializer.put("table", result);
		return serializer;
	}

	@JSONExported
	public JSONObject deleteTable(
			JSONObject serializer,
			ITable table ) throws JSONException, CMDBException {
		try {
			table.delete();
		} catch (ORMException e) {
			if (e.getExceptionType() == ORMExceptionType.ORM_CONTAINS_DATA) {
				table.setStatus(SchemaStatus.NOTACTIVE);
				table.save();
			}
			throw e;
		}
		return serializer;
	}

	// TODO AUTHORIZATION ON ATTRIBUTES IS NEVER CHECKED!
	@JSONExported
	public JSONObject saveAttribute(
			JSONObject serializer,
			@Parameter(value="name", required=false) String name,
			@Parameter(value="type", required=false) String attributeTypeString,
			@Parameter("description") String description,
			@Parameter(value="defaultvalue", required=false) String defaultValue,
			@Parameter("isbasedsp") boolean isBaseDSP,
			@Parameter("isnotnull") boolean isNotNull,
			@Parameter("isunique") boolean isUnique,
			@Parameter("isactive") boolean isActive,
			@Parameter("fieldmode") String fieldMode,
			@Parameter(value="len", required=false) int length,
			@Parameter(value="precision", required=false) int precision,
			@Parameter(value="scale", required=false) int scale,
			@Parameter(value="lookup", required=false) String lookupType,
			@Parameter(value="idDomain", required=false) int domainId,
			@Parameter(value="fieldFilter", required=false) String fieldFilter,
			@Parameter(value="fkDestination", required=false) int fkDestinationId,
			@Parameter(value="group", required=false) String group,
			@Parameter(value="meta", required=false) JSONObject meta,
			BaseSchema table,
			UserContext userCtx) throws JSONException, CMDBException {
		IAttribute attribute;
		try {
			attribute = table.getAttribute(name);
			if (!attribute.getMode().isCustom()) {
				throw AuthExceptionType.AUTH_NOT_AUTHORIZED.createException();
			}
		} catch (NotFoundException e) {
			attribute = AttributeImpl.create(table, name, AttributeType.valueOf(attributeTypeString));
		}
		if (description.length() == 0) {
			description = name;
		}
		attribute.setDescription(description);
		attribute.setDefaultValue(defaultValue);
		attribute.setBaseDSP(isBaseDSP);
		attribute.setNotNull(isNotNull);
		attribute.setUnique(isUnique);
		attribute.setFieldMode(fieldMode);
		attribute.setGroup(group);
		if (length > 0) {
			attribute.setLength(length);
		}
		if (precision > 0) {
			attribute.setPrecision(precision);
		}
		if (scale > 0) {
			attribute.setScale(scale);
		}
		attribute.setStatus(SchemaStatus.fromBoolean(isActive));
		
		if (attributeTypeString.equals(AttributeType.REFERENCE.toString())) {
			if (domainId > 0) {
				attribute.setReferenceDomain(domainId);
				IDomain domain= userCtx.domains().get(domainId);				
				boolean isdirect=false;
				String cardinality=domain.getCardinality();
				if (cardinality.equals(IDomain.CARDINALITY_N1))
					isdirect = true;
				else if (cardinality.equals(IDomain.CARDINALITY_1N))
					isdirect = false;
				attribute.setIsReferenceDirect(isdirect);
			}
			attribute.setFilterSafe(fieldFilter);
		} else if (attributeTypeString.equals(AttributeType.LOOKUP.toString())) {
			if (lookupType != null) {
				attribute.setLookupType(lookupType);
			}
		} else if (fkDestinationId > 0 && attributeTypeString.equals(AttributeType.FOREIGNKEY.toString())) {
			if (fkDestinationId > 0) {
				attribute.setFKTargetClass(userCtx.tables().get(fkDestinationId).getName());
			}
		}
		attribute.save();
		if (meta != null) {
			manageMetaData(meta, attribute, table);
		}
		serializer.put("attribute", Serializer.serializeAttribute(attribute));
		return serializer;
	}

	enum MetaStatus {
		DELETED,
		MODIFIED,
		NEW,
		NOT_MODIFIED // notmodified?
	}

	private void manageMetaData(JSONObject metaInRequest,
			IAttribute attribute, BaseSchema table) throws JSONException {
		Iterator<?> keyRequest = metaInRequest.keys();
		while (keyRequest.hasNext()) {
			String metaName = (String) keyRequest.next();
			JSONObject metaInfo = metaInRequest.getJSONObject(metaName);
			MetaStatus metaStatus = MetaStatus.valueOf(metaInfo.getString("status"));
			String metaValue = metaInfo.getString("value");
			switch (metaStatus) {
			case DELETED:
				MetadataService.deleteMetadata(attribute, metaName);
				break;
			case MODIFIED:
			case NEW:
				MetadataService.updateMetadata(attribute, metaName, metaValue);
				break;
			case NOT_MODIFIED:
			}
		}
	}

	@JSONExported
	public JSONObject deleteAttribute(
			JSONObject serializer,
			@Parameter("name") String attributeName,
			BaseSchema table) throws JSONException {
		IAttribute attribute = table.getAttribute(attributeName);
		try {
			attribute.delete();
		} catch (ORMException e) {
			if (e.getExceptionType() == ORMExceptionType.ORM_CONTAINS_DATA) {
				attribute.setStatus(SchemaStatus.NOTACTIVE);
				attribute.save();
			}
			throw e;
		}
		return serializer;
	}
	
	@JSONExported
	public JSONObject reorderAttribute(
			JSONObject serializer,
			@Parameter("attributes") String jsonAttributeList,
			ITable table) throws JSONException, CMDBException {   	
		JSONArray attributeList = new JSONArray(jsonAttributeList);
		Map<String, Integer> attributePositions = new HashMap<String, Integer>();
		for(int i = 0; i < attributeList.length(); ++i) {
			JSONObject jattr = attributeList.getJSONObject(i);
			String attrName = jattr.getString("name");
			int attrIdx = jattr.getInt("idx");
			attributePositions.put(attrName, attrIdx);
		}
		for(String name : attributePositions.keySet()) {
			int index = attributePositions.get(name);
			IAttribute attribute = table.getAttribute(name);
			attribute.setIndex(index);
			attribute.save();
		}
		return serializer;
	}

	@JSONExported
	public JSONObject saveDomain(
			IDomain domain,
			JSONObject serializer,
			@Parameter(value="name", required=false) String domainName,
			@Parameter(value="idClass1", required=false) int classId1,
			@Parameter(value="idClass2", required=false) int classId2,
			@Parameter("description") String description,
			@Parameter(value="cardinality", required=false) String cardinality,
			@Parameter("directDescription") String descriptionDirect,
			@Parameter("reverseDescription") String descriptionInverse,
			@Parameter("isMasterDetail") boolean isMasterDetail,
			@Parameter("active") boolean isActive
	) throws JSONException, AuthException, NotFoundException {
		if (domain.isNew()) {
			domain.setClass1(UserContext.systemContext().tables().get(classId1));
			domain.setClass2(UserContext.systemContext().tables().get(classId2));
			domain.setName(domainName);
			if (cardinality!=null && !cardinality.equals("")) {
				domain.setCardinality(cardinality);
			}
		}
		domain.setDescription(description);
		domain.setDescriptionDirect(descriptionDirect);
		domain.setDescriptionInverse(descriptionInverse);
		domain.setMasterDetail(isMasterDetail);		
		domain.setStatus(SchemaStatus.fromBoolean(isActive));
		domain.save();
		
		serializer.put("domain", Serializer.serializeDomain(domain));
		return serializer;
	}

	@JSONExported
	public void deleteDomain(
			IDomain domain ) throws JSONException {
		
		boolean hasReference = false;
		String cardinality = domain.getCardinality();
		if(cardinality.equals(IDomain.CARDINALITY_11)||cardinality.equals(IDomain.CARDINALITY_1N)){
			ITable table = domain.getClass2();	
			hasReference = searchReference(table, domain);
		}
		if (!hasReference  && (cardinality.equals(IDomain.CARDINALITY_11)||cardinality.equals(IDomain.CARDINALITY_N1))){
			ITable table = domain.getClass1();
			hasReference = searchReference(table, domain);		
		}
		if (hasReference) {
			throw ORMExceptionType.ORM_DOMAIN_HAS_REFERENCE.createException();
		} else {
			domain.delete();
		}
	}
	
	private static boolean searchReference(ITable table, IDomain domain){
		Map<String, IAttribute> attributes = table.getAttributes();
		for (String attrName: attributes.keySet()){
			IAttribute attribute = attributes.get(attrName);
			IDomain attributeDom = attribute.getReferenceDomain();
			if(attributeDom!=null && (attributeDom.getName()).equals(domain.getName())){
				return true;
			}
		}
		return false;
	}
	
	@JSONExported
	public JSONObject getDomainList(
				@Parameter("WithSuperclasses") boolean withSuperclasses,
				JSONObject serializer,
				ITable table,
				DomainFactory df,
				ITableFactory tf
			) throws JSONException {
		JSONArray rows = new JSONArray();
		for(IDomain domain : df.list(table).inherited()) {
			rows.put(Serializer.serializeDomain(domain, table));
		}
		serializer.put("rows", rows);
		if (withSuperclasses) {
			serializer.put("superclasses", tf.fullTree().idPath(table.getName()));
		}
		return serializer;
	}

	@JSONExported
	public JSONArray getFKTargetingClass(
			ITableFactory tf,
			ITable table) throws JSONException, CMDBException {
		JSONArray fk = new JSONArray();
		for (IAttribute attribute : table.fkDetails()) {
			if (attribute.getMode().isDisplayable()) {
				fk.put(Serializer.serializeAttribute(attribute));
			}
		}
		return fk;
	}

	@JSONExported
	public JSONObject getReferenceableDomainList(
			JSONObject serializer,
			ITable table,
			DomainFactory df,
			ITableFactory tf
		) throws JSONException {
			JSONArray rows = new JSONArray();
			for(IDomain domain : df.list(table).inherited()){
				String cardinality = domain.getCardinality();
				String class1 = domain.getTables()[0].getName();
				String class2 = domain.getTables()[1].getName();
				Collection<String> classWithAncestor = tf.fullTree().path(table.getName());
				if(//cardinality.equals(IDomain.CARDINALITY_11) ||
						(cardinality.equals(IDomain.CARDINALITY_1N) && classWithAncestor.contains(class2)) ||
						(cardinality.equals(IDomain.CARDINALITY_N1) && classWithAncestor.contains(class1))) {
					rows.put(Serializer.serializeDomain(domain));
				}
			}
			serializer.put("rows", rows);
		return serializer;
	}
}