(function () {

	Ext.define('CMDBuild.controller.management.classes.panel.form.tabs.attachments.window.Add', {
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
			'classesFormTabAttachmentsWindowAddConfigureAndShow',
			'onClassesFormTabAttachmentsWindowAddAbortButtonClick',
			'onClassesFormTabAttachmentsWindowAddCategoryChange',
			'onClassesFormTabAttachmentsWindowAddConfirmButtonClick'
		],

		/**
		 * @property {CMDBuild.view.management.classes.panel.form.tabs.attachments.window.add.ContainerFieldsCommon}
		 */
		containerFieldsCommon: undefined,

		/**
		 * @property {CMDBuild.view.management.classes.panel.form.tabs.attachments.window.add.ContainerFieldsMetadata}
		 */
		containerFieldsMetadata: undefined,

		/**
		 * @property {CMDBuild.view.management.classes.panel.form.tabs.attachments.window.add.FormPanel}
		 */
		form: undefined,

		/**
		 * @cfg {Object}
		 */
		metadata: {},

		/**
		 * @property {CMDBuild.view.management.classes.panel.form.tabs.attachments.window.add.AddView}
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

			this.view = Ext.create('CMDBuild.view.management.classes.panel.form.tabs.attachments.window.add.AddView', { delegate: this });

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
		 * @param {Object} parameters.metadata
		 *
		 * @returns {Void}
		 */
		classesFormTabAttachmentsWindowAddConfigureAndShow: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.metadata = Ext.isObject(parameters.metadata) ? parameters.metadata : {};

			// Error handling
				if (this.cmfg('classesFormTabAttachmentsSelectedEntryTypeIsEmpty'))
					return _error('classesFormTabAttachmentsWindowAddConfigureAndShow(): unmanaged selectedEntryType property', this, this.cmfg('classesFormTabAttachmentsSelectedEntryTypeGet'));

				if (this.cmfg('classesFormTabAttachmentsSelectedCardIsEmpty'))
					return _error('classesFormTabAttachmentsWindowAddConfigureAndShow(): unmanaged selectedCard property', this, this.cmfg('classesFormTabAttachmentsSelectedCardGet'));
			// END: Error handling

			Ext.apply(this, { metadata: parameters.metadata }); // Apply configurations

			// Form setup
			this.form.reset();

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
		onClassesFormTabAttachmentsWindowAddAbortButtonClick: function () {
			this.view.close();
		},

		/**
		 * @param {String} category
		 *
		 * @returns {Void}
		 */
		onClassesFormTabAttachmentsWindowAddCategoryChange: function (category) {
			// Error handling
				if (!Ext.isString(category) || Ext.isEmpty(category))
					return _error('onClassesFormTabAttachmentsWindowAddCategoryChange(): unmanaged category parameter', this, category);
			// END: Error handling

			this.classesFormTabAttachmentsContainerFieldsMetadataReset();

			if (this.cmfg('classesFormTabAttachmentsCategoriesExists', category)) {
				var categoryModel = this.cmfg('classesFormTabAttachmentsCategoriesGet', { name: category });

				Ext.Array.forEach(categoryModel.get(CMDBuild.core.constants.Proxy.METADATA_GROUPS), function (metadataGroupModel, i, allMetadataGroupModels) {
					if (Ext.isObject(metadataGroupModel) && !Ext.Object.isEmpty(metadataGroupModel)) {
						var fields = getFieldsForMetadataGroup(metadataGroupModel, this.metadata);

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
		onClassesFormTabAttachmentsWindowAddConfirmButtonClick: function () {
			if (this.validate(this.form)) {
				var formData = this.form.getData(true);

				var params = {};
				params['Category'] = formData[CMDBuild.core.constants.Proxy.CATEGORY];
				params['Description'] = formData[CMDBuild.core.constants.Proxy.DESCRIPTION];
				params['Major'] = formData[CMDBuild.core.constants.Proxy.MAJOR];
				params['Metadata'] = Ext.encode(this.classesFormTabAttachmentsWindowMetadataValuesGet());
				params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('classesFormTabAttachmentsSelectedCardGet', CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('classesFormTabAttachmentsSelectedEntryTypeGet', CMDBuild.core.constants.Proxy.NAME);

				CMDBuild.proxy.management.classes.panel.form.tabs.attachments.Attachments.create({
					form: this.form.getForm(),
					params: params,
					loadMask: this.view,
					scope: this,
					success: function (form, action) {
						this.cmfg('classesFormTabAttachmentsStoreLoad');

						this.cmfg('onClassesFormTabAttachmentsWindowAddAbortButtonClick');
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
