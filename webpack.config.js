const currentTask = process.env.npm_lifecycle_event
const path = require("path");           // 2. node library link of path package for path.resolve below
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const fse = require('fs-extra')

const postCSSPlugins = [                // 7 b. Plugins of PostCSS
  require('postcss-import'),
  require('postcss-mixins'),
  require('postcss-simple-vars'),
  require('postcss-nested'),
  require('postcss-hexrgba'),
  require('autoprefixer')
]

class RunAfterCompile {
  apply(compiler) {
    compiler.hooks.done.tap('Copy images', function () {
      fse.copySync('./app/assets/images', './docs/assets/images')
    })
  }
}

let cssConfig = {
  test: /\.css$/i,
  use: [
    //'style-loader', // we want different loaders for dev and build
    'css-loader?url=false',
    {
      loader: 'postcss-loader',
      options: { plugins: postCSSPlugins }
    }]
}

let pages = fse.readdirSync('./app').filter(function (file) {
  return file.endsWith('.html')
}).map(function (page) {
  return new HtmlWebpackPlugin({ filename: page, template: `./app/${page}` })
})

let config = {  // common parts for dev and build versions of webpack dev or build
  entry: "./app/assets/scripts/App.js",
  plugins: pages,//[new HtmlWebpackPlugin({ filename: 'index.html', template: './app/index.html' })],
  module: {
    rules: [
      cssConfig
    ]
  }
}


if (currentTask == 'dev') {
  cssConfig.use.unshift('style-loader')
  config.output = {
    filename: "bundled.js",
    path: path.resolve(__dirname, "app")
  }
  config.devServer = {
    before: function (app, server) {
      server._watch('./app/**/*.html')
    },
    contentBase: path.join(__dirname, 'app'),
    hot: true,
    port: 3000,
    host: '0.0.0.0'
  }
  config.mode = 'development'
}
if (currentTask == 'build') {
  config.module.rules.push({
    test: /\.js$/,
    exclude: /(node_modules)/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env']
      }
    }
  })
  cssConfig.use.unshift(MiniCssExtractPlugin.loader)
  postCSSPlugins.push(require('cssnano'))
  config.output = {
    filename: "[name].[chunkhash].js",
    chunkFilename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, "docs")  //was dist
  }
  config.mode = 'production'
  config.optimization = {
    splitChunks: { chunks: 'all' }
  }
  config.plugins.push(
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({ filename: 'styles.[chunkhash].css' }),
    new RunAfterCompile()
  )
}

module.exports = config




let deletemelater = {//module.exports = {
  entry: "./app/assets/scripts/App.js", // 1. where we begin
  output: {
    filename: "bundled.js",
    path: path.resolve(__dirname, "app")// 3. webpack requires an absolute path for the output
  },
  devServer: {                          // 8. web-dev-server
    before: function (app, server) {
      server._watch('./app/**/*.html')  // 9. add to watch html changes
    },
    contentBase: path.join(__dirname, 'app'),
    hot: true,                          // no reload of CSS & JS and auto-refresh on changes in HTML - hot module replacement
    port: 3000,                          // default 8080, 3000 easier to recall
    host: '0.0.0.0'                     // 10. be able to visit from same wifi
  },
  mode: 'development',                  // 4. mode
  //  watch: true,                          // 5. tell webpack to keep watching for changes and re-bundle on change
  module: {
    rules: [                            // 6. what webpack to do with different type files   // if a file ends in .css use the css-loader module
      {
        test: /\.css$/i,                // if a file ends in .css use the css-loader module
        use: [
          'style-loader',               // render styles
          'css-loader?url=false',       // understand css - out of the box webpack understands only js, //added the ?url=false for comment By default, the css-loader will attempt to handle any images we reference in our CSS (e.g. background images, etc...). While this is great in certain situations, for our usage in this course we want to disable this and we'll manage our image files manually. With this in mind, when you list 'css-loader' in your webpack.config.js file you'll want to add an option to the end of it like this 'css-loader?url=false' instead. 
          {
            loader: 'postcss-loader',   // 7. post css webpack support
            options: { plugins: postCSSPlugins }
          }]
      }
    ]
  }
}

