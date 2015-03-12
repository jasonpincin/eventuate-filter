var test      = require('tape'),
    eventuate = require('eventuate'),
    filter    = require('..')

test('eventuate filter promise', function (t) {
    t.plan(1)

    var event = eventuate()
    var only1 = filter(event, function (v) { return v === 1 })

    only1().then(function (v) {
        t.equal(v, 1, 'promise resolves from filtered eventuate')
    })
    event.produce(1)
})
