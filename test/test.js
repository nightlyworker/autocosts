/************************************************
**                                             **
**              AUTOCOSTS.INFO                 **
**      the automobile costs calculator        **
**                                             **
************************************************/

/*
  This script inserts thousands of user inputs stored on test/users_insertions.json into the core calculator function
  and checks JS files syntax using jshint, and checks also standard rules using standardJS
  on all the .js files stored in directory /src
*/

const fs = require('fs')
const path = require('path')
const ProgressBar = require('progress')
// const { execSync } = require('child_process')
const debug = require('debug')('test:test')

// this should be here on the beginning to set global environments
const commons = require(path.join(__dirname, '..', 'commons'))
commons.setRelease('test')
const fileNames = commons.getFileNames()
const directories = commons.getDirectories()

const statsFunctions = require(fileNames.build.statsFunctions)
const transferData = require(fileNames.project['transferData.js'])
const calculator = require(fileNames.project['calculator.js'])

testCalculatorFunction(function () {
  commons.runNodeScriptSync(path.join(directories.server.root, 'test/validateJs.js'))
  commons.runNodeScriptSync(path.join(directories.server.root, 'test/validateHtml.js'))
  commons.runNodeScriptSync(path.join(directories.server.root, 'test/validateCss.js'))
  commons.runNodeScriptSync(path.join(directories.server.root, 'build.js'), ['-A'])

  console.log('All tests ran successfully'.green)
  process.exit(0)
})

// eof main script

function testCalculatorFunction (callback) {
  console.log('Testing core calculator function with thousands of inputs...')
  debug('Inserting thousands of user inputs from ' +
    path.relative(directories.server.root, path.join(__dirname, 'users_insertions.json')) +
    ' into the core calculator function. Progress bar...\n')

  var _countrySpecs = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'country_specs.json'), 'utf8'),
    parseJsonProperty)

  // build a more code friendly Object
  var countrySpecs = {}
  for (let item of Object.keys(_countrySpecs)) {
    countrySpecs[_countrySpecs[item].Country] = _countrySpecs[item]
  }
  debug(countrySpecs)

  var userInsertionsFile = path.join(__dirname, 'users_insertions.json')
  fs.readFile(userInsertionsFile, 'utf8', function (err, data) {
    if (err) {
      // It is always good practice to return after callback(err, result)
      // whenever a callback call is not the last statement of a function
      callback(Error('Error reading file ' + userInsertionsFile + '. ' + err.message))
      return
    }

    var usersInput = JSON.parse(data, parseJsonProperty)
    var numberofInputs = usersInput.length

    var Bar = new ProgressBar('[:bar] :percent',
      { total: numberofInputs, width: 80 }
    )

    for (let i = 0; i < numberofInputs; i++) {
      let countryObject, structuredUserInput, calculatedData
      Bar.tick()

      try {
        let CC = usersInput[i].country // ISO Country Code

        if (CC) {
          countryObject = {
            code: CC,
            currency: countrySpecs[CC].currency,
            distance_std: countrySpecs[CC].distance_std,
            fuel_efficiency_std: countrySpecs[CC].fuel_efficiency_std,
            fuel_price_volume_std: countrySpecs[CC].fuel_price_volume_std
          }

          if (statsFunctions.isUserDataEntryOk(usersInput[i], countryObject)) {
            structuredUserInput = transferData.createUserDataObjectFromDB(usersInput[i])
            calculatedData = calculator.calculateCosts(structuredUserInput, countryObject)
          }
        }
      } catch (error) {
        console.error('\n\ni:' + i, '\n',
          '\n\ncountryObject: ', countryObject,
          '\n\nusersInput: ', usersInput[i],
          '\n\nstructuredUserInput: ', JSON.stringify(structuredUserInput, undefined, 2),
          '\n\ncalculatedData: ', JSON.stringify(calculatedData, undefined, 2))

        callback(Error(error))
      }
    }

    Bar.terminate()
    callback(null, 0)
  })
}

// to be used by JSON.parse
// if json property is a number within a String (!isNaN) convert its type to Number
function parseJsonProperty (key, value) {
  return !isNaN(value) ? parseFloat(value) : value
}
