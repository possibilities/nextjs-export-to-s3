const walk = require('klaw-sync')
const groupBy = require('lodash/groupBy')
const values = require('lodash/values')
const { relative } = require('path')

const getFileDepth = path => {
  const match = path.match(/\//g)
  return match || 0
}

const findSyncableGroups = rootPath => {
  const files = walk(rootPath)
    .filter(file => file.path.endsWith('.html'))
    .map(file => file.path.slice(0, -5))
    .map(path => relative(rootPath, path))

  return values(groupBy(files, getFileDepth))
}

module.exports = findSyncableGroups
