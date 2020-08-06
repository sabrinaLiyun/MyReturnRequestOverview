function initModel() {
	var sUrl = "/sap/opu/odata/sap/ZCUSTOMER_RETURN/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}