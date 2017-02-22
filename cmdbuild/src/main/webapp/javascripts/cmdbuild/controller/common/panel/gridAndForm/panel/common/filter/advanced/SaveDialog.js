(function () {

	Ext.define('CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.SaveDialog', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Manager}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onPanelGridAndFormCommonFilterAdvancedSaveDialogAbortButtonClick',
			'onPanelGridAndFormCommonFilterAdvancedSaveDialogSaveButtonClick',
			'panelGridAndFormCommonFilterAdvancedSaveDialogConfigureAndShow'
		],

		/**
		 * Parameter to forward to next save call
		 *
		 * @property {Boolean}
		 */
		enableApply: false,

		/**
		 * @property {CMDBuild.view.common.panel.gridAndForm.panel.common.filter.advanced.saveDialog.FormPanel}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.gridAndForm.panel.common.filter.advanced.saveDialog.SaveDialogWindow}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Manager} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.common.panel.gridAndForm.panel.common.filter.advanced.saveDialog.SaveDialogWindow', { delegate: this });

			// Shorthands
			this.form = this.view.form;
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
				var formData = this.form.panelFunctionDataGet();

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
		},

		/**
		 * @param {Object} parameters
		 * @param {Boolean} parameters.enableApply
		 *
		 * @returns {Void}
		 */
		panelGridAndFormCommonFilterAdvancedSaveDialogConfigureAndShow: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.enableApply = Ext.isBoolean(parameters.enableApply) ? parameters.enableApply : false;

			// Error handling
				if (this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterIsEmpty'))
					return _error(
						'panelGridAndFormCommonFilterAdvancedSaveDialogConfigureAndShow(): unmanaged filter property',
						this,
						this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterGet')
					);
			// END: Error handling

			Ext.apply(this, parameters);

			this.form.loadRecord(this.cmfg('panelGridAndFormCommonFilterAdvancedManagerSelectedFilterGet'));

			this.view.show();
		}
	});

})();
