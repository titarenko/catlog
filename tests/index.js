const log = require('../')
const sinon = require('sinon')
require('should')
require('should-sinon')

require('colors')

describe('log', function () {
  let time, clock, consoleError, consoleLog
  beforeEach(function () {
    time = new Date()
    clock = sinon.useFakeTimers(time.getTime())
    consoleError = sinon.stub(console, 'error')
    consoleLog = sinon.stub(console, 'log')
  })
  afterEach(function () {
    clock.restore()
    console.error.restore()
    console.log.restore()
  })
  describe('error', function () {
    it('should use util.format for arg processing', function () {
      log(__filename).error('obj %j', { a: 1 })
      const message = `${time.toISOString().white} ${'error'.red} ${'totlog/tests/index.js'.cyan} obj {"a":1}`
      consoleError.should.be.calledWith(message)
    })
  })
  describe('warn', function () {
    it('should use util.format for arg processing', function () {
      log(__filename).warn('obj %j', { a: 2 })
      const message = `${time.toISOString().white} ${'warn'.yellow} ${'totlog/tests/index.js'.cyan} obj {"a":2}`
      consoleLog.should.be.calledWith(message)
    })
  })
  describe('debug', function () {
    it('should use util.format for arg processing', function () {
      log(__filename).debug('obj %j', { a: 3 })
      const message = `${time.toISOString().white} debug ${'totlog/tests/index.js'.cyan} obj {"a":3}`
      consoleLog.should.be.calledWith(message)
    })
  })
})
