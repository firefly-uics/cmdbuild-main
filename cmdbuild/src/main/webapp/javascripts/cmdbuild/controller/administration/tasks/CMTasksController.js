(function() {

	Ext.define('CMDBuild.controller.administration.tasks.CMTasksController', {
		extend: 'CMDBuild.controller.CMBasePanelController',

		parentDelegate: undefined,
		tasksDatas: ['all', 'email', 'event', 'workflow'], // Used to check task existence
		taskType: undefined,
		selectionModel: undefined,

		// Overwrite
		constructor: function(view) {

			// Handlers exchange and controller setup
			this.view = view;
			this.grid = view.grid;
			this.form = view.form;
			this.view.delegate = this;
			this.grid.delegate = this;

			this.selectionModel = this.grid.getSelectionModel();

			this.callParent(arguments);
		},

		onViewOnFront: function(parameters) {
			if (typeof parameters !== 'undefined') {
				var me = this;

				this.taskType = (this.correctTaskTypeCheck(parameters.internalId)) ? parameters.internalId : this.tasksDatas[0];

				this.grid.reconfigure(CMDBuild.core.proxy.CMProxyTasks.getStore(this.taskType));
				this.grid.store.load({
					callback: function() {
						if (!me.selectionModel.hasSelection())
							me.selectionModel.select(0, true);
					}
				});
			}
		},

		/**
		 * Gatherer function to catch events
		 *
		 * @param (String) name
		 * @param (Object) param
		 * @param (Function) callback
		 */
		cmOn: function(name, param, callBack) {
			switch (name) {
				case 'onAddButtonClick':
					return this.onAddButtonClick(name, param, callBack);

				case 'onItemDoubleClick':
					return this.onItemDoubleClick();

				case 'onRowSelected':
					return this.onRowSelected(name, param, callBack);

				case 'onStartButtonClick':
					return this.onStartButtonClick(param);

				case 'onStopButtonClick':
					return this.onStopButtonClick(param);

				default: {
					if (this.parentDelegate)
						return this.parentDelegate.cmOn(name, param, callBack);
				}
			}
		},

		/**
		 * Automated form controller constructor
		 *
		 * @param (String) type
		 */
		buildFormController: function(type) {
			if (this.correctTaskTypeCheck(type)) {
				this.form.delegate = Ext.create('CMDBuild.controller.administration.tasks.CMTasksForm' + this.capitaliseFirstLetter(type) + 'Controller', this.form);
				this.form.delegate.parentDelegate = this;
				this.form.delegate.selectionModel = this.selectionModel;
			}
		},

		capitaliseFirstLetter: function(string) {
			if (typeof string === 'string') {
				return string.charAt(0).toUpperCase() + string.slice(1);
			}

			return string;
		},

		correctTaskTypeCheck: function(type) {
			return (type != '' && (this.tasksDatas.indexOf(type) >= 0)) ? true : false;
		},

		/**
		 * Form wizard creator
		 */
		loadForm: function(type) {
			if (this.correctTaskTypeCheck(type)) {
				this.form.wizard.removeAll();
				this.form.delegate.delegateStep = [];

				var items = Ext.create('CMDBuild.view.administration.tasks.' + type + '.CMTaskTabs').getTabs();

				for (var i = 0; i < items.length; i++) {

					// Controllers relation propagation
					items[i].delegate.parentDelegate = this.form.delegate;
					this.form.delegate.delegateStep.push(items[i].delegate);

					this.form.wizard.add(items[i]);
				}

				this.form.wizard.numberOfTabs = items.length;
				this.form.wizard.changeTab(0);
			}
		},

		onAddButtonClick: function(name, param, callBack) {
			this.selectionModel.deselectAll();
			this.buildFormController(param.type);

			return this.form.delegate.cmOn(name, param, callBack);
		},

		onItemDoubleClick: function() {
			return this.form.delegate.onModifyButtonClick();
		},

		/**
		 * Check for a right form controller and/or creates it and then calls delegate's onRowSelected function
		 *
		 * @param (String) name
		 * @param (Object) param
		 * @param (Function) callback
		 */
		onRowSelected: function(name, param, callBack) {
			var selectedType = this.selectionModel.getSelection()[0].get(CMDBuild.ServiceProxy.parameter.TYPE);

			if (
				!this.form.delegate
//				|| (this.form.delegate.taskType != param.get(CMDBuild.ServiceProxy.parameter.TYPE))
				|| (this.form.delegate.taskType != selectedType)
			)
				this.buildFormController(selectedType);

			if (this.form.delegate)
				this.form.delegate.cmOn(name, param, callBack);
		},

		onStartButtonClick: function(record) {
			this.form.delegate.onAbortButtonClick();

			CMDBuild.LoadMask.get().show();
			CMDBuild.core.proxy.CMProxyTasks.start({
				scope: this,
				params: { id: record.get(CMDBuild.ServiceProxy.parameter.ID) },
				success: this.success,
				callback: this.callback
			});
		},

		onStopButtonClick: function(record) {
			this.form.delegate.onAbortButtonClick();

			CMDBuild.LoadMask.get().show();
			CMDBuild.core.proxy.CMProxyTasks.stop({
				scope: this,
				params: { id: record.get(CMDBuild.ServiceProxy.parameter.ID) },
				success: this.success,
				callback: this.callback
			});
		},

		success: function() {
			this.grid.store.load();
		}
	});

})();