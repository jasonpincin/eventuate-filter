var test                     = require('tape'),
    eventuate                = require('eventuate-core'),
    errors                   = require('eventuate-core/errors'),
    EventuateUnconsumedError = errors.EventuateUnconsumedError,
    filter                   = require('..')

test('accepts lazy and requireConsumption options', function (t) {
  t.plan(1)

  var event = eventuate()
  filter(event, { lazy: false, requireConsumption: true }, function (data) {
    return !!data.alert
  })

  t.throws(function () {
    event.produce({ alert: true })
  }, EventuateUnconsumedError)
})

