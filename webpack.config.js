const exec = require('child_process').exec;

const path = require("path");
const webpack = require('webpack')

const isProductionBuild = process.env.NODE_ENV === "production";

const mode = isProductionBuild ? "production" : "development";
const devtool = isProductionBuild ? 'source-map' : "source-map";



console.log(`Build mode: ${mode}`);

const outDir = path.join(__dirname, "bundle");

console.log(outDir);

const commonConfig = {
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },

    target: "electron-renderer",
    resolve: {
        extensions: [".ts", ".js"],
    },
    mode,
    node: false,
    devtool,

};


const mainConfig = {
    entry: path.join(__dirname, "src", "main.ts"),
    output: {
        filename: "main.js",
        path: outDir,
    },
    target: "electron-main",
    resolve: {
        extensions: [".ts", ".js"],
    }
};

const rendererConfig = {
    entry: path.join(__dirname, "src", "window", "index.ts"),
    output: {
        filename: "index.js",
        path: outDir,
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.type': '"renderer"'
        }),
    ]
};

const preloadConfig = {
    entry: path.join(__dirname, "src", "preload.ts"),
    output: {
        filename: "preload.js",
        path: outDir,
    },
    target: "electron-main",
    resolve: {
        extensions: [".ts", ".js"],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.type': '"renderer"'
        }),
    ]
}

module.exports = [

    Object.assign({}, commonConfig, mainConfig),
    Object.assign({}, commonConfig, preloadConfig),
    Object.assign({}, commonConfig, rendererConfig)
];
