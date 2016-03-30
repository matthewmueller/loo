
# sutra

  Minimalistic streaming logger with layered transport and custom field support.

  Uses the same output format as [bole](https://github.com/rvagg/bole), so tools like [bistre](https://github.com/hughsk/bistre) and [garnish](https://github.com/mattdesl/garnish) will work great.

## Installation

```bash
npm i sutra
```

## Example

```js
let log = require('sutra')

// application logging
let app = log('app')
app.error.pipe(process.stderr)
app.fatal.pipe(process.stderr)

// component logging
let postgres = app('postgres')
postgres.debug.pipe(process.stdout)
postgres.info.pipe(process.stdout)

// add custom fields and log
let query = 'SELECT * FROM teams'
let client = Postgres(url)
postgres.debug.fields({ client: client.id })
postgres.debug('running query %s', query)
```

## Levels

Here are the log levels that ship with sutra

- trace: finer-grained informational events than the debug
- debug: fine-grained informational events that are most useful to debug an application
- info: informational messages that highlight the progress of the application at coarse-grained level
- warn: potentially harmful situations
- error: error events that might still allow the application to continue running.
- fatal: very severe error events that will presumably lead the application to abort.

## Tests

```
npm install
npm test
```

## License

MIT
