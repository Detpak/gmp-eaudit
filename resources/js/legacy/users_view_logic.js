import { CommonView } from "./common_view";
import { DynamicTable } from "./dynamic_table";

export class UsersViewLogic
{
    constructor()
    {
        this.rolesView = new CommonView({
            addItemModalId: 'addRoleModal',
            onItemAddedMsg: 'Role successfully added!',

            editItemModalId: 'editRoleModal',
            onItemEditedMsg: 'Role successfully changed!',

            tableWrapperId: 'rolesTableWrapper',
            tableColumns: [
                DynamicTable.idColumn(),
                DynamicTable.selectionColumn(),
                {
                    id: 'name',
                    name: 'Name'
                },
                {
                    id: 'remarks',
                    name: 'Description'
                },
                DynamicTable.actionColumn('editRoleModal')
            ],
            tableUrlSource: '/api/v1/fetch-roles',
            tableParseData: data => data.data.map(item => [item.id, item.name, (item.remarks || item.length > 0) ? item.remarks : '-', null]),

            itemDeleteUrl: '/api/v1/delete-role',
            itemDeleteConfirmMsg: "Do you really want to delete this user role?",
            onItemDeletedMsg: "User role successfully deleted!",
            onDeleteItemFailedMsg: "Cannot delete the user role",

            deleteSelectedUrl: '/api/v1/delete-roles',
            deleteSelectedBtnId: 'deleteSelectedRolesBtn',
            noItemSelectedMsg: "Please select the user role to delete",
            deleteSelectedItemConfirmMsg: "Do you really want to delete the selected user role?",
            onSelectedItemDeletedMsg: "The selected user role successfully deleted!",
            onDeleteSelectedItemFailedMsg: "Cannot delete the selected user role",

            refreshBtnId: 'refreshRolesTableBtn'
        });

        document.getElementById('manageUserTab').addEventListener('shown.bs.tab', event => {
            if (!this.manageUserView) {
                this.manageUserView = new CommonView({
                    addItemModalId: 'addUserModal',
                    onItemAddedMsg: 'User successfully added!',

                    editItemModalId: 'editUserModal',
                    onItemEditedMsg: 'User successfully edited!',

                    tableWrapperId: 'usersTableWrapper',
                    tableColumns: [
                        DynamicTable.idColumn(),
                        DynamicTable.selectionColumn(),
                        {
                            id: 'name',
                            name: 'Name'
                        },
                        {
                            id: 'employee_id',
                            name: 'Employee ID'
                        },
                        {
                            id: 'login_id',
                            name: 'Login ID'
                        },
                        {
                            id: 'email',
                            name: 'E-mail'
                        },
                        {
                            id: 'role_name',
                            name: 'Role'
                        },
                        DynamicTable.actionColumn('editUserModal')
                    ],
                    tableUrlSource: '/api/v1/fetch-users',
                    tableParseData: data => data.data.map(item => [
                        item.id,
                        item.name,
                        item.employee_id,
                        item.login_id,
                        (item.email || item.email.length > 0) ? item.email : '-',
                        item.role_name,
                        null
                    ]),

                    itemDeleteUrl: '/api/v1/delete-user',
                    itemDeleteConfirmMsg: "Do you really want to delete this user?",
                    onItemDeletedMsg: "User successfully deleted!",
                    onDeleteItemFailedMsg: "Cannot delete the user",

                    deleteSelectedUrl: '/api/v1/delete-users',
                    deleteSelectedBtnId: 'deleteSelectedUsersBtn',
                    noItemSelectedMsg: "Please select the user to delete",
                    deleteSelectedItemConfirmMsg: "Do you really want to delete the selected user?",
                    onSelectedItemDeletedMsg: "The selected user successfully deleted!",
                    onDeleteSelectedItemFailedMsg: "Cannot delete the selected user ",

                    refreshBtnId: 'refreshUsersTableBtn'
                });
            }
        });
    }
}

/*
export class UsersViewLogic
{
    constructor()
    {
        this.addRoleModalForm = ModalForm.getOrCreateInstance('addRoleModal');

        this.addRoleModalForm.setOnFormSent(() => {
            this.refreshRolesTable();
            showToastMsg("Role successfully added!");
        });

        this.changeRoleModalForm = ModalForm.getOrCreateInstance('changeRoleModal');

        this.changeRoleModalForm.setOnFormSubmit((jsonData) => {
            const form = this.changeRoleModalForm.getFormElement();
            jsonData['id'] = form.getAttribute('data-app-id');
            return jsonData;
        });

        this.changeRoleModalForm.setOnFormSent(() => {
            this.refreshRolesTable();
            showToastMsg("Role successfully changed!");
        });

        this.initRolesPage();

        document.getElementById('rolesTab').addEventListener('shown.bs.tab', event => {
            console.log(event);
        });

        document.getElementById('userManagementTab').addEventListener('shown.bs.tab', event => {
            console.log(event);
        });
    }

    initRolesPage()
    {
        if (!this.rolesPage) {
            this.rolesPage = {
                rolesTableWrapper: document.getElementById('rolesTableWrapper'),
                rolesTable: new DynamicTable({
                    wrapperId: 'rolesTableWrapper',
                    fixedHeader: true,
                    columns: [
                        DynamicTable.idColumn(),
                        DynamicTable.selectionColumn(),
                        'Name',
                        'Description',
                        DynamicTable.actionColumn('changeRoleModal')
                    ],
                    source: {
                        type: 'server',
                        server: {
                            url: `/api/v1/fetch-roles`,
                            method: 'GET',
                            headers: axios.defaults.headers.common,
                            then: data => {
                                this.rolesPage.selectedItems = document.querySelectorAll('input[name="selectedItems"]');
                                return data.data.map(item => [item.id, item.name, (item.remarks || item.length > 0) ? item.remarks : '-', null])
                            },
                            total: data => {
                                console.log(data.total);
                                return data.total;
                            }
                        }
                    },
                    onDeleteBtnClicked: (id) => {
                        if (!confirm("Do you really want to delete this user role?")) return;

                        axios.get(`/api/v1/delete-role/${id}`)
                            .then((response) => {
                                showToastMsg("User role successfully deleted!");
                                this.refreshRolesTable();
                            })
                            .catch((reason) => {
                                showToastMsg("Cannot delete the user role", true);
                                console.log(reason);
                            });

                            console.log(id);
                        }
                    }),
                deleteSelectedBtn: IndicatorButton.getOrCreateInstance('deleteSelectedRolesBtn'),
                refreshBtn: document.getElementById('refreshRolesTableBtn')
            };

            this.rolesPage.deleteSelectedBtn.setOnClick(() => {
                let selectedItems = this.rolesPage.rolesTable.getSelectedItems();

                if (!selectedItems || selectedItems.rowIds.length == 0) {
                    this.rolesPage.deleteSelectedBtn.setDone();
                    alert("Please select the user role to delete");
                    return;
                }

                if (!confirm("Do you really want to delete the selected user role?")) return;

                axios.post('/api/v1/delete-roles', this.rolesPage.rolesTable.getSelectedItems(), { headers: { 'Content-Type': 'application/json' } })
                    .then((response) => {
                        showToastMsg("The selected user role successfully deleted!");
                        this.rolesPage.deleteSelectedBtn.setDone();
                        this.refreshRolesTable();
                    })
                    .catch((reason) => {
                        showToastMsg("Cannot delete the selected user role", true);
                        this.rolesPage.deleteSelectedBtn.setDone();
                        console.log(reason);
                    });
            });

            this.rolesPage.refreshBtn.addEventListener('click', () => {
                this.refreshRolesTable();
            });
        }

        this.refreshRolesTable();
    }

    initUserManagementPage()
    {

    }

    refreshRolesTable()
    {
        this.rolesPage.rolesTable.refresh();
    }
}*/
