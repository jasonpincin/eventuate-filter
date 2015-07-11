var eventuate = require('eventuate'),
    filter    = require('..')

var pie = eventuate()
pie(function (p) {
    console.log('%s served...', p.type)
})

var shoofly = filter(pie, function (p) {
    return p.type === 'shoofly'
})
shoofly(function (p) {
    console.log('Love %s pie', p.type)
})

var everythingElse = filter(pie, function (p) {
    return p.type !== 'shoofly'
})
everythingElse(function (p) {
    console.log('Don\'t care for %s pie', p.type)
})

pie.produce({type: 'apple' })
pie.produce({type: 'cherry' })
pie.produce({type: 'shoofly' })
pie.produce({type: 'peach' })
