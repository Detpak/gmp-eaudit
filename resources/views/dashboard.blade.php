<x-layouts.admin title="Dashboard" page-id="0">
    <div class="container-fluid">
        <div class="row">
            <div class="col-lg card m-2">
                <div class="card-body d-flex">
                    <div class="flex-grow-1">
                        <h5>Total Cycles</h5>
                        <x-spinner id="totalCycles"></x-spinner>
                    </div>
                    <i class="fa-solid fa-arrows-spin chart-icon my-auto"></i>
                </div>
            </div>
            <div class="col-lg card m-2">
                <div class="card-body d-flex">
                    <div class="flex-grow-1">
                        <h5>Total Audit Submitted</h5>
                        <x-spinner id="totalAuditSubmitted"></x-spinner>
                    </div>
                    <i class="fa-solid fa-envelopes-bulk chart-icon my-auto"></i>
                </div>
            </div>
            <div class="col-lg card m-2">
                <div class="card-body d-flex">
                    <div class="flex-grow-1">
                        <h5>Area Audited</h5>
                        <x-spinner id="areaAudited"></x-spinner>
                    </div>
                    <i class="fa-solid fa-warehouse chart-icon my-auto"></i>
                </div>
            </div>
            <div class="col-lg card m-2">
                <div class="card-body d-flex">
                    <div class="flex-grow-1">
                        <h5>Audit Area Group</h5>
                        <x-spinner id="auditAreaGroup"></x-spinner>
                    </div>
                    <i class="fa-solid fa-check-double chart-icon my-auto"></i>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col card m-2">
                <div class="card-body">Chart 1</div>
            </div>
            <div class="col card m-2">
                <div class="card-body">Chart 2</div>
            </div>
        </div>
        <div class="row">
            <div class="col card m-2">
                <div class="card-body">Chart 3</div>
            </div>
            <div class="col card m-2">
                <div class="card-body">Chart 4</div>
            </div>
        </div>
    </div>
</x-layouts.admin>
