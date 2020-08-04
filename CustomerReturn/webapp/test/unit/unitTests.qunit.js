/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"cn/bosch/CustomerReturn/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
