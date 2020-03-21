const usage = code => {
  console.error('Usage: nextjs-export-to-s3 <preview|production>')
  process.exit(1)
}

const preview = () => console.log('preview')
const production = () => console.log('production')

const commands = { preview, production }

const commandNames = Object.keys(commands)
const command = process.argv[2]

if (!commandNames.includes(command)) usage()

const handler = commands[command]

handler()
