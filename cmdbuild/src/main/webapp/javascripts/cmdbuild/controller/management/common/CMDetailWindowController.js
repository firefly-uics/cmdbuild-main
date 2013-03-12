(function() {
	Ext.define("CMDBuild.controller.management.common.CMDetailWindowController", {
		extend: "CMDBuild.controller.management.common.CMCardWindowController",

		constructor: function() {
			this.callParent(arguments);
		},

		getRelationsAttribute: function() {
			var form = this.getForm(),
				ff = form.getFields(),
				out = [];

			for (var i=0, f=null; i<ff.items.length; ++i) {
				f = ff.items[i];
				if(f.CMAttribute && f.CMAttribute.cmRelationAttribute) {
					f.enable();
					out.push(f);
				}
			}

			return out;
		},

		//override
		buildSaveParams: function() {
			var p = this.callParent(arguments);

			if (this.referenceToMaster) {
				// set the value to the field that was hidden
				var r = this.referenceToMaster;
				p[r.name] = r.value;
			}

			return p;
		},

		// protected
		buildParamsToSaveRelation: function(detailData) {
			var detail = this.view.detail;

			var out = {
				did: detail.get("id"),
				attrs: this.fillRelationAttributesParams(detailData, {})
			};

			if (this.relation) {
				out["id"] = this.relation.rel_id;
			}

			return out;
		},

		fillRelationAttributesParams: function(detailData, attributes) {
			var relationAttributes = this.getRelationsAttribute();

			for (var i=0, a=null; i<relationAttributes.length; ++i) {
				a = relationAttributes[i];
				attributes[a.CMAttribute.attributeName] = a.getValue();
			}

			return attributes;
		},

		//override
		beforeRequest: function(form) {
			// Disable the fields of the relation attribute
			// to don't send them with the save request
			// if there is not a refenrence to to master card
			if (!this.referenceToMaster) {
				var ff = form.getFields();
				for (var i=0, f=null; i<ff.items.length; ++i) {
					f = ff.items[i];
					f.setDisabled(f.CMAttribute && f.CMAttribute.cmRelationAttribute);
				}
			}
		},

		//override
		onSaveSuccess: function(form, res) {
			// if this.relation is different to undefined,
			// so the relation data was loaded because has some attributes
			// use it to update the relation attributes;
			if (this.relation) {
				this.updateRelation(form, res);
			}
			this.callParent(arguments);
		},

		updateRelation: function(form, res) {
			var p = this.buildParamsToSaveRelation({
				id: this.view.cardId,
				cid: this.view.classId
			});

			CMDBuild.ServiceProxy.relations.modify({
				params: { JSON: Ext.JSON.encode(p) }
			});
		},

		// override to remove the reference
		loadFields: function(entryTypeId, cb) {
			var me = this;

			_CMCache.getAttributeList(entryTypeId, function(attributes) {
				attributes = removeFKOrMasterDeference(me, attributes);
				attributes = addDomainAttributesIfNeeded(me, me.view, attributes);

				me.view.fillForm(attributes, editMode = false);
				if (cb) {
					cb();
				}
			});
		},

		// override
		onCardLoaded: function(me, card) {
			me.callParent(arguments);

			if (me.view.hasRelationAttributes) {
				loadRelationToFillRelationAttributes(me);
			}
		}
	});

	function loadRelationToFillRelationAttributes(me) {
		var parameterNames = CMDBuild.ServiceProxy.parameter;
		var parameters = {};
		parameters[parameterNames.CARD_ID] =  me.card.get("Id");
		parameters[parameterNames.CLASS_NAME] = me.entryType.getId();
		parameters[parameterNames.DOMAIN_ID] = me.view.detail.get("id");
		parameters[parameterNames.DOMAIN_SOURCE] = me.view.detail.getDetailSide();

		CMDBuild.ServiceProxy.relations.getList({
			params: parameters,
			scope: this,
			success: function(a,b, response) {
				var domains = response.domains;
				/*
				 * the response structure is: domains: [{
				 * 		id: "xxx",
				 * 		relations: [{
							rel_attr: {
								name:value,
								...,
								name: value
							}
							rel_id: XXX
				 * 		}]
				 * 	}]
				 * */
				try {
					if (domains.length > 1) {
					_debug("TODO ecco perchè sbaglia il modify, il get relation torna due domini, che " +
							"in realtà è lo stesso nei due versi", domains);
					}
					me.relation = domains[0].relations[0]; // set this for the save request
					var fields = me.getRelationsAttribute(),
						attributes = me.relation.rel_attr;

					for (var i=0, f=null; i<fields.length; ++i) {
						f = fields[i];
						if (f.CMAttribute) {
							var value = attributes[f.CMAttribute.name] || attributes[f.CMAttribute.attributeName];
							f.setValue(value);
						}
					}

				} catch (e) {
					me.relation = undefined;
					_debug("No relations", e);
				}
			}
		});
	}

	// to remove the reference
	function removeFKOrMasterDeference(me, attributes) {
		var attributesToAdd = [];
		for (var i = 0; i < attributes.length; i++) {
			var attribute = attributes[i];

			if (attribute) {
				if (isTheFKFieldToTarget(me.view, attribute) 
						|| isTheReferenceOfTheDetail(me.view, attribute)) {
					// does not create the relation if the
					// detail has a reference to the master
					// used to add a detail
					if (me.view.masterData) {
						me.referenceToMaster = {
							name: attribute.name,
							value: me.view.masterData.get("Id")
						};
					}
				} else {
					attributesToAdd.push(attribute);
				}
			}
		}

		return attributesToAdd;
	}

	function isTheFKFieldToTarget(view, attribute) {
		if (attribute && view.fkAttribute) {
			return attribute.name == view.fkAttribute.name;
		}

		return false;
	};

	function isTheReferenceOfTheDetail(view, attribute) {
		if (!view.detail) {
			return false;
		} else {
			return attribute.idDomain == view.detail.get("id");
		}
	};

	function addDomainAttributesIfNeeded(me, view, attributes) {
		var domainAttributes = view.detail.getAttributes() || [],
			out = [];

		if (domainAttributes.length > 0) {

			view.hasRelationAttributes = true;

			var areTheAttributesDividedInTab = false;
			for (var i=0, l=attributes.length; i<l; ++i) {
				var a = attributes[i];
				if (a.group && a.group != "") {
					areTheAttributesDividedInTab = true;
					break;
				}
			}

			// to have a useful label for the tab that has the
			// detail's attributes modify the group of all attributes
			// if this is undefined
			if (areTheAttributesDividedInTab) {
				out = [].concat(attributes);
			} else {
				for (var i=0, a=null; i<attributes.length; ++i) {
					a = attributes[i];
					var dolly = Ext.apply({}, a);
					dolly.group = CMDBuild.Translation.management.modcard.detail_window.detail_attributes;
					out.push(dolly);
				}
			}

			// add the attributes of the domain and add to them
			// a group to have a separated tab in the form
			for (var i=0, a=null; i<domainAttributes.length; ++i) {
				a = domainAttributes[i];
				var dolly = Ext.apply({}, a);
				dolly.group = CMDBuild.Translation.management.modcard.detail_window.relation_attributes;
				dolly.attributeName = dolly.name; // used to update the relations attributes
				if (me.referenceToMaster) {
					dolly.name = "_" + me.referenceToMaster.name + "_" + dolly.name;
				}
				// mark these attributes to be able to detect them
				// when save or load the data. There is the possibility
				// of a names collision.
				dolly.cmRelationAttribute = true;
				out.push(dolly);
			}
		} else {
			out = [].concat(attributes);
		}

		return out;
	}
})();