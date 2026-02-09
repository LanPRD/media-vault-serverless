import NodeConfig from "@prdev-solutions/eslint-config/node.mjs";

export default [
  ...NodeConfig,
  {
    files: ["scripts/**"],
    rules: {
      "no-magic-numbers": ["off"]
    }
  }
];
