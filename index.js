var pre       = require('call-hook/pre'),
    isPromise = require('is-promise'),
    onError   = require('on-error')

module.exports = function mkFilteredEventuate (eventuate, options, filter) {
    filter = arguments.length > 2 ? filter : options
    options = arguments.length > 2 ? options : undefined

    options = options || {}
    options.destroyResidual = options.destroyResidual !== undefined ? options.destroyResidual : true
    options.destroyRemoved = options.destroyRemoved !== undefined ? options.destroyRemoved : true
    options.lazy = options.lazy !== undefined ? options.lazy : true

    var filteredEventuate              = eventuate.factory(options)
    filteredEventuate.upstreamConsumer = upstreamConsumer
    filteredEventuate.destroy          = pre(filteredEventuate.destroy, removeUpstreamConsumer)

    upstreamConsumer.removed = upstreamConsumerRemoved
    eventuate.consume(upstreamConsumer)

    return filteredEventuate

    function upstreamConsumer (data) {
        if (options.lazy && !filteredEventuate.hasConsumer()) return

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

    function upstreamConsumerRemoved () {
        if (options.destroyRemoved) filteredEventuate.destroy()
    }

    function produceError (err) {
        filteredEventuate.produce(err instanceof Error ? err : new Error(err))
    }

    function removeUpstreamConsumer () {
        eventuate.removeConsumer(upstreamConsumer)
    }
}
