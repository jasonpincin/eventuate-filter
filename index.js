var chainable = require('eventuate-chainable'),
    isPromise = require('is-promise'),
    onError   = require('on-error')

module.exports = chainable(function eventuateFilter (eventuate, options, filter) {
    return upstreamConsumer

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
            if (bool && !eventuate.isDestroyed()) eventuate.produce(data)
        }
    }

    function produceError (err) {
        if (!eventuate.isDestroyed())
            eventuate.produce(err instanceof Error ? err : new Error(err))
    }
})
