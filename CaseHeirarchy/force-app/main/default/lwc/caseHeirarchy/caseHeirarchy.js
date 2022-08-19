import { LightningElement,wire,api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getChildrenCases from '@salesforce/apex/getChildrenCases.getChildrenCasesParent';
import NAME_FIELD from '@salesforce/schema/Case.CaseNumber';
import SUBJECT_FIELD from '@salesforce/schema/Case.Subject';
import ORIGIN_FIELD from '@salesforce/schema/Case.Origin';

const COLS = [
	{ fieldName: NAME_FIELD.fieldApiName, label: "Case Number",type:'button',typeAttributes: { label: { fieldName: NAME_FIELD.fieldApiName }, name: "gotoCase", variant: "base" } },
	{ fieldName: SUBJECT_FIELD.fieldApiName, label: "Subject",type:'text' },
	{ fieldName: ORIGIN_FIELD.fieldApiName, label: "origin",type:'text' }
];

export default class CaseHeirarchy extends NavigationMixin(LightningElement) {

    @api
    recordId;
    
    gridColumns = COLS;
	isLoading = true;
	gridData = [];
    error
    numChildCase
    
    @wire(getChildrenCases,{recordID:'$recordId'})
    childCases({data,error}){
        if(error){
            this.error = error;
            this.gridData= undefined;
        }
        else if (data){
            this.error = undefined;
            this.gridData = data.map((caseItem) => ({
				_children: [],
				...caseItem,
			}));
			console.log(JSON.stringify(this.gridData));
            this.numChildCase=this.gridData.length > 0?false:true;
            this.isLoading = false;
        }

    }
    
    async handleOnToggle(event) {
		console.log(event.detail.name);
		console.log(event.detail.hasChildrenContent);
		console.log(event.detail.isExpanded);
		const rowName = event.detail.name;
    
		if (!event.detail.hasChildrenContent && event.detail.isExpanded) {
        
			this.isLoading = true;
        try{    
			let result = await getChildrenCases({ recordID: rowName })
			console.log(result);
		    if (result && result.length > 0) {
				const newChildren = result.map((child) => ({
							_children: [],
							...child
						}));
				this.gridData = this.getNewDataWithChildren(
							rowName,
							this.gridData,
							newChildren
						);
			} 
            else{
				 this.dispatchEvent(
							new ShowToastEvent({
								title: "No children",
								message: "No children exists for the selected case",
								variant: "warning"
							})
						);
				}
			
            }
        	catch(error) {
					console.log("Error loading child cases", error);
					this.dispatchEvent(
						new ShowToastEvent({
							title: "Error Loading Children cases",
							message: error + " " + error?.message,
							variant: "error"
						})
					);
			}
		finally {
					this.isLoading = false;
				}
	    }
    }

    handleRowAction(event){
        const action = event.detail.action;
        const row = event.detail.row;
        console.log(event.detail.row);
        //console.log(event.detail.action.name)
        try{
            //switch (action.name) {
             //   case 'gotoCase':
                    this[NavigationMixin.Navigate]({
                        type: "standard__recordPage",
                        attributes: {
                            recordId: event.detail.row.Id,
                            actionName: "view"
                        }
                    });//.then((url) => {
                    //    window.open(url, "_blank");
                  //  });
               // break;
           // }
        }
        catch(error) {
					console.log("Error loading child cases", error);
					this.dispatchEvent(
						new ShowToastEvent({
							title: "Error Loading Children cases",
							message: error + " " + error?.message,
							variant: "error"
						})
					);
		}
        finally{

        }

    }
   

	getNewDataWithChildren(rowName, data, children) {
		return data.map((row) => {
			let hasChildrenContent = false;
			if (
				Object.prototype.hasOwnProperty.call(row, "_children") &&
				Array.isArray(row._children) &&
				row._children.length > 0
			) {
				hasChildrenContent = true;
			}

			if (row.Id === rowName) {
				row._children = children;
			} else if (hasChildrenContent) {
				this.getNewDataWithChildren(rowName, row._children, children);
			}
			return row;
		});
	}


}