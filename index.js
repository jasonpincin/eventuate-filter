var pre       = require('call-hook/pre'),
    isPromise = require('is-promise'),
    onError   = require('on-error')

module.exports = function mkFilteredEventuate (eventuate, options, filter) {
    filter = arguments.length > 2 ? filter : options
    options = arguments.length > 2 ? options : {}

    options.lazy = typeof options.lazy !== 'undefined' ? options.lazy : true

    var consuming = false

    var filteredEventuate              = eventuate.factory(options)
    filteredEventuate.upstreamConsumer = upstreamConsumer
    filteredEventuate.consume          = pre(filteredEventuate.consume, addUpstreamConsumer)
    filteredEventuate.destroy          = pre(filteredEventuate.destroy, removeUpstreamConsumer)

    if (!options.lazy) addUpstreamConsumer()
    return filteredEventuate

    function upstreamConsumer (data) {
        if (filter.length === 2) {
            filter(data, onError(produceError).otherwise(filterResult))
        }
        else {
            var result = filter(data)
            if (isPromise(result)) result.then(filterResult, produceError)
            else filterResult(result)
        }

        function filterResult (bool) {
            if (bool) filteredEventuate.produce(data)
        }
    }

    function produceError (err) {
        filteredEventuate.produce(err instanceof Error ? err : new Error(err))
    }

    function addUpstreamConsumer () {
        if (!consuming && !filteredEventuate.isDestroyed()) eventuate.consume(upstreamConsumer)
        consuming = true
    }

    function removeUpstreamConsumer () {
        eventuate.removeConsumer(upstreamConsumer)
    }
}
