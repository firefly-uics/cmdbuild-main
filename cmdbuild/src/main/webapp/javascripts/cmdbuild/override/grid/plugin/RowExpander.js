(function () {

	Ext.define('CMDBuild.override.grid.plugin.RowExpander', {
		override: 'Ext.grid.plugin.RowExpander',

		/**
		 * @returns {Void}
		 */
		collapseAll: function () {
			Ext.Array.forEach(this.grid.getStore().getRange(), function (record, i, allRecords) {
				if (this.recordsExpanded[record.internalId])
					this.toggleRow(record.index, record);
			}, this);
		},

		/**
		 * Fix for collapseAll() on filtered store that try to collapse a node that is hided from filter function - 20/01/2017
		 *
		 * @param {Number} rowIdx
		 * @param {Ext.data.Model} record
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		toggleRow: function (rowIdx, record) {
			var rowNode = this.view.getNode(rowIdx),
				row = Ext.fly(rowNode, '_rowExpander'),
				nextBd = Ext.isEmpty(row) ? null : row.down(this.rowBodyTrSelector, true),
				isCollapsed = Ext.isEmpty(row) ? false : row.hasCls(this.rowCollapsedCls),
				addOrRemoveCls = isCollapsed ? 'removeCls' : 'addCls', rowHeight;

			if (Ext.isObject(row) && !Ext.Object.isEmpty(row)) {
				Ext.suspendLayouts();

				row[addOrRemoveCls](this.rowCollapsedCls);

				Ext.fly(nextBd)[addOrRemoveCls](this.rowBodyHiddenCls);

				this.recordsExpanded[record.internalId] = isCollapsed;

				this.view.refreshSize();
				this.view.fireEvent(isCollapsed ? 'expandbody' : 'collapsebody', row.dom, record, nextBd);

				if (this.grid.ownerLockable) {
					this.view = this.grid.ownerLockable.lockedGrid.view;

					rowHeight = row.getHeight();

					row = Ext.fly(this.view.getNode(rowIdx), '_rowExpander');
					row.setHeight(rowHeight);

					row[addOrRemoveCls](this.rowCollapsedCls);

					this.view.refreshSize();
				}

				Ext.resumeLayouts(true);
			}
		},
	});

})();

