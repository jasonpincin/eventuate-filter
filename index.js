var pre       = require('call-hook/pre'),
    post      = require('call-hook/post'),
    isPromise = require('is-promise'),
    onError   = require('on-error')

module.exports = function mkFilteredEventuate (upstreamEventuate, options, filter) {
    if (typeof options === 'function') {
        filter  = options
        options = undefined
    }

    if (typeof upstreamEventuate.destroyed !== 'function')
        throw new TypeError('eventuate-filter expects first argument to be a non-basic eventuate')

    options                 = options || {}
    options.destroyResidual = options.destroyResidual !== undefined ? options.destroyResidual : true
    options.lazy            = options.lazy !== undefined ? options.lazy : true

    var consuming = false

    var eventuate              = upstreamEventuate.factory(options)
    eventuate.upstreamConsumer = upstreamConsumer
    eventuate.consume          = pre(eventuate.consume, addUpstreamConsumer)
    eventuate.destroy          = post(eventuate.destroy, removeUpstreamConsumer)

    upstreamEventuate.destroyed(eventuate.destroy)
    upstreamConsumer.removed = upstreamConsumerRemoved
    if (!options.lazy) addUpstreamConsumer()

    return eventuate

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
            if (bool) eventuate.produce(data)
        }
    }

    function addUpstreamConsumer () {
        if (!consuming && !eventuate.isDestroyed()) {
            upstreamEventuate.consume(upstreamConsumer)
            consuming = true
        }
    }

    function upstreamConsumerRemoved () {
        consuming = false
        if (!eventuate.isDestroyed() && !upstreamEventuate.isDestroyed())
            addUpstreamConsumer()
    }

    function removeUpstreamConsumer () {
        upstreamEventuate.removeConsumer(upstreamConsumer)
    }

    function produceError (err) {
        eventuate.produce(err instanceof Error ? err : new Error(err))
    }
}
