<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    {{-- @auth('admin')
    <meta name="api-token" content="{{ session()->get('access_token') }}">
    @endauth --}}
    @vite(['resources/css/app.css', 'resources/css/app.js'])
    @isset($title)<title>{{ $title }}</title>@endisset
</head>
<body>
    {{ $slot }}
</body>
</html>
