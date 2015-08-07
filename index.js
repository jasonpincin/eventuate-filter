module.exports = function mkFilteredEventuate (eventuate, filter) {
    var filteredEventuate = eventuate.factory({ monitorConsumers: eventuate.hasConsumer !== undefined })
    filteredEventuate.upstreamConsumer = filterConsumer
    filteredEventuate.unsubscribe = function filteredEventuateUnsubscribe () {
        eventuate.removeConsumer(filterConsumer)
    }

    eventuate(filterConsumer)
    return filteredEventuate

    function filterConsumer (data) {
        if (filter(data)) filteredEventuate.produce(data)
    }
}
