var assign    = require('object-assign'),
    chainable = require('eventuate-chainable/mixin'),
    reproduce = require('./lib/reproduce')

module.exports = eventuateFilter
function eventuateFilter (upstream, options, filter) {
  if (typeof options === 'function') {
    filter = options
    options = undefined
  }

  var eventuate = assign(upstream.factory(options), chainable.properties)
  chainable.call(eventuate, upstream, options, reproduce(filter))
  return eventuate
}
