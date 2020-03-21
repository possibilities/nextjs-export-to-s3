const walk = require('klaw-sync')
const groupBy = require('lodash/groupBy')
const values = require('lodash/values')

const findSyncableGroups = () => {
  return values(
    groupBy(
      walk(process.cwd())
        .filter(file => file.path.endsWith('.html'))
        .map(file => file.path.slice(0, -5)),
      path => path.match(/\//g).length - 1
    )
  )
}

module.exports = findSyncableGroups
