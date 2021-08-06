// @ts-check
import minimist from 'minimist'
import _fs from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'
import semver from 'semver'
import enquirer from 'enquirer'
import execa from 'execa'

const { prompt } = enquirer
const fs = _fs.promises

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const args = minimist(process.argv.slice(2))
const { skipBuild, tag } = args

const versionIncrements = ['patch', 'minor', 'major']

const bin = (name) => resolve(__dirname, `../node_modules/.bin/${name}`)
const run = (bin, args, opts = {}) =>
  execa(bin, args, { stdio: 'inherit', ...opts })
const step = (msg) => console.log(chalk.cyan(msg))

async function main() {
  let targetVersion
  const pkg = JSON.parse(
    await fs.readFile(resolve(__dirname, '../package.json'), 'utf-8')
  )
  const { version: currentVersion } = pkg

  const { release } = await prompt({
    type: 'select',
    name: 'release',
    message: 'Select release type',
    choices: versionIncrements
      .map((i) => `${i} (${semver.inc(currentVersion, i)})`)
      .concat(['custom']),
  })

  if (release === 'custom') {
    targetVersion = (
      await prompt({
        type: 'input',
        name: 'version',
        message: 'Input custom version',
        initial: currentVersion,
      })
    ).version
  } else {
    targetVersion = release.match(/\((.*)\)/)[1]
  }

  if (!semver.valid(targetVersion)) {
    throw new Error(`Invalid target version: ${targetVersion}`)
  }

  const { yes: tagOk } = await prompt({
    type: 'confirm',
    name: 'yes',
    message: `Releasing v${targetVersion}. Confirm?`,
  })

  if (!tagOk) {
    return
  }

  // Update the package version.
  step('\nUpdating the package version...')
  await updatePackage(targetVersion)

  // Build the package.
  step('\nBuilding the package...')
  await run('pnpm', ['build'])

  // Generate the changelog.
  step('\nGenerating the changelog...')
  await run('pnpm', ['changelog'])
  await run('pnpm', ['prettier', '--write', 'CHANGELOG.md'])

  const { yes: changelogOk } = await prompt({
    type: 'confirm',
    name: 'yes',
    message: `Changelog generated. All good?`,
  })

  if (!changelogOk) {
    return
  }

  // Commit changes to the Git and create a tag.
  step('\nCommitting changes...')
  await run('git', ['add', 'CHANGELOG.md', 'package.json'])
  await run('git', ['commit', '-m', `release: v${targetVersion}`])
  await run('git', ['tag', `v${targetVersion}`])

  // Publish the package.
  step('\nPublishing the package...')
  await run('pnpm', [
    'publish',
    '--new-version',
    targetVersion,
    ...(tag ? ['--tag', tag] : []),
    '--access',
    'public',
    '--no-commit-hooks',
    '--no-git-tag-version',
  ])

  // Push to GitHub.
  step('\nPushing to GitHub...')
  await run('git', ['push', 'origin', `refs/tags/v${targetVersion}`])
  await run('git', ['push'])
}

async function updatePackage(version) {
  const pkgPath = resolve(__dirname, '../package.json')
  const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'))

  pkg.version = version

  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}

main().catch((err) => console.error(err))
