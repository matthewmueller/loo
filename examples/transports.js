'use strict'

let Papertrail = require('@mnm/logger-papertrail')
let SlackLogger = require('@mnm/logger-slack')
let environment = require('envobj')
let Pretty = require('bistre')
let log = require('..')('jack:bot')
let Log = require('..')


/**
 * Required environment variables
 */

let env = environment({
  PAPERTRAIL_URL: '',
  SLACK_WEBHOOK: ''
})

/**
 * Logging
 */

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
  let jackops_logger = SlackLogger(env.SLACK_WEBHOOK, {
    icon_url: 'https://cldup.com/8KHsv7mkQW.png',
    username: 'Jackops'
  })
  Log('to:slack').pipe(jackops_logger)
  log.warn.pipe(jackops_logger)
  log.error.pipe(jackops_logger)
  log.fatal.pipe(jackops_logger)
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
  let team_id = 'team'
  let message = {
    user: 'matt',
    text: 'lol!'
  }
  Log('to:slack').info('*%s (%s)* ← %s', message.user, team_id, message.text)
  log.info('%s (%s) ← %s', message.user, team_id, message.text)
}, 1000)

