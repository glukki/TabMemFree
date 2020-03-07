import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/background.js",
  output: {
    file: "build/background.js",
    format: "iife"
  },
  plugins: [resolve(), commonjs()]
};
