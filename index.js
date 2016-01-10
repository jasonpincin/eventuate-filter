var chainable       = require('eventuate-chainable'),
    producerFactory = require('./lib/producer-factory')

module.exports = eventuateFilterFactory
function eventuateFilterFactory (Super) {
  var EventuateFilter = chainable(Super, producerFactory)

  function eventuateFilter (upstream, options, filter) {
    return new EventuateFilter(upstream, options, filter)
  }
  eventuateFilter.constructor = EventuateFilter
  return eventuateFilter
}
