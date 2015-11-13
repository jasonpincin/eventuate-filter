# eventuate-filter

[![NPM version](https://badge.fury.io/js/eventuate-filter.png)](http://badge.fury.io/js/eventuate-filter)
[![Build Status](https://travis-ci.org/jasonpincin/eventuate-filter.svg?branch=master)](https://travis-ci.org/jasonpincin/eventuate-filter)
[![Coverage Status](https://coveralls.io/repos/jasonpincin/eventuate-filter/badge.png?branch=master)](https://coveralls.io/r/jasonpincin/eventuate-filter?branch=master)
[![Sauce Test Status](https://saucelabs.com/browser-matrix/jp-project9.svg)](https://saucelabs.com/u/jp-project9)

Create an eventuate that re-produces a subset of events from another eventuate.

This tiny module is also part of the larger aggregate module: 
[eventuate](https://github.com/jasonpincin/eventuate)

This module may also be used stand-alone, with 
[eventuate-core](https://github.com/jasonpincin/eventuate-core).

## example

```javascript
var eventuate = require('eventuate-core'),
    filter    = require('eventuate-filter')

var logMessage = eventuate()
var errorMessage = filter(logMessage, function (log) {
    return log.level === 'error'
})

errorMessage(function (log) {
    console.error(log.message)
})

logMessage.produce({ level: 'info', message: 'something happened' })
logMessage.produce({ level: 'error', message: 'something bad happened' })
logMessage.produce({ level: 'info', message: 'something else happened' })

// output:
// something bad happened
```

## api

```javascript
var eventuate = require('eventuate-core')
var filter    = require('eventuate-filter')

var upstreamEventuate = eventuate()
```

The API of the `filteredEventuate` is mostly identical to the `eventuate` it 
is filtering. 

### var filteredEventuate = filter(upstreamEventuate, options, filterFunc)

Returns a new eventuate, `filteredEventuate`, which re-produces events from 
a non-basic eventuate, `upstreamEventuate`, for which `filterFunc` returns or 
resolves to `true`. 

Valid options are:
* `requireConsumption` (default: `false`) - throw an error if a produced event is not consumed
* `destroyResidual` (default: `true`) - call the destroy function when the last
  consumer is removed via `removeConsumer` or `removeAllConsumers` (after at
  least one consumer was added)
* `lazy` (default: `true`) - wait until a consumer is added before consuming
  from `upstreamEventuate`. If set to `false`, will begin
  consuming/filtering/producing immediately, even with no consumers added. This
  is useful when used in conjunction with `requireConsumption`, for example.


The `filterFunc` function should accept at least one argument, `data`, but may
optionally accept a 2nd argument of a `callback`; `eventuate-filter` will
determine whether a callback is accepted based on the argument `length` of the
`filterFunc` function. 

If a callback is NOT accepted, then `filterFunc` should return either a `boolean` 
or a `Promise`. If a `Promise` is returned, it should resolve to a `boolean`. If
a callback is accepted, the return value of `filterFunc` is ignored, and the
error-first style callback (`function (err, bool) {}`) must be called with
either a truthy `error` or a falsey `error` and a `boolean`. 

Upon receiving a `truthy` boolean from either a return value, Promise, or
callback, the `filteredEventuate` will produce the `data` in question.

If either the `callback` is supplied an `error`, or the `Promise` is `rejected`,
then the `filteredEventuate` will produce an `Error` object.

### filteredEventuate.destroy()

When destroyed, the `filteredEventuate` will stop consuming from the
`upstreamEventuate`. The `filteredEventuate` is automatically destroyed unless
the `destroyResidual` option was given as `false` during creation of the
`filteredEventuate`.

### filteredEventuate.upstreamConsumer

The function added as a consumer to the `upstreamEventuate`.

## install

With [npm](https://npmjs.org) do:

```
npm install --save eventuate-core
```

## testing

`npm test`

Or to run tests in phantom: `npm run phantom`

### coverage

`npm run view-cover`

This will output a textual coverage report.

`npm run open-cover`

This will open an HTML coverage report in the default browser.
