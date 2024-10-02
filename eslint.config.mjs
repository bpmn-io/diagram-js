import bpmnIoPlugin from 'eslint-plugin-bpmn-io';

export default [
  ...bpmnIoPlugin.configs.browser.map((config) => {
    return {
      ...config,
      files: [ 'lib/**/*.js' ]
    };
  }),
  ...bpmnIoPlugin.configs.mocha.map((config) => {
    return {
      ...config,
      files: [ 'test/**/*.js' ]
    };
  })
];