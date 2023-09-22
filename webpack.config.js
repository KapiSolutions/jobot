import { resolve as _resolve } from "path";

export const entry = "./src/server.ts";
export const target = "node";
export const output = {
  filename: "bundle.js",
  path: _resolve(__dirname, "dist"), // Output directory
};
export const module = {
  rules: [
    {
      test: /\.ts$/,
      use: "ts-loader",
      exclude: /node_modules/,
    },
  ],
};
export const resolve = {
  extensions: [".ts", ".js"],
};
