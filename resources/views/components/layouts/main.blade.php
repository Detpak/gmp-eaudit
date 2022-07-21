<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @isset($viewtype)
    <meta name="viewtype" content="{{ $viewtype }}">
    <meta name="userid" content="{{ UserHelpers::getUserId() }}">
    @endisset

    {{-- @auth('admin')
    <meta name="api-token" content="{{ session()->get('access_token') }}">
    @endauth --}}
    <script src="{{ asset('js/app.js') }}"></script>
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
    @isset($title)<title>{{ $title }}</title>@endisset
</head>
<body>
    {{ $slot }}
</body>
</html>
