(function () {

	/**
	 * Required managed functions from upper structure:
	 * 	- panelGridAndFormSelectedEntityGet
	 * 	- panelGridAndFormSelectedEntityIsEmpty
	 * 	- panelGridAndFormSelectedItemGet
	 * 	- panelGridAndFormSelectedItemIsEmpty
	 */
	Ext.define('CMDBuild.controller.common.panel.module.attachment.window.Modify', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.common.panel.module.attachment.Modify'
		],

		/**
		 * @cfg {CMDBuild.controller.common.panel.module.attachment.Grid}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onPanelModuleAttachmentWindowModifyAbortButtonClick',
			'onPanelModuleAttachmentWindowModifyCategoryChange',
			'onPanelModuleAttachmentWindowModifyConfirmButtonClick',
			'panelModuleAttachmentWindowModifyConfigureAndShow'
		],

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.window.modify.ContainerFieldsCommon}
		 */
		containerFieldsCommon: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.window.modify.ContainerFieldsMetadata}
		 */
		containerFieldsMetadata: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.window.modify.FormPanel}
		 */
		form: undefined,

		/**
		 * Witch has metadata and/or record properties
		 *
		 * @cfg {Object}
		 */
		presets: {},

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.window.modify.ModifyView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.common.panel.module.attachment.Grid} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.common.panel.module.attachment.window.modify.ModifyView', { delegate: this });

			// Shorthands
			this.containerFieldsCommon = this.view.form.containerFieldsCommon;
			this.containerFieldsMetadata = this.view.form.containerFieldsMetadata;
			this.form = this.view.form;
		},

		/**
		 * @returns {Void}
		 */
		onPanelModuleAttachmentWindowModifyAbortButtonClick: function () {
			this.view.close();
		},

		/**
		 * @param {String} category
		 *
		 * @returns {Void}
		 */
		onPanelModuleAttachmentWindowModifyCategoryChange: function (category) {
			// Error handling
				if (!Ext.isString(category) || Ext.isEmpty(category))
					return _error('onPanelModuleAttachmentWindowModifyCategoryChange(): unmanaged category parameter', this, category);
			// END: Error handling

			this.panelModuleAttachmentContainerFieldsMetadataReset();

			if (this.cmfg('panelModuleAttachmentGridCategoriesExists', category)) {
				var categoryModel = this.cmfg('panelModuleAttachmentGridCategoriesGet', { name: category });

				Ext.Array.forEach(categoryModel.get(CMDBuild.core.constants.Proxy.METADATA_GROUPS), function (metadataGroupModel, i, allMetadataGroupModels) {
					if (Ext.isObject(metadataGroupModel) && !Ext.Object.isEmpty(metadataGroupModel)) {
						var fields = getFieldsForMetadataGroup(metadataGroupModel, this.record.get(CMDBuild.core.constants.Proxy.META));

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
		 */
		onPanelModuleAttachmentWindowModifyConfirmButtonClick: function () {
			if (this.validate(this.form)) {
				var formData = this.form.getData(true);

				this.containerFieldsCommon.fieldFile.submitValue = !Ext.isEmpty(formData[CMDBuild.core.constants.Proxy.FILE]); // Avoid to submit empty file property

				var params = {};
				params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('panelGridAndFormSelectedItemGet', CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.CATEGORY] = formData[CMDBuild.core.constants.Proxy.CATEGORY];
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('panelGridAndFormSelectedEntityGet', CMDBuild.core.constants.Proxy.NAME);
				params[CMDBuild.core.constants.Proxy.DESCRIPTION] = formData[CMDBuild.core.constants.Proxy.DESCRIPTION];
				params[CMDBuild.core.constants.Proxy.FILE_NAME] = formData[CMDBuild.core.constants.Proxy.FILE_NAME];
				params[CMDBuild.core.constants.Proxy.MAJOR] = formData[CMDBuild.core.constants.Proxy.MAJOR];
				params[CMDBuild.core.constants.Proxy.META] = Ext.encode(this.panelModuleAttachmentWindowMetadataValuesGet());

				CMDBuild.proxy.common.panel.module.attachment.Modify.update({
					form: this.form.getForm(),
					params: params,
					loadMask: this.view,
					scope: this,
					success: function (form, action) {
						this.cmfg('panelModuleAttachmentGridStoreLoad');

						this.cmfg('onPanelModuleAttachmentWindowModifyAbortButtonClick');
					}
				});
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		panelModuleAttachmentContainerFieldsMetadataReset: function () {
			this.containerFieldsMetadata.removeAll();
			this.containerFieldsMetadata.hide();
		},

		/**
		 * @param {Object} parameters
		 * @param {CMDBuild.model.common.panel.module.attachment.Attachment} parameters.record
		 *
		 * @returns {Void}
		 */
		panelModuleAttachmentWindowModifyConfigureAndShow: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Error handling
				if (this.cmfg('panelGridAndFormSelectedEntityIsEmpty'))
					return _error('panelModuleAttachmentWindowModifyConfigureAndShow(): unmanaged selectedEntity property', this, this.cmfg('panelGridAndFormSelectedEntityGet'));

				if (this.cmfg('panelGridAndFormSelectedItemIsEmpty'))
					return _error('panelModuleAttachmentWindowModifyConfigureAndShow(): unmanaged selectedItem property', this, this.cmfg('panelGridAndFormSelectedItemGet'));

				if (!Ext.isObject(parameters.record) || Ext.Object.isEmpty(parameters.record))
					return _error('panelModuleAttachmentWindowModifyConfigureAndShow(): unmanaged record parameter', this, parameters.record);
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
		panelModuleAttachmentWindowMetadataValuesGet: function() {
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
		}
	});

	/**
	 * Take a MetadataGroup model as input and return an array of Ext.form.field derived from the metadataDefinitions in the input
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
