var test      = require('tape'),
    eventuate = require('eventuate-core'),
    filter    = require('..')(eventuate)

test('eventuate filter lazily consumes', function (t) {
  t.plan(2)

  var event = eventuate()
  var only1 = filter(event, function (v) {
    t.fail('filter should not execute with no consumers')
  })

  t.ok(!event.hasConsumer(only1.upstreamConsumer),
       'does not immediately add consumer to upstream eventuate')
  only1.consume(function () {})
  t.ok(event.hasConsumer(only1.upstreamConsumer),
       'lazily adds consumer to upstream eventuate')
})

test('eventuate filter eagerly consumes with lazy = false', function (t) {
  t.plan(2)

  var event = eventuate()
  var only1 = filter(event, { lazy: false }, function (v) {
    t.pass('filter should execute with no consumers if lazy = false')
  })

  t.ok(event.hasConsumer(only1.upstreamConsumer),
       'adds consumer to upstream eventuate')
  event.produce(123)
})

test('has no consumer initially', function (t) {
  t.plan(1)

  var event = eventuate()
  var only1 = filter(event, function (v) { return v === 1 })

  t.equal(only1.hasConsumer(), false, 'has no consumer')
})

