module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  globals: {
    BigInt: 'readonly'
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-undef': 'error',
    'default-case': 'warn',
    'react-hooks/exhaustive-deps': 'warn'
  },
  env: {
    browser: true,
    es2020: true,
    node: true
  }
};
