(function () {

	Ext.define('CMDBuild.proxy.administration.navigationTree.NavigationTree', {

		requires: [
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.administration.navigationTree.TargetClassStore',
			'CMDBuild.proxy.administration.navigationTree.ReaderClass',
			'CMDBuild.proxy.index.Json'
		],

		singleton: true,

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		create: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.navigationTree.create });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.NAVIGATION_TREE, parameters, true);
		},

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStoreTargetClass: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.ENTITY, {
				autoLoad: true,
				model: 'CMDBuild.model.administration.navigationTree.TargetClassStore',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.entity.readAll,
					reader: {
						type: 'classstore',
						root: CMDBuild.core.constants.Proxy.CLASSES
					},
					extraParams: {
						limitParam: undefined,
						pageParam: undefined,
						startParam: undefined
					}
				},
				filters: [
					function (record) {
						return (
							record.get(CMDBuild.core.constants.Proxy.TABLE_TYPE) != CMDBuild.core.constants.Global.getTableTypeSimpleTable() // Discard simple classes
							&& record.get(CMDBuild.core.constants.Proxy.NAME) != CMDBuild.core.constants.Global.getRootNameClasses() // Discard root class of all classes
						);
					}
				],
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.DESCRIPTION, direction: 'ASC' }
				]
			});
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		read: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.navigationTree.read });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.NAVIGATION_TREE, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readAll: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.navigationTree.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.NAVIGATION_TREE, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readAllEntryTypes: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.entity.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.ENTITY, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readAllDomains: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.domain.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.DOMAIN, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		remove: function (parameters, success) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.navigationTree.remove });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.NAVIGATION_TREE, parameters, true);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		update: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.navigationTree.update });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.NAVIGATION_TREE, parameters, true);
		}
	});

})();
