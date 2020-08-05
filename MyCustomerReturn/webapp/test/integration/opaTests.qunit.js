/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"cn/bosch/MyCustomerReturn/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});
