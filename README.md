> As of version `1.0.0` this library exposes [ES modules](http://exploringjs.com/es6/ch_modules.html#sec_basics-of-es6-modules). Use an ES module aware bundler such as [Webpack](https://webpack.js.org) or [Rollup](https://rollupjs.org) to bundle it for the browser.

# diagram-js

[![Build Status](https://travis-ci.com/bpmn-io/diagram-js.svg?branch=develop)](https://travis-ci.com/bpmn-io/diagram-js)

A toolbox for displaying and modifying diagrams on the web.


## Built with diagram-js

Some libraries / applications built on top of diagram-js:

#### Part of [bpmn.io](https://bpmn.io/)

* [bpmn-js](https://github.com/bpmn-io/bpmn-js) - A BPMN 2.0 viewer / modeler ([Demo](https://demo.bpmn.io/bpmn))
* [cmmn-js](https://github.com/bpmn-io/cmmn-js) - A CMMN 1.1 viewer / modeler ([Demo](https://demo.bpmn.io/cmmn))
* [dmn-js](https://github.com/bpmn-io/dmn-js) - A DMN 1.3 viewer / modeler / table editor ([Demo](https://demo.bpmn.io/dmn))

#### External

* [Node Sequencer](https://github.com/philippfromme/node-sequencer) - A Node-Based Sequencer for the Web ([Demo](https://philippfromme.github.io/node-sequencer-demo/))
* [chor-js](https://github.com/bptlab/chor-js) - A BPMN 2.0 Choreography diagram viewer and editor
* [postit-js](https://github.com/pinussilvestrus/postit-js) - Create Post-it boards on a canvas editor ([Demo](https://postit-js-demo.netlify.app/))

## Resources

* [Issues](https://github.com/bpmn-io/diagram-js/issues)
* [Changelog](./CHANGELOG.md)
* [Contributing Guide](https://github.com/bpmn-io/diagram-js/blob/master/.github/CONTRIBUTING.md)
* [Examples](https://github.com/bpmn-io/diagram-js-examples)


## Hacking the Project

To get the development setup make sure to have [NodeJS](https://nodejs.org/en/download/) installed.
As soon as you are set up, clone the project and execute

```
npm install
```


### Testing

Execute `npm run dev` to run the test suite in watch mode.

Expose an environment variable `TEST_BROWSERS=(Chrome|Firefox|IE)` to execute the tests in a non-headless browser.


### Package

Execute `npm run all` to lint and test the project.

__Note:__ We do not generate any build artifacts. Required parts of the library should be bundled by modelers / viewers as needed instead.



## License

MIT
