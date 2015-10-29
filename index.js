module.exports = function mkFilteredEventuate (eventuate, options, filter) {
    filter = arguments.length > 2 ? filter : options
    options = arguments.length > 2 ? options : undefined

    var filteredEventuate              = eventuate.factory(options)
    filteredEventuate.upstreamConsumer = filterConsumer
    filteredEventuate.destroy          = destroy
    eventuate.consume(filterConsumer)

    return filteredEventuate

    function filterConsumer (data) {
        if (filter(data)) filteredEventuate.produce(data)
    }

    function destroy () {
        eventuate.removeConsumer(filterConsumer)
    }
}
