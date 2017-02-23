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
				var menuItems = [];

				this.buildMenuChildren(
					this.dataViewFilterGridToolbarTopEntryTypeRelationshipTreeGet(
						this.cmfg('dataViewFilterSourceEntryTypeGet', CMDBuild.core.constants.Proxy.ID),
						CMDBuild.core.constants.Proxy.CHILDREN
					),
					menuItems
				);

				return Ext.create('CMDBuild.core.buttons.icon.split.add.Card', {
					text: CMDBuild.Translation.addCard + ' ' + this.cmfg('dataViewFilterSourceEntryTypeGet', CMDBuild.core.constants.Proxy.DESCRIPTION),
					itemId: 'addButton',
					disabled: this.isAddButtonDisabled(menuItems),
					scope: this,

					menu: Ext.create('Ext.menu.Menu', { items: menuItems }),

					/**
					 * @returns {Boolean}
					 *
					 * @override
					 */
					isEnableActionEnabled: this.isEnableActionEnabled
				});
			}

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
		},

		/**
		 * @param {Array} childrenArray
		 * @param {Array or Object} parent
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
		 * @param {CMDBuild.model.management.dataView.filter.entryType.EntryType} entryTypeObject
		 * @param {Array or Object} parent
		 *
		 * @returns {void}
		 *
		 * @private
		 */
		buildMenuItem: function (entryTypeObject, parent) {
			if (Ext.isObject(entryTypeObject) && !Ext.Object.isEmpty(entryTypeObject)) {
				var menuObject = {
					disabled: (
						!entryTypeObject.get([CMDBuild.core.constants.Proxy.PERMISSIONS, CMDBuild.core.constants.Proxy.CREATE])
						&& !entryTypeObject.get(CMDBuild.core.constants.Proxy.IS_SUPER_CLASS)
					),
					text: entryTypeObject.get(CMDBuild.core.constants.Proxy.DESCRIPTION),
					entryTypeId: entryTypeObject.get(CMDBuild.core.constants.Proxy.ID),
					scope: this
				};

				// Add handler function only if isn't superclass
				if (!entryTypeObject.get(CMDBuild.core.constants.Proxy.IS_SUPER_CLASS))
					menuObject.handler = function (button, e) {
						this.cmfg('onDataViewFilterAddButtonClick', { id: button.entryTypeId });
					};

				switch (Ext.typeOf(parent)) {
					case 'array': {
						parent.push(menuObject);
					} break;

					case 'object': {
						parent.menu = Ext.isArray(parent.menu) ? parent.menu : [];
						parent.menu.push(menuObject);
					} break;

					default:
						return _error('buildMenuItem(): unmanaged parent parameter type', this, parent);
				}

				this.buildMenuChildren(entryTypeObject.get(CMDBuild.core.constants.Proxy.CHILDREN), menuObject);
			}
		},

		/**
		 * @returns {Void}
		 */
		dataViewFilterGridToolbarTopUiUpdate: function () {
			// Add button setup
				this.dataViewFilterGridToolbarTopEntryTypeRelationshipTreeReset();

				// Build entryType map
				Ext.Array.forEach(this.cmfg('dataViewFilterCacheEntryTypeGetAll'), function (entryTypeObject, i, allEntryTypeObjects) {
					if (Ext.isObject(entryTypeObject) && !Ext.Object.isEmpty(entryTypeObject))
						this.dataViewFilterGridToolbarTopEntryTypeRelationshipTreeSet({ value: entryTypeObject });
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
			 * @param {CMDBuild.model.management.dataView.filter.entryType.EntryType} child
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
				) {
					var children = this.entryTypeRelationshipTree[id].get(CMDBuild.core.constants.Proxy.CHILDREN);
					children = Ext.Array.merge(children, [child]); // Merge with unique items
					children = CMDBuild.core.Utils.objectArraySort(children); // Sort children by description ASC

					this.entryTypeRelationshipTree[id].set(CMDBuild.core.constants.Proxy.CHILDREN, Ext.Array.clean(children));
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
			 * @param {CMDBuild.model.management.dataView.filter.entryType.EntryType} parameters.value
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			dataViewFilterGridToolbarTopEntryTypeRelationshipTreeSet: function (parameters) {
				parameters = Ext.isObject(parameters) ? parameters : {};

				if (
					Ext.isObject(parameters.value) && !Ext.Object.isEmpty(parameters.value)
					&& !Ext.isEmpty(parameters.value.get(CMDBuild.core.constants.Proxy.ID))
				) {
					this.entryTypeRelationshipTree[parameters.value.get(CMDBuild.core.constants.Proxy.ID)] = parameters.value;
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
			menuItems = Ext.isArray(menuItems) ? menuItems : [];

			var capabilityAddDisabled = this.cmfg('dataViewFilterSourceEntryTypeGet', [
					CMDBuild.core.constants.Proxy.CAPABILITIES,
					CMDBuild.core.constants.Proxy.ADD_DISABLED
				]),
				permissionsWrite = this.cmfg('dataViewFilterSourceEntryTypeGet', [
					CMDBuild.core.constants.Proxy.PERMISSIONS,
					CMDBuild.core.constants.Proxy.WRITE
				]);

			if (this.cmfg('dataViewFilterSourceEntryTypeGet', CMDBuild.core.constants.Proxy.IS_SUPER_CLASS))
				return Ext.isEmpty(menuItems) || capabilityAddDisabled;

			return !permissionsWrite || capabilityAddDisabled;
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
