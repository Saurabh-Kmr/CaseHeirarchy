import { LightningElement,wire,api,track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import {refreshApex} from '@salesforce/apex';
import getChildrenCasesParent from '@salesforce/apex/CaseHeirarchyController.getChildrenCasesParent';
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
    @api
    childrecordID;
    gridDataRaw;
    childDataRaw;
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
			console.log(this.error)
			console.log('Grid',JSON.stringify(this.gridData));
			
			this.numChildCase= false;
			console.log('Gridl',this.numChildCase);

        }
        else if (data){
            this.error = undefined;
            this.gridDataRaw=data;
            this.gridData = data.map((caseItem) => ({
				_children: [],
				...caseItem,
			}));
			console.log('Grid',JSON.stringify(this.gridData.length));
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
					this.dispatchEvent(
						new ShowToastEvent({
							title: "Error Loading Children cases",
							message: error + " " + error?.message,
							variant: "error"
						})
					);
        }
        else if(data && data.length > 0){
                this.childDataRaw=data;
				const newChildren = data.map((child) => ({
							_children: [],
							...child
						}));
                console.log('Children',JSON.stringify(newChildren));
				this.gridData = this.getNewDataWithChildren(
							this.childrecordID,
							this.gridData,
							newChildren
						);
                console.log('grid',JSON.stringify(this.gridData))
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

    async handleOnToggle(event) {
		console.log(event.detail.name);
		console.log(event.detail.hasChildrenContent);
		console.log(JSON.stringify(event.detail));
		const rowName = event.detail.name;
		if (!event.detail.hasChildrenContent && event.detail.isExpanded) {
        
			this.isLoading = true;
        try{  
            this.childrecordID =  rowName;
            await refreshApex(this.gridDataRaw);
            await refreshApex(this.childDataRaw);
            console.log('selected',this.childrecordID);
			/*let result = await getChildrenCasesParent({ recordID: rowName })
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
						    )
				        );
			}*/
			
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
        //const row = event.detail.row;
        //console.log('row',JSON.stringify(event.detail));
        //console.log(event.detail.action.name)
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
					console.log("Error loading child cases", error);
					this.dispatchEvent(
						new ShowToastEvent({
							title: "Error Loading Children cases",
							message: error + " " + error?.message,
							variant: "error"
						})
					);
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