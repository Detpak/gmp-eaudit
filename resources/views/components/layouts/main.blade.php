{{-- <!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @isset($viewtype)
    <meta name="viewtype" content="{{ $viewtype }}">
    <meta name="token" content="{{ Session::get('eaudit_token') }}">
    @endisset

    <script src="{{ asset('js/app.js') }}"></script>
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
    @isset($title)<title>{{ $title }}</title>@endisset
</head>
<body>
    {{ $slot }}
</body>
</html> --}}

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    @if(Session::has('eaudit_token'))
    <meta name="token" content="{{ Session::get('eaudit_token') }}">
    @endif

    <meta name="root-url" content="{{ asset('') }}">

    @if(env('APP_DEBUG'))
    <meta name="development" content="1">
    @endif

    <title>e-Audit</title>
</head>
<body>
    <main id="main-container">{{ $slot }}</main>
    <script src="{{ asset('js/manifest.js') }}"></script>
    <script src="{{ asset('js/vendor.js') }}"></script>
    <script src="{{ asset('js/app.js') }}"></script>
</body>
</html>
