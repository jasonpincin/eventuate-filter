var test                     = require('tape'),
    Promise                  = require('promise-polyfill'),
    eventuate                = require('eventuate-core'),
    EventuateUnconsumedError = require('eventuate-core/errors').EventuateUnconsumedError,
    filter                   = require('..')

test('accepts options', function (t) {
    t.plan(1)

    var event = eventuate()
    filter(event, { lazy: false, requireConsumption: true }, function (data) {
        return !!data.alert
    })

    t.throws(function () {
        event.produce({ alert: true })
    }, EventuateUnconsumedError)
})

test('eventuate filter lazily consumes by default', function (t) {
    t.plan(2)

    var event = eventuate()
    var only1 = filter(event, function (v) { return v === 1 })

    t.notOk(event.hasConsumer(only1.upstreamConsumer), 'does not immediately add consumer to upstream event')
    only1(function () {})
    t.ok(event.hasConsumer(only1.upstreamConsumer), 'lazily adds consumer to upstream event')
})

test('has no consumer initially', function (t) {
    t.plan(1)

    var event = eventuate()
    var only1 = filter(event, function (v) { return v === 1 })

    t.equal(only1.hasConsumer(), false, 'has no consumer')
})

test('eventuate filter syncronoysly filters data', function (t) {
    t.plan(6)

    var event = eventuate()
    var only1 = filter(event, function (v) { return v === 1 })

    var eventCount = 0
    event(function () {
        eventCount++
    })

    var only1Count = 0
    only1(function (v) {
        t.equal(v, 1, 'should only get filtered values')
        only1Count++
    })

    t.true(only1.hasConsumer(), 'registers consumers')

    event.produce(2)
    event.produce(1)
    event.produce(5)
    event.produce(3)
    event.produce(1)
    event.produce(1)

    t.equal(eventCount, 6, 'produce 6 events')
    t.equal(only1Count, 3, 'should filter out non matching events')
})

test('events do not propogate after destroyed', function (t) {
    t.plan(2)

    var event = eventuate()
    var only1 = filter(event, function (v) { return v === 1 })

    var eventCount = 0
    event(function () {
        eventCount++
    })

    var only1Count = 0
    only1(function (v) {
        only1Count++
    })
    only1.destroy()
    event.produce(1)
    t.equal(eventCount, 1)
    t.equal(only1Count, 0)
})

test('does not lazily consume after being destroyed', function (t) {
    t.plan(2)

    var event = eventuate()
    var oddEvents = filter(event, odd)
    t.notOk(event.hasConsumer(oddEvents.upstreamConsumer), 'consumer NOT in upstream')
    oddEvents.destroy()
    oddEvents(function () {})
    t.notOk(event.hasConsumer(oddEvents.upstreamConsumer), 'consumer NOT in upstream')

    function odd (x) {
        return x % 2 === 1
    }
})

test('removed upstream consumer when destroyed', function (t) {
    t.plan(2)

    var event = eventuate()
    var oddEvents = filter(event, odd)

    oddEvents(function () {})
    t.ok(event.hasConsumer(oddEvents.upstreamConsumer), 'consumer in upstream')
    oddEvents.removeAllConsumers()
    t.notOk(event.hasConsumer(oddEvents.upstreamConsumer), 'consumer NOT in upstream')

    function odd (x) {
        return x % 2 === 1
    }
})

test('supports destroyResidual option', function (t) {
    t.plan(2)

    var event = eventuate()
    var oddEvents = filter(event, { destroyResidual: false }, odd)

    oddEvents(function () {})
    t.ok(event.hasConsumer(oddEvents.upstreamConsumer), 'consumer in upstream')
    oddEvents.removeAllConsumers()
    t.ok(event.hasConsumer(oddEvents.upstreamConsumer), 'consumer still in upstream')

    function odd (x) {
        return x % 2 === 1
    }
})

test('accepts async filter', function (t) {
    t.plan(2)

    var event = eventuate()
    var chosenEvents = filter(event, choose)

    chosenEvents(function (data) {
        t.equal(data, 42)
    })
    event.produce('hello')
    event.produce(42)
    event.produce('hello')
    event.produce(42)

    function choose (data, cb) {
        setTimeout(function () {
            if (typeof data === 'number') cb(null, true)
            else cb(null, false)
        }, 50)
    }
})

test('supports filter returning a promise ', function (t) {
    t.plan(2)

    var event = eventuate()
    var chosenEvents = filter(event, choose)

    chosenEvents(function (data) {
        t.equal(data, 42)
    })
    event.produce('hello')
    event.produce(42)
    event.produce('hello')
    event.produce(42)

    function choose (data) {
        return new Promise(function (resolve) {
            setTimeout(function () {
                if (typeof data === 'number') resolve(true)
                else resolve(false)
            }, 50)
        })
    }
})

test('callback errors are produced', function (t) {
    t.plan(4)

    var event = eventuate()
    var chosenEvents = filter(event, choose)

    chosenEvents(function (data) {
        t.fail('should not receive data')
    })
    chosenEvents.error(function (err) {
        t.ok(err instanceof Error, 'is Error')
        t.equal(err.message, 'boom', 'message = boom')
    })
    event.produce('hello')
    event.produce(42)

    function choose (data, cb) {
        setTimeout(function () {
            if (typeof data === 'number') cb(new Error('boom'))
            else cb(new Error('boom'))
        }, 50)
    }
})

test('promise errors are produced', function (t) {
    t.plan(4)

    var event = eventuate()
    var chosenEvents = filter(event, choose)

    chosenEvents(function (data) {
        t.fail('should not receive data')
    })
    chosenEvents.error(function (err) {
        t.ok(err instanceof Error, 'is Error')
        t.equal(err.message, 'boom', 'message = boom')
    })
    event.produce('hello')
    event.produce(42)

    function choose (data) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                reject('boom')
            }, 50)
        })
    }
})
