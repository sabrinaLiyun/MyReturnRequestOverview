sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, MessageBox, Utilities, History,Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("SAPUI5MyReturnOrder.MyReturnOrderAPP.controller.ReturnOrderItems", {
			onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("TargetReturnOrderItems").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

		},
		
		handleRouteMatched: function (oEvent) {
			var oTransfer = oEvent.getParameters().data;
			this.fnFilterTable(oTransfer.OrderNo);
			
			var oResourceModel = new sap.ui.model.json.JSONModel();

			var oParams = {};

			let path = `/CustomerREturn('${oTransfer.OrderNo}')`; ///CustomerREturn('60000006')*/
			//var path = "/CustomerREturn('${oTransfer.OrderNo}')";

			var selectedOrder = this.getView().getModel().getProperty(path);

			oParams.OrderNo = oTransfer.OrderNo;
			oParams.SalesOrg = selectedOrder.SalesOrganization;
			oParams.CustomerNo = selectedOrder.SoldToParty;
			oParams.CustName = selectedOrder.CustomerName;
			oParams.DC = selectedOrder.DistributionChannel;
			oParams.Division = selectedOrder.OrganizationDivision;
		//	console.log("Order", selectedOrder);
			oParams.CreationDate = selectedOrder.CreationDate;
			oParams.ResponseDate = selectedOrder.ResponseDate;
			oParams.Status = selectedOrder.ApprovalStatusDesc;

			oResourceModel.setDefaultBindingMode("TwoWay");
			oResourceModel.setData(oParams);
			this.getView().setModel(oResourceModel, "OrderResource");

		},
		
		fnFilterTable: function (sFilter) {
			//Build filter array
			var oFilterValues = [];
			if (sFilter !== "") {
				oFilterValues.push(new Filter("CustomerReturn", FilterOperator.EQ, sFilter));
			}
			// console.log(sFilter);
			//Filter binding
			var oList = this.byId("idItemTable");
			var oBinding = oList.getBinding("items");
			oBinding.filter(oFilterValues);
		},
		
			_onFioriListReportTableUpdateFinished: function(oEvent) {
			var oTable = oEvent.getSource();
			var oHeaderbar = oTable.getAggregation("headerToolbar");
			if (oHeaderbar && oHeaderbar.getAggregation("content")[1]) {
				var oTitle = oHeaderbar.getAggregation("content")[1];
				if (oTable.getBinding("items") && oTable.getBinding("items").isLengthFinal()) {
					oTitle.setText("(" + oTable.getBinding("items").getLength() + ")");
				} else {
					oTitle.setText("(1)");
				}
			}

		},
		
		
		formatValudationSatus: function (sValue) {
			var statusIcon;
			if (sValue === "Rejected") {
				statusIcon = "sap-icon://status-error";
			} else if (sValue === "Waiting for approval" || sValue === "Partially Approved") {
				statusIcon = "sap-icon://status-critical";
			} else if (sValue === "Approved") {
				statusIcon = "sap-icon://status-completed";
			}
			return statusIcon;
		},
		
		formatAvailableToObjectState: function (bAvailable) { 
			// return bAvailable ? "Error" : "Success";
			var vStatus;
			if (bAvailable === "Approved") {
				vStatus = "Success";
			} else if (bAvailable === "Waiting for approval") {
				vStatus = "Warning";
			}  else if (bAvailable === "Rejected") {
				vStatus = "Error";
			}  else if (bAvailable === "Partially Approved") {
				vStatus = "Warning";
			} 
			
			return vStatus;
		},
		
		_onPageNavButtonPress: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("RouteReturnOrders", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

			var sEntityNameSet;
			if (sPath !== null && sPath !== "") {
				if (sPath.substring(0, 1) === "/") {
					sPath = sPath.substring(1);
				}
				sEntityNameSet = sPath.split("(")[0];
			}
			var sNavigationPropertyName;
			var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

			if (sEntityNameSet !== null) {
				sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet,
					sRouteName);
			}
			if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
				if (sNavigationPropertyName === "") {
					this.oRouter.navTo(sRouteName, {
						context: sPath,
						masterContext: sMasterContext
					}, false);
				} else {
					oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function (bindingContext) {
						if (bindingContext) {
							sPath = bindingContext.getPath();
							if (sPath.substring(0, 1) === "/") {
								sPath = sPath.substring(1);
							}
						} else {
							sPath = "undefined";
						}

						// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
						if (sPath === "undefined") {
							this.oRouter.navTo(sRouteName);
						} else {
							this.oRouter.navTo(sRouteName, {
								context: sPath,
								masterContext: sMasterContext
							}, false);
						}
					}.bind(this));
				}
			} else {
				this.oRouter.navTo(sRouteName);
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}

		},
	
	});
}, /* bExport= */ true);