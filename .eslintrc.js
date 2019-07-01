module.exports = {
  env: {
    browser: true
  },
  extends: ["standard"],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  root: true
}