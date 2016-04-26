'use strict'

let Papertrail = require('@mnm/logger-papertrail')
let SlackLogger = require('@mnm/logger-slack')
let log = require('..')('logger')
let environment = require('envobj')
let Pretty = require('bistre')
let Log = require('..')

let env = environment({
  PAPERTRAIL_URL: '',
  SLACK_WEBHOOK: ''
})

if (env.PAPERTRAIL_URL) {
  let papertrail = Papertrail(env.PAPERTRAIL_URL)
  Log('to:papertrail').pipe(papertrail)
  log.info.pipe(papertrail)
  log.warn.pipe(papertrail)
  log.error.pipe(papertrail)
  log.fatal.pipe(papertrail)
}

// log to slack
if (env.SLACK_WEBHOOK) {
  let slack_logger = SlackLogger(env.SLACK_WEBHOOK, {
    username: 'Sutra'
  })
  Log('to:slack').pipe(slack_logger)
  log.info.pipe(slack_logger)
  log.warn.pipe(slack_logger)
  log.error.pipe(slack_logger)
  log.fatal.pipe(slack_logger)
}

// default logging
let pretty = Pretty()
log.info.pipe(pretty)
log.warn.pipe(pretty)
log.error.pipe(pretty)
log.fatal.pipe(pretty)
pretty.pipe(process.stderr)

let i = 0
let team = { a: 1, b: 2, c: 3}
log.info('hi there', { team: team })
let sid = setInterval(function() {
  log.info('hi there', { team: team })
}, 1000)

