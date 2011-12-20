(function() {
	var _fields = CMDBuild.model.CMWidgetDefinitionModel._FIELDS;

	Ext.define("CMDBuild.controller.administration.widget.CMWidgetDefinitionController", {

		mixins: {
			observable: 'Ext.util.Observable'
		},

		constructor: function(view) {
			this.view = view;

			this.mon(this.view, "select", onWidgetDefinitionSelect, this);
			this.mon(this.view, "deselect", onWidgetDefinitionDeselect, this);
			this.mon(this.view, "cm-add", onAddClick, this);
			this.mon(this.view, "cm-save", onSaveClick, this);
			this.mon(this.view, "cm-abort", onAbortClick, this);
			this.mon(this.view, "cm-remove", onRemoveClick, this);
			this.mon(this.view, "cm-modify", onModifyClick, this);
			this.mon(this.view, "cm-enable-modify", onEnableModify, this);
		},

		onClassSelected: function(classId) {
			this.classId = classId;
			this.view.enable();
			this.view.reset(removeAllRecords = true);

			var me = this;
			var et = _CMCache.getEntryTypeById(classId);
				widgets = et.getWidgets();
			for (var i=0, l=widgets.length, w; i<l; ++i) {
				w = widgets[i];
				addRecordToGrid(w, me);
			}
		},

		onAddClassButtonClick: function() {
			this.view.disable();
		}
	});

	function addRecordToGrid(w, me) {
		me.view.addRecordToGrid(new CMDBuild.model.CMWidgetDefinitionModel(w));
	}

	function onAddClick(widgetName) {
		this.model = undefined;
		this.view.reset();
		buildSubController(this, widgetName);
		if (this.subController) {
			this.view.enableModify();
			this.subController.setDefaultValues();
		}
	}

	function onWidgetDefinitionSelect(sm, record, index) {
		this.model = record;
		buildSubController(this, record.get("type"), record);
	}

	function onWidgetDefinitionDeselect(sm, record, index) {
		this.model = undefined;
		delete this.subController;
	}

	function onSaveClick() {
		if (!this.subController) {
			return;
		}

		var me = this,
			widgetDef = me.view.getWidgetDefinition();

		if (this.model) {
			widgetDef.id = this.model.get(_fields.id);
		}

		CMDBuild.ServiceProxy.CMWidgetConfiguration.save({
			params: {
				widget: Ext.encode(widgetDef),
				className: _CMCache.getClassById(me.classId).get("name")
			},
			success: function success(response, operation, responseData) {
				var widgetModel = new CMDBuild.model.CMWidgetDefinitionModel(Ext.apply(responseData.response, {
					type: widgetDef.type
				}));

				_CMCache.onWidgetSaved(me.classId, widgetDef);
				me.view.addRecordToGrid(widgetModel, selectAfter = true);
				me.view.disableModify(enableToolBar = true);
			}
		});
	}

	function onAbortClick() {
		if (this.model) {
			this.view.disableModify(enableToolbar = true);
			this.subController.fillFormWithModel(this.model);
		} else {
			this.view.reset();
		}
	}

	function onRemoveClick() {
		if (this.model && this.subController) {
			var me = this,
				id = this.model.get(_fields.id),
				params = {
					id: id,
					className: _CMCache.getClassById(me.classId).get("name")
				};

			CMDBuild.ServiceProxy.CMWidgetConfiguration.remove({
				params: params,
				success: function() {
					me.view.removeRecordFromGrid(id);
					me.view.reset();

					_CMCache.onWidgetDeleted(me.classId, id);

					delete me.model;
					delete me.subController;
				}
			});
		}
	}

	function buildSubController(me, widgetName, record) {
		if (me.subController) {
			delete me.subController;
		}

		var subControllerClass = findController(widgetName);
		if (subControllerClass) {
			var subView = me.view.buildWidgetForm(widgetName);
			me.subController = subControllerClass.create({
				view: subView
			});

			if (record) {
				me.subController.fillFormWithModel(record);
			}
			me.view.disableModify(enableToolbar = true);
		} else {
			me.view.reset();
		}

		function findController(widgetName) {
			var controller = null;
			for (var key in CMDBuild.controller.administration.widget) {
				if (CMDBuild.controller.administration.widget[key].WIDGET_NAME == widgetName) {
					controller = CMDBuild.controller.administration.widget[key];
					break;
				}
			}

			return controller;
		}
	}

	function onModifyClick() {
		this.view.enableModify();
	}

	function onEnableModify() {
		if (this.subController) {
			this.subController.afterEnableEditing()
		}
	}
})();