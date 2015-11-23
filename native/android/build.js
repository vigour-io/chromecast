#!/usr/bin/env node
var spawn = require('child_process').spawn
var log = require('npmlog')
var Promise = require('promise')
var path = require('path')

// paths
var srcPath = path.join(__dirname, 'plugin')

log.info('building .aar files from source')

function exe (command, cwd) {
  var args = command.split(' ')
  var fnName = args[0]
  args = args.splice(1, args.length - 1)
  return new Promise(function (resolve, reject) {
    log.info('Executing', command)
    if (cwd === '') {
      cwd = process.cwd()
    }
    log.info('in', cwd)
    var call = spawn(fnName, args, { cwd: cwd })
    call.stdout.on('data', function (data) {
      process.stdout.write(data)
    })

    call.stderr.on('data', function (data) {
      process.stderr.write(data)
    })

    call.on('close', function (code) {
      if (code === 0) {
        resolve()
      } else {
        reject()
      }
    })
  })
}

function assemble () {
  return exe('./gradlew lib:uploadArchives', srcPath)
}

Promise.resolve()
  .then(assemble)
  .catch(function (reason) {
    log.error(reason)
    process.exit(1)
  })
