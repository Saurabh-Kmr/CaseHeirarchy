import { createElement } from 'lwc';
import CaseHeirarchy from 'c/caseHeirarchy';
import generateTreeData from '@salesforce/apex/CaseHeirarchyController.getChildrenCasesParent';


jest.mock(
    '@salesforce/apex/CaseHeirarchyController.getChildrenCasesParent',
    () => {
        const {
            createApexTestWireAdapter
        } = require('@salesforce/sfdx-lwc-jest');
        return {
            default: createApexTestWireAdapter(jest.fn())
        };
    },
    { virtual: true }
);

const mockGenerateTreeData = require('./data/generateTreeGridData.json');


describe('c-case-heirarchy', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }

        jest.clearAllMocks();

    });

    it('shows tree data when @wire returns data', () => {
        // Arrange
        const element = createElement('c-case-heirarchy', {
            is: CaseHeirarchy
        });

        // Act
        document.body.appendChild(element);
        generateTreeData.emit(mockGenerateTreeData);
        // Assert
        // const div = element.shadowRoot.querySelector('div');
        return Promise.resolve().then(() => {
            // Select elements for validation
            const treeEl = element.shadowRoot.querySelector('lightning-tree-grid');
            console.log(treeEl);
            expect(treeEl.data).toStrictEqual(mockGenerateTreeData);
        });
    });

    it('shows error panel when @wire returns error', () => {
        // Create initial element
        const element = createElement('c-case-heirarchy', {
            is: CaseHeirarchy
        });
        document.body.appendChild(element);

        // Emit error from @wire
        generateTreeData.error();

        // Return a promise to wait for any asynchronous DOM updates. Jest
        // will automatically wait for the Promise chain to complete before
        // ending the test and fail the test if the promise rejects.
        return Promise.resolve().then(() => {
            const errorPanelEl =
                element.shadowRoot.querySelector('c-error-panel');
            expect(errorPanelEl).not.toBeNull();
        });
    });


    it('is accessible when recipe shown', async() => {
        // Create initial element
        const element = createElement('c-case-heirarchy', {
            is: CaseHeirarchy
        });
        document.body.appendChild(element);

        // Emit data from @wire
        generateTreeData.emit(mockGenerateTreeData);

        await expect(element).toBeAccessible();
    });

    it('is accessible when error panel shown',async () => {
        // Create initial element
        const element = createElement('c-case-heirarchy', {
            is: CaseHeirarchy
        });
        document.body.appendChild(element);

        // Emit error from @wire
        generateTreeData.error();

        await expect(element).toBeAccessible();
    });
});//last