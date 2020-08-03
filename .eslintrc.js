module.exports = {
  extends: ['airbnb-base', 'prettier'],
  rules: {
      // style rules such as spacing and line-length are handled by prettier in .prettierrc
      'prettier/prettier': 2,
      // do not require trailing commas in multiline object literals
      'comma-dangle': ['off'],
      // address issues with chai expect statements causing errors
      'no-unused-expressions': 0,
      'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0 }],
      // ignore devDependencies
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'prefer-arrow-callback': 2,
      'no-console': 0
  },
  env: {
      node:true
  },
  plugins: ['prettier']
};
