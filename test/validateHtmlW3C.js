/*
  script that runs a http server on localhost and then html-validates
  using W3C html validator all the html pages served
*/

console.log('Validating html/hbs pages using official W3C server...')

const fs = require('fs')
const path = require('path')
const async = require('async')
const request = require('request')
const isOnline = require('is-online')
const validator = require('html-validator')
const debug = require('debug')('test:validateHtmlW3C')

// http server that is run locally on localhost, to serve the website's files
const testServer = require('./testServer')

// this should be here on the beginning to set global environments
const commons = require(path.join(__dirname, '..', 'commons'))
commons.setRelease('test')

const settings = commons.getSettings()
const fileNames = commons.getFileNames()
const directories = commons.getDirectories()

console.log('Running script ' + path.relative(directories.server.root, __filename))

// ['/worldstats', '/list', '/pt', '/us', '/au', etc.]
var PathnamesToValidateArr = getPathnamesToValidate()

var Bar = commons.getProgressBar(PathnamesToValidateArr.length + 3, debug.enabled)

var wasAtLeastOnceCheckedByW3C = false
var W3CServerAtLeastFailedOnce = false

async.series([checkForInternet, startsHttpServer, validateHtmlOnAllPages],
  // done after execution of above funcitons
  function (err, results) {
    testServer.closeServer()

    Bar.tick({ info: '' })
    Bar.terminate()

    if (err) {
      console.log(Error(err))
      process.exitCode = 1
    } else if (wasAtLeastOnceCheckedByW3C && !W3CServerAtLeastFailedOnce) {
      console.log('All html/hbs pages validated correctly'.green)
      process.exitCode = 0
    } else if (wasAtLeastOnceCheckedByW3C && W3CServerAtLeastFailedOnce) {
      console.log('It was not possible to validate some files because the W3C server was unavailable, move on'.yellow)
      process.exitCode = 0
    } else {
      console.log('It was not possible to validate any file because the W3C server was unavailable, move on'.yellow)
      process.exitCode = 0
    }
    console.log('\n')
  }
)

// checks for internet connection
function checkForInternet (callback) {
  isOnline().then(function (online) {
    if (!online) {
      callback('ERROR: no Internet connection'.red.bold)
    } else {
      callback()
    }
  })
}

// starts http server on localhost on test default port
function startsHttpServer (callback) {
  console.log('building a clean copy and minifying html')
  commons.runNodeScriptSync(path.join(directories.server.root, 'build.js'), ['-cm'], 'ignore')

  Bar.tick({ info: 'starting local server' })
  testServer.startsServerForTests(
    ['--database'], // we need this option to test url /worldstats
    function () {
      Bar.tick({ info: 'server started' })
      callback()
    }, function (err) {
      callback(Error(err))
    })
}

// returns ['/worldstats', '/list', '/pt', '/us', '/au', etc.]
function getPathnamesToValidate () {
  var countriesInfo = JSON.parse(fs.readFileSync(fileNames.project.countriesInfoFile, 'utf8'))
  var availableCountries = countriesInfo.availableCountries

  var countryCodesArray = Object.keys(availableCountries) // ['PT', 'US', 'AU', etc.]
  var numberOfCountries = countryCodesArray.length

  var pathnames = ['/worldstats', '/list', '/domains']
  for (let i = 0; i < numberOfCountries; i++) {
    pathnames.push('/' + countryCodesArray[i].toLowerCase())
  }
  for (let i = 0; i < numberOfCountries; i++) {
    pathnames.push('/' + countryCodesArray[i].toLowerCase() + '/stats')
  }

  return pathnames
}

// validates html code of pages using validator.w3.org/nu
function validateHtmlOnAllPages (next) {
  async.eachOf(PathnamesToValidateArr, validatePage, function (err) {
    if (err) {
      next(Error('Error validating html on pages: ' + err.message))
    } else {
      debug('All html pages validated')
      next()
    }
  })
}

// pathname is for example '/pt' or '/worldstats'
// see https://github.com/jfoclpf/autocosts/blob/master/contributing.md#url-parts-terminology
function validatePage (pathname, key, callback) {
  var url = 'http://localhost:' + settings.HTTPport + pathname
  request({ uri: url }, function (err, response, body) {
    if (err) {
      callback(Error(err.message + ', error on url: ' + url))
      return
    }

    const options = {
      format: 'text',
      data: body
    }

    validator(options)
      .then((result) => {
        wasAtLeastOnceCheckedByW3C = true
        if (result.toLowerCase().includes('error')) {
          console.log(`Error on ${url}\n`.error, result)
          console.log(addLinesToStr(body))
          console.log(`Error on ${url}\n`.error, result)
          callback(Error('Found html error'))
        } else if (result.toLowerCase().includes('warning')) {
          console.log(`Warning on ${url}\n`.error, result)
          console.log(addLinesToStr(body))
          console.log(`Warning on ${url}\n`.error, result)
          callback(Error('Found html warning'))
        } else {
          debug(pathname)
          Bar.tick({ info: pathname })
          // setTimeout(callback, 100)
          callback()
        }
      })
      .catch((err) => {
        W3CServerAtLeastFailedOnce = true
        // sometimes the W3C is unavailable, but we should not return an error in such conditions
        // https://github.com/zrrrzzt/html-validator/issues/162
        if (err) {
          debug(pathname)
          Bar.tick({ info: 'W3C server unavailable, skipping ' + pathname })
          callback() // OK
        } else {
          callback(Error(err))
        }
      })
  })
}

// for debug purposes. On a big string of code with many breaklines,
// adds after a breakline, the correspondig line number
// from "abc\ndef\nghi" => "1: abc\n 2: def\n 3: ghi"
function addLinesToStr (str) {
  var arr = str.split('\n')
  for (let i = 0; i < arr.length; i++) {
    arr[i] = (i + 1).toString().padStart(4, ' ') + ':  ' + arr[i] + '\n'
  }
  return arr.join('')
}
