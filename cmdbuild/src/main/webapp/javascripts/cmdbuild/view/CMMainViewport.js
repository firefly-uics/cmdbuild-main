(function() {
	var tr = CMDBuild.Translation.common.splash,
	
		credits = '<ul class="splashScreen_central">'
		+ '<li> <span class="splashBold"> <a href="http://www.tecnoteca.com" target="_blank"> Tecnoteca srl </a></span> '
		+ tr.design + ', '+tr.implementation+', '+ tr.maintainer +'</li>'
		+ '<li> <span class="splashBold"> <a href="http://www.comune.udine.it" target="_blank"> ' + tr.municipality + ' </a> </span> '+ tr.principal+'</li> '
		+ '<li> <span class="splashBold"> <a href="http://www.cogitek.it" target="_blank"> Cogitek srl</a> </span> '+ tr.consultant +' </li>'		
		+ '</ul>',

		splashText = '<div class="splashScreen_central">' + 
			'<div class="spalshMotto">Open Source Configuration and Management Database</div>' +
			'<span class="splashSubTitle copyright">Copyright &copy; Tecnoteca srl</span>' +
		'</div>',

		release = '<div id="splashScreen_version">' + CMDBuild.Translation.release + '</div>';

	Ext.define("CMDBuild.view.CMMainViewport", {
		extend: "Ext.Viewport",
		layout: 'border',
		renderTo: Ext.getBody(),
		cmFirstRender: true,
		cmPanels: [],
		cmAccordions: [],
		controllerType: "MainViewportController",
		statics: {
			showSplash: function(target, administration) {
				var txt = "";
				
				if (target) {
					if (!this.creditWin) {
						this.creditWin = new Ext.window.Window({
							closable: false,
							draggable: false,
							resizable: false
						});
					}

					this.theMask = target.getEl().mask();
					this.theMask.fadeIn({
						duration: 400,
						opacity: 0.8
					});

					this.theMask.on("click", function() {
						CMDBuild.view.CMMainViewport.hideSplash();
					});

					txt = credits;
					this.theWin = this.creditWin;

				} else {
					if (!this.splash) {
						this.splash = new Ext.window.Window({
							modal: true,
							closable: false,
							draggable: false,
							resizable: false
						});
					}

					txt = splashText;
					this.theWin = this.splash;
				}
				
				if (!this.imageCls) {
					this.imageCls = "splashScreen_image" + (administration ? "_administration" : "");
				}

				this.theWin.update('<div class="' + this.imageCls + '">' + txt + release + '</div>');

				this.theWin.show();
				return this;
			},

			hideSplash: function() {

				if (this.theMask) {
					this.theMask.fadeOut({
						remove: true
					});
				}

				if (this.theWin) {
					this.theWin.hide();
				}

				// show the header and the footer, that are initially hidden
				var divs = Ext.DomQuery.select("div[class=cm_no_display]");
				for (var i=0, l=divs.length; i<l; ++i) {
					divs[i].setAttribute("class", "");
				}

				return this;
			}
		},

		initComponent : function() {
			this.splash = null;
			this.cmAccordions = Ext.create("Ext.panel.Panel", {
				padding: "5 0 5 5",
				region: 'west',
				split: true,
				collapsible: true, 
				collapseMode: 'mini',
				preventHeader: true,
				layout: "accordion",
				layoutConfig: {
					animate: false
				},
				items: this.cmAccordions,
				frame: false,
				border: true,
				width: 200
			});

			this.cmPanels = new Ext.panel.Panel({
				padding: "5 5 5 0",
				region: 'center',
				layout: "card",
				items: this.cmPanels,
				frame: false,
				border: false
			});

			this.header = new Ext.panel.Panel({
				border: true,
				region: "north",
				height: 45,
				contentEl: "header"
			});

			this.footer= new Ext.panel.Panel({
				border: true,
				region: "south",
				height: 18,
				contentEl: "footer"
			});

			this.items = [this.cmAccordions,this.cmPanels, this.header, this.footer];
			this.border = false;
			
			this.callParent(arguments);
            
            var creditsLink = Ext.get('cmdbuild_credits_link');
            creditsLink.on('click', function(e) {
                CMDBuild.view.CMMainViewport.showSplash(this);
            }, this);
		},

		/*
		 * Take a function as parameter
		 * iterate over the cmAccordions and call the given
		 * function with the current accordion as parameter
		 */
		foreachAccordion: function(fn, scope) {
			if (typeof fn == "undefined") {
				throw "CMMainViewport.foreachAccordion must have a function as parameter";
			}
			this.cmAccordions.items.each(fn, scope)
		},
		/*
		 * Take a function as parameter
		 * iterate over the cmPanels and call the given
		 * function with the current accordion as parameter
		 */
		foreachPanel: function(fn, scope) {
			if (typeof fn == "undefined") {
				throw "CMMainViewport.foreachPanel must have a function as parameter";
			}
			this.cmPanels.items.each(fn, scope)
		},
		/*
		 * Search in the cmPanels the given name
		 * and bring it to front
		 */
		bringTofrontPanelByCmName: function(cmName, params, silent) {
			var p = this.findModuleByCMName(cmName),
				activatePanel;

			if (p) {
				activatePanel = (typeof p.beforeBringToFront != "function" || p.beforeBringToFront(params) !== false);
				if (activatePanel) {
					this.cmPanels.layout.setActiveItem(p.id);
				}
				if (silent !== true) {
					p.fireEvent("CM_iamtofront", params);
				}
			}
			return activatePanel;
		},

		deselectAccordionByName: function(cmName) {
			var a = this.findAccordionByCMName(cmName);

			var sm = a.getSelectionModel();
			sm.deselect(sm.getSelection());
		},

		findAccordionByCMName: function(cmName) {
			return this.cmAccordions.items.findBy(function(accordion) {
				return accordion.cmName == cmName;
			});
		},

		findModuleByCMName: function(cmName) {
			return this.cmPanels.items.findBy(function(panel) {
				return panel.cmName == cmName;
			});
		},

		disableAccordionByName: function(cmName) {
			var a = this.findAccordionByCMName(cmName);
			a.disable();
		},

		enableAccordionByName: function(cmName) {
			var a = this.findAccordionByCMName(cmName);
			a.enable();
		},
		
		getExpansedAccordion: function() {
			return this.cmAccordions.items.findBy(function(accordion) {
				return (!accordion.collapsed);
			});
		},

		getFirstAccordionWithANodeWithGivenId: function(id) {
			var currentAccordion = this.getExpansedAccordion();
			if (currentAccordion && typeof currentAccordion.getNodeById(id) != "undefined") {
				return currentAccordion;
			} else {
				return this.cmAccordions.items.findBy(function(accordion) {
					return (typeof accordion.getNodeById(id) != "undefined");
				});
			}
		},

		getFirstAccordionWithASelectableNode: function() {
			var a = null;

			this.foreachAccordion(function(accordion) {
				if (a == null) {
					var firstSelectableNode = accordion.getFirtsSelectableNode();
					if (firstSelectableNode) {
						a = accordion;
					}
				}
			});

			return a;
		}
	});
})();