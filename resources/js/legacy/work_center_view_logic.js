import { CommonView } from "./common_view";
import { DynamicTable } from "./dynamic_table";

export class WorkCenterViewLogic
{
    constructor()
    {
        new CommonView({
            addItemModalId: 'addDeptModal',
            onItemAddedMsg: 'Department successfully added!',

            editItemModalId: 'editDeptModal',
            onItemEditedMsg: 'Department successfully changed!',

            tableWrapperId: 'deptTableWrapper',
            tableColumns: [
                DynamicTable.idColumn(),
                DynamicTable.selectionColumn(),
                {
                    id: 'name',
                    name: 'Name'
                },
                {
                    id: 'code',
                    name: 'Code'
                },
                DynamicTable.actionColumn('editDeptModal')
            ],
            tableUrlSource: '/api/v1/fetch-depts',
            tableParseData: data => data.data.map(item => [item.id, item.name, item.code, null]),

            itemDeleteUrl: '/api/v1/delete-dept',
            itemDeleteConfirmMsg: "Do you really want to delete this department?",
            onItemDeletedMsg: "Department successfully deleted!",
            onDeleteItemFailedMsg: "Cannot delete the department",

            deleteSelectedUrl: '/api/v1/delete-depts',
            deleteSelectedBtnId: 'deleteSelectedDeptBtn',
            noItemSelectedMsg: "Please select the department to delete",
            deleteSelectedItemConfirmMsg: "Do you really want to delete the selected department?",
            onSelectedItemDeletedMsg: "The selected department successfully deleted!",
            onDeleteSelectedItemFailedMsg: "Cannot delete the selected department",

            refreshBtnId: 'refreshDeptTable'
        });
    }
}
