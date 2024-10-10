import bpmnIoPlugin from 'eslint-plugin-bpmn-io';

export default [
  ...bpmnIoPlugin.configs.node.map(config => {

    return {
      ...config,
      files: [
        '*.js',
        '*.mjs'
      ]
    };
  }),
  ...bpmnIoPlugin.configs.browser.map(config => {

    return {
      ...config,
      files: [
        'lib/**/*.js'
      ]
    };
  }),
  ...bpmnIoPlugin.configs.mocha.map(config => {

    return {
      ...config,
      files: [
        '**/test/**/*.js'
      ]
    };
  }),
  {
    languageOptions: {
      globals: {
        sinon: true
      }
    },
    rules: {
      'mocha/no-setup-in-describe': 'off',
      'mocha/no-sibling-hooks': 'off',
      'mocha/max-top-level-suites': 'off',
      'mocha/no-pending-tests': 'off',
      'mocha/no-skipped-tests': 'off'
    },
    files: [
      '**/test/**/*.js'
    ]
  }
];