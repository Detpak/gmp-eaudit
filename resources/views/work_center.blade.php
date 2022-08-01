<x-layouts.submenus title="Work Center" page-id="3">
    <x-slot:tabs>
        <x-tab active id="departmentsTab" target="departmentsTabPane"><i class="fa-solid fa-building"></i> Departments</x-tab>
        <x-tab id="areasTab" target="areasTabPane"><i class="fa-solid fa-warehouse"></i> Areas</x-tab>
    </x-slot:tabs>

    <x-submenu_tab_pane shown id="departmentsTabPane" labelled-by="departmentsTab">
        <x-slot:navbar>
            <button class="btn btn-success me-2" type="button" data-bs-toggle="modal" data-bs-target="#addDeptModal"><i class="fa-solid fa-plus"></i> Add Department</button>
            <x-indicator_button id="deleteSelectedDeptBtn" style="danger">
                <i class="fa-solid fa-trash"></i> Delete Selected
            </x-indicator_button>
            <button class="btn btn-outline-primary me-2" type="button" id="refreshDeptTable"><i class="fa-solid fa-arrow-rotate-right"></i></button>
        </x-slot:navbar>

        <div class="h-100 pb-4" id="deptTableWrapper"></div>

        <x-modal_form id="addDeptModal" action="/api/v1/add-dept">
            <x-slot:title>
                <h5>Add Department</h5>
            </x-slot:title>

            <x-slot:body>
                <div class="mb-3">
                    <label for="deptName" class="form-label">Department name:</label>
                    <input type="text" class="form-control" id="deptName" name="name" aria-describedby="deptNameMsg">
                    <div id="deptNameMsg" class="invalid-feedback d-none"></div>
                </div>
                <div class="mb-3">
                    <label for="deptCode" class="form-label">Code:</label>
                    <input type="text" class="form-control" id="deptCode" name="code" aria-describedby="deptCodeMsg">
                    <div id="deptCodeMsg" class="invalid-feedback d-none"></div>
                </div>
            </x-slot:body>

            <x-slot:submitButton icon="fa-solid fa-plus">
                Add
            </x-slot:submitButton>
        </x-modal_form>

        <x-modal_form id="editDeptModal" action="/api/v1/edit-dept" fetch-action="/api/v1/get-dept">
            <x-slot:title>
                <h5>Edit Department</h5>
            </x-slot:title>

            <x-slot:body>
                <div class="mb-3">
                    <label for="editDeptName" class="form-label">Department name:</label>
                    <input type="text" class="form-control" id="editDeptName" name="name" aria-describedby="editDeptNameMsg">
                    <div id="editDeptNameMsg" class="invalid-feedback d-none"></div>
                </div>
                <div class="mb-3">
                    <label for="editDeptCode" class="form-label">Code:</label>
                    <input type="text" class="form-control" id="editDeptCode" name="code" aria-describedby="editDeptCodeMsg">
                    <div id="editDeptCodeMsg" class="invalid-feedback d-none"></div>
                </div>
            </x-slot:body>

            <x-slot:submitButton icon="fa-solid fa-pencil">
                Edit
            </x-slot:submitButton>
        </x-modal_form>
    </x-submenu_tab_pane>

    <x-submenu_tab_pane shown id="areasTabPane" labelled-by="areasTab">

    </x-submenu_tab_pane>
</x-layouts.submenus>
