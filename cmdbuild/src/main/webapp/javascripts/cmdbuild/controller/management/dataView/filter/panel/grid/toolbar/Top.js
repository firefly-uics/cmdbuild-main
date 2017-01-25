(function () {

	Ext.define('CMDBuild.controller.management.dataView.filter.panel.grid.toolbar.Top', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Utils'
		],

		/**
		 * @cfg {CMDBuild.controller.management.dataView.filter.panel.grid.Grid}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'dataViewFilterGridToolbarTopUiUpdate'
		],

		/**
		 * @property {Object}
		 *
		 * @private
		 */
		entryTypeRelationshipTree: {},

		/**
		 * @property {CMDBuild.view.management.dataView.filter.panel.grid.toolbar.TopView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.dataView.filter.panel.grid.Grid} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.dataView.filter.panel.grid.toolbar.TopView', { delegate: this });
		},

		/**
		 * @returns {CMDBuild.core.buttons.icon.split.add.Card or CMDBuild.core.buttons.icon.add.Card}
		 *
		 * @private
		 */
		buildButtonAdd: function () {
			// Error handling
				if (this.cmfg('dataViewFilterSourceEntryTypeIsEmpty'))
					return _error('buildButtonAdd(): empty sourceEntryType', this, this.cmfg('dataViewFilterSourceEntryTypeGet'));
			// END: Error handling

			if (this.cmfg('dataViewFilterSourceEntryTypeGet', CMDBuild.core.constants.Proxy.IS_SUPER_CLASS)) {
				var menuItems = [],
					selectedEntryTypeDescendants = this.dataViewFilterGridToolbarTopEntryTypeRelationshipTreeGet(
						this.cmfg('dataViewFilterSourceEntryTypeGet', CMDBuild.core.constants.Proxy.ID),
						CMDBuild.core.constants.Proxy.CHILDREN
					);

				this.buildMenuChildren(selectedEntryTypeDescendants, menuItems);

				return Ext.create('CMDBuild.core.buttons.icon.split.add.Card', {
					text: CMDBuild.Translation.addCard + ' ' + this.cmfg('dataViewFilterSourceEntryTypeGet', CMDBuild.core.constants.Proxy.DESCRIPTION),
					itemId: 'addButton',
					disabled: this.isAddButtonDisabled(menuItems),
					scope: this,

					menu: Ext.create('Ext.menu.Menu', {
						items: menuItems
					}),

					/**
					 * @returns {Boolean}
					 *
					 * @override
					 */
					isEnableActionEnabled: this.isEnableActionEnabled
				});
			} else {
				return Ext.create('CMDBuild.core.buttons.icon.add.Card', {
					text: CMDBuild.Translation.addCard + ' ' + this.cmfg('dataViewFilterSourceEntryTypeGet', CMDBuild.core.constants.Proxy.DESCRIPTION),
					itemId: 'addButton',
					disabled: this.isAddButtonDisabled(),
					scope: this,

					handler: function (button, e) {
						this.cmfg('onDataViewFilterAddButtonClick', { id: this.cmfg('dataViewFilterSourceEntryTypeGet', CMDBuild.core.constants.Proxy.ID) });
					},

					/**
					 * @returns {Boolean}
					 *
					 * @override
					 */
					isEnableActionEnabled: this.isEnableActionEnabled
				});
			}
		},

		/**
		 * @param {Array} childrenArray
		 * @param {Object} parent
		 *
		 * @returns {void}
		 *
		 * @private
		 */
		buildMenuChildren: function (childrenArray, parent) {
			if (Ext.isArray(childrenArray) && !Ext.isEmpty(childrenArray))
				Ext.Array.forEach(childrenArray, function (childrenObject, i, allChildrenObjects) {
					if (Ext.isObject(childrenObject) && !Ext.Object.isEmpty(childrenObject))
						this.buildMenuItem(childrenObject, parent);
				}, this);
		},

		/**
		 * @param {CMDBuild.model.management.dataView.filter.panel.grid.toolbar.top.Parent} entryTypeObject
		 * @param {Object} parent
		 *
		 * @returns {void}
		 *
		 * @private
		 */
		buildMenuItem: function (entryTypeObject, parent) {
			if (
				Ext.isObject(entryTypeObject) && !Ext.Object.isEmpty(entryTypeObject)
				&& !entryTypeObject.get(CMDBuild.core.constants.Proxy.CAPABILITIES).create
			) {
				var menuObject = {
					text: entryTypeObject.get(CMDBuild.core.constants.Proxy.DESCRIPTION),
					entryTypeId: entryTypeObject.get(CMDBuild.core.constants.Proxy.ID),
					scope: this
				};

				// Add handler function only if isn't superclass
				if (!entryTypeObject.get(CMDBuild.core.constants.Proxy.IS_SUPER_CLASS))
					menuObject.handler = function (button, e) {
						this.cmfg('onDataViewFilterAddButtonClick', { id: button.entryTypeId });
					};

				if (Ext.isArray(parent)) {
					parent.push(menuObject);
				} else if (Ext.isObject(parent)) {
					parent.menu = Ext.isArray(parent.menu) ? parent.menu : [];
					parent.menu.push(menuObject);
				} else {
					return _error('buildMenuItem(): unmanaged parent parameter type', this, parent);
				}

				this.buildMenuChildren(entryTypeObject.get(CMDBuild.core.constants.Proxy.CHILDREN), menuObject);
			}
		},

		/**
		 * @returns {Void}
		 */
		dataViewFilterGridToolbarTopUiUpdate: function () {
			this.dataViewFilterGridToolbarTopEntryTypeRelationshipTreeReset();

			// Build entryType map
			Ext.Array.forEach(this.cmfg('dataViewFilterCacheEntryTypeGetAll'), function (entryTypeObject, i, allEntryTypeObjects) {
				if (Ext.isObject(entryTypeObject) && !Ext.Object.isEmpty(entryTypeObject))
					this.dataViewFilterGridToolbarTopEntryTypeRelationshipTreeSet({ value: entryTypeObject.getData() });
			}, this);

			// Build relationship tree
			Ext.Object.each(this.dataViewFilterGridToolbarTopEntryTypeRelationshipTreeGet(), function (id, entryTypeObject, myself) {
				if (
					Ext.isObject(entryTypeObject) && !Ext.Object.isEmpty(entryTypeObject)
					&& !Ext.isEmpty(entryTypeObject.get(CMDBuild.core.constants.Proxy.PARENT))
				){
					this.dataViewFilterGridToolbarTopEntryTypeRelationshipTreeAppendChild(entryTypeObject.get(CMDBuild.core.constants.Proxy.PARENT), entryTypeObject);
				}
			}, this);

			// Build toolbar add button
			this.view.remove('addButton');
			this.view.insert(0, this.buildButtonAdd());
		},

		// EntryTypeRelationshipTree property functions
			/**
			 * @param {Number} id
			 * @param {CMDBuild.model.management.dataView.filter.panel.grid.toolbar.top.Parent} child
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			dataViewFilterGridToolbarTopEntryTypeRelationshipTreeAppendChild: function (id, child) {
				if (
					Ext.isNumber(id) && !Ext.isEmpty(id)
					&& !Ext.isEmpty(this.entryTypeRelationshipTree[id])
					&& Ext.isObject(child) && !Ext.Object.isEmpty(child)
					&& Ext.getClassName(child) == 'CMDBuild.model.management.dataView.filter.panel.grid.toolbar.top.Parent'
				) {
					var children = this.entryTypeRelationshipTree[id].get(CMDBuild.core.constants.Proxy.CHILDREN);
					children = Ext.Array.merge(children, [child]); // Merge with unique items
					children = CMDBuild.core.Utils.objectArraySort(children); // Sort children by description ASC

					this.entryTypeRelationshipTree[id].set(CMDBuild.core.constants.Proxy.CHILDREN, children);
				}
			},

			/**
			 * @param {Number} id
			 * @param {String} attributeName
			 *
			 * @returns {Mixed or undefined}
			 *
			 * @private
			 */
			dataViewFilterGridToolbarTopEntryTypeRelationshipTreeGet: function (id, attributeName) {
				if (
					Ext.isNumber(id) && !Ext.isEmpty(id)
					&& !Ext.isEmpty(this.entryTypeRelationshipTree[id])
				) {
					if (Ext.isString(attributeName) && !Ext.isEmpty(attributeName))
						return this.entryTypeRelationshipTree[id].get(attributeName);

					return this.entryTypeRelationshipTree[id];
				}

				return this.entryTypeRelationshipTree;
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			dataViewFilterGridToolbarTopEntryTypeRelationshipTreeReset: function () {
				this.entryTypeRelationshipTree = {};
			},

			/**
			 * @param {Object} parameters
			 * @param {Object} parameters.value
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			dataViewFilterGridToolbarTopEntryTypeRelationshipTreeSet: function (parameters) {
				if (
					Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)
					&& !Ext.isEmpty(parameters.value[CMDBuild.core.constants.Proxy.ID])
					&& Ext.isObject(parameters.value) && !Ext.Object.isEmpty(parameters.value)
				) {
					this.entryTypeRelationshipTree[parameters.value[CMDBuild.core.constants.Proxy.ID]] = Ext.create(
						'CMDBuild.model.management.dataView.filter.panel.grid.toolbar.top.Parent',
						parameters.value
					);
				}
			},

		/**
		 * @param {Array} menuItems
		 *
		 * @returns {Boolean}
		 *
		 * @private
		 */
		isAddButtonDisabled: function (menuItems) {
			var permissionsWrite = this.cmfg('dataViewFilterSourceEntryTypeGet', [
					CMDBuild.core.constants.Proxy.PERMISSIONS,
					CMDBuild.core.constants.Proxy.WRITE
				]),
				permissionsDisabledFeaturesCreate = this.cmfg('dataViewFilterSourceEntryTypeGet', [
					CMDBuild.core.constants.Proxy.PERMISSIONS,
					CMDBuild.core.constants.Proxy.DISABLED_FEATURES,
					CMDBuild.core.constants.Proxy.CREATE
				]);

			if (this.cmfg('dataViewFilterSourceEntryTypeGet', CMDBuild.core.constants.Proxy.IS_SUPER_CLASS))
				return Ext.isEmpty(menuItems) || !permissionsWrite || permissionsDisabledFeaturesCreate;

			return !permissionsWrite || permissionsDisabledFeaturesCreate;
		},

		/**
		 * @param {Array} menuItems
		 *
		 * @returns {Boolean}
		 *
		 * @private
		 */
		isEnableActionEnabled: function (menuItems) {
			return (
				!this.cmfg('dataViewFilterSourceEntryTypeIsEmpty')
				&& (
					!this.cmfg('dataViewFilterSourceEntryTypeGet', CMDBuild.core.constants.Proxy.IS_SUPER_CLASS)
					|| (
						this.cmfg('dataViewFilterSourceEntryTypeGet', CMDBuild.core.constants.Proxy.IS_SUPER_CLASS)
						&& Ext.isEmpty(menuItems)
					)
				)
			);
		}
	});

})();
