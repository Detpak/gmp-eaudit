let mix = require('laravel-mix');

mix.react()
    .extract(['react'])
    .js('resources/js/app.js', 'public/js')
    .sourceMaps();

//mix.sass('resources/sass/app.scss', 'public/css');
