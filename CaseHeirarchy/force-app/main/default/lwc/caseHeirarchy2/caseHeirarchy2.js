import { LightningElement,wire,api,track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getChildrenCasesParent from '@salesforce/apex/CaseHeirarchyController.getChildrenCasesParent';
import NAME_FIELD from '@salesforce/schema/Case.CaseNumber';
import SUBJECT_FIELD from '@salesforce/schema/Case.Subject';
import ORIGIN_FIELD from '@salesforce/schema/Case.Origin';

const COLS = [
	{ fieldName: NAME_FIELD.fieldApiName, label: "Case Number",type:'button',initialWidth: 200,typeAttributes: { label: { fieldName: NAME_FIELD.fieldApiName }, name: "gotoCase", variant: "base" } },
	{ fieldName: SUBJECT_FIELD.fieldApiName, label: "Subject",type:'text' },
	{ fieldName: ORIGIN_FIELD.fieldApiName, label: "origin",type:'text' }
];

export default class CaseHeirarchy extends NavigationMixin(LightningElement) {

    @api
    recordId;
    childrecordID;
    gridColumns = COLS;
	isLoading = true;

	@track
	gridData;
    error;
    numChildCase;
    
    @wire(getChildrenCasesParent,{recordID:'$recordId'})
    childCases({data,error}){
        if(error){
            this.error = error;
            this.gridData= undefined;
			this.numChildCase= false;
			

        }
        else if (data){
            this.error = undefined;
            this.gridataRaw =data;
            this.gridData = data.map((caseItem) => ({
				_children: [],
				...caseItem,
			}));
            this.numChildCase=(this.gridData.length=== 0)?true:false ;
			if(this.gridData.length ===0){
					this.gridData =undefined;
			}
            this.isLoading = false;
        }

    }
    
    @wire(getChildrenCasesParent,{recordID:'$childrecordID'})
    grandchildCases({data,error}){
        if(error){
			
			
			this.showToast("Error Loading Children cases",error + " " + error?.message,"error");
					
        }
        else if(data && data.length > 0){
			
				const newChildren = data.map((child) => ({
							_children: [],
							...child
						}));
             
				this.gridData = this.getNewDataWithChildren(
							this.childrecordID,
							this.gridData,
							newChildren
						);
                
				
				this.isLoading=false;
		} 
        else{
		
			this.showToast("No children","No children exists for the selected case","warning");
		}
			
            

    }

     handleOnToggle(event) {
		
		const rowName = event.detail.name;
		if (!event.detail.hasChildrenContent && event.detail.isExpanded) {
			
			this.isLoading = true;
        try{  
			
            this.childrecordID =  rowName;
        }
		catch(error) {
					this.showToast("Error Loading Children cases",error + " " + error?.message,"error");	
				}
		finally {
					this.isLoading = false;
				}
	}
    }

    handleRowAction(event){
        const action = event.detail.action;
        try{
            if(action.subTypeAttributes.name==='gotoCase') {
                    this[NavigationMixin.Navigate]({
                        type: "standard__recordPage",
                        attributes: {
                            recordId: event.detail.row.Id,
                            actionName: "view"
                        }
                    });
				}
        }
        catch(error) {
					console.log("Error navigating to case", error);
					
					this.showToast("Error navigating to case",error + " " + error?.message,"error");
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

	showToast(title,message,variant){
		this.dispatchEvent(
			new ShowToastEvent({
				title:title, 
				message:message,
				variant:variant

			})
		);
	}


}