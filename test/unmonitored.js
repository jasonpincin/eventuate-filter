var test      = require('tape'),
    eventuate = require('eventuate'),
    filter    = require('..')

test('unmonitored eventuate filter', function (t) {
    var event = eventuate({ monitorConsumers: false })
    var only1 = filter(event, function (v) { return v === 1 })

    t.equal(only1.consumerAdded, undefined, 'has no consumerAdded')
    t.equal(only1.consumerRemoved, undefined, 'has no consumerRemoved')
    t.equal(only1.hasConsumer, undefined, 'has no hasConsumer')

    t.end()
})
