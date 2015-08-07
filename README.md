# eventuate-filter

[![NPM version](https://badge.fury.io/js/eventuate-filter.png)](http://badge.fury.io/js/eventuate-filter)
[![Build Status](https://travis-ci.org/jasonpincin/eventuate-filter.svg?branch=master)](https://travis-ci.org/jasonpincin/eventuate-filter)
[![Coverage Status](https://coveralls.io/repos/jasonpincin/eventuate-filter/badge.png?branch=master)](https://coveralls.io/r/jasonpincin/eventuate-filter?branch=master)

Create filtered [eventuate](https://github.com/jasonpincin/eventuate), acting as subset of broader eventuate

## example

```javascript
var eventuate = require('eventuate'),
    filter    = require('eventuate-filter')

var pie = eventuate()
pie(function (p) {
    console.log('%s served...', p.type)
})

var shoofly = filter(pie, function (pie) {
    return pie.type === 'shoofly'
})
shoofly(function (p) {
    console.log('Love %s pie', p.type)
})

var everythingElse = filter(pie, function (pie) {
    return pie.type !== 'shoofly'
})
everythingElse(function (p) {
    console.log('Don\'t care for %s pie', p.type)
})

pie.produce({type: 'apple' })
pie.produce({type: 'cherry' })
pie.produce({type: 'shoofly' })
pie.produce({type: 'peach' })
```

## api

```javascript
var eventuate = require('eventuate')
var filter    = require('eventuate-filter')

var upstreamEventuate = eventuate()
```

### var filteredEventuate = filter(upstreamEventuate, filterFunc)

Returns a new eventuate which re-produces events from eventuate `upstreamEventuate` for which `filterFunc` returns true.  `filterFunc` should have the signature `function (data) { }`. This function receives all event data from `upstreamEventuate` and must return a truthy or falsey value.

If `upstreamEventuate` is an unmonitored eventuate, `filteredEventuate` will return an unmonitored eventuate.

### filteredEventuate.unsubscribe()

Stop consuming events from `upstreamEventuate` (and thus stop producing events). 

### filteredEventuate.upstreamConsumer

The function added as a consumer to the `upstreamEventuate`. Example:

```javascript
var consumerIdx = upstreamEventuate.consumers.indexOf(filteredEventuate.upstreamConsumer)
assert(consumerIdx >= 0)
```

## testing

`npm test [--dot | --spec] [--grep=pattern]`

Specifying `--dot` or `--spec` will change the output from the default TAP style. 
Specifying `--grep` will only run the test files that match the given pattern.

## coverage

`npm run coverage [--html]`

This will output a textual coverage report. Including `--html` will also open 
an HTML coverage report in the default browser.
