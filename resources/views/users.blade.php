<x-layouts.submenus title="Users" page-id="4">
    <x-slot:tabs>
        <x-tab active id="rolesTab" target="rolesTabPane">Roles</x-tab>
        <x-tab id="userManagementTab" target="userManagementTabPane">User Management</x-tab>
    </x-slot:tabs>

    <x-submenu_tab_pane shown id="rolesTabPane" labelled-by="rolesTab">
        <x-slot:navbar>
            <button class="btn btn-success me-2" type="button" data-bs-toggle="modal" data-bs-target="#addRoleModal"><i class="fa-solid fa-plus"></i> Add Role</button>
            <x-indicator_button id="deleteSelectedRolesBtn" style="danger">
                <i class="fa-solid fa-trash"></i> Delete Selected
            </x-indicator_button>
            <button class="btn btn-outline-primary me-2" type="button" id="refreshRolesTableBtn"><i class="fa-solid fa-arrow-rotate-right"></i></button>
        </x-slot:navbar>

        <div id="rolesTableWrapper"></div>

        <x-modal_form id="addRoleModal" action="/api/v1/add-role">
            <x-slot:title>
                <h5>Add Role</h5>
            </x-slot:title>

            <x-slot:body>
                <div class="mb-3">
                    <label for="roleName" class="form-label">Role name:</label>
                    <input type="text" class="form-control" id="roleName" name="roleName" aria-describedby="roleNameMsg">
                    <div id="roleNameMsg" class="invalid-feedback d-none"></div>
                </div>
                <div class="mb-3">
                    <label for="remarks" class="form-label">Remarks:</label>
                    <textarea class="form-control" id="remarks" name="remarks" rows="3" maxlength="255" aria-describedby="remarksMsg"></textarea>
                    <div id="remarksMsg" class="invalid-feedback d-none"></div>
                </div>
                <div class="mb-3">
                    <label for="addRoleAccordion" class="form-label">Access privileges:</label>
                    <div class="accordion" id="addRoleAccordion">
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="addRoleDashboardHeader">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#addRoleDashboardCollapse" aria-expanded="true" aria-controls="addRoleDashboardCollapse">
                                    Dashboard
                                </button>
                            </h2>
                            <div id="addRoleDashboardCollapse" class="accordion-collapse collapse" aria-labelledby="addRoleDashboardHeader">
                                <div class="accordion-body">
                                    <label for="dashboardAccess" class="form-label">Access level:</label>
                                    <select class="form-select mb-2" aria-label="Level" id="dashboardAccess" name="dashboardAccess">
                                        <option value="0">No access</option>
                                        <option value="1">Minimal access</option>
                                        <option value="2">Full access</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="addRoleAuditHeader">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#addRoleAuditCollapse" aria-expanded="false" aria-controls="addRoleAuditCollapse">
                                    Audit
                                </button>
                            </h2>
                            <div id="addRoleAuditCollapse" class="accordion-collapse collapse" aria-labelledby="addRoleAuditHeader">
                                <div class="accordion-body">
                                    <label for="auditAccess" class="form-label">Access level:</label>
                                    <select class="form-select mb-2" aria-label="Level" id="auditAccess" name="auditAccess">
                                        <option value="0">No access</option>
                                        <option value="1">Full access</option>
                                    </select>
                                    <label for="auditCycleAccess" class="form-label">Submenus:</label>
                                    <select class="form-select mb-2" aria-label="Level" id="auditCycleAccess" name="auditCycleAccess">
                                        <option value="0">Cycles Page: No access</option>
                                        <option value="1">Cycles Page: Full access</option>
                                    </select>
                                    <select class="form-select mb-2" aria-label="Level" id="auditRecordAccess" name="auditRecordAccess">
                                        <option value="0">Records Page: No access</option>
                                        <option value="1">Records Page: Full access</option>
                                    </select>
                                    <select class="form-select mb-2" aria-label="Level" id="auditDetailAccess" name="auditDetailAccess">
                                        <option value="0">Details Page: No access</option>
                                        <option value="1">Details Page: Full access</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="addRoleUsersHeader">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#addRoleUsersCollapse" aria-expanded="false" aria-controls="addRoleUsersCollapse">
                                    Users
                                </button>
                            </h2>
                            <div id="addRoleUsersCollapse" class="accordion-collapse collapse" aria-labelledby="addRoleUsersHeader">
                                <div class="accordion-body">
                                    <label for="usersAccess" class="form-label">Access level:</label>
                                    <select class="form-select mb-2" aria-label="Level" id="usersAccess" name="usersAccess">
                                        <option value="0">No access</option>
                                        <option value="1">Full access</option>
                                    </select>
                                    <label for="usersRoleAccess" class="form-label">Submenus:</label>
                                    <select class="form-select mb-2" aria-label="Level" id="usersRoleAccess" name="usersRoleAccess">
                                        <option value="0">Roles Page: No access</option>
                                        <option value="1">Roles Page: Full access</option>
                                    </select>
                                    <select class="form-select mb-2" aria-label="Level" id="usersUserListAccess" name="usersUserListAccess">
                                        <option value="0">User List Page: No access</option>
                                        <option value="1">User List Page: Full access</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </x-slot:body>

            <x-slot:submitButton icon="fa-solid fa-plus">
                Add
            </x-slot:submitButton>
        </x-modal_form>

        <x-modal_form id="changeRoleModal" action="/api/v1/change-role" fetch-action="/api/v1/get-role">
            <x-slot:title>
                <h5>Change Role</h5>
            </x-slot:title>

            <x-slot:body>
                <div class="mb-3">
                    <label for="roleName" class="form-label">Role name:</label>
                    <input type="text" class="form-control" id="chRoleName" name="chRoleName" aria-describedby="chRoleNameMsg">
                    <div id="chRoleNameMsg" class="invalid-feedback d-none"></div>
                </div>
                <div class="mb-3">
                    <label for="remarks" class="form-label">Remarks:</label>
                    <textarea class="form-control" id="chRemarks" name="chRemarks" rows="3" maxlength="255" aria-describedby="chRemarksMsg"></textarea>
                    <div id="chRemarksMsg" class="invalid-feedback d-none"></div>
                </div>
                <div class="mb-3">
                    <label for="changeRoleAccordion" class="form-label">Access privileges:</label>
                    <div class="accordion" id="changeRoleAccordion">
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="dashboardHeader">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#dashboardCollapse" aria-expanded="true" aria-controls="dashboardCollapse">
                                    Dashboard
                                </button>
                            </h2>
                            <div id="dashboardCollapse" class="accordion-collapse collapse" aria-labelledby="dashboardHeader">
                                <div class="accordion-body">
                                    <label for="chDashboardAccess" class="form-label">Access level:</label>
                                    <select class="form-select mb-2" aria-label="Level" id="chDashboardAccess" name="chDashboardAccess">
                                        <option value="0">No access</option>
                                        <option value="1">Minimal access</option>
                                        <option value="2">Full access</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="auditHeader">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#auditCollapse" aria-expanded="false" aria-controls="auditCollapse">
                                    Audit
                                </button>
                            </h2>
                            <div id="auditCollapse" class="accordion-collapse collapse" aria-labelledby="auditHeader">
                                <div class="accordion-body">
                                    <label for="chAuditAccess" class="form-label">Access level:</label>
                                    <select class="form-select mb-2" aria-label="Level" id="chAuditAccess" name="chAuditAccess">
                                        <option value="0">No access</option>
                                        <option value="1">Full access</option>
                                    </select>
                                    <label for="chAuditCycleAccess" class="form-label">Submenus:</label>
                                    <select class="form-select mb-2" aria-label="Level" id="chAuditCycleAccess" name="chAuditCycleAccess">
                                        <option value="0">Cycles Page: No access</option>
                                        <option value="1">Cycles Page: Full access</option>
                                    </select>
                                    <select class="form-select mb-2" aria-label="Level" id="chAuditRecordAccess" name="chAuditRecordAccess">
                                        <option value="0">Records Page: No access</option>
                                        <option value="1">Records Page: Full access</option>
                                    </select>
                                    <select class="form-select mb-2" aria-label="Level" id="chAuditDetailAccess" name="chAuditDetailAccess">
                                        <option value="0">Details Page: No access</option>
                                        <option value="1">Details Page: Full access</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="usersHeader">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#usersCollapse" aria-expanded="false" aria-controls="usersCollapse">
                                    Users
                                </button>
                            </h2>
                            <div id="usersCollapse" class="accordion-collapse collapse" aria-labelledby="usersHeader">
                                <div class="accordion-body">
                                    <label for="chUsersAccess" class="form-label">Access level:</label>
                                    <select class="form-select mb-2" aria-label="Level" id="chUsersAccess" name="chUsersAccess">
                                        <option value="0">No access</option>
                                        <option value="1">Full access</option>
                                    </select>
                                    <label for="chUsersRoleAccess" class="form-label">Submenus:</label>
                                    <select class="form-select mb-2" aria-label="Level" id="chUsersRoleAccess" name="chUsersRoleAccess">
                                        <option value="0">Roles Page: No access</option>
                                        <option value="1">Roles Page: Full access</option>
                                    </select>
                                    <select class="form-select mb-2" aria-label="Level" id="chUsersUserListAccess" name="chUsersUserListAccess">
                                        <option value="0">User Management Page: No access</option>
                                        <option value="1">User Management Page: Full access</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </x-slot:body>

            <x-slot:submitButton icon="fa-solid fa-plus">
                Add
            </x-slot:submitButton>
        </x-modal_form>
    </x-submenu_tab_pane>

    <x-submenu_tab_pane id="userManagementTabPane" labelled-by="userManagementTab">
        <x-slot:navbar>
            <button class="btn btn-success me-2" type="button"><i class="fa-solid fa-plus"></i> Add User</button>
            <button class="btn btn-outline-primary me-2" type="button"><i class="fa-solid fa-arrow-rotate-right"></i></button>
        </x-slot:navbar>
        <x-dynamic_table id="usersTable"></x-dynamic_table>
    </x-submenu_tab_pane>
</x-layouts>
