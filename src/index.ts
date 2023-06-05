import { cac } from 'cac'
import { fileURLToPath } from 'url'
import path from 'path'
import { readPackageUpSync } from 'read-pkg-up'
import auth from './actions/auth'
import cancelAuth from './actions/cancelAuth'
import chat from './actions/chat'
import stdout from './utils/stdout'

async function main () {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const pkg = readPackageUpSync({ cwd: __dirname })
  const packageName = pkg && pkg.packageJson.name || 'smartchat'
  const version = pkg && pkg.packageJson.version || '1.0.0'

  const cli = cac(packageName)
  cli
   .command('auth', 'Set a openai api key or access token')
   .option('--offical', 'Choose the official ChatGPT API ')
   .option('--no-offical', 'Choose the unofficial proxy API')
   .action(async (options)=> {
    await auth(options)
  })

  cli
    .command('deauth', 'remove openai api key or access token')
    .action(async () => {
      await cancelAuth()
   })

  cli
    .command('<prompt>', 'Ask ChatGPT a question')
    .option('-c, --continue', 'Continue last conversation', {
      default: false
    })
    .option('-s, --store', 'Enables the local message cache', {
      default: true
    })
    .option('--chat', 'Continuous dialogue mode', {
      default: false
    })
    .option('-p, --proxy <proxy>', 'Provide a reverse proxy for unofficial proxy API', {
      default: 'https://ai.fakeopen.com/api/conversation'
    })
    .option('-m, --model <model>', 'Model for ChatGPTAPI', {
      default: 'gpt-3.5-turbo'
    })
    .action(async (prompt, options) => {
      await chat(prompt, options)
    })

  cli.help()
  cli.version(version)
  
  try {
    cli.parse()
  } catch (error: any) {
    stdout.error(`${error.message}\n`)
    cli.outputHelp()
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  // abnormal exit
  process.exit(1)
})
