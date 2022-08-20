@IsTest
private class CaseHeirarchyControllerTest {

    public static void createCases(Integer amount) {
        
        List<Case> casestoCreate = new List<Case>();
        for (Integer i = 0; i < amount; i++) {
            casestoCreate.add(
                new Case(
                    Subject='Test_Parent_Case'+i,
                    Origin = 'Web'
                )
            );
        }
        insert casestoCreate;
       
    }
     

     public static void createChildCases(Id parentCaseId,Integer amount) {
        List<Case> cases = new List<Case>();
        for (Integer i = 0; i < amount; i++) {
            cases.add(
                new Case(
                    Subject='Test_Parent_Case'+i,
                    Origin = 'Web',
                    ParentId= ParentCaseId
                )
            );
        }
        insert cases;
        
    
    }

    @IsTest
    static void getChildCasesPostiveNoChildCases(){
        Profile standardUserProfile = [
            SELECT Name, Id
            FROM Profile
            WHERE
                UserType = 'Standard'
                AND PermissionsPrivacyDataAccess = FALSE
                AND PermissionsSubmitMacrosAllowed = TRUE
                AND PermissionsMassInlineEdit = TRUE
                AND NAME !='Case:NotRead'
                
            LIMIT 1
        ];
        User testUser = new User(
            Alias = 'standt',
            Email = 'standarduser@testorg.com',
            EmailEncodingKey = 'UTF-8',
            LastName = 'Testing',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = standardUserProfile.Id,
            TimeZoneSidKey = 'America/Los_Angeles',
            UserName = 'standarduser@CaseOrg-testorg.com'
        );
        insert testUser;
        System.runAs(new User(Id = UserInfo.getUserId())) {
            CaseHeirarchyControllerTest.createCases(5);
        }
        System.runAs(testUser) {
            Test.startTest();
            Id id = [SELECT Id from Case LIMIT 1].Id;
            List<Case> result = CaseHeirarchyController.getChildrenCasesParent(id);
            Test.stopTest();
            System.assertEquals(0, result.size(),'Expected results to be 0');
        }


    }

    @IsTest
    static void getChildCasesPostiveSingleChildCases(){
        Profile standardUserProfile = [
            SELECT Name, Id
            FROM Profile
            WHERE
                UserType = 'Standard'
                AND PermissionsPrivacyDataAccess = FALSE
                AND PermissionsSubmitMacrosAllowed = TRUE
                AND PermissionsMassInlineEdit = TRUE
                AND Name !='Case:NotRead'
            LIMIT 1
        ];
        User testUser = new User(
            Alias = 'standt',
            Email = 'standarduser@testorg.com',
            EmailEncodingKey = 'UTF-8',
            LastName = 'Testing',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = standardUserProfile.Id,
            TimeZoneSidKey = 'America/Los_Angeles',
            UserName = 'standarduser@dreamhouse-testorg.com'
        );
        insert testUser;
        System.runAs(new User(Id = UserInfo.getUserId())) {
            CaseHeirarchyControllerTest.createCases(5);
            Id id = [SELECT Id from Case order by createddate ASC LIMIT 1].Id;
            CaseHeirarchyControllerTest.createChildCases(id,2);
        }
        System.runAs(testUser) {
            Test.startTest();
            Id id = [SELECT Id from Case order by createddate ASC LIMIT 1].Id;
            List<Case> result = CaseHeirarchyController.getChildrenCasesParent(id);
            Test.stopTest();
            System.assertEquals(2, result.size(),'Expected results to be 2');
        }


    }

     @IsTest
    static void caseNotAccessible(){
        try{
        Profile customUserProfile = [
            SELECT Name, Id
            FROM Profile
            WHERE
                UserType = 'Standard'
                AND PermissionsPrivacyDataAccess = FALSE
                AND PermissionsSubmitMacrosAllowed = TRUE
                AND PermissionsMassInlineEdit = TRUE
                AND Name = 'Case:NotRead'
            LIMIT 1
        ];
        User testUser = new User(
            Alias = 'standt',
            Email = 'standarduser@testorg.com',
            EmailEncodingKey = 'UTF-8',
            LastName = 'Testing',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = customUserProfile.Id,
            TimeZoneSidKey = 'America/Los_Angeles',
            UserName = 'customuser@CaseOrg-testorg.com'
        );
        insert testUser;
        System.runAs(new User(Id = UserInfo.getUserId())) {
            CaseHeirarchyControllerTest.createCases(5);
            Id id = [SELECT Id from Case order by createddate ASC LIMIT 1].Id;
            CaseHeirarchyControllerTest.createChildCases(id,2);
        }
        System.runAs(testUser) {
            Test.startTest();
            Id id = [SELECT Id from Case order by createddate ASC LIMIT 1].Id;
        
            List<Case> result = CaseHeirarchyController.getChildrenCasesParent(id);
                    Test.stopTest();
          //  System.assertEquals(0, result.size(),'Expected results to be 2');
        }
        }   
        catch(Exception e){
            System.debug(e.getMessage());
            System.assertEquals(true,e.getMessage().contains('getChildrenCases'),'Expected error to be encountered');
    } 
    }
    

   /* @IsTest
    static void queryExceptionTest(){
    try{
        Profile standardUserProfile = [
            SELECT Name, Id
            FROM Profile
            WHERE
                UserType = 'Standard'
                AND PermissionsPrivacyDataAccess = FALSE
                AND PermissionsSubmitMacrosAllowed = TRUE
                AND PermissionsMassInlineEdit = TRUE
                AND NAME !='Case:NotRead'
                
            LIMIT 1
        ];
        User testUser = new User(
            Alias = 'standt',
            Email = 'standarduser@testorg.com',
            EmailEncodingKey = 'UTF-8',
            LastName = 'Testing',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = standardUserProfile.Id,
            TimeZoneSidKey = 'America/Los_Angeles',
            UserName = 'standarduser@CaseOrg-testorg.com'
        );
        insert testUser;
        System.runAs(new User(Id = UserInfo.getUserId())) {
            CaseHeirarchyControllerTest.createCases(5);
        }
        System.runAs(testUser) {
            Test.startTest();
            Id id = [SELECT Id from Case LIMIT 1].Id;
            CaseHeirarchyController.queryExceptionBreaker = true;
           
            List<Case> result = CaseHeirarchyController.getChildrenCasesParent(id);
            
            Test.stopTest();
            System.assertEquals(0, result.size());
        }
     }
     catch(QueryException e){
            System.assertEquals(e.getMessage(),'QueryException');
        }
    }
    */
}