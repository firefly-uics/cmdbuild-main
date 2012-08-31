(function () {

	Ext.define("CMDBuild.controller.management.common.widgets.CMManageEmailController", {

		mixins: {
			observable: "Ext.util.Observable",
			widgetcontroller: "CMDBuild.controller.management.common.widgets.CMWidgetController",
			emailgriddelegate: "CMDBuild.view.management.common.widgets.CMEmailGridDelegate"
		},

		statics: {
			WIDGET_NAME: ".ManageEmail"
		},

		TEMPLATE_FIELDS: ['toAddresses','ccAddresses','subject','content','condition'],
		TEMPLATE_CONDITION: 'condition',

		constructor: function(view, supercontroller, widget, clientForm, card) {

			this.mixins.observable.constructor.call(this);
			this.mixins.widgetcontroller.constructor.apply(this, arguments);

			this.reader = CMDBuild.management.model.widget.ManageEmailConfigurationReader;

			this.emailsWereGenerated = false;
			this.gridStoreWasLoaded = false;

			this.emailTemplatesData = _extractVariablesForTemplateResolver(this);
			this.readWrite = !this.reader.readOnly(widget);

			var xavars = Ext.apply({}, this.reader.templates(this.widgetConf), this.emailTemplatesData);

			this.templateResolver = new CMDBuild.Management.TemplateResolver({
				clientForm: clientForm,
				xaVars: xavars,
				serverVars: this.getTemplateResolverServerVars()
			});

			this.view.setDelegate(this);
		},

		// override
		/*
		 * If the grid is already loaded add the emails generated from the templates
		 * (if there are templates, and if the email are not already generated).
		 * Otherwise, load the grid before. 
		 */
		beforeActiveView: function() {
			var pi = _CMWFState.getProcessInstance();
			if (!this.gridStoreWasLoaded) {
				this.view.getEl().mask(CMDBuild.Translation.common.wait_title);
				this.view.emailGrid.store.load({
					params: {
						ProcessId: pi.getId()
					},
					scope: this,
					callback: function(records, operation, success) {
						this.gridStoreWasLoaded = true;
						this.view.getEl().unmask();
						this.addEmailFromTemplateIfNeeded();
					}
				});
			} else {
				this.addEmailFromTemplateIfNeeded();
			}
		},

		/*
		 * Resolve the template only if there are
		 * no draft mails, because the draft mails are
		 * saved from this step, and assume that
		 * the user has already modified the template
		 * for this step.
		 */
		addEmailFromTemplateIfNeeded: function() {
			if (this.emailsWereGenerated) {
				return;
			}

			if (this.readWrite
					&& this.thereAreTemplates()
					&& !this.view.hasDraftEmails()) {

				_createEmailFromTemplate(this);
			}
		},

		thereAreTemplates: function() {
			return this.countTemplates() > 0;
		},

		countTemplates: function() {
			var t = this.reader.emailTemplates(this.widgetConf) || [];
			return t.length;
		},

		removeUnsentEmails: function() {
			var emailToRemove = [].concat(this.view.getNewEmails())
				.concat(this.view.getDraftEmails());

			for (var i=0, l=emailToRemove.length, e=null; i<l; ++i) {
				e = emailToRemove[i];
				this.view.removeRecord(e);
			}
		},

		// override
		getData: function(isAdvance) {
			return {
				Updated: this.view.getOutgoing(true),
				Deleted: this.view.getDeletedEmails()
			};
		},

		// override
		isValid: function() {
			return !(this.reader.required(this.widgetConf)
				&& this.getOutgoing().length == 0);
		},

		// override
		isBusy: function() {
			this.addEmailFromTemplateIfNeeded();
			return this.busy;
		},

		// as emailgriddelegate
		onUpdateTemplatesButtonClick: function() {
			this.removeUnsentEmails(); // New and Draft
			this.emailsWereGenerated = false;
			this.addEmailFromTemplateIfNeeded();
		}
	});

	function _createEmailFromTemplate(me) {
		if (me.busy) {
			return;
		}

		me.busy = true;
		me.view.removeTemplatesFromStore();
		me.emailsWereGenerated = true;

		me.templateResolver.resolveTemplates({
			attributes: Ext.Object.getKeys(me.emailTemplatesData),
			callback: function onTemlatesWereSolved(values) {
				for (var i=1; i<=me.countTemplates(); ++i) {
					var v = {};
					var conditionExpr = values[me.TEMPLATE_CONDITION+i];
					if (!conditionExpr || eval(conditionExpr)) {
						for (var j=0, l=me.TEMPLATE_FIELDS.length, field=null; j<l; ++j) {
							field = me.TEMPLATE_FIELDS[j];
							v[field] = values[field+i];
						}

						me.view.addTemplateToStore(v);
					}
				}

				me.templateResolver.bindLocalDepsChange(function() {
					if (me.emailsWereGenerated) {
						me.emailsWereGenerated = false;
						new CMDBuild.Msg.warn(null, CMDBuild.Translation.management.modworkflow.extattrs.manageemail.mailsAreChanged);
					}
				});

				me.busy = false;
			}
		});
	}

	/*
	 * Extract the variables of each EmailTemplate,
	 * add a suffix to them with the index,
	 * and put them all in the templates map.
	 * 
	 * This is needed to be passed as a unique map to the
	 * template resolver.
	 */
	function _extractVariablesForTemplateResolver(me) {
		var emailTemplates = me.reader.emailTemplates(me.widgetConf) || [];
		var variables = {};

		for (var i=0, l=emailTemplates.length, t=null; i<l; ++i) {
			t = emailTemplates[i];
			for (var key in t) {
				variables[key + (i+1)] = t[key];
			}
		}

		return variables;
	}
})();