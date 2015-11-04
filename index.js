var pre            = require('call-hook/pre')

module.exports = function mkFilteredEventuate (eventuate, options, filter) {
    filter = arguments.length > 2 ? filter : options
    options = arguments.length > 2 ? options : undefined

    var consuming = false

    var filteredEventuate              = eventuate.factory(options)
    filteredEventuate.upstreamConsumer = upstreamConsumer
    filteredEventuate.consume          = pre(filteredEventuate.consume, addUpstreamConsumer)
    filteredEventuate.destroy          = pre(filteredEventuate.destroy, removeUpstreamConsumer)

    return filteredEventuate

    function upstreamConsumer (data) {
        if (filter(data)) filteredEventuate.produce(data)
    }

    function addUpstreamConsumer () {
        if (!consuming && !filteredEventuate.isDestroyed()) eventuate.consume(upstreamConsumer)
        consuming = true
    }

    function removeUpstreamConsumer () {
        eventuate.removeConsumer(upstreamConsumer)
    }
}
