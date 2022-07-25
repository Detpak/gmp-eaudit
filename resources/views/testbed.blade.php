<x-layouts.admin title="Testbed" page-id="6">
    <div class="p-4">
        <button class="btn btn-primary" type="button" data-bs-toggle="modal" data-bs-target="#modalFormTest">Open Modal Form</button>
        <button class="btn btn-primary" type="button" id="dynTableRefresh">Refresh</button>
        <div id="testDynTable"></div>
    </div>

    <x-modal_form id="modalFormTest" action="/api/v1/modal-form-test">
        <x-slot:title>
            <h5>Add Role</h5>
        </x-slot:title>

        <x-slot:body>
            <div class="mb-3">
                <label for="field1" class="form-label">Test field 1:</label>
                <input type="text" class="form-control" id="field1" name="field1" aria-describedby="field1Msg">
                <div id="field1Msg" class="invalid-feedback d-none"></div>
            </div>

            <div class="mb-3">
                <label for="field2" class="form-label">Test field 2:</label>
                <input type="text" class="form-control" id="field2" name="field2" aria-describedby="field2Msg">
                <div id="field2Msg" class="invalid-feedback d-none"></div>
            </div>

            <div class="mb-3">
                <label for="field3" class="form-label">Test field 3:</label>
                <input type="text" class="form-control" id="field3" name="field3" aria-describedby="field3Msg">
                <div id="field3Msg" class="invalid-feedback d-none"></div>
            </div>
        </x-slot:body>

        <x-slot:submitButton>
            Submit
        </x-slot:submitButton>
    </x-modal_form>

    <x-modal_form id="modalFormEditTest" action="/api/v1/modal-form-test" fetch-action="/api/v1/fetch-modal-form-test" fetch-method="get">
        <x-slot:title>
            <h5>Add Role</h5>
        </x-slot:title>

        <x-slot:body>
            <div class="mb-3">
                <label for="field1" class="form-label">Test field 1:</label>
                <input type="text" class="form-control" id="field1" name="field1" aria-describedby="field1Msg">
                <div id="field1Msg" class="invalid-feedback d-none"></div>
            </div>

            <div class="mb-3">
                <label for="field2" class="form-label">Test field 2:</label>
                <input type="text" class="form-control" id="field2" name="field2" aria-describedby="field2Msg">
                <div id="field2Msg" class="invalid-feedback d-none"></div>
            </div>

            <div class="mb-3">
                <label for="field3" class="form-label">Test field 3:</label>
                <input type="text" class="form-control" id="field3" name="field3" aria-describedby="field3Msg">
                <div id="field3Msg" class="invalid-feedback d-none"></div>
            </div>
        </x-slot:body>

        <x-slot:submitButton>
            Submit
        </x-slot:submitButton>
    </x-modal_form>
</x-layouts.admin>
