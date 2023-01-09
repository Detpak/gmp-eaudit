let mix = require('laravel-mix');
require('laravel-mix-compress');

const plugins = [];

mix.react()
    .extract(['react'])
    .js('resources/js/app.js', 'public/js')
    .sourceMaps()
    .options({
        uglify: true
    });

if (mix.inProduction()) {
    mix.compress({ productionOnly: true });
}
