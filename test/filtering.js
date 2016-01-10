var test      = require('tape'),
    eventuate = require('eventuate-core'),
    filter    = require('..')(eventuate),
    timeout   = { timeout: 1000 }

test('provides constructor generation', timeout, function (t) {
  t.plan(6)

  var event = eventuate()
  var only1 = filter(event, function (v) { return v === 1 })

  var eventCount = 0
  event(function () {
    eventCount++
  })

  var only1Count = 0
  only1.consume(function (v) {
    t.equal(v, 1, 'should only get filtered values')
    only1Count++
  })

  t.ok(only1.hasConsumer(), 'registers consumers')

  event.produce(2)
  event.produce(1)
  event.produce(5)
  event.produce(3)
  event.produce(1)
  event.produce(1)

  t.equal(eventCount, 6, 'produce 6 events')
  t.equal(only1Count, 3, 'should filter out non matching events')
})

test('constructor factory accepts options', timeout, function (t) {
  t.plan(1)

  var event = eventuate()
  var only1 = filter(event, {
    lazy: false
  }, function (v) { return v === 1 })

  t.ok(event.hasConsumer(only1.upstreamConsumer), 'registers consumer')
})
