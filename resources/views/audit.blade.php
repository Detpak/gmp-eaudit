<x-layouts.admin title="Audit" page-id="1">
    <x-slot:controls>
        <ul class="nav nav-pills" id="auditTab" role="tablist">
            <li class="nav-item" role="presentation">
                <a class="nav-link active" id="cyclesTab" data-bs-toggle="tab" data-bs-target="#cyclesTabPane" type="button" role="tab" aria-controls="cyclesTabPane" aria-selected="true">Cycles</a>
            </li>
            <li class="nav-item" role="presentation">
                <a class="nav-link" id="recordTab" data-bs-toggle="tab" data-bs-target="#recordTabPane" type="button" role="tab" aria-controls="recordTabPane" aria-selected="false">Record</a>
            </li>
            <li class="nav-item" role="presentation">
                <a class="nav-link" id="detailTab" data-bs-toggle="tab" data-bs-target="#detailTabPane" type="button" role="tab" aria-controls="detailTabPane" aria-selected="false">Detail</a>
            </li>
        </ul>
    </x-slot:controls>
    <div class="tab-content h-100" id="myTabContent">
        <div class="tab-pane fade show active h-100" id="cyclesTabPane" role="tabpanel" aria-labelledby="cyclesTab" tabindex="0">
            <div class="d-flex flex-column h-100">
                <nav class="navbar bg-white px-1 py-3">
                    <div class="container-fluid justify-content-start">
                        <button class="btn btn-success me-2" type="button"><i class="fa-solid fa-plus"></i> New Cycle</button>
                        <button class="btn btn-outline-success me-2" type="button"><i class="fa-solid fa-file-excel"></i> Export</button>
                        <button class="btn btn-outline-primary me-2" type="button"><i class="fa-solid fa-arrow-rotate-right"></i></button>
                    </div>
                </nav>
                <div class="flex-fill overflow-auto px-4">
                    <table class="table">
                        <thead class="sticky-top bg-white">
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">First</th>
                                <th scope="col">Last</th>
                                <th scope="col">Handle</th>
                            </tr>
                        </thead>
                        <tbody class="table-group-divider">
                            <tr>
                                <th scope="row">1</th>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                            </tr>
                            <tr>
                                <th scope="row">2</th>
                                <td>Jacob</td>
                                <td>Thornton</td>
                                <td>@fat</td>
                            </tr>
                            <tr>
                                <th scope="row">3</th>
                                <td colspan="2">Larry the Bird</td>
                                <td>@twitter</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="tab-pane fade" id="recordTabPane" role="tabpanel" aria-labelledby="recordTab" tabindex="0">

        </div>
        <div class="tab-pane fade" id="detailTabPane" role="tabpanel" aria-labelledby="detailTab" tabindex="0">

        </div>
    </div>
</x-layouts.admin>
