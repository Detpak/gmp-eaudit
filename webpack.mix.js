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
    // plugins.push(
    //     new CompressionPlugin({
    //         filename: "[file].compressed[query]",
    //         algorithm: 'gzip',
    //         test: /\.js$|\.css$/,
    //         threshold: 10240,
    //         minRatio: 0.8,
    //     })
    // );
}

mix.webpackConfig({
    plugins: plugins
});

// if (!mix.inProduction()) {
//     mix.sourceMaps();
// }

//mix.sass('resources/sass/app.scss', 'public/css');
