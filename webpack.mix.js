let mix = require('laravel-mix');

mix.react()
    .extract(['react'])
    .js('resources/js/app.js', 'public/js')
    .sourceMaps();
