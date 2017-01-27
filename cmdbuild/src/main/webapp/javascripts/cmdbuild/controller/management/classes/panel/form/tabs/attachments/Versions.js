(function () {

	Ext.define('CMDBuild.controller.management.classes.panel.form.tabs.attachments.Versions', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
//			'CMDBuild.proxy.management.classes.panel.form.tabs.attachments.Attachments'
		],

		/**
		 * @cfg {CMDBuild.controller.management.classes.panel.form.tabs.attachments.Attachments}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'classesFormTabAttachmentsVersionsConfigureAndShow',
			'onClassesFormTabAttachmentsVersionsDownloadButtonClick'
		],

		/**
		 * @property {CMDBuild.view.management.classes.panel.form.tabs.attachments.versions.GridPanel}
		 */
		grid: undefined,

		/**
		 * @property {CMDBuild.view.management.classes.panel.form.tabs.attachments.versions.VersionsView}
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

			this.view = Ext.create('CMDBuild.view.management.classes.panel.form.tabs.attachments.versions.VersionsView', { delegate: this });

			// Shorthands
			this.grid = this.view.grid;
		},

		/**
		 * @param {Object} parameters
		 * @param {CMDBuild.model.management.classes.panel.form.tabs.attachments.Attachment} parameters.record
		 *
		 * @returns {Void}
		 */
		classesFormTabAttachmentsVersionsConfigureAndShow: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Error handling
				if (this.cmfg('classesFormTabAttachmentsSelectedEntryTypeIsEmpty'))
					return _error('classesFormTabAttachmentsVersionsConfigureAndShow(): unmanaged selectedEntryType property', this, this.cmfg('classesFormTabAttachmentsSelectedEntryTypeGet'));

				if (this.cmfg('classesFormTabAttachmentsSelectedCardIsEmpty'))
					return _error('classesFormTabAttachmentsVersionsConfigureAndShow(): unmanaged selectedCard property', this, this.cmfg('classesFormTabAttachmentsSelectedCardGet'));

				if (!Ext.isObject(parameters.record) || Ext.Object.isEmpty(parameters.record))
					return _error('classesFormTabAttachmentsVersionsConfigureAndShow(): unmanaged record parameter', this, parameters.record);
			// END: Error handling

			var params = {};
			params['Filename'] = parameters.record.get(CMDBuild.core.constants.Proxy.FILE_NAME);
			params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('classesFormTabAttachmentsSelectedCardGet', CMDBuild.core.constants.Proxy.ID);
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('classesFormTabAttachmentsSelectedEntryTypeGet', CMDBuild.core.constants.Proxy.NAME);

			this.grid.getStore().load({ params: params });

			this.view.show();
		},

		/**
		 * @param {CMDBuild.model.management.classes.panel.form.tabs.attachments.Attachment} record
		 *
		 * @returns {Void}
		 *
		 * FIXME: waiting for refactor (rename)
		 */
		onClassesFormTabAttachmentsVersionsDownloadButtonClick: function (record) {
			// Error handling
				if (!Ext.isObject(record) || Ext.Object.isEmpty(record))
					return _error('onClassesFormTabAttachmentsVersionsDownloadButtonClick(): unmanaged record parameter', this, record);
			// END: Error handling

			var params = {};
			params['Filename'] = record.get(CMDBuild.core.constants.Proxy.FILE_NAME);
			params['Version'] = record.get(CMDBuild.core.constants.Proxy.VERSION);
			params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('classesFormTabAttachmentsSelectedCardGet', CMDBuild.core.constants.Proxy.ID);
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('classesFormTabAttachmentsSelectedEntryTypeGet', CMDBuild.core.constants.Proxy.NAME);

			CMDBuild.proxy.management.classes.panel.form.tabs.attachments.Attachments.download({ params: params });
		}
	});

})();
