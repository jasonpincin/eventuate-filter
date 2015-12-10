var isPromise = require('is-promise')

module.exports = createReproducer

function createReproducer (filter) {
  return function each (value) {
    var self = this

    if (filter.length === 2) filter(value, cb)
    else {
      var result = filter(value)
      if (isPromise(result)) result.then(filterResult, error)
      else filterResult(result)
    }

    function filterResult (bool) {
      if (bool) self.produce(value)
      self.finish()
    }

    function error (err) {
      self.error(err).finish()
    }

    function cb (err, bool) {
      if (err) error(err)
      else filterResult(bool)
    }
  }
}