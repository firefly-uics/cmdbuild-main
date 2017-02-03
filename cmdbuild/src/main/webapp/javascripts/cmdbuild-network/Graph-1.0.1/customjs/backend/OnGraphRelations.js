(function($) {
	var OnGraphRelations = function(param, onReadyFunction, onReadyScope) {
		/**
		 * Attributes
		 */
		var onReadyFunction = onReadyFunction;
		var onReadyScope = onReadyScope;

		/**
		 * Base functions
		 */
		this.model = $.Cmdbuild.customvariables.model;
		this.config = param;
		this.filter = {};
		this.attributes = [];
		this.alldata = [];
		this.data = [];
		this.metadata = {};
		this.init = function() {
			this.loadAttributes();
		};
		this.loadAttributes = function() {
			this.attributes = [ {
				type : "string",
				name : "domainDescription",
				description : $.Cmdbuild.translations.getTranslation("COLUMNHEADER_RELATION", "Relation"),
				displayableInList : true
			}, {
				type : "string",
				name : "classId",
				description : $.Cmdbuild.translations.getTranslation("attr_typeId", 'Class Id'),
				displayableInList : false
			}, {
				type : "string",
				name : "cardDescription",
				description : $.Cmdbuild.translations.getTranslation("COLUMNHEADER_CARD", "Card"),
				displayableInList : true
			}, {
				type : "string",
				name : "classDescription",
				description : $.Cmdbuild.translations.getTranslation("COLUMNHEADER_CLASS", "Class"),
				displayableInList : true
			} ];

			var me = this;
			setTimeout(function() {
				me.preLoadData();
			}, 100);
		};
		this.preLoadData = function() {
			this.alldata = [];
			var me = this;
			var cardId = param.cardId;
			var classId = param.classId;
			if (!classId) {
				return;
			}
			$.Cmdbuild.customvariables.cacheDomains.getLoadingDomains4Class(classId, function(domains) {
				this.getAllRelatedCards(domains, 0, classId, parseInt(cardId), function() {
					onObjectReady();
				}, this);
			}, this);
		};
		this.composeFilterOnAllRelations = function(classId, cardId, domains) {
			var relations = [];
			for (var i = 0; i < domains.length; i++) {
				var domain = domains[i];
				var directedDomain = $.Cmdbuild.g3d.backend.CmdbuildModel.getDirectedDomain(classId, domain);
				var oppositeDirection = (directedDomain.direction === "_1") ? "_2" : "_1";
				var filterOnRelation = $.Cmdbuild.g3d.backend.CmdbuildModel.getCardsFilterOnDomain(oppositeDirection,
						domain._id, directedDomain.destinationId, directedDomain.sourceId, cardId,
						directedDomain.sourceId);
				relations.push(filterOnRelation.relation[0]);
			}
			var filterOnRelations = {
				relation : relations
			}
			return filterOnRelations;

		};
		this.getAllRelatedCards = function(domains, index, classId, cardId, callback, callbackScope) {
			if (index === domains.length) {
				callback.apply(callbackScope, []);
				return;
			}
			var domain = domains[index];
			index++;
			var directedDomain = $.Cmdbuild.g3d.backend.CmdbuildModel.getDirectedDomain(classId, domain);
			// in the filter the relation is mirrored
			var oppositeDirection = (directedDomain.direction === "_1") ? "_2" : "_1";
			var filterOnRelation = $.Cmdbuild.g3d.backend.CmdbuildModel.getCardsFilterOnDomain(oppositeDirection,
					domain._id, directedDomain.destinationId, directedDomain.sourceId, cardId, directedDomain.sourceId);
			var allFilter = {
				relation : filterOnRelation.relation

			}
			var config = {
				filter : allFilter
			};
			$.Cmdbuild.g3d.proxy.getRelatedCards(directedDomain.destinationId, config, function(data, metadata) {
				var classDescription = $.Cmdbuild.customvariables.cacheClasses
						.getDescription(directedDomain.destinationId);
				for (var i = 0; i < data.length; i++) {
					var card = data[i];
					var description = ((card.Code) ? card.Code : "") + " - "
							+ ((card.Description) ? card.Description : "");
					this.pushItem(domain._id, domain._id, 1, classId, classDescription, card._id, description);
				}
				this.getAllRelatedCards(domains, index, classId, parseInt(cardId), callback, callbackScope);
			}, this);

		};
		this.justHere = function(cardId) {
			for (var i = 0; i < this.alldata.length; i++) {
				if (this.alldata[i].cardId === cardId) {
					return i;
				}
			}
			return -1;
		};
		this.pushItem = function(domainId, domainDescription, relationId, classId, classDescription, cardId,
				cardDescription) {
			if (this.justHere(cardId) !== -1) {
				return;
			}
			var item = {
				domainId : domainId,
				domainDescription : domainDescription,
				relationId : relationId,
				classId : classId,
				classDescription : classDescription,
				cardId : cardId,
				cardDescription : cardDescription,
				attributes : {}
			};

			this.alldata.push(item);
		};

		this.loadData = function(param, callback, callbackScope) {
			// filter data
			var all_data;
			if (this.filter && this.filter.query) {
				var query = this.filter.query.trim().toLowerCase();
				all_data = this.alldata.filter(function(el) {
					return el.domainDescription.toLowerCase().search(query) !== -1
							|| el.classDescription.toLowerCase().search(query) !== -1
							|| el.cardDescription.toLowerCase().search(query) !== -1;
				});
			} else {
				all_data = this.alldata;
			}
			this.metadata.total = all_data.length;
			// sort data
			if (param.sort) {
				var sortingColumn = param.sort;
				this.alldata.sort(function(a, b) {
					var val_a = a[sortingColumn];
					var val_b = b[sortingColumn];
					if (typeof val_a === "string") {
						val_a = val_a.toUpperCase();
					}
					if (typeof val_b === "string") {
						val_b = val_b.toUpperCase();
					}
					if (param.direction === "ASC") {
						return (val_a > val_b) ? 1 : -1;
					} else {
						return (val_a < val_b) ? 1 : -1;
					}
				});
			}
			// apply pagination
			var limit = param.firstRow + parseInt(param.nRows);
			this.data = all_data.slice(param.firstRow, limit);
			callback.apply(callbackScope, this.data);
		};
		this.getAttributes = function() {
			return this.attributes;
		};
		this.getData = function() {
			return this.data;
		};
		this.getMetadata = function() {
			return this.metadata;
		};

		/**
		 * Private functions
		 */
		var onObjectReady = function() {
			onReadyFunction.apply(onReadyScope);
		};

		/**
		 * Custom functions
		 */
		this.getTotalRows = function() {
			var metadata = this.getMetadata();
			return metadata && metadata.total ? metadata.total : this.alldata.length;
		};

		/**
		 * Call init function and return object
		 */
		this.init();
	};
	$.Cmdbuild.custom.backend.OnGraphRelations = OnGraphRelations;
	function compact(data) {
		returnData = {};
		for (var i = 0; i < data.length; i++) {
			returnData[data[i]._id] = data[i];
		}
		data = [];
		for ( var key in returnData) {
			data.push(returnData[key]);
		}
		return data;
	}
})(jQuery);

