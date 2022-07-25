<div class="tab-pane fade {{ isset($shown) ? 'show active' : '' }} h-100" id="{{ $id }}" role="tabpanel" aria-labelledby="{{ $labelledBy }}" tabindex="0">
    <div class="d-flex flex-column h-100">
        @isset($navbar)
        <nav class="navbar bg-white px-1 py-3">
            <div class="container-fluid justify-content-start">
                {{ $navbar }}
            </div>
        </nav>
        @endisset
        <div class="flex-fill overflow-auto px-4">
            {{ $slot }}
        </div>
    </div>
</div>
