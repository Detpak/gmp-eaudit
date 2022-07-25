<x-layouts.admin title="{{ $title }}" page-id="{{ $pageId }}">
    <x-slot:controls>
        <x-tabs>
            {{ $tabs }}
        </x-tabs>
    </x-slot:controls>
    <div class="tab-content h-100" id="myTabContent">
        {{ $slot }}
    </div>
</x-layouts.admin>
