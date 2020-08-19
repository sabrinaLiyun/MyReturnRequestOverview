sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function (BaseController, MessageBox, Utilities, History) {
	"use strict";

	return BaseController.extend("SAPUI5MyReturnOrder.MyReturnOrderAPP.controller.CreateReturnOrder", {
		handleRouteMatched: function (oEvent) {
			var sAppId = "App5f155bcb6d338e01cd7c2169";

			var oParams = {};

			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;

			} else {
				if (this.getOwnerComponent().getComponentData()) {
					var patternConvert = function (oParam) {
						if (Object.keys(oParam).length !== 0) {
							for (var prop in oParam) {
								if (prop !== "sourcePrototype" && prop.includes("Set")) {
									return prop + "(" + oParam[prop][0] + ")";
								}
							}
						}
					};

					this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);

				}
			}

			var oPath;

			if (this.sContext) {
				oPath = {
					path: "/" + this.sContext,
					parameters: oParams
				};
				this.getView().bindObject(oPath);
			}

		},

		_onComboChange: function (event) {
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

		},

		_onPageNavButtonPress: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var oQueryParams = this.getQueryParameters(window.location);

			if (sPreviousHash !== undefined || oQueryParams.navBackToLaunchpad) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("default", true);
			}

		},
		getQueryParameters: function (oLocation) {
			var oQuery = {};
			var aParams = oLocation.search.substring(1).split("&");
			for (var i = 0; i < aParams.length; i++) {
				var aPair = aParams[i].split("=");
				oQuery[aPair[0]] = decodeURIComponent(aPair[1]);
			}
			return oQuery;

		},
		_onButtonPress: function () {
			return new Promise(function (fnResolve) {
				var sTargetPos = "center center";
				sTargetPos = (sTargetPos === "default") ? undefined : sTargetPos;
				sap.m.MessageToast.show("Return Order was created successfully", {
					onClose: fnResolve,
					duration: 3000 || 3000,
					at: sTargetPos,
					my: sTargetPos
				});
			}).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onButtonPress1: function () {
			return new Promise(function (fnResolve) {
				sap.m.MessageBox.confirm("This page contains unsaved data. Do you really want to exit?", {
					title: "Cancel",
					actions: ["Yes", "No"],
					onClose: function (sActionClicked) {
						fnResolve(sActionClicked === "Yes");
						if (sActionClicked === "Yes") {
							window.history.go(-1);
						}

					}
				});
			}).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err);
				}
			});

		},
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("TargetCreateReturnOrder").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

		},
		onSave: function () {
			var c3Text;
			var c4Text;
			var c1, c2, c3, c4;
			var items = this.byId("oTableCreate").getItems();
			var aArray = [];
			var sCustomerNo = this.byId("Combox_CustomerID").getSelectedKey();
			var sSalesArea = this.byId("Combox_SalesAreaID").getSelectedKey();
			if (!sCustomerNo) {
				this.byId("Combox_CustomerID").setValueState("Error");
				this.byId("Combox_CustomerID").setValueStateText("Please select valid value!");
				return;
			} else {
				this.byId("Combox_CustomerID").setValueState("None");
			}
			if (!sSalesArea) {
				this.byId("Combox_SalesAreaID").setValueState("Error");
				this.byId("Combox_SalesAreaID").setValueStateText("Please select valid value!");
				return;
			} else {
				this.byId("Combox_SalesAreaID").setValueState("None");
			}
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				c1 = item.getCells()[0].getValue();
				c2 = item.getCells()[2].getValue();
				c3 = item.getCells()[4].getSelectedKey();
				c4 = item.getCells()[5].getSelectedKey();
				c3Text = item.getCells()[4].getValue();
				c4Text = item.getCells()[5].getValue();
				if (c1 != "" && c2 != "" && c3Text != "" && c4Text != "") {
					aArray.push({
						"Material": c1,
						"RequestedQuantity": c2,
						"ReturnReason": c3,
						"ReturnsRefundType": c4,
						"RetsMgmtProcessingBlock": "B"
					});
				}

			}
			if (aArray == "") {
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
						MessageBox.error("Create return order failed");
					}
				});
			}
		},

		onAdd: function (oEvent) {
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
						}
					}),
					new sap.m.ComboBox({
						items: {
							path: "zreturn>/RefundTypeText",
							template: new sap.ui.core.Item({
								key: "{zreturn>ReturnsRefundType}",
								text: "{zreturn>RefundTypeDescription}"
							})
						}
					})
				]
			});
			var oTable = this.getView().byId("oTableCreate");
			oTable.addItem(oItem);
		},
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

		onClear: function () {
			this.byId("Combox_CustomerID").setSelectedKey("");
			this.byId("Combox_SalesAreaID").setSelectedKey("");
			this.byId("Text1").setText("");
			var items = this.byId("oTableCreate").getItems();
			for (var i = 0; i < items.length; i++) {
				var item = items[i];

				item.getCells()[0].setValue("");
				item.getCells()[1].setText("");
				item.getCells()[2].setValue("");
				item.getCells()[3].setText("");
				item.getCells()[4].setSelectedKey("");
				item.getCells()[5].setSelectedKey("");
			}
		},

		onTest: function (oEvent) {
			this.byId("Combox_CustomerID").setSelectedKey("");
			this.byId("Combox_SalesAreaID").setSelectedKey("");
			var items = this.byId("oTableCreate").getItems();
			for (var i = 0; i < items.length; i++) {
				var item = items[i];

				item.getCells()[0].setValue("");
				item.getCells()[2].setValue("");
				item.getCells()[4].setSelectedKey("");
				item.getCells()[5].setSelectedKey("");
			}

		},
		onEnter: function (oEvent) {
			var oRow = oEvent.getSource().getParent();
			var aCells = oRow.getCells();
			var afilters = [];
			var oModel = this.getView().getModel();
			var mDes;
			var cMaterial = aCells[0].getValue();
			if (cMaterial != "") {
				afilters.push(
					new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, cMaterial),
							new sap.ui.model.Filter("Language", sap.ui.model.FilterOperator.EQ, "EN")
						],
						and: true
					})
				);
				oModel.read("/MaterialDescription", {
					filters: afilters,
					success: function (oData, response) {
						var data = oData.results[0];
						mDes = data.MaterialName;
						aCells[1].setText(mDes);
					},
					error: function (oErr) {
						this.console.log("Failed");
					}
				});
				aCells[3].setText("PC");
			}
		}
	});
}, /* bExport= */ true);