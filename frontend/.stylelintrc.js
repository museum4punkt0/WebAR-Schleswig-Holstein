module.exports = {
  plugins: ['stylelint-color-format'],
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recommended-vue',
    'stylelint-config-recess-order',
    'stylelint-config-prettier',
  ],
  rules: {
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['v-deep'],
      },
    ],
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['apply', 'variants', 'responsive', 'screen'],
      },
    ],
    'no-empty-source': null,
    'property-no-unknown': true,
    'declaration-block-trailing-semicolon': 'always',
    'block-closing-brace-newline-after': 'always',
    'block-closing-brace-newline-before': 'always',
    'block-opening-brace-newline-after': 'always',
    'max-line-length': 80,
    'color-format/format': {
      format: 'rgb',
    },
  },
}
