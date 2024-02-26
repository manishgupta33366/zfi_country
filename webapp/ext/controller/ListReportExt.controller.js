sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox"
], function(MessageToast, Fragment, MessageBox) {
    'use strict';

    return {
        handleMassUploadBtnPress: function(oEvent) {
            if (!this.massUploadDialog) {
                // If the dialog has not been loaded, load it
                Fragment.load({
                    name: "zficountry.ext.fragments.MassUploadDialog",
                    id: "massUploadFragmentDialog",
                    controller: this
                }).then(function(oDialog){
                    this.getView().addDependent(oDialog);
                    this.massUploadDialog = oDialog; // Store the dialog reference
                    oDialog.open();
                }.bind(this));
            } else {
                // If the dialog has already been loaded, just open the existing dialog
                this.massUploadDialog.open();
            }
        },
        handleUploadPress: function(oEvent){
            var oFileUploader = Fragment.byId("massUploadFragmentDialog", "fileUploaderDialog").getContent()[0];
            oFileUploader.clear();
            var requestData = {
                ItemRelation: "0001",
                Hdr1ToCountry: this._fileProcessedData
            }
            var oModel = this.getView().getModel("massDataUpload");
            var sUrl = "/Hdr1Set('1')?$expand=Hdr1ToCountry";
            
            oModel.create(sUrl, requestData, {
            success: function(oData, oResponse) {
                console.log("POST request successful:", oData);
            },
            error: function(oError) {
                console.error("Error making POST request:", oError);
            }
            });
        },
        onFileChange: function(oEvent){
			var vFiles = oEvent.getParameter("files");
            if(vFiles[0] === undefined){
                return;
            }
			var vFileName = vFiles[0].name;
			var vExt = vFileName.substring(vFileName.lastIndexOf(".")).toUpperCase();
			if (vExt == '.XLS' || vExt == '.XLSX') 
				this._excelFileToJSON(vFiles[0]);
			else {
				MessageBox.error(this.getView().getModel("i18n").getProperty("invalidFile"));
                oEvent.getSource().setValue('');
             }
		},
        onClosePress: function(){
            this.massUploadDialog.close();
        },
        _excelFileToJSON: function(file){
			var _that = this;
    		try {
    			var reader = new FileReader();
    			reader.readAsBinaryString(file);
			    reader.onload = function(e) {

					var data = e.target.result,fileJSONData;
					var workbook = XLSX.read(data, {
						type : 'binary'
			        });
					var result = {};
			        workbook.SheetNames.forEach(function(sheetName) {
			        	var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
			            	if (roa.length > 0) {
			                	result[sheetName] = roa;
			                	fileJSONData = result[sheetName];
			            	}
			        	});
                            
                        if(fileJSONData === undefined){
                            MessageBox.error(_that.getView().getModel("i18n").getProperty("noDataInFile"));
                            return;
                        }
                        _that._fileProcessedData = fileJSONData;
			        }
			} catch(e) {
				MessageBox.error(e);
			}
		}
    };
});