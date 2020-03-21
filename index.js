const shell = require('shelljs')
const { tmpdir } = require('os')
const { ulid } = require('ulid')
const { join, resolve, dirname } = require('path')
const { existsSync } = require('fs')
const range = require('lodash/range')
const findSyncableGroups = require('./findSyncableGroups')

const isVerbose = process.argv.includes('--verbose')

const usage = message => {
  console.error('Usage: nextjs-export-to-s3 <mode> <bucket>')
  if (message) {
    console.error(message)
  }
  process.exit(1)
}

const preview = async bucket => {
  if (!existsSync('dist')) {
    throw new Error('`./dist` does not exist')
  }

  const workDir = join(tmpdir(), ulid().toLowerCase())
  const groups = findSyncableGroups('dist')
  groups.forEach((group, groupIndex) =>
    group.forEach(path => {
      const from = join(resolve('dist'), `${path}.html`)
      const to = join(workDir, `group-${groupIndex.toString()}`, path)
      shell.mkdir('-p', dirname(to))
      shell.cp(from, to)
    })
  )

  const { code } = shell.exec(
    `
      aws s3 sync dist ${bucket} \
        --cache-control max-age=0,no-cache \
        --acl public-read
    `,
    { quiet: !isVerbose }
  )
  if (code) {
    throw new Error('Could not sync `./dist` to S3')
  }

  shell.cd(workDir)
  for (const groupIndex of range(groups.length)) {
    const groupPath = join(workDir, `group-${groupIndex.toString()}`)
    const { code } = shell.exec(
      `
        aws s3 sync ${groupPath} ${bucket} \
          --cache-control max-age=0,no-cache \
          --content-type text/html \
          --acl public-read
      `,
      { quiet: !isVerbose }
    )
    if (code) {
      throw new Error(`Could not sync group \`${groupIndex}\` to S3`)
    }
  }
}

const production = () => {
  console.error('Error: production not yet implemented')
  process.exit(1)
}

const commands = { preview, production }

const commandNames = Object.keys(commands)
const command = process.argv[2]
const bucket = process.argv[3]

if (!bucket) {
  usage('Error: bucket is required')
}

if (!commandNames.includes(command)) {
  usage('Error: command name must be `preview` or `production`')
}

const handler = commands[command]

handler(bucket).catch(error => usage(`Error: ${error.message}`))
