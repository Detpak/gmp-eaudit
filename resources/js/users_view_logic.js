import { Grid, html } from "gridjs";
import { IndicatorButton, ModalForm } from "./components";
import { showToastMsg } from "./utils";
import { RowSelection } from "gridjs-selection";
import axios from "axios";
import { DynamicTable } from "./dynamic_table";

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
}
