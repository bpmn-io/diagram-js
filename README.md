> As of version `1.0.0` this library exposes ES modules. Use an ES module aware transpiler such as Webpack, Rollup or Browserify + babelify to bundle it for the browser.

# diagram-js

[![Build Status](https://travis-ci.org/bpmn-io/diagram-js.svg?branch=master)](https://travis-ci.org/bpmn-io/diagram-js)

A toolbox for displaying and modifying diagrams on the web.


## Built with diagram-js

Some libraries / applications built on top of diagram-js:

#### Part of [bpmn.io](https://bpmn.io/)

* [bpmn-js](https://github.com/bpmn-io/bpmn-js) - A BPMN 2.0 viewer / modeler ([Demo](https://demo.bpmn.io/bpmn))
* [cmmn-js](https://github.com/bpmn-io/cmmn-js) - A CMMN 1.1 viewer / modeler ([Demo](https://demo.bpmn.io/cmmn))
* [dmn-js](https://github.com/bpmn-io/dmn-js) - A DMN 1.1 viewer / modeler / table editor ([Demo](https://demo.bpmn.io/dmn))

#### External

* [Gitter](https://github.com/philippfromme/gitter) - A node-based sequencer ([Demo](https://philippfromme.github.io/gitter-demo/))


## Resources

* [Issues](https://github.com/bpmn-io/diagram-js/issues)
* [Changelog](./CHANGELOG.md)
* [Contributing Guide](https://github.com/bpmn-io/diagram-js/blob/master/CONTRIBUTING.md)
* [Example Application](https://github.com/bpmn-io/diagram-js/tree/master/example)


## Hacking the Project

To get the development setup make sure to have [NodeJS](https://nodejs.org/en/download/) installed.
If your set up, clone the project and execute

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