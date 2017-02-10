(function () {

	/**
	 * Constants with the standard parameter names
	 */
	Ext.define('CMDBuild.core.constants.Proxy', {

		singleton: true,

		ABSOLUTE_CLASS_ORDER: 'absoluteClassOrder',
		ACCORDION: 'accordion',
		ACCOUNT: 'account',
		ACTION: 'action',
		ACTIVE: 'active',
		ACTIVE_ONLY: 'activeOnly',
		ACTIVITY: 'activity',
		ACTIVITY_DESCRIPTION: 'activityDescription',
		ACTIVITY_ID: 'activityId',
		ACTIVITY_INSTANCE_ID: 'activityInstanceId',
		ACTIVITY_INSTANCE_INFO_LIST: 'activityInstanceInfoList',
		ACTIVITY_METADATA: 'activityMetadata',
		ACTIVITY_NAME: 'activityName',
		ACTIVITY_PERFORMER_NAME: 'activityPerformerName',
		ACTIVITY_SUBSET_ID: 'activitySubsetId',
		ACTIVITY_WRITABLE: 'activityWritable',
		ADD_DISABLED: 'addDisabled',
		ADDRESS: 'address',
		ADMIN: 'admin',
		ADMINISTRATOR_PASSWORD: 'administratorPassword',
		ADMINISTRATOR_USER_NAME: 'administratorUserName',
		ADVANCE: 'advance',
		ADVANCED: 'advanced',
		ALFRESCO: 'alfresco',
		ALFRESCO_DELAY: 'alfrescoDelay',
		ALFRESCO_FILE_SERVER_PORT: 'alfrescoFileServerPort',
		ALFRESCO_FILE_SERVER_URL: 'alfrescoFileServerUrl',
		ALFRESCO_HOST: 'alfrescoHost',
		ALFRESCO_LOOKUP_CATEGORY: 'alfrescoLookupCategory',
		ALFRESCO_PASSWORD: 'alfrescoPassword',
		ALFRESCO_REPOSITORY_APPLICATION: 'alfrescoRepositoryApplication',
		ALFRESCO_REPOSITORY_FILE_SERVER_PATH: 'alfrescoRepositoryFileServerPath',
		ALFRESCO_REPOSITORY_WEB_SERVICE_PATH: 'alfrescoRepositoryWebServicePath',
		ALFRESCO_USER: 'alfrescoUser',
		ALL: 'all',
		ALLOW_CARD_EDITING: 'allowCardEditing',
		ALLOW_PASSWORD_CHANGE: 'allowPasswordChange',
		ALREADY_ASSOCIATED: 'alreadyAssociated',
		ALWAYS_ENABLED: 'alwaysEnabled',
		AND: 'and',
		ANY: 'any',
		APPLIED: 'applied',
		ATTACHMENT: 'attachment',
		ATTACHMENTS: 'attachments',
		ATTACHMENTS_ACTIVE: 'attachmentsActive',
		ATTACHMENTS_CATEGORY: 'attachmentsCategory',
		ATTRIBUTE: 'attribute',
		ATTRIBUTE_CLASS: 'attributeClass',
		ATTRIBUTE_DESCRIPTION: 'attributeDescription',
		ATTRIBUTE_DOMAIN: 'attributeDomain',
		ATTRIBUTE_MAPPING: 'attributeMapping',
		ATTRIBUTE_NAME: 'attributeName',
		ATTRIBUTE_PATH: 'attributePath',
		ATTRIBUTE_SEPARATOR: 'attributeSeparator',
		ATTRIBUTES: 'attributes',
		ATTRIBUTES_NODE: 'attributesNode',
		ATTRIBUTES_PRIVILEGES: 'attributesPrivileges',
		AUTHOR: 'author',
		AUTHORIZATION_HEADER_KEY: 'CMDBuild-Authorization',
		AUTOCOMPLETION: 'autocompletion',
		BASE: 'base',
		BASE_LEVEL: 'baseLevel',
		BASE_NODE: 'baseNode',
		BCC: 'bcc',
		BCC_ADDRESSES: 'bccAddresses',
		BEGIN_DATE: 'beginDate',
		BEGIN_DATE_AS_LONG: 'beginDateAsLong',
		BIM: 'bim',
		BIM_LAYER: 'bimLayer',
		BODY: 'body',
		BULK_UPDATE: 'bulkUpdate',
		CALCULATED: 'calculated',
		CAPABILITIES: 'capabilities',
		CARD: 'card',
		CARD_BINDING: 'cardBinding',
		CARD_BROWSER_BY_DOMAIN_CONFIGURATION: 'cardBrowserByDomainConfiguration',
		CARD_FORM_RATIO: 'cardFormRatio',
		CARD_ID: 'cardId',
		CARD_IDENTIFIER: 'cardIdentifier',
		CARD_LOCK_TIMEOUT: 'cardLockTimeout',
		CARD_SEPARATOR: 'cardSeparator',
		CARD_TABS_POSITION: 'cardTabsPosition',
		CARDINALITY: 'cardinality',
		CARDS: 'cards',
		CATEGORIES: 'categories',
		CATEGORY: 'category',
		CC: 'cc',
		CC_ADDRESSES: 'ccAddresses',
		CENTER_LATITUDE: 'centerLatitude',
		CENTER_LONGITUDE: 'centerLongitude',
		CHANGE_PASSWORD: 'changePassword',
		CHANGE_STATUS: 'changeStatus',
		CHANGED: 'changed',
		CHECKED: 'checked',
		CHECKED_CARDS: 'checkedCards',
		CHILD_NODES: 'childNodes',
		CHILD_NODES_ID: 'childNodesId',
		CHILDREN: 'children',
		CLASS: 'class',
		CLASS_ATTACHMENT_TAB: 'classAttachmentTab',
		CLASS_ATTRIBUTE: 'classAttribute',
		CLASS_DESCRIPTION: 'classDescription',
		CLASS_DETAIL_TAB: 'classDetailTab',
		CLASS_EMAIL_TAB: 'classEmailTab',
		CLASS_HISTORY_TAB: 'classHistoryTab',
		CLASS_ID: 'classId',
		CLASS_IDENTIFIER: 'classIdentifier',
		CLASS_MAPPING: 'classMapping',
		CLASS_NAME: 'className',
		CLASS_NAMES: 'classNames',
		CLASS_NOTE_TAB: 'classNoteTab',
		CLASS_ORDER_SIGN: 'classOrderSign',
		CLASS_RELATION_TAB: 'classRelationTab',
		CLASS_TARGET_ID: 'classTargetId',
		CLASSES: 'classes',
		CLIENT_FILTER: 'clientFilter',
		CLONE: 'clone',
		CLONE_DISABLED: 'cloneDisabled',
		CLOUD_ADMIN: 'cloudAdmin',
		CLUSTERING_THRESHOLD: 'clusteringThreshold',
		CMIS: 'cmis',
		CMIS_HOST: 'cmisHost',
		CMIS_MODEL: 'cmisModel',
		CMIS_PASSWORD: 'cmisPassword',
		CMIS_PATH: 'cmisPath',
		CMIS_USER: 'cmisUser',
		CODE: 'code',
		COLUMNS: 'columns',
		COMPONENTS: 'components',
		CONDITION: 'condition',
		CONFIGURATION: 'configuration',
		CONFIRMATION: 'confirmation',
		CONFIRMED: 'confirmed',
		CONNECTION_HOST: 'connectionHost',
		CONNECTION_PASSWORD: 'connectionPassword',
		CONNECTION_PORT: 'connectionPort',
		CONNECTION_USER: 'connectionUser',
		CONTENT: 'content',
		CONTEXT: 'context',
		COUNT: 'count',
		CQL: 'cql',
		CQL_FILTER: 'cqlFilter',
		CREATE: 'create',
		CREATE_SHARK_SCHEMA: 'createSharkSchema',
		CREATION: 'creation',
		CRON_EXPRESSION: 'cronExpression',
		CRON_INPUT_TYPE: 'cronInputType',
		CSV: 'csv',
		CUSTOM: 'custom',
		CUSTOM_FORM: 'customForm',
		CUSTOM_PAGE: 'customPage',
		CUSTOM_PAGES: 'customPages',
		DASHBOARD: 'dashboard',
		DASHBOARDS: 'dashboards',
		DATA: 'data',
		DATA_INDEX: 'dataIndex',
		DATA_SOURCES: 'dataSources',
		DATA_VIEW: 'dataView',
		DATABASE_NAME: 'databaseName',
		DATABASE_TYPE: 'databaseType',
		DATABASE_USER_NAME: 'databaseUserName',
		DATABASE_USER_PASSWORD: 'databaseUserPassword',
		DATABASE_USER_TYPE: 'databaseUserType',
		DATASOURCE: 'dataSourceName',
		DATASOURCE_ADDRESS: 'dataSourceAddress',
		DATASOURCE_CONFIGURATION: 'dataSourceConfiguration',
		DATASOURCE_DB_INSATANCE_NAME: 'dataSourceDbInstance',
		DATASOURCE_DB_NAME: 'dataSourceDbName',
		DATASOURCE_DB_PASSWORD: 'dataSourceDbPassword',
		DATASOURCE_DB_PORT: 'dataSourceDbPort',
		DATASOURCE_DB_TYPE: 'dataSourceDbType',
		DATASOURCE_DB_USERNAME: 'dataSourceDbUsername',
		DATASOURCE_TABLE_VIEW_PREFIX: 'dataSourceTableViewPrefix',
		DATASOURCE_TYPE: 'dataSourceType',
		DATE: 'date',
		DAY_OF_MONTH: 'dayOfMonth',
		DAY_OF_WEEK: 'dayOfWeek',
		DB: 'db',
		DEFAULT: 'default',
		DEFAULT_ACCOUNT: 'defaultAccount',
		DEFAULT_DATE: 'defaultDate',
		DEFAULT_FILTER: 'defaultFilter',
		DEFAULT_FOR_GROUPS: 'defaultForGroups',
		DEFAULT_GROUP_DESCRIPTION: 'defaultGroupDescription',
		DEFAULT_GROUP_ID: 'defaultGroupId',
		DEFAULT_GROUP_NAME: 'defaultGroupName',
		DEFAULT_LANGUAGE: 'defaultLanguage',
		DEFAULT_LOCALIZATION: 'defaultLocalization',
		DEFAULT_SELECTION: 'defaultSelection',
		DELAY: 'delay',
		DELETE: 'delete',
		DELETE_CARD: 'deleteCard',
		DELETE_DISABLED: 'deleteDisabled',
		DELETE_TYPE: 'deletionType',
		DEMO: 'demo',
		DESCRIPTION: 'description',
		DESTINATION: 'destination',
		DESTINATION_CLASS: 'destinationClass',
		DESTINATION_CLASS_ID: 'destinationClassId',
		DESTINATION_CLASS_NAME: 'destinationClassName',
		DESTINATION_CODE: 'destinationCode',
		DESTINATION_DESCRIPTION: 'destinationDescription',
		DESTINATION_DISABLED_CLASSES: 'destinationDisabledClasses',
		DIRECT: 'direct',
		DIRECT_DESCRIPTION: 'directDescription',
		DIRECTION: 'direction',
		DIRTY: 'dirty',
		DISABLE: 'disable',
		DISABLE_ADD_ROW: 'disableAddRow',
		DISABLE_DELETE_ROW: 'disableDeleteRow',
		DISABLE_GRID_FILTER_TOGGLER: 'disableGridFilterToggler',
		DISABLE_IMPORT_FROM_CSV: 'disableImportFromCsv',
		DISABLE_SYNCHRONIZATION_OF_MISSING_VARIABLES: 'disableSynchronizationOfMissingVariables',
		DISABLED: 'disabled',
		DISABLED_CARD_TABS: 'disabledCardTabs',
		DISABLED_FEATURES: 'disabledFeatures',
		DISABLED_MODULES: 'disabledModules',
		DISABLED_PROCESS_TABS: 'disabledProcessTabs',
		DISPLAY_CARD_LOCKER_NAME: 'displayCardLockerName',
		DISPLAY_LABEL: 'displayLabel',
		DMS: 'dms',
		DOMAIN: 'domain',
		DOMAIN_DESCRIPTION: 'domainDescription',
		DOMAIN_DIRECTION: 'domainDirection',
		DOMAIN_ID: 'domainId',
		DOMAIN_NAME: 'domainName',
		DOMAINS: 'domains',
		DRAFT: 'draft',
		EDGE_COLOR: 'edgeColor',
		EDITING_MODE: 'editingMode',
		EDITOR_TYPE: 'editorType',
		ELEMENTS: 'elements',
		EMAIL: 'email',
		EMAIL_ACCOUNT: 'emailAccount',
		EMAIL_ACTIVE: 'emailActive',
		EMAIL_ID: 'emailId',
		EMAIL_TEMPLATE: 'emailTemplate',
		EMAIL_TEMPLATES: 'emailTemplates',
		EMPTY: 'empty',
		ENABLE: 'enable',
		ENABLE_ADD_ATTACHMENT_ON_CLOSED_ACTIVITIES: 'enableAddAttachmentOnClosedActivities',
		ENABLE_CARD_LOCK: 'enableCardLock',
		ENABLE_EDGE_TOOLTIP: 'enableEdgeTooltip',
		ENABLE_MAP: 'enableMap',
		ENABLE_MOVE_REJECTED_NOT_MATCHING: 'enableMoveRejectedNotMatching',
		ENABLE_NODE_TOOLTIP: 'enableNodeTooltip',
		ENABLE_RECURSION: 'enableRecursion',
		ENABLED: 'enabled',
		ENABLED_LANGUAGES: 'enabledLanguages',
		ENABLED_PANELS: 'enabledPanels',
		END_DATE: 'endDate',
		ENGINE: 'engine',
		ENTITY: 'entity',
		ENTITY_ID: 'entityId',
		ENTITY_IDENTIFIER: 'entityIdentifier',
		ENTRY_TYPE: 'entryType',
		ERRORS: 'errors',
		EVENT_CLASS: 'eventClass',
		EVENT_TITLE: 'eventTitle',
		EXCLUDE: 'exclude',
		EXCLUDE_PROCESSES: 'excludeProcesses',
		EXECUTABLE: 'executable',
		EXISTING: 'existing',
		EXPORT_CSV: 'exportCsv',
		EXPORT_DISABLED: 'exportDisabled',
		EXPRESSION: 'expression',
		EXTENSION: 'extension',
		EXTENSION_MAXIMUM_LEVEL: 'extensionMaximumLevel',
		EXTERNAL_GRAPHIC: 'externalGraphic',
		FAILURES: 'failures',
		FIELD: 'field',
		FIELD_MODE: 'fieldmode',
		FIELDS: 'fields',
		FILE: 'file',
		FILE_NAME: 'fileName',
		FILL_COLOR: 'fillColor',
		FILL_OPACITY: 'fillOpacity',
		FILLED: 'filled',
		FILTER: 'filter',
		FILTER_FROM_ADDRESS: 'filterFromAddress',
		FILTER_FUNCTION: 'filterFunction',
		FILTER_SUBJECT: 'filterSubject',
		FILTER_TYPE: 'filterType',
		FILTERS: 'filters',
		FK_DESTINATION: 'fkDestination',
		FLOW_STATUS: 'flowStatus',
		FOLDER_TYPE: 'folderType',
		FORCE_CREATION: 'forceCreation',
		FORCE_DOWNLOAD: 'forceDownload',
		FORCE_DOWNLOAD_PARAM_KEY: 'force-download',
		FORCE_FORMAT: 'forceFormat',
		FORM: 'form',
		FORMAT: 'format',
		FROM: 'from',
		FROM_ADDRESS: 'fromAddress',
		FULL_NAME: 'fullName',
		FULL_SCREEN_MODE: 'fullScreenMode',
		FUNCTION: 'function',
		FUNCTION_DATA: 'functionData',
		FUNCTIONS: 'functions',
		GENERIC: 'generic',
		GEO_SERVER: 'geoServer',
		GEO_SERVER_LAYERS_MAPPING: 'geoServerLayersMapping',
		GIS: 'gis',
		GOOGLE: 'google',
		GRAPH: 'graph',
		GRID: 'grid',
		GRID_CONFIGURATION: 'gridConfiguration',
		GROUP: 'group',
		GROUP_DESCRIPTIONS: 'groupDescriptions',
		GROUP_ID: 'groupId',
		GROUP_NAME: 'groupName',
		GROUPS: 'groups',
		HAS_POSITION: 'hasPosition',
		HEADERS: 'headers',
		HIDDEN: 'hidden',
		HIDE_SIDE_PANEL: 'hideSidePanel',
		HISTORY: 'history',
		HOST: 'host',
		HOUR: 'hour',
		ICON: 'icon',
		ID: 'id',
		ID_DOMAIN: 'idDomain',
		IDENTIFIER: 'identifier',
		IMAP_PORT: 'imapPort',
		IMAP_SERVER: 'imapServer',
		IMAP_SSL: 'imapSsl',
		IMAP_START_TLS: 'imapStartTls',
		IMPORT_CSV: 'importCsv',
		IMPORT_DISABLED: 'importDisabled',
		INCOMING_FOLDER: 'incomingFolder',
		INDEX: 'index',
		INHERITED: 'inherited',
		INITIAL_ZOOM_LEVEL: 'initialZoomLevel',
		INPUT: 'input',
		INSTANCE: 'instance',
		INSTANCE_ID: 'instanceId',
		INSTANCE_IDENTIFIER: 'instanceIdentifier',
		INSTANCE_NAME: 'instanceName',
		INSTRUCTIONS: 'instructions',
		INVERSE_DESCRIPTION: 'inverseDescription',
		IP_TYPE: 'ipType',
		IS_ACTIVE: 'isActive',
		IS_ADMINISTRATOR: 'isAdministrator',
		IS_CARD: 'isCard',
		IS_CLOUD_ADMINISTRATOR: 'isCloudAdministrator',
		IS_DEFAULT: 'isDefault',
		IS_ID_TEMPORARY: 'isIdTemporary',
		IS_KEY: 'isKey',
		IS_MASTER_DETAIL: 'isMasterDetail',
		IS_RELATION: 'isRelation',
		IS_STARTABLE: 'isStartable',
		IS_SUPER_CLASS: 'isSuperClass',
		IS_VISIBLE: 'isVisible',
		ITEM: 'item',
		JDBC_DRIVER_VERSION: 'jdbcDriverVersion',
		JRXML: 'jrxml',
		KEEP_SYNCHRONIZATION: 'keepSynchronization',
		KEY: 'key',
		KEY_ATTRIBUTES: 'keyAttributes',
		KEY_VALUE_SEPARATOR: 'keyValueSeparator',
		LABEL: 'label',
		LANGUAGE: 'language',
		LANGUAGE_PROMPT: 'languagePrompt',
		LANGUAGES: 'languages',
		LANGUAGES_TAGS: 'languagesTags',
		LANGUAGES_WITH_LOCALIZATIONS: 'languagesWithLocalizations',
		LANGUAGES_WITH_LOCALIZATIONS_TAGS: 'languagesWithLocalizationsTags',
		LAYER_FULL_NAME: 'layerFullName',
		LAYERS: 'layers',
		LAYOUT: 'layout',
		LDAP: 'ldap',
		LEAF: 'leaf',
		LENGTH: 'length',
		LIMIT: 'limit',
		LOCAL: 'local',
		LOCALIZATION: 'localization',
		LOCALIZED_HEADER_KEY: 'CMDBuild-Localized',
		LOGOUT_REDIRECT: 'logoutRedirect',
		LOOKUP: 'lookup',
		LOOKUP_TYPE: 'lookupType',
		LOOKUP_VALUE: 'lookupValue',
		MAJOR: 'major',
		MANDATORY: 'mandatory',
		MAP: 'map',
		MAP_LATITATUDE: 'mapLatitude',
		MAP_LONGITUDE: 'mapLongitude',
		MAP_ZOOM: 'mapZoom',
		MASTER_DETAIL: 'masterDetail',
		MASTER_DETAIL_LABEL: 'masterDetailLabel',
		MASTER_TABLE_NAME: 'masterTableName',
		MAX_ZOOM: 'maxZoom',
		MENU: 'menu',
		MENU_ITEM: 'menuItem',
		MESSAGE: 'message',
		META: 'meta',
		METADATA: 'metadata',
		METADATA_GROUP_NAME: 'metadataGroupName',
		METADATA_GROUPS: 'metadataGroups',
		METADATA_OUTPUT: 'metadataOutput',
		MIN_ZOOM: 'minZoom',
		MINUTE: 'minute',
		MODE: 'mode',
		MODEL: 'model',
		MODEL_FILE_NAME: 'modelFileName',
		MODEL_NAME: 'modelName',
		MODIFICATION: 'modification',
		MODIFY: 'modify',
		MODIFY_DISABLED: 'modifyDisabled',
		MODULE_ID: 'moduleId',
		MONTH: 'month',
		MYSQL: 'mysql',
		NAME: 'name',
		NAME_CLASS_1: 'nameClass1',
		NAME_CLASS_2: 'nameClass2',
		NAVIGATION_TREE: 'navigationTree',
		NAVIGATION_TREE_NODE_ID: 'navigationTreeNodeId',
		NEW: 'new',
		NEW_PASSWORD: 'newPassword',
		NO_SUBJECT_PREFIX: 'noSubjectPrefix',
		NONE: 'none',
		NORMAL: 'normal',
		NOT_POSITIVES: 'notPositives',
		NOTES: 'notes',
		NOTIFICATION_ACTIVE: 'notificationActive',
		NOTIFICATION_EMAIL_ACCOUNT: 'notificationEmailAccount',
		NOTIFICATION_EMAIL_TEMPLATE: 'notificationEmailTemplate',
		NOTIFICATION_EMAIL_TEMPLATE_ERROR: 'notificationEmailTemplateError',
		NOTIFY_WITH: 'notifyWith',
		NUMBER: 'number',
		OBJECT: 'object',
		ODT: 'odt',
		OLD_PASSWORD: 'oldPassword',
		OPERATIONS: 'operations',
		ORACLE: 'oracle',
		ORIENTED_DESCRIPTION: 'orientedDescription',
		ORIGIN: 'origin',
		ORIGIN_CLASS_ID: 'originClassId',
		ORIGIN_CLASS_NAME: 'originClassName',
		ORIGIN_DISABLED_CLASSES: 'originDisabledClasses',
		OSM: 'osm',
		OUTGOING: 'outgoing',
		OUTPUT: 'output',
		OUTPUT_FOLDER: 'outputFolder',
		OWNER: 'owner',
		PAGE: 'page',
		PARAMETERS: 'parameters',
		PARAMS: 'params',
		PARENT: 'parent',
		PARENT_DESCRIPTION: 'parentDescription',
		PARENT_ID: 'parentId',
		PARSING_ACTIVE: 'parsingActive',
		PARSING_KEY_END: 'parsingKeyEnd',
		PARSING_KEY_INIT: 'parsingKeyInit',
		PARSING_VALUE_END: 'parsingValueEnd',
		PARSING_VALUE_INIT: 'parsingValueInit',
		PASSWORD: 'password',
		PATCH: 'patch',
		PATCHES: 'patches',
		PATH: 'path',
		PDF: 'pdf',
		PERFORMER_NAME: 'performerName',
		PERFORMERS: 'performers',
		PERMISSIONS: 'permissions',
		PHASE: 'phase',
		PHASE_AFTER_CREATE: 'afterCreate',
		PHASE_AFTER_UPDATE: 'afterUpdate',
		PHASE_BEFORE_DELETE: 'beforeDelete',
		PHASE_BEFORE_UPDATE: 'beforeUpdate',
		POINT_RADIUS: 'pointRadius',
		POLLING_FREQUENCY: 'pollingFrequency',
		POPUP_HEIGHT_PERCENTAGE: 'popupHeightPercentage',
		POPUP_WIDTH_PERCENTAGE: 'popupWidthPercentage',
		PORT: 'port',
		POSITION: 'position',
		PRECISION: 'precision',
		PREFIX: 'prefix',
		PRESELECT_IF_UNIQUE: 'preselectIfUnique',
		PRESET: 'preset',
		PRESETS: 'presets',
		PRESETS_TYPE: 'presetsType',
		PRIVILEGED: 'privileged',
		PRIVILEGES: 'privileges',
		PROCESS: 'process',
		PROCESS_ATTACHMENT_TAB: 'processAttachmentTab',
		PROCESS_EMAIL_TAB: 'processEmailTab',
		PROCESS_HISTORY_TAB: 'processHistoryTab',
		PROCESS_IDENTIFIER: 'processIdentifier',
		PROCESS_INSTANCE_ID: 'processInstanceId',
		PROCESS_NOTE_TAB: 'processNoteTab',
		PROCESS_RELATION_TAB: 'processRelationTab',
		PROCESS_WIDGET_ALWAYS_ENABLED: 'processWidgetAlwaysEnabled',
		PROCESSED_FOLDER: 'processedFolder',
		PROMPT_SYNCHRONIZATION: 'promptSynchronization',
		PROPERTY: 'property',
		PROPERTY_IDENTIFIER: 'propertyIdentifier',
		PROPERTY_NAME: 'propertyName',
		QUERY: 'query',
		QUICK_SEARCH: 'quickSearch',
		READ: 'read',
		READ_ONLY: 'readOnly',
		READ_ONLY_ATTRIBUTES: 'readOnlyAttributes',
		READ_ONLY_SEARCH_WINDOW: 'readOnlySearchWindow',
		REASON: 'reason',
		RECEIVED: 'received',
		RECIPIENT_ADDRESS: 'recipientAddress',
		RECORD: 'record',
		REFERENCE: 'reference',
		REFERENCE_COMBO_STORE_LIMIT: 'referenceComboStoreLimit',
		REFERENCED_CLASS_NAME: 'referencedClassName',
		REFERENCED_ELEMENT_ID: 'referencedElementId',
		REFRESH_BEHAVIOUR: 'refreshBehaviour',
		REGEX: 'regex',
		REJECT_NOT_MATCHING: 'rejectNotMatching',
		REJECTED_FOLDER: 'rejectedFolder',
		RELATION: 'relation',
		RELATION_ID: 'relationId',
		RELATION_LIMIT: 'relationLimit',
		RELATIONS: 'relations',
		RELATIONS_SIZE: 'relations_size',
		REMOVE: 'remove',
		REPORT: 'report',
		REPORT_ACTIVE: 'reportActive',
		REPORT_CODE: 'reportCode',
		REPORT_EXTENSION: 'reportExtension',
		REPORT_ID: 'reportId',
		REPORT_NAME: 'reportName',
		REPORT_PARAMETERS: 'reportParameters',
		REQUIRED: 'required',
		RESPONSE: 'response',
		RESTRICTED_ADMIN: 'restrictedAdmin',
		RESULT: 'result',
		RESULTS: 'results',
		ROLE: 'role',
		ROOT: 'root',
		ROOT_CLASS: 'rootClass',
		ROW_LIMIT: 'rowLimit',
		ROWS: 'rows',
		RTF: 'rtf',
		RUNTIME: 'runtime',
		SCALE: 'scale',
		SCOPE: 'scope',
		SECTION: 'section',
		SECTION_HIERARCHY: 'sectionHierarchy',
		SECTION_ID: 'sectionId',
		SELECTABLE: 'selectable',
		SELECTED: 'selected',
		SENDER_ACCOUNT: 'senderAccount',
		SENT: 'sent',
		SEPARATOR: 'separator',
		SERVER_URL: 'serverUrl',
		SERVICE: 'service',
		SERVICE_ENDPOINT: 'serviceEndpoint',
		SESSION: 'session',
		SESSION_ID: 'sessionId',
		SESSION_TIMEOUT: 'sessionTimeout',
		SHORT: 'short',
		SHOW_COLUMN: 'showColumn',
		SIMPLE: 'simple',
		SIMPLE_FILTER: 'simpleFilter',
		SIMPLE_HISTORY_MODE_FOR_CARD: 'simpleHistoryModeForCard',
		SIMPLE_HISTORY_MODE_FOR_PROCESS: 'simpleHistoryModeForProcess',
		SINGLE_SELECT: 'singleSelect',
		SKIP_DISABLED_CLASSES: 'skipDisabledClasses',
		SMTP_PORT: 'smtpPort',
		SMTP_SERVER: 'smtpServer',
		SMTP_SSL: 'smtpSsl',
		SMTP_START_TLS: 'smtpStartTls',
		SORT: 'sort',
		SORT_DIRECTION: 'sortDirection',
		SORT_INDEX: 'sortIndex',
		SOURCE: 'source',
		SOURCE_ATTRIBUTE: 'sourceAttribute',
		SOURCE_CLASS_NAME: 'sourceClassName',
		SOURCE_FUNCTION: 'sourceFunction',
		SOURCE_NAME: 'sourceName',
		SOURCE_OBJECT: 'sourceObject',
		SPECIFIC_TYPE_VALUES: 'specificTypeValues',
		SPRITE_DIMENSION: 'spriteDimension',
		SQL: 'sql',
		SQLSERVER: 'sqlserver',
		SRC: 'src',
		STANDARD: 'standard',
		START: 'start',
		START_DATE: 'startDate',
		STARTING_CLASS: 'startingClass',
		STARTING_CLASS_ID: 'startingClassId',
		STATE: 'state',
		STATUS: 'status',
		STEP_RADIUS: 'stepRadius',
		STROKE_COLOR: 'strokeColor',
		STROKE_DASHSTYLE: 'strokeDashstyle',
		STROKE_OPACITY: 'strokeOpacity',
		STROKE_WIDTH: 'strokeWidth',
		STRUCTURE: 'structure',
		STYLE: 'style',
		SUB_SECTION: 'subSection',
		SUBJECT: 'subject',
		SYSTEM: 'system',
		TABLE: 'table',
		TABLE_NAME: 'tableName',
		TABLE_TYPE: 'tableType',
		TABS: 'tabs',
		TAG: 'tag',
		TARGET_CLASS: 'targetClass',
		TARGET_CLASS_DESCRIPTION: 'targetClassDescription',
		TARGET_CLASS_FIELD: 'targetClassField',
		TARGET_CLASS_NAME: 'targetClassName',
		TARGET_VARIABLE_NAME: 'targetVariableName',
		TASK: 'task',
		TASK_MANAGER: 'taskManager',
		TEMPLATE: 'template',
		TEMPLATE_ID: 'templateId',
		TEMPLATE_NAME: 'templateName',
		TEMPLATES: 'templates',
		TEMPORARY: 'temporary',
		TEMPORARY_ID: 'temporaryId',
		TEXT: 'text',
		TIME: 'time',
		TIME_INTERVAL: 'timeInterval',
		TITLE: 'title',
		TO: 'to',
		TO_ADDRESSES: 'toAddresses',
		TOKEN: 'token',
		TOOLBAR_BOTTOM: 'toolbarBottom',
		TOOLBAR_TOP: 'toolbarTop',
		TOTAL: 'total',
		TRANSLATION_UUID: 'translationUuid',
		TRANSLATIONS: 'translations',
		TREE_NAME: 'treeName',
		TYPE: 'type',
		TYPES: 'types',
		UI_CONFIGURATION: 'uiConfiguration',
		UNCACHED: 'unchached',
		UNIQUE: 'unique',
		UPDATE: 'update',
		URL: 'url',
		USER: 'user',
		USER_ID: 'userId',
		USER_INTERFACE: 'userInterface',
		USER_STOPPABLE: 'userStoppable',
		USERNAME: 'username',
		USERS: 'users',
		UTILITY: 'utility',
		VALUE: 'value',
		VALUES: 'values',
		VARIABLES: 'variables',
		VERSION: 'version',
		VERSIONABLE: 'versionable',
		VIEW: 'view',
		VIEW_POINT_DISTANCE: 'viewPointDistance',
		VIEW_POINT_HEIGHT: 'viewPointHeight',
		VIEW_TYPE: 'viewType',
		VIEWS: 'views',
		VISIBILITY: 'visibility',
		VISIBLE: 'visible',
		WARNINGS: 'warnings',
		WIDGET: 'widget',
		WIDGET_ID: 'widgetId',
		WIDGETS: 'widgets',
		WORKFLOW: 'workflow',
		WORKFLOW_ACTIVE: 'workflowActive',
		WORKFLOW_ACTIVITY: 'workflowActivity',
		WORKFLOW_ATTRIBUTES: 'workflowAttributes',
		WORKFLOW_CLASS_NAME: 'workflowClassName',
		WORKFLOW_ID: 'workflowId',
		WORKFLOW_INSTANCE: 'workflowInstance',
		WORKFLOW_NAME: 'workflowName',
		WORKSPACE: 'workspace',
		WRITABLE: 'writable',
		WRITE: 'write',
		XPDL: 'xpdl',
		YAHOO: 'yahoo',
		ZIP: 'zip',
		ZOOM_INITIAL_LEVEL: 'zoomInitialLevel',
		ZOOM_MAX: 'zoomMax',
		ZOOM_MIN: 'zoomMin'
	});

})();
