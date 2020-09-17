sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function (BaseController, MessageBox, Utilities, History) {
	"use strict";
	return BaseController.extend("SAPUI5MyReturnOrder.MyReturnOrderAPP.controller.CreateReturnOrder", {
		/**
		 * Called when the worklist controller is instantiated.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("TargetCreateReturnOrder").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
		},
		/**
		 * Called by onInit
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		handleRouteMatched: function (oEvent) {},
		/**
		 * Called when customer is selected.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onSelectChange: function (event) {
			var oCustomerCode = event.getParameter("selectedItem").getKey();
			var afilters = [];
			afilters.push(new sap.ui.model.Filter("Customer",
				sap.ui.model.FilterOperator.EQ, oCustomerCode));

			var oModel = this.getView().getModel();
			oModel.read("/CustomerData", {
				filters: afilters,
				success: function (oData) {
					var data = oData.results[0];
					var CustomerDes = data.CustomerName;
					//	console.log(CustomerDes);
					this.getView().byId("Text1").setText(CustomerDes);
				}.bind(this)
			});
			var oValidatedComboBox = event.getSource();
			oValidatedComboBox.setValueState("None");

		},
			/**
		 * Called when sales area is selected.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onSelectChangeSalesArea: function (event) {
			var oValidatedComboBox = event.getSource();
			oValidatedComboBox.setValueState("None");
			},
			
		/**
		 * Called when return reason is selected
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onHandleChange: function (oEvent) {
			var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				sValue = oValidatedComboBox.getValue();
			if (!sSelectedKey && sValue) {
				oValidatedComboBox.setValueState("Error");
				oValidatedComboBox.setValueStateText("Please select valid value!");
			} else {
				oValidatedComboBox.setValueState("None");
			}
		},
		/**
		 * Called when refund yype is selected
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onHandleChangeSpecial: function (oEvent) {
			var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				sValue = oValidatedComboBox.getValue();
			if (sValue === "Credit Memo") {
				oValidatedComboBox.setValueState("None");
			} else if (!sSelectedKey && sValue) {
				oValidatedComboBox.setValueState("Error");
				oValidatedComboBox.setValueStateText("Please select valid value!");
			} else {
				oValidatedComboBox.setValueState("None");
			}
		},
		/**
		 * Called when back button is clicked
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onPageBackPress: function () {
			this.onClear();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("RouteReturnOrders", true);
		},
		/**
		 * Called when cancel button is clicked
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onCancel: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var that = this;
			return new Promise(function (fnResolve) {
				sap.m.MessageBox.confirm("This page contains unsaved data. Do you really want to exit?", {
					title: "Cancel",
					actions: ["Yes", "No"],
					onClose: function (sActionClicked) {
						if (sActionClicked === "Yes") {
							that.onClear();
							oRouter.navTo("RouteReturnOrders", true);
						}
					}
				});
			}).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err);
				}
			});

		},
		/**
		 * Called when save button is clicked
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onSave: function () {
			var sReturnReasonText;
			var sRefundTypeText;
			var sMaterial, sQuantity, sReturnReasonCode, sRefundTypeCode;
			var oItems = this.byId("oTableCreate").getItems();
			var aArray = [];
			var sCustomerNo = this.byId("Combox_CustomerID").getSelectedKey();
			var sSalesArea = this.byId("Combox_SalesAreaID").getSelectedKey();
			var sErrorInput = "No";
			var sResponsivePaddingClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer";
			//          Check if customer and sales area are filled		
			if (!sCustomerNo) {
				this.byId("Combox_CustomerID").setValueState("Error");
				this.byId("Combox_CustomerID").setValueStateText("Please select valid value!");
				sErrorInput = "Yes";
			} else {
				this.byId("Combox_CustomerID").setValueState("None");
			}
			if (!sSalesArea) {
				this.byId("Combox_SalesAreaID").setValueState("Error");
				this.byId("Combox_SalesAreaID").setValueStateText("Please select valid value!");
				sErrorInput = "Yes";
			} else {
				this.byId("Combox_SalesAreaID").setValueState("None");
			}
			if (sErrorInput === "Yes") {
				return;
			}
			for (var i = 0; i < oItems.length; i++) {
				var oItem = oItems[i];
				sMaterial = oItem.getCells()[0].getValue();
				sQuantity = oItem.getCells()[2].getValue();
				sReturnReasonCode = oItem.getCells()[4].getSelectedKey();
				sRefundTypeCode = oItem.getCells()[5].getSelectedKey();
				sReturnReasonText = oItem.getCells()[4].getValue();
				sRefundTypeText = oItem.getCells()[5].getValue();
				if (sMaterial === "" && sQuantity === "" && sReturnReasonText === "" && sRefundTypeText === "") {
					continue;
				}
				if (sMaterial === "") {
					oItem.getCells()[0].setValueState("Error");
					oItem.getCells()[0].setValueStateText("Please input value!");
					sErrorInput = "Yes";
				} else {
					oItem.getCells()[0].setValueState("None");
				}
				if (sQuantity === "") {
					oItem.getCells()[2].setValueState("Error");
					oItem.getCells()[2].setValueStateText("Please input value!");
					sErrorInput = "Yes";
				} else {
					oItem.getCells()[2].setValueState("None");
				}
				if (sReturnReasonText === "") {
					oItem.getCells()[4].setValueState("Error");
					oItem.getCells()[4].setValueStateText("Please select valid value!");
					sErrorInput = "Yes";
				} else {
					if (!oItem.getCells()[4].getSelectedKey()) {
						oItem.getCells()[4].setValueState("Error");
						oItem.getCells()[4].setValueStateText("Please select valid value!");
						sErrorInput = "Yes";
					} else {
						oItem.getCells()[4].setValueState("None");
					}
				}
				if (sRefundTypeText === "") {
					oItem.getCells()[5].setValueState("Error");
					oItem.getCells()[5].setValueStateText("Please select valid value!");
					sErrorInput = "Yes";
				} else {
					// First selected line has blank key
					oItem.getCells()[5].setValueState("None");
				}
				if (sMaterial !== "" && sQuantity !== "" && sReturnReasonText !== "" && sRefundTypeText !== "") {
					aArray.push({
						"Material": sMaterial,
						"RequestedQuantity": sQuantity,
						"ReturnReason": sReturnReasonCode,
						"ReturnsRefundType": sRefundTypeCode,
						"RetsMgmtProcessingBlock": "B",
						"ReturnsRefundProcgMode": "P",
						"CustRetItmFollowUpActivity": "0001"
					});
				}
			}
			if (sErrorInput === "Yes") {
				return;
			}
			if (aArray.length === 0) {
				MessageBox.error("No items are filled");
			} else {
				var so = {
					"CustomerReturnType": "YRE2",
					"SalesOrganization": this.byId("Combox_SalesAreaID").getSelectedItem().getText().substring(0, 4),
					"DistributionChannel": this.byId("Combox_SalesAreaID").getSelectedItem().getText().substring(5, 7),
					"OrganizationDivision": this.byId("Combox_SalesAreaID").getSelectedItem().getText().substring(8, 10),
					"SoldToParty": this.byId("Combox_CustomerID").getSelectedItem().getText(),
					"SDDocumentReason": "001",
					"to_Item": {
						"results": aArray
					}
				};
				this.oModel = this.getView().getModel("ZRETURN_SAP");
				this.byId("oTableCreate").setBusy(true);
				this.oModel.create("/A_CustomerReturn", so, {
					refreshAfterChange: true,
					success: function (res) {
						this.byId("oTableCreate").setBusy(false);
						MessageBox.success("Return Order " + res.CustomerReturn + " was created successfully");
						this.onClear();
					}.bind(this),
					error: function (res) {
						this.byId("oTableCreate").setBusy(false);
						MessageBox.error("Failed.", {
							title: "Error",
							id: "messageBoxId2",
							details: JSON.parse(res.responseText).error.message.value,
							contentWidth: "100px",
							styleClass: sResponsivePaddingClasses
						});
					}.bind(this)
				});
			}
		},
		/**
		 * Called when add button is clicked
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onAdd: function (oAddEvent) {
			var that = this;
			var oItem = new sap.m.ColumnListItem({
				cells: [
					new sap.m.Input({
						change: function (oEvent) {
							that.onEnter(oEvent);
						}
					}),
					new sap.m.Text({
						text: ""
					}),
					new sap.m.Input(),
					new sap.m.Text({
						text: ""
					}),
					new sap.m.ComboBox({
						items: {
							path: "zreturn>/ReturnReasonText",
							template: new sap.ui.core.Item({
								key: "{zreturn>ReturnReason}",
								text: "{zreturn>ReturnReasonName}"
							})
						},
						change: function (oEvent) {
							that.onHandleChange(oEvent);
						}
					}),
					new sap.m.ComboBox({
						items: {
							path: "zreturn>/RefundTypeText",
							template: new sap.ui.core.Item({
								key: "{zreturn>ReturnsRefundType}",
								text: "{zreturn>RefundTypeDescription}"
							})
						},
						change: function (oEvent) {
							that.onHandleChangeSpecial(oEvent);
						}
					})
				]
			});
			var oTable = this.getView().byId("oTableCreate");
			oTable.addItem(oItem);
		},
		/**
		 * Called when Delete button is clicked
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onDelete: function (oEvent) {
			var oTable = this.getView().byId("oTableCreate");
			return new Promise(function (fnResolve) {
				sap.m.MessageBox.confirm("Do you want to delete it?", {
					title: "Delete",
					actions: ["Yes", "No"],
					onClose: function (sActionClicked) {
						if (sActionClicked === "Yes") {
							var sSelectItems = oTable.getSelectedItems();
							var i = 0;
							while (i < sSelectItems.length) {
								oTable.removeItem(sSelectItems[i]);
								i++;
							}
						}
					}
				});
			}).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err);
				}
			});
		},
		/**
		 * Clear all data on the Page
		 * @param no
		 * @public
		 */
		onClear: function () {
			this.byId("Combox_CustomerID").setSelectedKey("");
			this.byId("Combox_SalesAreaID").setSelectedKey("");
			this.byId("Text1").setText("");
			var oItems = this.byId("oTableCreate").getItems();
			var oTable = this.getView().byId("oTableCreate");
			oTable.removeSelections();
			for (var i = 0; i < oItems.length; i++) {
				var oItem = oItems[i];
				oItem.getCells()[0].setValue("");
				oItem.getCells()[1].setText("");
				oItem.getCells()[2].setValue("");
				oItem.getCells()[3].setText("");
				oItem.getCells()[4].setSelectedKey("");
				oItem.getCells()[5].setSelectedKey("");
				oItem.getCells()[0].setValueState("None");
				oItem.getCells()[2].setValueState("None");
				oItem.getCells()[4].setValueState("None");
				oItem.getCells()[5].setValueState("None");
				if (i > 9) {
					oTable.removeItem(oItem);
				}
			}
			this.byId("Combox_CustomerID").setValueState("None");
			this.byId("Combox_SalesAreaID").setValueState("None");
			var j = oItems.length;
			if (j < 10) {
				do {
					this.onAdd();
					j++;
				} while (j < 10);
			}
		},
		/**
		 * Called when enter event is trigger during cursor in material input 
		 * @param {sap.ui.base.Event} oEvent the update finished event 
		 * @public
		 */
		onEnter: function (oEvent) {
			var oRow = oEvent.getSource().getParent();
			var aCells = oRow.getCells();
			var afilters = [];
			var oModel = this.getView().getModel();
			var sMaterialDescrip;
			var sMaterial = aCells[0].getValue();
			if (sMaterial !== "") {
				afilters.push(
					new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, sMaterial),
							new sap.ui.model.Filter("Language", sap.ui.model.FilterOperator.EQ, "EN")
						],
						and: true
					})
				);
				oModel.read("/MaterialDescription", {
					filters: afilters,
					success: function (oData, response) {
						var data = oData.results[0];
						if (typeof data !== "undefined") {
							sMaterialDescrip = data.MaterialName;
							aCells[1].setText(sMaterialDescrip);
							aCells[3].setText("PC");
							aCells[0].setValueState("None");
						} else {
							aCells[0].setValueState("Error");
							aCells[0].setValueStateText("Please input valid value!");
							aCells[1].setText("");
							aCells[3].setText("");
						}
					},
					error: function (oErr) {
						this.console.log("Material read failed");
						aCells[0].setValueState("Error");
						aCells[0].setValueStateText("Please input valid value!");
					}
				});
			} else {
				aCells[0].setValueState("None");
			}
		}
	});
}, /* bExport= */ true);