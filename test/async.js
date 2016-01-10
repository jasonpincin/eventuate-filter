var test      = require('tape'),
    eventuate = require('eventuate-core'),
    filter    = require('..')(eventuate),
    Promise   = require('promise-polyfill')

test('supports async callbacks', function (t) {
  t.plan(2)

  var event = eventuate()
  var only1 = filter(event, function (v, done) {
    setImmediate(done, null, v === 1)
  })

  only1.consume(function (v) {
    t.equal(v, 1)
  })

  event.produce(1)
  event.produce(2)
  event.produce(1)
})

test('supports promises', function (t) {
  t.plan(2)

  var event = eventuate()
  var only1 = filter(event, function (v) {
    return new Promise(function (resolve) {
      setImmediate(resolve, v === 1)
    })
  })

  only1.consume(function (v) {
    t.equal(v, 1)
  })

  event.produce(1)
  event.produce(2)
  event.produce(1)
})

test('produces error on callback errors', function (t) {
  t.plan(2)

  var event = eventuate()
  var only1 = filter(event, function (v, done) {
    setImmediate(done, new Error('boom'))
  })

  only1.consume(function (v) {
    t.fail('should not produce data')
  }, function (err) {
    t.ok(err instanceof Error, 'is an error')
  })

  event.produce(1)
  event.produce(2)
})

test('produces error on promise rejection', function (t) {
  t.plan(2)

  var event = eventuate()
  var only1 = filter(event, function (v) {
    return new Promise(function (resolve, reject) {
      setImmediate(reject, new Error('boom'))
    })
  })

  only1.consume(function (v) {
    t.fail('should not produce data')
  }, function (err) {
    t.ok(err instanceof Error, 'is an error')
  })

  event.produce(1)
  event.produce(2)
})
