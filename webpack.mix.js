let mix = require('laravel-mix');
require('laravel-mix-compress')

mix.react()
    .extract(['react'])
    .js('resources/js/app.js', 'public/js')
    .sourceMaps()

if (mix.inProduction()) {
    mix.minify();
}

//mix.sass('resources/sass/app.scss', 'public/css');
