public with sharing class CaseHeirarchyController {
    
    public static boolean queryExceptionBreaker =false;
    public static boolean throwException = false;

    @AuraEnabled(cacheable=true)
    public static List<Case> getChildrenCasesParent(ID recordID){
        
        try{              
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