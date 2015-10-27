var test           = require('tape'),
    basicEventuate = require('eventuate-core/basic'),
    filter         = require('..')

test('basic eventuate filter', function (t) {
    t.plan(3)

    var event = basicEventuate()
    var only1 = filter(event, function (v) { return v === 1 })

    t.equal(only1.consumerAdded, undefined, 'has no consumerAdded')
    t.equal(only1.consumerRemoved, undefined, 'has no consumerRemoved')
    t.equal(only1.factory, basicEventuate, 'has basic eventuate factory')
})
