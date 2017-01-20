(function () {

	Ext.define('CMDBuild.controller.management.widget.OpenNote', {
		extend: 'CMDBuild.controller.common.abstract.Widget',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.common.CMWidgetManagerController}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.model.CMActivityInstance}
		 */
		card: undefined,

		/**
		 * @property {Ext.form.Basic}
		 */
		clientForm: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'beforeHideView',
			'getData',
			'isValid',
			'onBeforeSave',
			'onEditMode',
			'widgetOpenNoteBeforeActiveView = beforeActiveView'
		],

		/**
		 * Disable delegate apply to avoid to set this class as view's delegate
		 *
		 * @cfg {Boolean}
		 *
		 * @override
		 */
		enableDelegateApply: false,

		/**
		 * @property {CMDBuild.controller.management.workflow.panel.form.tabs.Note}
		 */
		tabDelegate: undefined,

		/**
		 * @property {CMDBuild.view.management.workflow.panel.form.tabs.note.NoteView}
		 */
		view: undefined,

		/**
		 * @cfg {String}
		 */
		widgetConfigurationModelClassName: 'CMDBuild.model.management.widget.openNote.Configuration',

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		widgetOpenNoteBeforeActiveView: function () {
			this.view.enable();

			this.view.delegate.cmfg('panelGridAndFormPanelFormTabActiveSet', 'formTabNote');

			this.beforeActiveView(); // Custom callParent
		}
	});

})();
