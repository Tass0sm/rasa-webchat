const path = require("path");
// eslint-disable-next-line import/no-extraneous-dependencies
const CleanWebpackPlugin = require("clean-webpack-plugin");
const { version } = require("./package.json");

module.exports = {
  entry: "./index.js",
  externals: {
    react: {
      root: "React",
      commonjs2: "react",
      commonjs: "react",
      amd: "react",
      umd: "react"
    },
    "react-dom": {
      root: "ReactDOM",
      commonjs2: "react-dom",
      commonjs: "react-dom",
      amd: "react-dom",
      umd: "react-dom"
    }
  },
  output: {
    path: path.join(__dirname, "/lib"),
    filename: "bundle.js",
    library: "WebChat",
    libraryTarget: "umd"
  },
  resolve: {
    extensions: [".js", ".jsx"],
    fallback: {
      path: require.resolve("path-browserify")
    }
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "string-replace-loader",
            options: {
              search: "PACKAGE_VERSION_TO_BE_REPLACED",
              replace: version
            }
          },
          { loader: "babel-loader" }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          {
            loader: "sass-loader",
            options: {
              sassOptions: {
                includePaths: [path.resolve(__dirname, "src/scss/")]
              }
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(jpg|png|gif|svg|woff|ttf|eot)$/,
        type: "asset/resource"
      }
    ]
  },
  plugins: [new CleanWebpackPlugin(["lib"])]
};
