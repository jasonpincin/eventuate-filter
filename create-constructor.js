var assign         = require('object-assign'),
    chainableMixin = require('eventuate-chainable/mixin'),
    reproduce      = require('./lib/reproduce')

module.exports = function createConstructor (eventuateMixin) {
  function EventuateFilter (upstream, options, filter) {
    if (typeof options === 'function') {
      filter = options
      options = undefined
    }
    eventuateMixin.call(this, options)
    chainableMixin.call(this, upstream, options, reproduce(filter))
  }
  assign(
    EventuateFilter.prototype,
    eventuateMixin.properties,
    chainableMixin.properties,
    {
      constructor: EventuateFilter
    }
  )

  return EventuateFilter
}
