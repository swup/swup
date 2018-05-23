const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const fs = require('fs')
var glob = require("glob");
let plugins = [];

glob.sync("./src/plugins/**.js").forEach(item => {
    plugins.push(item.replace('./src/plugins/', '').replace('.js', ''));
});

const baseConfig = {
    mode: "production",
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    presets: ['es2015', 'stage-0'],
                }
            }
        ]
    },
    optimization: {
        minimizer: [
            // we specify a custom UglifyJsPlugin here to get source maps in production
            new UglifyJsPlugin({
                uglifyOptions: {
                    compress: false,
                    ecma: 6,
                    mangle: true
                },
                include: /\.min\.js$/
            })
        ]
    }
}

const swupConfig = Object.assign({}, baseConfig, {
    entry: {
        "swup": "./entry.js",
        "swup.min": "./entry.js",
    },
    output: {
        path: __dirname + "/dist/",
        library: "Swup",
        libraryTarget: "umd",
        filename: "[name].js",
    },
})


function createPluginConfig(pluginName) {
    let config = Object.assign({}, baseConfig, {
        entry: {},
        output: {
            path: __dirname + "/dist/plugins",
            library: pluginName,
            libraryTarget: "umd",
            filename: "[name].js",
        },
    })

    config.entry[pluginName] = `./src/plugins/${pluginName}.js`
    config.entry[pluginName + ".min"] = `./src/plugins/${pluginName}.js`

    return config
}

let configsArray = []
configsArray.push(swupConfig)
plugins.forEach(item => {
    configsArray.push(createPluginConfig(item))
})

module.exports = configsArray
