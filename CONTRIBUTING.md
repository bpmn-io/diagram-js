# How to Contribute

Great to see you! Help us out by [filing bugs or feature requests](#working-with-issues), assisting others in our [forums](https://forum.bpmn.io/) or by [contributing improvements](#contributing-improvements).


## Table of Contents

* [Working with Issues](#working-with-issues)
    * [Creating an Issue](#creating-an-issue)
    * [Helping out](#helping-out)
* [Contributing Improvements](#contributing-improvements)
    * [Setting up the Project locally](#setting-up-the-project-locally)
    * [Discussing Code Changes](#discussing-code-changes)
    * [Creating a Pull Request](#creating-a-pull-request)


## Working with Issues

We use our [issue tracker](https://github.com/bpmn-io/diagram-js/issues) for project communication, discussion and planning.


### Creating an Issue

Help others to understand your request:

* Be clear whether you [file a bug](#reporting-a-bug) or [suggest a new feature/improvement](#suggesting-a-feature)
* Be descriptive when reporting (what, where, when and how)


#### Reporting a Bug

Help us to understand and reproduce your issue:

* Attach your environment (browser, diagram-js version)
* Attach steps to reproduce
* Attach code samples, configuration options or stack traces that provide the necessary context

If possible, try to build [a test case](https://github.com/bpmn-io/diagram-js/tree/master/test/spec) that reproduces your problem.
[See below](#setting-up-the-project) how to setup diagram-js for development.


#### Suggesting a Feature

* Provide the necessary context that allows us to understand how your proposal improves our library


### Helping out

* Share your perspective on issues
* Be helpful and respect others when commenting


## Contributing Improvements

Learn how to setup the project locally, make changes and contribute bug fixes and new features through pull requests.

### Setting up the Project

If you don't have [NodeJS](https://nodejs.org/en/download/) setup, do it beforehand.

The following code snippet sets up diagram-js on your machine.

```plain
mkdir bpmn.io
cd bpmn.io

git clone git@github.com:bpmn-io/diagram-js.git
(cd diagram-js && npm install)

// Run the test suite
bon test

// Running the test suite with every file change
TEST_BROWSERS=(Chrome|Firefox|IE) npm run dev
```



### Discussing Code Changes

Create a [pull request](#creating-a-pull-request) if you would like to have an in-depth discussion about some piece of code.


### Creating a Pull Request

We use pull requests for feature additions and bug fixes. If you are not yet familiar on how to create a pull request, [read this great guide](https://gun.io/blog/how-to-github-fork-branch-and-pull-request).

Some things that make it easier for us to accept your pull requests

* The code adheres to our conventions
    * spaces instead of tabs
    * single-quotes
    * ...
* The code is tested
* The `npm run all` build passes (executes tests + linting)
* The work is combined into a single commit
* The commit messages adhere to our [guideline](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y)


We'd be glad to assist you if you do not get these things right in the first place.


:heart: from the bpmn.io team.