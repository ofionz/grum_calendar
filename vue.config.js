module.exports = {
    publicPath: './',
    indexPath: 'index.php',
    chainWebpack: config => {
        if (process.env.NODE_ENV === 'production') {
            config
                .plugin('html')
                .tap(args => {
                    args[0].template = './index_template.php'
                    args[0].minify.removeAttributeQuotes = false
                    return args
                })
        }
    },
    runtimeCompiler: true,
    transpileDependencies: ['vuetify'],
    configureWebpack: {
        optimization: {
            splitChunks: false,
        },
        output: {
            filename: "js/[name][hash].js",
            chunkFilename: "js/c-[name][hash].js",
        },
    },
    css: {
        extract: {
            ignoreOrder: true,
            filename: "css/[name][hash].css",
            chunkFilename: "css/c-[name][hash].css",
        },
    },
}
