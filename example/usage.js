var eventuate = require('eventuate-core'),
    filter    = require('..')

var logMessage = eventuate()
var errorMessage = filter(logMessage, function (log) {
    return log.level === 'error'
})

errorMessage(function (log) {
    console.error(log.message)
})

logMessage.produce({ level: 'info', message: 'something happened' })
logMessage.produce({ level: 'error', message: 'something bad happened' })
logMessage.produce({ level: 'info', message: 'something else happened' })

// output:
// something bad happened
