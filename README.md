# diagram-js

[![CI](https://github.com/bpmn-io/diagram-js/workflows/CI/badge.svg)](https://github.com/bpmn-io/diagram-js/actions?query=workflow%3ACI)

A toolbox for displaying and modifying diagrams on the web.


## Built with diagram-js

Some libraries / applications built on top of diagram-js:

#### Part of [bpmn.io](https://bpmn.io/)

* [bpmn-js](https://github.com/bpmn-io/bpmn-js) - A BPMN 2.0 viewer / modeler ([Demo](https://demo.bpmn.io/bpmn))
* [cmmn-js](https://github.com/bpmn-io/cmmn-js) - A CMMN 1.1 viewer / modeler ([Demo](https://demo.bpmn.io/cmmn))
* [dmn-js](https://github.com/bpmn-io/dmn-js) - A DMN 1.3 viewer / modeler / table editor ([Demo](https://demo.bpmn.io/dmn))

#### External

* [Apache Seata Saga Designer](https://github.com/apache/incubator-seata/tree/2.x/saga/seata-saga-statemachine-designer) - A visual orchestration tool for Seata Saga transaction ([Demo](https://seata.apache.org/saga-designer/))
* [archimate-js](https://github.com/archimodel/archimate-js) - An ArchiMate diagram viewer and editor ([Demo](https://archimodel.net))
* [chor-js](https://github.com/bptlab/chor-js) - A BPMN 2.0 Choreography diagram viewer and editor ([Demo](https://bpt-lab.org/chor-js-demo/))
* [Node Sequencer](https://github.com/philippfromme/node-sequencer) - A Node-Based Sequencer for the Web ([Demo](https://philippfromme.github.io/node-sequencer-demo/))
* [object-diagram-js](https://github.com/timKraeuter/object-diagram-js) - An object diagram viewer and editor ([Demo](https://timkraeuter.com/object-diagram-js/))
* [postit-js](https://github.com/pinussilvestrus/postit-js) - Create Post-it boards on a canvas editor ([Demo](https://postit-js-demo.netlify.app/))

## Resources

* [Issues](https://github.com/bpmn-io/diagram-js/issues)
* [Changelog](./CHANGELOG.md)
* [Contributing Guide](.github/CONTRIBUTING.md)
* [Examples](https://github.com/bpmn-io/diagram-js-examples)


## Development

Prepare the project by installing all dependencies:

```sh
npm install
```

Then, depending on your use-case you may run any of the following commands:

```sh
# build the library and run all tests
npm run all

# run the development setup
npm run dev

# run tests (single run)
npm test
```

Expose an environment variable `TEST_BROWSERS=(Chrome|Firefox)` to execute the tests in a non-headless browser.

> [!NOTE]
> We do not generate any build artifacts. Required parts of the library should be bundled by consuming libraries as needed instead.


## License

MIT
