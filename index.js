var
  chainable = require('eventuate-chainable'),
  isPromise = require('is-promise')

module.exports = chainable(function eventuateFilter (options, filter) {
  return function forEachValue (data) {
    var self = this

    if (filter.length === 2) filter(data, cb)
    else {
      var result = filter(data)
      if (isPromise(result)) result.then(filterResult, error)
      else filterResult(result)
    }

    function filterResult (bool) {
      if (bool) self.produce(data)
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
})
