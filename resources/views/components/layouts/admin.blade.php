@php
    $pages = [
        ['title' => 'Dashboard',    'url' => 'dashboard',   'icon' => 'fa-chart-line',  'selected' => false],
        ['title' => 'Audit',        'url' => 'audit',       'icon' => 'fa-list-check',  'selected' => false],
        ['title' => 'Standard',     'url' => 'standard',    'icon' => 'fa-ruler',       'selected' => false],
        ['title' => 'Work Center',  'url' => 'work-center', 'icon' => 'fa-building',    'selected' => false],
        ['title' => 'Users',        'url' => 'users',       'icon' => 'fa-users',       'selected' => false],
        ['title' => 'Settings',     'url' => 'settings',    'icon' => 'fa-gear',        'selected' => false],
    ];

    if (env('APP_ENV') != 'production') {
        $pages[] = ['title' => 'Testbed', 'url' => 'testbed', 'icon' => 'fa-flask-vial', 'selected' => false];
    }

    $pages[$pageId]['selected'] = 'true';

    $fullname = Session::get('eaudit_name');
@endphp

<x-layouts.main title="e-Audit | {{ $title }}" viewtype="{{ $pages[$pageId]['url'] }}">
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
        <div class="vh-100 flex-fill bg-white overflow-auto">
            <div class="d-flex flex-column h-100">
                <div class="navbar navbar-light bg-light p-3">
                    @isset($controls)
                    {{ $controls }}
                    @else
                    <div class="p-2">e-Audit</div>
                    @endisset
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
                <div class="flex-fill overflow-auto">
                    {{ $slot }}
                </div>
            </div>
        </div>
    </div>
    <div class="position-fixed top-0 start-50 translate-middle-x p-3">
        <div id="msgToast" class="toast align-items-center" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    Hello, world! This is a toast message.
                </div>
                <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    </div>
</x-layouts.main>
