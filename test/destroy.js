var
  test      = require('tape'),
  eventuate = require('eventuate-core'),
  filter    = require('..')

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

  var
    event            = eventuate(),
    oddEvents        = filter(event, odd),
    upstreamConsumer = oddEvents.upstreamConsumer
  t.notOk(event.hasConsumer(upstreamConsumer), 'consumer NOT in upstream')
  oddEvents.destroy()
  oddEvents(function () {})
  t.notOk(event.hasConsumer(upstreamConsumer), 'consumer NOT in upstream')

  function odd (x) {
    return x % 2 === 1
  }
})

test('removed upstream consumer when destroyed', function (t) {
  t.plan(2)

  var
    event            = eventuate(),
    oddEvents        = filter(event, odd),
    upstreamConsumer = oddEvents.upstreamConsumer

  oddEvents(function () {})
  t.ok(event.hasConsumer(upstreamConsumer), 'consumer in upstream')
  oddEvents.removeAllConsumers()
  t.notOk(event.hasConsumer(upstreamConsumer), 'consumer NOT in upstream')

  function odd (x) {
    return x % 2 === 1
  }
})

test('supports destroyResidual option', function (t) {
  t.plan(2)

  var
    event            = eventuate(),
    oddEvents        = filter(event, { destroyResidual: false }, odd),
    upstreamConsumer = oddEvents.upstreamConsumer

  oddEvents(function () {})
  t.ok(event.hasConsumer(upstreamConsumer), 'consumer in upstream')
  oddEvents.removeAllConsumers()
  t.ok(event.hasConsumer(upstreamConsumer), 'consumer still in upstream')

  function odd (x) {
    return x % 2 === 1
  }
})

test('should be destroyed with upstream', function (t) {
  t.plan(1)

  var event = eventuate()
  var fEvent = filter(event, function () {})
  event.destroy()
  t.ok(fEvent.isDestroyed())
})
