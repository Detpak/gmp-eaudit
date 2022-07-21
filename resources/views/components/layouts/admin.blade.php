@php
    $pages = [
        ['title' => 'Dashboard', 'url' => 'dashboard', 'icon' => 'fa-chart-line', 'selected' => false],
        ['title' => 'Audit', 'url' => 'audit', 'icon' => 'fa-list-check', 'selected' => false],
        ['title' => 'Standard', 'url' => 'standard', 'icon' => 'fa-ruler', 'selected' => false],
        ['title' => 'Work Center', 'url' => 'work-center', 'icon' => 'fa-building', 'selected' => false],
        ['title' => 'Settings', 'url' => 'settings', 'icon' => 'fa-gear', 'selected' => false],
    ];

    $currentPage = $pages[$pageId];
    $currentPage['selected'] = true;

    $fullname = Session::get('eaudit_name');
@endphp

<x-layouts.main title="e-Audit | {{ $title }}" viewtype="{{ $currentPage['url'] }}">
    <div class="d-flex flex-row main">
        <div class="d-flex flex-column min-vh-100 p-2 bg-primary bg-gradient text-white" style="width: 110px">
            <ul class="nav nav-pills flex-column mb-auto">
                @foreach ($pages as $page)
                <li class="nav-item">
                    <a href="{{ url("admin/{$page['url']}") }}" class="nav-link {{ $page['selected'] ? "active bg-white fw-bold text-primary" : "text-white sidebar-hover" }} px-2 mb-1">
                        <i class="fa-solid {{ $page['icon'] }} menu-icon d-block text-center"></i>
                        <p class="menu-text text-center m-0">{{ $page['title'] }}</p>
                    </a>
                </li>
                @endforeach
            </ul>
        </div>
        <div class="vh-100 flex-fill bg-white">
            <div class="d-flex flex-column h-100">
                <div class="sticky-top">
                    <div class="navbar navbar-light bg-light p-4">
                        <div class="navbar-nav">e-Audit</div>
                        <div class="dropdown d-flex flex-row">
                            <a class="text-truncate text-decoration-none pt-1 me-2" href="#" id="user_dropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <small>{{ $fullname }}</small>
                            </a>
                            <a class="dropdown-toggle pt-1" href="#" id="user_dropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false"></a>
                            <ul class="dropdown-menu shadow-lg" aria-labelledby="user_dropdown">
                                <li><a class="dropdown-item" href="{{ url('deauth') }}"><i class="fa-solid fa-right-from-bracket"></i> Logout</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="flex-fill overflow-auto">
                    <div class="p-4 h-100">
                        {{ $slot }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-layouts.main>
