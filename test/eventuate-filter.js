var test      = require('tape'),
    eventuate = require('eventuate-core'),
    filter    = require('..')

test('eventuate filter', function (t) {
    t.plan(12)

    var event = eventuate()
    var only1 = filter(event, function (v) { return v === 1 })

    t.notOk(event.hasConsumer(only1.upstreamConsumer), 'does not immediately add consumer to upstream event')
    t.ok(only1.consumerAdded, 'has consumerAdded')
    t.ok(only1.consumerRemoved, 'has consumerRemoved')
    t.ok(only1.hasConsumer() !== undefined, 'has hasConsumer')

    var eventCount = 0
    event(function () {
        eventCount++
    })

    var only1Count = 0
    only1(function (v) {
        t.equal(v, 1, 'should only get filtered values')
        only1Count++
    })

    t.ok(event.hasConsumer(only1.upstreamConsumer), 'lazily adds consumer to upstream event')
    t.true(only1.hasConsumer(), 'registers consumers')

    event.produce(2)
    event.produce(1)
    event.produce(5)
    event.produce(3)
    event.produce(1)
    event.produce(1)

    // after destroy, no more events should propogate
    only1.destroy()
    t.notOk(~event.getConsumers().indexOf(only1.upstreamConsumer), 'destroy removes consumer from upstream event')
    event.produce(1)
    event.produce(1)

    t.equal(eventCount, 8, 'produce 6 events')
    t.equal(only1Count, 3, 'should filter out non matching events')
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
