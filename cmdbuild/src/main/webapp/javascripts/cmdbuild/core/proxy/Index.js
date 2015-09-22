(function() {

	/**
	 * A class that works as index of all proxies urls
	 */
	Ext.define('CMDBuild.core.proxy.Index', {
		alternateClassName: ['CMDBuild.ServiceProxy.url', 'CMDBuild.core.proxy.Index'], // Legacy class name

		singleton: true,

		attachments: {
			getAttachmentList: 'services/json/attachments/getattachmentlist'
		},

		attribute: {
			create: '',
			read: 'services/json/schema/modclass/getattributelist',
			update: 'services/json/schema/modclass/saveattribute',
			remove: 'services/json/schema/modclass/deleteattribute',

			reorder: 'services/json/schema/modclass/reorderattribute',
			updateSortConfiguration: 'services/json/schema/modclass/saveordercriteria'
		},

		card: {
			create: '',
			read: 'services/json/management/modcard/getcard',
			update: 'services/json/management/modcard/updatecard',
			remove: 'services/json/management/modcard/deletecard',

			bulkUpdate: 'services/json/management/modcard/bulkupdate',
			bulkUpdateFromFilter: 'services/json/management/modcard/bulkupdatefromfilter',
			getList: 'services/json/management/modcard/getcardlist',
			getListShort: 'services/json/management/modcard/getcardlistshort',
			getPosition: 'services/json/management/modcard/getcardposition'
		},

		classes: {
			create: 'services/json/schema/modclass/savetable', // TODO: waiting for refactor (crud)
			read: '', // TODO: waiting for refactor (crud)
			update: 'services/json/schema/modclass/savetable', // TODO: waiting for refactor (crud)
			remove: 'services/json/schema/modclass/deletetable',

			readAll: 'services/json/schema/modclass/getallclasses',

			cards: {
				lock: 'services/json/lock/lockcard',
				unlock: 'services/json/lock/unlockcard',
				unlockAll: 'services/json/lock/unlockall'
			}
		},

		csv: {
			clearSession: 'services/json/management/importcsv/clearsession',
			getCsvRecords: 'services/json/management/importcsv/getcsvrecords',
			readCsv: 'services/json/management/importcsv/readcsv',
			uploadCsv: 'services/json/management/importcsv/uploadcsv'
		},

		configuration: {
			getConfiguration: 'services/json/schema/setup/getconfiguration',
			getConfigurations: 'services/json/schema/setup/getconfigurations',
			saveConfiguration: 'services/json/schema/setup/saveconfiguration'
		},

		dataView: {
			readAll: 'services/json/viewmanagement/read', // TODO: waiting for refactor (rename on server)

			filter: {
				create: 'services/json/viewmanagement/createfilterview',
				read: '', // TODO: waiting for refactor (crud)
				update: 'services/json/viewmanagement/updatefilterview',
				remove: 'services/json/viewmanagement/deletefilterview',

				readAll: 'services/json/viewmanagement/readfilterview' // TODO: waiting for refactor (crud)
			},

			sql: {
				create: 'services/json/viewmanagement/createsqlview',
				read: '', // TODO: waiting for refactor (crud)
				update: 'services/json/viewmanagement/updatesqlview',
				remove: 'services/json/viewmanagement/deletesqlview',

				readAll: 'services/json/viewmanagement/readsqlview' // TODO: waiting for refactor (crud)
			}
		},

		domain: {
			create: 'services/json/schema/modclass/savedomain', // TODO: waiting for refactor (crud)
			read: '',
			update: 'services/json/schema/modclass/savedomain', // TODO: waiting for refactor (crud)
			remove: 'services/json/schema/modclass/deletedomain',

			readAll: 'services/json/schema/modclass/getalldomains',

			getDomainList: 'services/json/schema/modclass/getdomainlist'
		},

		email: {
			accounts:{
				remove: 'services/json/schema/emailaccount/delete',
				get: 'services/json/schema/emailaccount/get',
				post: 'services/json/schema/emailaccount/post',
				put: 'services/json/schema/emailaccount/put',

				getStore: 'services/json/schema/emailaccount/getall',
				getStoreColumns: '',
				setDefault: 'services/json/schema/emailaccount/setdefault'
			},

			attachment: {
				copy: 'services/json/email/attachment/copy',
				download: 'services/json/email/attachment/download',
				readAll: 'services/json/email/attachment/readall',
				remove: 'services/json/email/attachment/delete',
				upload: 'services/json/email/attachment/upload'
			},

			queue: {
				configuration: 'services/json/email/queue/configuration',
				configure: 'services/json/email/queue/configure',
				running: 'services/json/email/queue/running',
				start: 'services/json/email/queue/start',
				stop: 'services/json/email/queue/stop'
			},

			templates:{
				remove: 'services/json/email/template/delete',
				get: 'services/json/email/template/read',
				post: 'services/json/email/template/create',
				put: 'services/json/email/template/update',

				getStore: 'services/json/email/template/readall'
			},

			remove: 'services/json/email/email/delete',
			get: 'services/json/email/email/read',
			post: 'services/json/email/email/create',
			put: 'services/json/email/email/update',

			enabled: 'services/json/email/email/enabled',
			getStore: 'services/json/email/email/readall'
		},

		fkTargetClass: 'services/json/schema/modclass/getfktargetingclass',

		filter: {
			create: 'services/json/filter/create',
			read: 'services/json/filter/read',
			remove: 'services/json/filter/delete',
			update: 'services/json/filter/update',

			groupStore: 'services/json/filter/readallgroupfilters',
			userStore: 'services/json/filter/readforuser',

			defaultForGroups: {
				read: 'services/json/filter/getgroups',
				update: 'services/json/filter/setdefault'
			}
		},

		functions: {
			getFunctions: 'services/json/schema/modclass/getfunctions'
		},

		group: {
			create: 'services/json/schema/modsecurity/savegroup', // TODO: waiting for refactor (crud)
			read: '',
			remove: '',
			update: 'services/json/schema/modsecurity/savegroup', // TODO: waiting for refactor (crud)

			enableDisableGroup: 'services/json/schema/modsecurity/enabledisablegroup',
			getGroupList: 'services/json/schema/modsecurity/getgrouplist',
			getUiConfiguration: 'services/json/schema/modsecurity/getuiconfiguration',

			defaultFilters: {
				read: 'services/json/filter/getdefault',
				update: 'services/json/filter/setdefault',

				readAllGroupFilters: 'services/json/filter/readallgroupfilters'
			},

			users: {
				getGroupUserList: 'services/json/schema/modsecurity/getgroupuserlist',
				saveGroupUserList: 'services/json/schema/modsecurity/savegroupuserlist'
			},

			userInterface: {
				getGroupUiConfiguration: 'services/json/schema/modsecurity/getgroupuiconfiguration',
				saveGroupUiConfiguration: 'services/json/schema/modsecurity/savegroupuiconfiguration'
			}
		},

		history: {
			classes: {
				getCardHistory: 'services/json/management/modcard/getcardhistory',
				getHistoricCard: 'services/json/management/modcard/gethistoriccard',
				getRelationsHistory: 'services/json/management/modcard/getrelationshistory',
				getHistoricRelation: 'services/json/management/modcard/gethistoricrelation'
			},
			processes: {
				getProcessHistory: 'services/json/management/modcard/getprocesshistory'
			}
		},

		localizations: {
			translation: {
				create: '',
				read: 'services/json/schema/translation/read',
				remove: '',
				update: 'services/json/schema/translation/update',

				readAll: 'services/json/schema/translation/readall'
			},
			importExport: {
				exportCsv: 'services/json/schema/translation/exportcsv',
				importCsv: 'services/json/schema/translation/importcsv'
			}
		},

		login: 'services/json/login/login',

		lookup: {
			disable: 'services/json/schema/modlookup/disablelookup',
			enable: 'services/json/schema/modlookup/enablelookup',
			getList: 'services/json/schema/modlookup/getlookuplist',
			getParentList: 'services/json/schema/modlookup/getparentlist',
			save: 'services/json/schema/modlookup/savelookup',
			saveType: 'services/json/schema/modlookup/savelookuptype',
			setOrder: 'services/json/schema/modlookup/reorderlookup',
			tree: 'services/json/schema/modlookup/tree'
		},

		menu: {
			create: '',
			read: 'services/json/schema/modmenu/getassignedmenu',
			update: 'services/json/schema/modmenu/savemenu',
			remove: 'services/json/schema/modmenu/deletemenu',

			readConfiguration: 'services/json/schema/modmenu/getmenuconfiguration',
			readAvailableItems: 'services/json/schema/modmenu/getavailablemenuitems'
		},

		navigationTrees: {
			get: 'services/json/navigationtree/get',
			read: 'services/json/navigationtree/read',
			create: 'services/json/navigationtree/create',
			save: 'services/json/navigationtree/save',
			remove: 'services/json/navigationtree/remove'
		},

		privileges: {
			classes: {
				read: 'services/json/schema/modsecurity/getclassprivilegelist',
				update: 'services/json/schema/modsecurity/saveclassprivilege',

				clearRowAndColumnPrivileges: 'services/json/schema/modsecurity/clearrowandcolumnprivileges',
				setRowAndColumnPrivileges: 'services/json/schema/modsecurity/setrowandcolumnprivileges',
				loadClassUiConfiguration: 'services/json/schema/modsecurity/loadclassuiconfiguration',
				saveClassUiConfiguration: 'services/json/schema/modsecurity/saveclassuiconfiguration'
			},
			dataView: {
				read: 'services/json/schema/modsecurity/getviewprivilegelist',
				update: 'services/json/schema/modsecurity/saveviewprivilege'
			},
			filter: {
				read: 'services/json/schema/modsecurity/getfilterprivilegelist',
				update: 'services/json/schema/modsecurity/savefilterprivilege'
			}
		},

		processes: {
			instances: {
				lock: 'services/json/lock/lockactivity',
				unlock: 'services/json/lock/unlockactivity'
			}
		},

		relations: {
			create: 'services/json/management/modcard/createrelations',
			read: 'services/json/management/modcard/getrelationlist',
			update: 'services/json/management/modcard/modifyrelation',
			remove: 'services/json/management/modcard/deleterelation',

			removeDetail: 'services/json/management/modcard/deletedetail',
			getAlreadyRelatedCards: 'services/json/management/modcard/getalreadyrelatedcards'
		},

		reports: {
			jasper: {
				create: 'services/json/management/modreport/createreportfactory',
				read: '',
				update: '',
				remove: 'services/json/schema/modreport/deletereport',
				save: 'services/json/schema/modreport/savejasperreport',

				analyze: 'services/json/schema/modreport/analyzejasperreport',
				getReportsByType: 'services/json/management/modreport/getreportsbytype',
				import: 'services/json/schema/modreport/importjasperreport',
				resetSession: 'services/json/schema/modreport/resetsession'
			},
			print: {
				cardDetails: 'services/json/management/modreport/printcarddetails',
				classSchema: 'services/json/schema/modreport/printclassschema',
				currentView: 'services/json/management/modreport/printcurrentview',
				schema: 'services/json/schema/modreport/printschema'
			},
			createReportFactory: 'services/json/management/modreport/createreportfactory',
			createReportFactoryByTypeCode: 'services/json/management/modreport/createreportfactorybytypecode',
			getReportTypesTree: 'services/json/management/modreport/getreporttypestree',
			getReportsByType: 'services/json/management/modreport/getreportsbytype',
			menuTree: 'services/json/schema/modreport/menutree',

			print: {
				cardDetails: 'services/json/management/modreport/printcarddetails',
				classSchema: 'services/json/schema/modreport/printclassschema',
				currentView: 'services/json/management/modreport/printcurrentview',
				schema: 'services/json/schema/modreport/printschema'
			},

			printReportFactory: 'services/json/management/modreport/printreportfactory',
			updateReportFactoryParams: 'services/json/management/modreport/updatereportfactoryparams'
		},

		tasks: {
			getStore: 'services/json/schema/taskmanager/readall',
			start: 'services/json/schema/taskmanager/start',
			stop: 'services/json/schema/taskmanager/stop',

			connector: {
				remove: 'services/json/schema/taskmanager/connector/delete',
				get: 'services/json/schema/taskmanager/connector/read',
				post: 'services/json/schema/taskmanager/connector/create',
				put: 'services/json/schema/taskmanager/connector/update',

				getStore: 'services/json/schema/taskmanager/connector/readall',
				getSqlSources: 'services/json/schema/taskmanager/connector/availablesqlsources'
			},
			email: {
				remove: 'services/json/schema/taskmanager/reademail/delete',
				get: 'services/json/schema/taskmanager/reademail/read',
				post: 'services/json/schema/taskmanager/reademail/create',
				put: 'services/json/schema/taskmanager/reademail/update',

				getStore: 'services/json/schema/taskmanager/reademail/readall'
			},
			event: {
				getStore: 'services/json/schema/taskmanager/event/readall',

				asynchronous: {
					remove: 'services/json/schema/taskmanager/event/asynchronous/delete',
					get: 'services/json/schema/taskmanager/event/asynchronous/read',
					post: 'services/json/schema/taskmanager/event/asynchronous/create',
					put: 'services/json/schema/taskmanager/event/asynchronous/update',

					getStore: 'services/json/schema/taskmanager/event/asynchronous/readall'
				},
				synchronous: {
					remove: 'services/json/schema/taskmanager/event/synchronous/delete',
					get: 'services/json/schema/taskmanager/event/synchronous/read',
					post: 'services/json/schema/taskmanager/event/synchronous/create',
					put: 'services/json/schema/taskmanager/event/synchronous/update',

					getStore: 'services/json/schema/taskmanager/event/synchronous/readall'
				}
			},
			workflow: {
				remove: 'services/json/schema/taskmanager/startworkflow/delete',
				get: 'services/json/schema/taskmanager/startworkflow/read',
				post: 'services/json/schema/taskmanager/startworkflow/create',
				put: 'services/json/schema/taskmanager/startworkflow/update',

				getStore: 'services/json/schema/taskmanager/startworkflow/readall',
				getStoreByWorkflow: 'services/json/schema/taskmanager/startworkflow/readallbyworkflow'
			}
		},

		user: {
			disable: 'services/json/schema/modsecurity/disableuser',
			getGroupList: 'services/json/schema/modsecurity/getusergrouplist',
			getList: 'services/json/schema/modsecurity/getuserlist',
			save: 'services/json/schema/modsecurity/saveuser'
		},

		utils: {
			clearCache: 'services/json/utils/clearcache',
			generateId: 'services/json/utils/generateid',
			getLanguage: 'services/json/utils/getlanguage',
			listAvailableTranslations: 'services/json/utils/listavailabletranslations'
		},

		widgets: {
			grid: {
				getSqlCardList: 'services/json/management/modcard/getsqlcardlist'
			}
		},

		workflow: {
			abortProcess: 'services/json/workflow/abortprocess',
			getActivityInstance: 'services/json/workflow/getactivityinstance',
			getStartActivity: 'services/json/workflow/getstartactivity',
			isProcessUpdated: 'services/json/workflow/isprocessupdated',
			saveActivity: 'services/json/workflow/saveactivity',
			synchronize: 'services/json/workflow/sync',
			xpdlDownload: 'services/json/workflow/downloadxpdl',
			xpdlDownloadTemplate: 'services/json/workflow/downloadxpdltemplate',
			xpdlUpload: 'services/json/workflow/uploadxpdl',
			xpdlVersions: 'services/json/workflow/xpdlversions'
		}
	});

})();