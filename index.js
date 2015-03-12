var eventuate = require('eventuate')

module.exports = function (event, filter) {
    var filteredEvent = eventuate({ monitorConsumers: event.hasConsumer !== undefined }),
        produce       = filteredEvent.produce
    delete filteredEvent.produce

    event(function eventuateFilter (data) {
        if (filter(data))
            produce(data)
    })
    return filteredEvent
}
