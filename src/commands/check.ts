import { Command, Flags } from '@oclif/core'
import * as dotenv from 'dotenv'
import fetch from 'node-fetch'
import inquirer from 'inquirer'
// import { Configuration, OpenAIApi } from 'openai'

dotenv.config()

const git_token = process.env.github_key
// const openai = new OpenAIApi(new Configuration({
//   apiKey: process.env.openai_key,
// }))

export default class Check extends Command {
  static override description = 'Analyze a GitHub PR for observability insights'

  static override examples = [
    '$ prinsights check --owner=sonali --repo=Hello-World --pr=38',
    '$ prinsights check',
  ]

  static override flags = {
    owner: Flags.string({
      char: 'o',
      description: 'GitHub repository owner (e.g., Sonali)',
      required: false,
    }),
    repo: Flags.string({
      char: 'r',
      description: 'GitHub repository name (e.g., Hello-World)',
      required: false,
    }),
    pr: Flags.string({
      char: 'p',
      description: 'Pull Request number (e.g., 28)',
      required: false,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Check)

    // Prompt for missing inputs
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'owner',
        message: 'Enter repository owner (e.g., Sonali):',
        when: !flags.owner,
      },
      {
        type: 'input',
        name: 'repo',
        message: 'Enter repository name (e.g., Hello-World):',
        when: !flags.repo,
      },
      {
        type: 'input',
        name: 'pr',
        message: 'Enter PR number (e.g., 28):',
        when: !flags.pr,
        validate: (input) =>
          /^\d+$/.test(input) ? true : 'PR number must be numeric',
      },
    ])

    const owner = flags.owner || answers.owner
    const repo = flags.repo || answers.repo
    const pr = flags.pr || answers.pr
    console.log("git token here 👍🏻",git_token)
    console.log("🔍 Running the latest compiled version of `check.ts` ✅");
    // if (!git_token) {
    //   this.error('GitHub token not found. Please set `github_key` in your .env file')
    //   return
    // }

    const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pr}`

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${git_token}`,
          Accept: 'application/vnd.github.v3.diff',
        },
      })

      if (!response.ok) {
        this.error(`❌ Failed to fetch PR: ${response.status} ${response.statusText}`)
        return
      }

      const diff = await response.text()
      
      this.log(`\n✅ PR Diff from ${owner}/${repo} (PR #${pr}):\n`)
      this.log(diff.slice(0, 1000) + '\n...') // Show first 1000 chars only for now
    } catch (err) {
      this.error(`Error fetching PR diff: ${(err as Error).message}`)
    }
  }
}