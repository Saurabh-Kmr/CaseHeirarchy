public with sharing class CaseHeirarchyController {
    
    class CaseHeirarchyControllerException extends Exception{}

    @SuppressWarnings('PMD.ApexCRUDViolation')
    @AuraEnabled(cacheable=true)
    public static List<Case> getChildrenCasesParent(ID recordID){
        
        try{    
                if(!recordID.getSobjectType().getDescribe().isAccessible()){
                    throw new CaseHeirarchyControllerException('Case object is not accesible to user');
                }          
                List<Case> cases = [SELECT id,CaseNumber,subject,origin from Case where ParentId =:recordID order by CaseNumber asc];
                SObjectAccessDecision securityDecision = Security.stripInaccessible(AccessType.READABLE,cases);
                return  (List<Case>)securityDecision.getRecords();             
            }
        catch(Exception e){
        System.debug(
                LoggingLevel.INFO,
                'Failed to query the Contact. Error is: ' + e.getMessage()
            );
            
            throw new AuraHandledException(e.getMessage());
        }
        
    }

    
}