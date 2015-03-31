package org.cmdbuild.service.rest.v2.constants;

public class Serialization {

	public static final String NAMESPACE = "http://cmdbuild.org/services/rest/v2/";

	public static final String //
			ID = "id", //
			ID_CAPITALIZED = "Id", //
			PROCESS_CAPITAL = "Process";

	public static final String //
			ACCOUNT = "account", //
			ACTIVE = "active", //
			ACTIVITY = "activity", //
			ADVANCE = "advance", //
			ATTACHMENT = "attachment", //
			ATTACHMENT_ID = ATTACHMENT + ID_CAPITALIZED, //
			ATTACHMENT_METADATA = ATTACHMENT + "Metadata", //
			ATTRIBUTE = "attribute", //
			ATTRIBUTES = "attributes", //
			AUTHOR = "author", //
			AVAILABLE_ROLES = "availableRoles", //
			BCC = "bcc", //
			BODY = "body", //
			CARD = "card", //
			CARD_ID = CARD + ID_CAPITALIZED, //
			CARDINALITY = "cardinality", //
			CATEGORY = "category", //
			CATEGORY_ID = CATEGORY + ID_CAPITALIZED, //
			CC = "cc", //
			CHILDREN = "children", //
			CLASS = "class", //
			CLASS_ID = CLASS + ID_CAPITALIZED, //
			CODE_CAPITALIZED = "Code", //
			CODE = "code", //
			CREATED = "created", //
			DATA = "data", //
			DATE = "date", //
			DEFAULT = "default", //
			DEFAULT_STATUS = DEFAULT + "Status", //
			DEFAULT_VALUE = DEFAULT + "Value", //
			DESCRIPTION = "description", //
			DESCRIPTION_ATTRIBUTE_NAME = DESCRIPTION + "_attribute_name", //
			DESCRIPTION_CAPITALIZED = "Description", //
			DESCRIPTION_DIRECT = DESCRIPTION + "Direct", //
			DESCRIPTION_INVERSE = DESCRIPTION + "Inverse", //
			DESCRIPTION_MASTER_DETAIL = DESCRIPTION + "MasterDetail", //
			DESTINATION = "destination", //
			DESTINATION_PROCESS = DESTINATION + PROCESS_CAPITAL, //
			DISPLAYABLE_IN_LIST = "displayableInList", //
			DOMAIN = "domain", //
			DOMAIN_ID = DOMAIN + ID_CAPITALIZED, //
			DOMAIN_SOURCE = DOMAIN + "Source", //
			EDITOR_TYPE = "editorType", //
			EMAIL = "email", //
			EMAIL_ID = EMAIL + ID_CAPITALIZED, //
			EXTENSION = "extension", //
			EXTRA = "extra", //
			FILE = "file", //
			FILTER = "filter", //
			FROM = "from", //
			GROUP = "group", //
			INDEX = "index", //
			INHERITED = "inherited", //
			INSTRUCTIONS = "instructions", //
			KEEP_SYNCHRONIZATION = "keepSynchronization", //
			LABEL = "label", //
			LENGTH = "length", //
			LIMIT = "limit", //
			MANDATORY = "mandatory", //
			MENU = "menu", //
			MENU_TYPE = MENU + "Type", //
			METADATA = "metadata", //
			MODE = "mode", //
			MODIFIED = "modified", //
			NAME = "name", //
			NO_SUBJECT_PREFIX = "noSubjectPrefix", //
			NOTIFY_WITH = "notifyWith", //
			NUMBER = "number", //
			OBJECT_DESCRIPTION = "objectDescription", //
			OBJECT_ID = "objectId", //
			OBJECT_TYPE = "objectType", //
			OUTPUT = "output", //
			PARAMETERS = "parameters", //
			PARAMS = "params", //
			PARENT_ID = "parent_id", //
			PARENT = "parent", //
			PARENT_TYPE = "parent_type", //
			PASSWORD = "password", //
			PRECISION = "precision", //
			PROMPT_SYNCHRONIZATION = "promptSynchronization", //
			PROTOTYPE = "prototype", //
			RELATION = "relation", //
			RELATION_ID = RELATION + ID_CAPITALIZED, //
			REPORT = "report", //
			REPORT_ID = REPORT + ID_CAPITALIZED, //
			REQUIRED = "required", //
			RESPONSE_METADATA = "meta", //
			ROLE_ID = "role" + ID_CAPITALIZED, //
			ROLE = "role", //
			SCALE = "scale", //
			SESSION = "session", //
			SORT = "sort", //
			SOURCE = "source", //
			SOURCE_PROCESS = SOURCE + PROCESS_CAPITAL, //
			START = "start", //
			STATUSES = "statuses", //
			STATUS = "status", //
			SUBJECT = "subject", //
			TARGET_CLASS = "targetClass", //
			TEMPLATE = "template", //
			TEXT = "text", //
			TITLE = "title", //
			TO = "to", //
			TOTAL = "total", //
			TYPE_CAPITALIZED = "Type", //
			TYPE = "type", //
			UNIQUE = "unique", //
			USERNAME = "username", //
			VALUES = "values", //
			VALUE = "value", //
			VERSION = "version", //
			WIDGETS = "widgets", //
			WRITABLE = "writable";

	public static final String //
			LOOKUP = "lookup", //
			LOOKUP_TYPE = LOOKUP + "Type", //
			LOOKUP_TYPE_ID = LOOKUP_TYPE + ID_CAPITALIZED, //
			LOOKUP_VALUE = LOOKUP + "Value", //
			LOOKUP_VALUE_ID = LOOKUP_VALUE + ID_CAPITALIZED;

	public static final String //
			PROCESS = "process", //
			PROCESS_ACTIVITY = PROCESS + "Activity", //
			PROCESS_ACTIVITY_ID = PROCESS_ACTIVITY + ID_CAPITALIZED, //
			PROCESS_ID = PROCESS + ID_CAPITALIZED, //
			PROCESS_INSTANCE = PROCESS + "Instance", //
			PROCESS_INSTANCE_ID = PROCESS_INSTANCE + ID_CAPITALIZED;

	public static final String //
			TYPE_BOOLEAN = "boolean", //
			TYPE_CHAR = "char", //
			TYPE_DATE = "date", //
			TYPE_DATE_TIME = "dateTime", //
			TYPE_DECIMAL = "decimal", //
			TYPE_DOUBLE = "double", //
			TYPE_ENTRY_TYPE = "entryType", //
			TYPE_FOREIGN_KEY = "foreignKey", //
			TYPE_INTEGER = "integer", //
			TYPE_IP_ADDRESS = "ipAddress", //
			TYPE_LIST = "list", //
			TYPE_LOOKUP = "lookup", //
			TYPE_REFERENCE = "reference", //
			TYPE_STRING_ARRAY = "stringArray", //
			TYPE_STRING = "string", //
			TYPE_TEXT = "text", //
			TYPE_TIME = "time";

	public static final String //
			UNDERSCORED_ACTIVITY = "_activity", //
			UNDERSCORED_ADVANCE = "_" + ADVANCE, //
			UNDERSCORED_ATTACHMENT = "_" + ATTACHMENT, //
			UNDERSCORED_AUTHOR = "_" + AUTHOR, //
			UNDERSCORED_CATEGORY = "_" + CATEGORY, //
			UNDERSCORED_CREATED = "_" + CREATED, //
			UNDERSCORED_DESCRIPTION = "_" + DESCRIPTION, //
			UNDERSCORED_DESTINATION = "_" + DESTINATION, //
			UNDERSCORED_DESTINATION_DESCRIPTION = UNDERSCORED_DESTINATION + DESCRIPTION_CAPITALIZED, //
			UNDERSCORED_DESTINATION_ID = UNDERSCORED_DESTINATION + ID_CAPITALIZED, //
			UNDERSCORED_DESTINATION_TYPE = UNDERSCORED_DESTINATION + TYPE_CAPITALIZED, //
			UNDERSCORED_ID = "_" + ID, //
			UNDERSCORED_MODIFIED = "_" + MODIFIED, //
			UNDERSCORED_NAME = "_" + NAME, //
			UNDERSCORED_SOURCE = "_" + SOURCE, //
			UNDERSCORED_SOURCE_DESCRIPTION = UNDERSCORED_SOURCE + DESCRIPTION_CAPITALIZED, //
			UNDERSCORED_SOURCE_ID = UNDERSCORED_SOURCE + ID_CAPITALIZED, //
			UNDERSCORED_SOURCE_TYPE = UNDERSCORED_SOURCE + TYPE_CAPITALIZED, //
			UNDERSCORED_STATUS = "_" + STATUS, //
			UNDERSCORED_TYPE = "_" + TYPE, //
			UNDERSCORED_VERSION = "_" + VERSION, //
			UNDERSCORED_WIDGETS = "_" + WIDGETS;

	private Serialization() {
		// prevents instantiation
	}

}