var test      = require('tape'),
    Promise   = require('promise-polyfill'),
    eventuate = require('eventuate-core'),
    filter    = require('..'),
    timeout   = { timeout: 1000 }

test('eventuate filter synchronously filters data', timeout, function (t) {
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

test('accepts async filter', timeout, function (t) {
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

test('supports filter returning a promise ', timeout, function (t) {
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

test('callback errors are produced', timeout, function (t) {
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

test('promise errors are produced', timeout, function (t) {
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

test('post-destroy produce does not throw an error', timeout, function (t) {
  t.plan(1)

  var event = eventuate()
  var chosenEvents = filter(event, everything)
  var errEvents = filter(event, makeErr)

  var callCount = 0
  chosenEvents(function (data) {
    callCount++
  })
  errEvents(function (data) {
    callCount++
  })
  event.produce(42)
  event.destroy()

  setTimeout(function () {
    t.equal(callCount, 0, 'call count is 0 and no errors thrown')
  }, 100)

  function everything (data, cb) {
    setTimeout(function () {
      cb(null, true)
    }, 50)
  }

  function makeErr (data, cb) {
    setTimeout(function () {
      cb(new Error('boom'))
    }, 50)
  }
})
