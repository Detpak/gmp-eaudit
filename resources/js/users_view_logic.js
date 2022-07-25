import { Grid, html } from "gridjs";
import { ModalForm } from "./components";
import { showToastMsg } from "./utils";
import { RowSelection } from "gridjs-selection";

export class UsersViewLogic
{
    constructor(userId)
    {
        this.userId = userId;
        this.addRoleModalForm = ModalForm.getOrCreateInstance('addRoleModal');

        this.addRoleModalForm.setOnFormSubmit((jsonData) => {
            jsonData.userId = userId;
            return jsonData;
        });

        this.addRoleModalForm.setOnFormSent(() => {
            showToastMsg("Role successfully added!");
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
                rolesTable: new Grid({
                    sort: true,
                    columns: [
                        {
                            id: 'id',
                            hidden: true,
                            sort: false,
                        },
                        {
                            id: 'selected',
                            sort: false,
                            plugin: {
                                component: RowSelection,
                                props: { id: (row) => row.cell(0).data }
                            }
                        },
                        {
                            name: 'Name'
                        },
                        {
                            name: 'Description'
                        },
                        {
                            sort: false,
                            name: 'Actions',
                            formatter: (_, row) => html(
                                `<button type="button" class="btn btn-primary btn-sm me-1" data-app-id="${row.cells[0].data}"><i class="fa-regular fa-pen-to-square"></i> Change</button>` +
                                `<button type="button" class="btn btn-danger btn-sm" data-app-id="${row.cells[0].data}"><i class="fa-solid fa-trash"></i> Delete</button>`
                            )
                        }
                    ],
                    server: {
                        url: `/api/v1/fetch-roles?userId=${this.userId}`,
                        method: 'GET',
                        then: data => {
                            this.rolesPage.selectedItems = document.querySelectorAll('input[name="selectedItems"]');
                            return data.data.map(item => [item.id, item.name, (item.remarks || item.length > 0) ? item.remarks : '-', null])
                        }
                    }
                }),
                deleteSelectedBtn: document.getElementById('deleteSelectedRolesBtn'),
                refreshBtn: document.getElementById('refreshRolesTableBtn')
            };

            this.rolesPage.rolesTable.on('ready', () => {
                const checkboxPlugin = this.rolesPage.rolesTable.config.plugin.get('selected');

                checkboxPlugin.props.store.on('updated', (state, _) => {
                    this.rolesPage.selectedRoles = state;
                });
            })

            this.rolesPage.deleteSelectedBtn.addEventListener('click', () => {
                console.log(this.rolesPage.selectedRoles);
                this.refreshRolesTable();
            });

            this.rolesPage.refreshBtn.addEventListener('click', () => {
                this.refreshRolesTable();
            });

            this.rolesPage.rolesTable.render(this.rolesPage.rolesTableWrapper);

        }

        this.refreshRolesTable();
    }

    initUserManagementPage()
    {

    }

    refreshRolesTable()
    {
        this.rolesPage.rolesTable.forceRender();
    }
}
