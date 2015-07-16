(function() {

	Ext.define('CMDBuild.core.proxy.Card', {
		alternateClassName: 'CMDBuild.ServiceProxy.card', // Legacy class name

		requires: [
			'CMDBuild.core.proxy.CMProxy',
			'CMDBuild.core.proxy.Constants',
			'CMDBuild.core.proxy.Index'
		],

		singleton: true,

		/**
		 * @param {Object} params
		 */
		bulkUpdate: function(params) {
			params.method = 'POST';
			params.url = CMDBuild.core.proxy.Index.card.bulkUpdate;

			CMDBuild.ServiceProxy.core.doRequest(params);
		},

		/**
		 * @param {Object} params
		 */
		bulkUpdateFromFilter: function(params) {
			params.method = 'POST';
			params.url = CMDBuild.core.proxy.Index.card.bulkUpdateFromFilter;

			CMDBuild.ServiceProxy.core.doRequest(params);
		},

		/**
		 * Retrieve the position on the DB of the required card, considering the sorting and current filter applied on the grid
		 *
		 * @param {Object} p
		 * 		Ex: {
		 * 			params: {
		 * 				{Number} cardId
		 * 				{String} className
		 * 				{Object} filter
		 * 				{Object} sort
		 * 			}
		 * 		}
		 */
		getPosition: function(params) {
			params.method = 'GET';
			params.url = CMDBuild.core.proxy.Index.card.getPosition;

			CMDBuild.ServiceProxy.core.doRequest(params);
		},

		/**
		 * @param {Object} params
		 */
		get: function(params) {
			adaptGetCardCallParams(params);
			params.method = 'GET';
			params.url = CMDBuild.core.proxy.Index.card.read;

			CMDBuild.ServiceProxy.core.doRequest(params);
		},

		/**
		 *
		 * Id of the card to lock, className is not required because id is unique
		 *
		 * @param {Number} params.id
		 */
		lockCard: function(params) {
			params.method = 'POST';
			params.url = CMDBuild.core.proxy.Index.card.lock;

			CMDBuild.ServiceProxy.core.doRequest(params);
		},

		/**
		 * @param {Object} params
		 */
		remove: function(params) {
			params.method = 'POST';
			params.url = CMDBuild.core.proxy.Index.card.remove;
			params.important = true;

			CMDBuild.ServiceProxy.core.doRequest(params);
		},

		/**
		 * Unlock all cards that was locked
		 *
		 * @param {Object} parameters
		 */
		unlockAllCards: function(parameters) {
			CMDBuild.Ajax.request({
				method: 'POST',
				url: CMDBuild.core.proxy.Index.card.unlockAll,
				params: parameters.params,
				scope: parameters.scope,
				loadMask: Ext.isBoolean(parameters.loadMask) ? parameters.loadMask : true,
				failure: parameters.failure || Ext.emptyFn(),
				success: parameters.success || Ext.emptyFn(),
				callback: parameters.callback || Ext.emptyFn()
			});
		},

		/**
		 * Id of card to unlock
		 *
		 * @param {Number} params.id
		 */
		unlockCard: function(params) {
			params.method = 'POST';
			params.url = CMDBuild.core.proxy.Index.card.unlock;

			CMDBuild.ServiceProxy.core.doRequest(params);
		},

		/**
		 * @property {Object} parameters
		 */
		update: function(parameters) {
			CMDBuild.Ajax.request({
				method: 'POST',
				url: CMDBuild.core.proxy.Index.card.update,
				headers: parameters.headers,
				params: parameters.params,
				scope: parameters.scope || this,
				loadMask: Ext.isBoolean(parameters.loadMask) ? parameters.loadMask : true,
				failure: parameters.failure || Ext.emptyFn(),
				success: parameters.success || Ext.emptyFn(),
				callback: parameters.callback || Ext.emptyFn()
			});
		},
	});

	function adaptGetCardCallParams(p) {
		if (p.params.Id && p.params.IdClass) {
			_deprecated('adaptGetCardCallParams', 'CMDBuild.core.proxy.Card');

			var parameters = {};
			parameters[CMDBuild.core.proxy.Constants.CLASS_NAME] = _CMCache.getEntryTypeNameById(p.params.IdClass);
			parameters[CMDBuild.core.proxy.Constants.CARD_ID] = p.params.Id;

			p.params = parameters;
		}
	}

})();