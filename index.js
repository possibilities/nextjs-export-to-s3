#!/usr/bin/env node

const shell = require('shelljs')
const { tmpdir } = require('os')
const { ulid } = require('ulid')
const { join, dirname } = require('path')
const { existsSync, readdirSync } = require('fs')
const findSyncableGroups = require('./findSyncableGroups')

const minimist = require('minimist')

const argv = minimist(process.argv.slice(2))

const {
  _: [command],
  's3-bucket': s3Bucket,
  's3-prefix': s3Prefix
} = argv

const usage = message => {
  console.error('Usage: nextjs-export-to-s3 <args>')
  if (message) {
    console.error(message)
  }
  process.exit(1)
}

const upload = (s3Bucket, s3Prefix) => {
  if (!existsSync('dist')) {
    throw new Error('`./dist` does not exist')
  }

  const workDir = join(tmpdir(), ulid().toLowerCase())

  shell.mkdir('-p', workDir)
  shell.cp('-r', 'dist', workDir)
  shell.mv(join(workDir, 'dist', '_next'), workDir)
  shell.mkdir('-p', join(workDir, 'pages-0'))
  shell.mv(join(workDir, 'dist/*'), join(workDir, 'pages-0'))
  shell.rm('-r', join(workDir, 'dist'))

  const groups = findSyncableGroups(join(workDir, 'pages-0'))
  groups.forEach((group, groupIndex) =>
    group.forEach(path => {
      const from = join(workDir, 'pages-0', `${path}.html`)
      const to = join(workDir, `pages-${(groupIndex + 1).toString()}`, path)
      shell.mkdir('-p', dirname(to))
      shell.cp(from, to)
    })
  )

  const bucket = `s3://${s3Bucket}${s3Prefix ? `/${s3Prefix}` : ''}`

  shell.cd(workDir)

  const { code } = shell.exec(`
    aws s3 sync ${join(workDir, '_next')} ${bucket} \
      --cache-control immutable,max-age=100000000,public \
      --acl public-read
  `)
  if (code) {
    throw new Error('Could not sync `./dist` to S3')
  }

  readdirSync(workDir)
    .filter(path => path.includes('pages-'))
    .forEach(pagePath => {
      const pagesPath = join(workDir, pagePath)
      const { code } = shell.exec(`
        aws s3 sync ${pagesPath} ${bucket} \
          --cache-control max-age=0,no-cache \
          --content-type text/html \
          --acl public-read
      `)
      if (code) {
        throw new Error(`Could not sync page group \`${pagesPath}\` to S3`)
      }
    })
}

const deploy = (s3Bucket, s3Prefix) => {
  console.error('Error: deploy not yet implemented')
  process.exit(1)
}

const commands = { upload, deploy }

const commandNames = Object.keys(commands)

if (!s3Bucket) {
  usage('Error: s3 bucket is required')
}

if (!s3Prefix) {
  usage('Error: s3 prefix is required')
}

if (!commandNames.includes(command)) {
  usage('Error: command name must be `upload` or `deploy`')
}

const handler = commands[command]

handler(s3Bucket, s3Prefix).catch(error => usage(`Error: ${error.message}`))
