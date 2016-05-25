
# loo

  Minimalistic streaming logger with a layered transport and custom field support.

  Uses the same output format as [bole](https://github.com/rvagg/bole), so tools like [bistre](https://github.com/hughsk/bistre) and [garnish](https://github.com/mattdesl/garnish) will work great.

## Installation

```bash
npm i loo
```

## Example

```js
let log = require('loo')

// application logging
let app = log('app')

// direct everything to a papertrail stream
app.pipe(papertrail(creds))

// direct error & fatal levels to process.stderr
app.error.pipe(process.stderr)
app.fatal.pipe(process.stderr)

// postgres service logging
let postgres = app('postgres')

// log the postgres debug & info events to stdout
postgres.debug.pipe(process.stdout)
postgres.info.pipe(process.stdout)

let query = 'SELECT * FROM teams'
let client = Postgres(url)

// add custom fields
postgres.debug.fields({ client: client.id })

// log out with printf support
postgres.debug('running query %s', query)
```

## Levels

- **trace**: finer-grained informational events than the debug
- **debug**: fine-grained informational events that are most useful to debug an application
- **info**: informational messages that highlight the progress of the application at coarse-grained level
- **warn**: potentially harmful situations
- **error**: error events that might still allow the application to continue running.
- **fatal**: very severe error events that will presumably lead the application to abort.

## Tests

```
npm install
npm test
```

## License

MIT
