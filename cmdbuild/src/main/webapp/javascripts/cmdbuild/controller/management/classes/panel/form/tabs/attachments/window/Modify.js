(function () {

	Ext.define('CMDBuild.controller.management.classes.panel.form.tabs.attachments.window.Modify', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.management.classes.panel.form.tabs.attachments.Attachments'
		],

		/**
		 * @cfg {CMDBuild.controller.management.classes.panel.form.tabs.attachments.Attachments}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'classesFormTabAttachmentsWindowModifyConfigureAndShow',
			'onClassesFormTabAttachmentsWindowModifyAbortButtonClick',
			'onClassesFormTabAttachmentsWindowModifyCategoryChange',
			'onClassesFormTabAttachmentsWindowModifyConfirmButtonClick'
		],

		/**
		 * @property {CMDBuild.view.management.classes.panel.form.tabs.attachments.window.modify.ContainerFieldsCommon}
		 */
		containerFieldsCommon: undefined,

		/**
		 * @property {CMDBuild.view.management.classes.panel.form.tabs.attachments.window.modify.ContainerFieldsMetadata}
		 */
		containerFieldsMetadata: undefined,

		/**
		 * @property {CMDBuild.view.management.classes.panel.form.tabs.attachments.window.modify.FormPanel}
		 */
		form: undefined,

		/**
		 * Witch has metadata and/or record properties
		 *
		 * @cfg {Object}
		 */
		presets: {},

		/**
		 * @property {CMDBuild.view.management.classes.panel.form.tabs.attachments.window.modify.ModifyView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.classes.panel.form.tabs.attachments.Attachments} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.classes.panel.form.tabs.attachments.window.modify.ModifyView', { delegate: this });

			// Shorthands
			this.containerFieldsCommon = this.view.form.containerFieldsCommon;
			this.containerFieldsMetadata = this.view.form.containerFieldsMetadata;
			this.form = this.view.form;
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		classesFormTabAttachmentsContainerFieldsMetadataReset: function () {
			this.containerFieldsMetadata.removeAll();
			this.containerFieldsMetadata.hide();
		},

		/**
		 * @param {Object} parameters
		 * @param {CMDBuild.model.management.classes.panel.form.tabs.attachments.Attachment} parameters.record
		 *
		 * @returns {Void}
		 */
		classesFormTabAttachmentsWindowModifyConfigureAndShow: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Error handling
				if (this.cmfg('classesFormTabAttachmentsSelectedEntryTypeIsEmpty'))
					return _error('classesFormTabAttachmentsWindowModifyConfigureAndShow(): unmanaged selectedEntryType property', this, this.cmfg('classesFormTabAttachmentsSelectedEntryTypeGet'));

				if (this.cmfg('classesFormTabAttachmentsSelectedCardIsEmpty'))
					return _error('classesFormTabAttachmentsWindowModifyConfigureAndShow(): unmanaged selectedCard property', this, this.cmfg('classesFormTabAttachmentsSelectedCardGet'));

				if (!Ext.isObject(parameters.record) || Ext.Object.isEmpty(parameters.record))
					return _error('classesFormTabAttachmentsWindowModifyConfigureAndShow(): unmanaged record parameter', this, parameters.record);
				// END: Error handling

			Ext.apply(this, { record: parameters.record }); // Apply configurations

			// Form setup
			this.form.reset();
			this.form.loadRecord(this.record);

			// Fields setup
			this.containerFieldsCommon.fieldFile.setDisabled(!this.record.get(CMDBuild.core.constants.Proxy.VERSIONABLE));
			this.containerFieldsCommon.fieldFile.setEmptyText('C:\\fakepath\\' + this.record.get(CMDBuild.core.constants.Proxy.FILE_NAME));

			this.containerFieldsCommon.fieldMajor.setDisabled(!this.record.get(CMDBuild.core.constants.Proxy.VERSIONABLE));

			this.view.show();
		},

		/**
		 * @returns {Object} out
		 *
		 * @private
		 * @legacy
		 *
		 * FIXME: refactor
		 */
		classesFormTabAttachmentsWindowMetadataValuesGet: function() {
			var fields = this.containerFieldsMetadata.items.getRange(),
				out = {};

			for (var i=0, f=null; i<fields.length; ++i) {
				f = fields[i];

				// Create the group if necessary
				if (Ext.isEmpty(out[f.cmMetadataGroupName]))
					out[f.cmMetadataGroupName] = {};

				// Add the value to the group
				out[f.cmMetadataGroupName][f.name] = f.getValue();
			}

			return out;
		},

		/**
		 * @returns {Void}
		 */
		onClassesFormTabAttachmentsWindowModifyAbortButtonClick: function () {
			this.view.close();
		},

		/**
		 * @param {String} category
		 *
		 * @returns {Void}
		 */
		onClassesFormTabAttachmentsWindowModifyCategoryChange: function (category) {
			// Error handling
				if (!Ext.isString(category) || Ext.isEmpty(category))
					return _error('onClassesFormTabAttachmentsWindowModifyCategoryChange(): unmanaged category parameter', this, category);
			// END: Error handling

			this.classesFormTabAttachmentsContainerFieldsMetadataReset();

			if (this.cmfg('classesFormTabAttachmentsCategoriesExists', category)) {
				var categoryModel = this.cmfg('classesFormTabAttachmentsCategoriesGet', { name: category });

				Ext.Array.forEach(categoryModel.get(CMDBuild.core.constants.Proxy.METADATA_GROUPS), function (metadataGroupModel, i, allMetadataGroupModels) {
					if (Ext.isObject(metadataGroupModel) && !Ext.Object.isEmpty(metadataGroupModel)) {
						var fields = getFieldsForMetadataGroup(metadataGroupModel, this.record.get(CMDBuild.core.constants.Proxy.METADATA));

						if (Ext.isArray(fields) && !Ext.isEmpty(fields)) {
							this.containerFieldsMetadata.add(fields);
							this.containerFieldsMetadata.show();
						}
					}
				}, this);
			}
		},

		/**
		 * @returns {Void}
		 *
		 * FIXME: waiting for refactor (rename)
		 */
		onClassesFormTabAttachmentsWindowModifyConfirmButtonClick: function () {
			if (this.validate(this.form)) {
				var formData = this.form.getData(true);

				this.containerFieldsCommon.fieldFile.submitValue = !Ext.isEmpty(formData['File']); // Avoid to submit empty file property

				var params = {};
				params['Category'] = formData[CMDBuild.core.constants.Proxy.CATEGORY];
				params['Description'] = formData[CMDBuild.core.constants.Proxy.DESCRIPTION];
				params['Filename'] = formData[CMDBuild.core.constants.Proxy.FILE_NAME];
				params['Major'] = formData[CMDBuild.core.constants.Proxy.MAJOR];
				params['Metadata'] = Ext.encode(this.classesFormTabAttachmentsWindowMetadataValuesGet());
				params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('classesFormTabAttachmentsSelectedCardGet', CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('classesFormTabAttachmentsSelectedEntryTypeGet', CMDBuild.core.constants.Proxy.NAME);

				CMDBuild.proxy.management.classes.panel.form.tabs.attachments.Attachments.update({
					form: this.form.getForm(),
					params: params,
					loadMask: this.view,
					scope: this,
					success: function (form, action) {
						this.cmfg('classesFormTabAttachmentsStoreLoad');

						this.cmfg('onClassesFormTabAttachmentsWindowModifyAbortButtonClick');
					}
				});
			}
		}
	});

	/**
	 * Take a CMDBuild.model.CMMetadataGroup as input and return an array of Ext.form.field derived from the metadataDefinitions in the input
	 *
	 * @legacy
	 *
	 * FIXME: refactor
	 */
	function getFieldsForMetadataGroup(metadataGroup, presets) {
		if (!metadataGroup) {
			return null;
		}

		var definitions = metadataGroup.get(CMDBuild.core.constants.Proxy.METADATA),
			fields = [],
			groupName = metadataGroup.get(CMDBuild.core.constants.Proxy.NAME);

		for (var i=0, definition=null; i<definitions.length; ++i) {
			definition = definitions[i];

			var field = CMDBuild.Management.FieldManager.getFieldForAttr(adaptMetadataDefinitionForFieldManager(definition));

			if (field) {
				field.cmMetadataGroupName = groupName;
				field.submitValue = false;

				// If present some values for the metadata set it this could happen if there are autocompletion rules or if we are editing an existing attachment
				if (presets && presets[groupName]) {
					var value = presets[groupName][field.name];

					if (value)
						field.setValue(value);
				}

				fields.push(field);
			}
		}

		return fields;
	}

	/**
	 * Take the serialization of a metadataDefinition as the server returns it, and adapt it to be used by the fieldManager
	 *
	 * @legacy
	 *
	 * FIXME: refactor
	 */
	function adaptMetadataDefinitionForFieldManager(definition) {
		var adapted = {
			name: definition.name,
			description: definition.description,
			isnotnull: definition.mandatory,
			type: definition.type
		};

		if (definition.type == 'DECIMAL') {
			// Unbound the decimal digits
			adapted.scale = undefined;
			adapted.precision = undefined;
		}

		if (definition.type == 'LIST') {
			adapted.values = definition.values;
		}

		return adapted;
	}

})();
