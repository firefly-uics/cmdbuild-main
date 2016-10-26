(function () {

	/**
	 * Form for task configuration (wizard)
	 */
	Ext.define('CMDBuild.view.administration.taskManager.FormPanel', {
		extend: 'Ext.form.Panel',

		requires: ['CMDBuild.core.constants.Proxy'],

		mixins: ['CMDBuild.view.common.PanelFunctions2'],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.Form}
		 */
		delegate: undefined,

		/**
		 * @property {CMDBuild.core.buttons.iconized.modify.Modify}
		 */
		modifyButton: undefined,

		activeItem: 0,
		bodyCls: 'cmdb-gray-panel',
		border: false,
		cls: 'cmdb-border-top',
		frame: false,
		region: 'center',

		layout: {
			type: 'card',
			align: 'stretch'
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				dockedItems: [
					Ext.create('Ext.toolbar.Toolbar', {
						dock: 'top',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_TOP,

						items: [
							this.modifyButton = Ext.create('CMDBuild.core.buttons.iconized.modify.Modify', {
								text: CMDBuild.Translation.modifyTask,
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onTaskManagerFormModifyButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.iconized.Remove', {
								text: CMDBuild.Translation.removeTask,
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onTaskManagerFormRemoveButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.iconized.Clone', {
								text: CMDBuild.Translation.cloneTask,
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onTaskManagerFormCloneButtonClick');
								}
							})
						]
					}),
					Ext.create('Ext.toolbar.Toolbar', {
						dock: 'bottom',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_BOTTOM,
						ui: 'footer',

						layout: {
							type: 'hbox',
							align: 'middle',
							pack: 'center'
						},

						items: [
							this.previousButton = Ext.create('CMDBuild.core.buttons.text.Previous', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onTaskManagerFormNavigationButtonClick', 'previous');
								}
							}),
							Ext.create('CMDBuild.core.buttons.text.Save', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onTaskManagerFormSaveButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.text.Abort', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onTaskManagerFormAbortButtonClick');
								}
							}),
							this.nextButton = Ext.create('CMDBuild.core.buttons.text.Next', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onTaskManagerFormNavigationButtonClick', 'next');
								}
							})
						]
					})
				]
			});

			this.callParent(arguments);

			this.panelFunctionModifyStateSet({
				forceToolbarTopState: true,
				state: false
			});
		}
	});

})();
