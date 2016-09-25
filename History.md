
4.0.0 / 2016-09-25
==================

  * BREAKING: update tests for latest tumbleweed,
    message and err get pulled out of objects now
  * fixed tests and added back in node 4 support

3.0.0 / 2016-05-25
==================

  * rename to loo and other various fixes
  * BREAKING: there were a few field ordering changes,
    you probably shouldnt rely on the order anyway

2.0.2 / 2016-04-26
==================

  * fixes transform streams as transports

2.0.1 / 2016-04-24
==================

  * errors should also file in the log.message field

2.0.0 / 2016-04-24
==================

  * all custom fields are under the 'fields' key.
  * smarter logging: printf + custom fields now in same log
  * fix test location

1.1.1 / 2016-04-05
==================

  * listen for all instances of loo on an existing process
  * update history

1.1.0 / 2016-03-30
==================

* use references instead of copies

1.0.1 / 2016-03-30
==================

  * remove unnecessary dep

1.0.0 / 2010-01-03
==================

  * Initial release
