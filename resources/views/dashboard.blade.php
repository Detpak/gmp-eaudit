<x-layouts.admin title="Dashboard" page-id="0">
    <x-slot:controls>
        <x-indicator_button id="refreshCharts">
            <i class="fa-solid fa-arrow-rotate-right"></i> Refresh
        </x-indicator_button>
    </x-slot:controls>
    <div class="container-fluid">
        <div class="m-3">
            <div class="row">
                <a class="col-lg btn btn-outline-primary m-2 text-start" role="button">
                    <div class="d-flex w-100 p-2">
                        <div class="flex-grow-1">
                            <h5>Total Cycles</h5>
                            <x-spinner id="totalCycles"></x-spinner>
                        </div>
                        <i class="fa-solid fa-arrows-spin chart-icon my-auto"></i>
                    </div>
                </a>
                <a class="col-lg btn btn-outline-primary m-2 text-start" role="button">
                    <div class="d-flex w-100 p-2">
                        <div class="flex-grow-1">
                            <h5>Total Audit Submitted</h5>
                            <x-spinner id="totalAuditSubmitted"></x-spinner>
                        </div>
                        <i class="fa-solid fa-envelopes-bulk chart-icon my-auto"></i>
                    </div>
                </a>
                <a class="col-lg btn btn-outline-primary m-2 text-start" role="button">
                    <div class="d-flex w-100 p-2">
                        <div class="flex-grow-1">
                            <h5>Area Audited</h5>
                            <x-spinner id="areaAudited"></x-spinner>
                        </div>
                        <i class="fa-solid fa-warehouse chart-icon my-auto"></i>
                    </div>
                </a>
                <a class="col-lg btn btn-outline-primary m-2 text-start" role="button">
                    <div class="d-flex w-100 p-2">
                        <div class="flex-grow-1">
                            <h5>Audit Area Group</h5>
                            <x-spinner id="auditAreaGroup"></x-spinner>
                        </div>
                        <i class="fa-solid fa-check-double chart-icon my-auto"></i>
                    </div>
                </a>
            </div>
            <div class="row">
                <div class="col card m-2">
                    <div class="card-body">
                        <a href="#"><h5>Current Cycle Audit by Status</h5></a>
                        <div style="min-height: 284px">
                            <canvas id="currentAuditCycleStatus"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col card m-2">
                    <div class="card-body">
                        <a href="#"><h5>Not Started and In-progress Audit by Area Audit Group</h5></a>
                        <div style="min-height: 284px">
                            <canvas id="notStartedAndInProgressAudit"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col card m-2">
                    <div class="card-body">
                        <a href="#"><h5>Submitted Audit by Area Audit Group</h5></a>
                        <div style="min-height: 284px">
                            <canvas id="submittedAudit"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col card m-2">
                    <div class="card-body">
                        <a href="#"><h5>Top 10 Failed Parameter for Current Cycle</h5></a>
                        <div style="min-height: 284px">
                            <canvas id="top10FailedParams"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-layouts.admin>
