const path = require('path')
const fs = require('fs-extra')
const ora = require('ora')
const cmd = require('node-cmd')
const editJsonFile = require("edit-json-file")
const argv = require('minimist')(process.argv.slice(2))

const pkgName = argv._[0]

if (!pkgName || pkgName === true) {
  console.log('You must include a package name')
  process.exit()
}

async function create (pkgName) {
  const pathName = path.join(__dirname, '../packages/', argv.path || '', pkgName)
  let spinner = ora(`Creating ${pkgName}`).start()

  if (fs.existsSync(pathName)) {
    spinner.stop()
    console.log(`A package already exists at ${pathName}`)
    process.exit()
  }

  await new Promise(
    (resolve, reject) => cmd.get(
      `
          mkdir -p ${pathName}
          mkdir ${path.join(pathName, 'src')}
          touch ${path.join(pathName, 'src/index.{js,test.js}')}
          cd ${pathName}
          yarn init --yes
        `,
      (err, data, stderr) => {
        spinner.stop()

        if (!err) {
          const pkgJson = editJsonFile(path.join(pathName, 'package.json'))
          pkgJson.set('sideEffects', false)
          pkgJson.set('main', 'dist/cjs/index.js')
          pkgJson.set('module', 'dist/es/index.js')
          pkgJson.set(
            'repository',
            `https://github.com/jaredLunde/data-structs/tree/master/packages/${pkgName}`
          )
          pkgJson.set('name', `@data-structs/${pkgName}`)
          pkgJson.set('scripts.build', 'yarn run build:es && yarn run build:cjs')
          pkgJson.set('scripts.build:es', 'rimraf dist/es && cross-env NODE_ENV=production BABEL_ENV=es babel src --out-dir dist/es --ignore **/*.test.js && npm run prettier:es')
          pkgJson.set('scripts.build:cjs', 'rimraf dist/cjs && cross-env NODE_ENV=production BABEL_ENV=cjs babel src --out-dir dist/cjs --ignore **/*.test.js && npm run prettier:cjs')
          pkgJson.set('scripts.watch', 'rimraf dist/es && cross-env NODE_ENV=production BABEL_ENV=es babel src -w --out-dir dist/es --ignore **/*.test.js')
          pkgJson.set('scripts.prettier', 'prettier --single-quote --no-semi --no-bracket-spacing --trailing-comma es5 --write')
          pkgJson.set('scripts.prettier:es', 'yarn prettier \"dist/es/**/*.js\"')
          pkgJson.set('scripts.prettier:cjs', 'yarn prettier \"dist/cjs/**/*.js\"')
          pkgJson.set('scripts.prepublishOnly', 'yarn test && yarn build')
          pkgJson.set('scripts.test', 'BABEL_ENV=cjs ava -v')
          pkgJson.set('ava', {
            "files": [
              "src/**/*.test.js"
            ],
            "require": [
              "@babel/register"
            ]
          })
          pkgJson.save()

          spinner = ora(`Installing ${pkgName}`).start()

          cmd.get(
            `
              yarn add --cwd ${pathName} --dev @stellar-apps/babel-preset-es rimraf prettier @babel/register ava
            `,
            async (err, data, stderr) => {
              spinner.stop()

              if (!err) {
                await fs.copy(
                  path.join(__dirname, `assets/babel.esx.rc`),
                  path.join(pathName, '.babelrc')
                )
                await fs.copy(
                  path.join(__dirname, `assets/gitignore`),
                  path.join(pathName, '.gitignore')
                )
                await fs.copy(
                  path.join(__dirname, `assets/npmignore`),
                  path.join(pathName, '.npmignore')
                )
                await fs.copy(
                  path.join(__dirname, `assets/LICENSE`),
                  path.join(pathName, 'LICENSE')
                )
                await fs.copy(
                  path.join(__dirname, `assets/README.md`),
                  path.join(pathName, 'README.md')
                )
                resolve(data)
              }
              else {
                console.log(err)
                reject(err)
              }
            }
          )
        } else {
          reject(err)
        }
      }
    )
  )
}

create(pkgName).then(() => console.log('Finished.'))
