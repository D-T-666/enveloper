const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackMildCompile = require("webpack-mild-compile").Plugin;
const WebpackPwaManifest = require("webpack-pwa-manifest");
const WorkboxPlugin = require("workbox-webpack-plugin");

const prod = process.env.NODE_ENV === "production";

module.exports = {
  entry: "./src/index.ts",
  mode: prod ? "production" : "development",
  // externals: {
  //   p5: "p5",
  // },
  optimization: {
    chunkIds: "total-size",
    concatenateModules: true,
    innerGraph: false,
    mangleExports: "size",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        include: path.resolve(__dirname, "src"),
      },
      {
        test: /\.s[ac]ss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "build"),
  },

  devServer: {
    static: {
      directory: path.join(__dirname, "build"),
    },
    compress: true,
    port: 5500,
  },
  plugins: [
    new HtmlWebpackPlugin({
      favicon: "./src/assets/favicon.ico",
      template: "./src/index.html",
      filename: "index.html",
      inject: "body",
    }),
    new WebpackMildCompile({}),
    ...(prod
      ? [
          new WebpackPwaManifest({
            publicPath: prod ? "/enveloper/" : "/",
            // filename: "manifest.json",
            icons: [
              {
                src: path.resolve("src/assets/icon.png"),
                sizes: "192x192",
                type: "image/png",
              },
            ],
            description:
              "Generates envelopes with given pictures and dimensions.",
            display: "standalone",
            background_color: "#fff",
            theme_color: "#000",
            name: "enveloper",
            short_name: "enveloper",
            start_url: prod ? "/enveloper/index.html" : "/index.html",
          }),
          new WorkboxPlugin.GenerateSW({
            clientsClaim: true,
            skipWaiting: true,
          }),
        ]
      : []),
  ],
};
