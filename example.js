'use strict'

let log = require('./')

log.fields({ root: 'root' })
log.debug.pipe(process.stdout)
log.debug.fields({ root: 'debug' })

let la = log('la')
let lb = log('lb')

la.fields({ a: 'a' })
lb.warn.fields({ b: 'b'})

la.info.pipe(process.stdout)
lb.warn.pipe(process.stderr)

let lc = lb('lc')
lc.error.pipe(process.stderr)
lc.error.fields({ 'c': 'c' })

la.debug('lad')
la.info('lai')
la.error('lae')

lb.debug('lbd')
lb.warn('lbw')
lb.fatal('lbf')

lc.debug('lcd')
lc.info('lci')
lc.warn('lcw')
lc.error('lce')
lc.fatal('lcf')

la.info(0)
