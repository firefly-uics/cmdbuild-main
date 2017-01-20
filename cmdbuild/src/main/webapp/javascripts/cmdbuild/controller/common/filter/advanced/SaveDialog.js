(function () {

	/**
	 * @deprecated CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.SaveDialog
	 */
	Ext.define('CMDBuild.controller.common.filter.advanced.SaveDialog', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.common.filter.advanced.Manager}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'panelGridAndFormCommonFilterAdvancedSaveDialogConfigureAndShow',
			'onPanelGridAndFormCommonFilterAdvancedSaveDialogAbortButtonClick',
			'onPanelGridAndFormCommonFilterAdvancedSaveDialogSaveButtonClick'
		],

		/**
		 * Parameter to forward to next save call
		 *
		 * @property {Boolean}
		 */
		enableApply: false,

		/**
		 * @property {CMDBuild.view.common.filter.advanced.saveDialog.FormPanel}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.common.filter.advanced.saveDialog.SaveDialogWindow}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.common.filter.advanced.Manager} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.common.filter.advanced.saveDialog.SaveDialogWindow', { delegate: this });

			// Shorthands
			this.form = this.view.form;
		},

		/**
		 * @param {Boolean} enableApply
		 *
		 * @returns {Void}
		 */
		panelGridAndFormCommonFilterAdvancedSaveDialogConfigureAndShow: function (enableApply) {
			if (!this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterIsEmpty')) {
				this.enableApply = Ext.isBoolean(enableApply) ? enableApply : false;

				this.form.loadRecord(this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterGet'));

				this.view.show();
			} else {
				_error('panelGridAndFormCommonFilterAdvancedSaveDialogConfigureAndShow(): cannot manage empty filter', this, this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterGet'));
			}
		},

		/**
		 * @returns {Void}
		 */
		onPanelGridAndFormCommonFilterAdvancedSaveDialogAbortButtonClick: function () {
			this.view.close();
		},

		/**
		 * @returns {Void}
		 */
		onPanelGridAndFormCommonFilterAdvancedSaveDialogSaveButtonClick: function () {
			if (this.validate(this.form)) {
				var formData = this.form.getData();

				this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterSet', {
					propertyName: CMDBuild.core.constants.Proxy.DESCRIPTION,
					value: formData[CMDBuild.core.constants.Proxy.DESCRIPTION]
				});
				this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterSet', {
					propertyName: CMDBuild.core.constants.Proxy.NAME,
					value: formData[CMDBuild.core.constants.Proxy.NAME]
				});

				this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSave', {
					enableApply: this.enableApply,
					enableSaveDialog: false
				});

				this.cmfg('onPanelGridAndFormCommonFilterAdvancedSaveDialogAbortButtonClick');
			}
		}
	});

})();
