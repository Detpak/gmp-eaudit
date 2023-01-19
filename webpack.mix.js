let mix = require('laravel-mix');
require('laravel-mix-compress');

mix.react()
    .extract(['react'])
    .js('resources/js/app.js', 'public/js')
    .sourceMaps()
    .compress({ productionOnly: true })
    .version()
    .options({
        uglify: true
    });
