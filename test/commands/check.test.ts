import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('check', () => {
  it('runs check cmd', async () => {
    const {stdout} = await runCommand('check')
    expect(stdout).to.contain('hello world')
  })

  it('runs check --name oclif', async () => {
    const {stdout} = await runCommand('check --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
