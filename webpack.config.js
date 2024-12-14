const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const isProduction = process.env.NODE_ENV == "production";

const stylesHandler = "style-loader";

const config = {
    entry: "./src/index.ts",

    output: {
        path: path.resolve(__dirname, "dist"),
        publicPath: "/"
    },
    devServer: {
        open: true,
        host: "localhost",
        static: [
            {
                directory: path.join(__dirname, "public"),
                publicPath: "/assets"
            },
            {
                directory: path.join(__dirname, "dist")
            }
        ],
        compress: true,
        port: 8080
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "index.html"
        })
    ],

    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                loader: "ts-loader",
                exclude: ["/node_modules/"]
            },
            {
                test: /\.s[ac]ss$/i,
                use: [stylesHandler, "css-loader", "sass-loader"]
            },
            {
                test: /\.(png|jpg)$/i,
                type: "asset/resource",
                generator: {
                    filename: "assets/[name][ext]"
                }
            },
            {
                test: /\.(glsl|wgsl)$/i,
                type: "asset/source"
            }

            // AddRRour rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
        ]
    },

    resolve: {
        extensions: [".tsx", ".ts", ".jsx", ".js", "..."],
        alias: {
            src: path.resolve(__dirname, "src") // Map '@src' to the 'src' folder
        }
    }
};

module.exports = () => {
    if (isProduction) {
        config.mode = "production";
    } else {
        config.mode = "development";
    }

    return config;
};
