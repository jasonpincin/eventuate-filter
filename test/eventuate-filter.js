var test      = require('tape'),
    eventuate = require('eventuate'),
    filter    = require('..')

test('eventuate filter', function (t) {
    var event = eventuate()
    var only1 = filter(event, function (v) { return v === 1 })

    t.equal(only1.produce, undefined, 'has no produce function')
    t.ok(only1.consumerAdded, 'has consumerAdded')
    t.ok(only1.consumerRemoved, 'has consumerRemoved')
    t.ok(only1.hasConsumer !== undefined, 'has hasConsumer')

    var eventCount = 0
    event(function (v) {
        eventCount++
    })

    var only1Count = 0
    only1(function (v) {
        t.equal(v, 1, 'should only get filtered values')
        only1Count++
    })

    t.true(only1.hasConsumer, 'registers consumers')

    event.produce(2)
    event.produce(1)
    event.produce(5)
    event.produce(3)
    event.produce(1)
    event.produce(1)

    t.equal(eventCount, 6, 'produce 6 events')
    t.equal(only1Count, 3, 'should filter out non matching events')

    t.end()
})
