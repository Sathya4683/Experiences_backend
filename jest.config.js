/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  //Giving ts-jest access to the same tsconfig
  globals: {
    "ts-jest": {
      tsconfig: {
        target: "ES2020",
        module: "commonjs",
        esModuleInterop: true,
        strict: true,
        skipLibCheck: true,
      },
    },
  },
};
