/*global QUnit*/

sap.ui.define([
	"SAPUI5MyReturnOrder/MyReturnOrderAPP/controller/ReturnOrders.controller"
], function (Controller) {
	"use strict";

	QUnit.module("ReturnOrders Controller");

	QUnit.test("I should test the ReturnOrders controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});