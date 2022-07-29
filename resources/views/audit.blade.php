<x-layouts.submenus title="Audit" page-id="1">
    <x-slot:tabs>
        <x-tab active id="cyclesTab" target="cyclesTabPane"><i class="fa-solid fa-arrows-spin"></i> Cycles</x-tab>
        <x-tab id="recordsTab" target="recordsTabPane"><i class="fa-solid fa-list me-1"></i> Records</x-tab>
        <x-tab id="detailsTab" target="detailsTabPane">Details</x-tab>
    </x-slot:tabs>

    <x-submenu_tab_pane shown id="cyclesTabPane" labelled-by="cyclesTab">
        <x-slot:navbar>
            <x-indicator_button style="success" id="newCycleBtn"><i class="fa-solid fa-plus"></i> Start New Cycle</x-indicator_button>
            <button class="btn btn-outline-primary me-2" type="button" id="refreshCyclesBtn"><i class="fa-solid fa-arrow-rotate-right"></i></button>
        </x-slot:navbar>
        <div class="col h-100" id="cyclesTableWrapper"></div>
    </x-submenu_tab_pane>

    <x-submenu_tab_pane id="recordsTabPane" labelled-by="recordsTab">

    </x-submenu_tab_pane>

    <x-submenu_tab_pane id="detailsTabPane" labelled-by="detailsTab">

    </x-submenu_tab_pane>
</x-layouts.submenus>
