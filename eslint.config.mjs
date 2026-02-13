import NodeConfig from "@prdev-solutions/eslint-config/node.mjs";

export default [
  ...NodeConfig,
  {
    files: ["scripts/**", "**/dtos/**"],
    rules: {
      "no-magic-numbers": ["off"]
    }
  },
  {
    rules: {
      complexity: ["error", { max: 10 }]
    }
  }
];
