const utils = require('./utils')
const fs = require('fs')
const path = require('path')

console.log(' Sending visual diff files to Cloudinary ')
console.log(' ========================================')
console.log('\n')

const diffPath = path.join(
  utils.visualRegressionPaths.base,
  utils.visualRegressionPaths.diff
)
const diffFiles = fs.readdirSync(diffPath)
const promises = []

diffFiles.forEach(file => {
  console.log(`Sending ${file} to Cloudinary...`)
  promises.push(
    utils.sendToCloudinary(path.join(diffPath, file), file, [
      `travis-${process.env.TRAVIS_BUILD_NUMBER}`
    ])
  )
})

Promise.all(promises).then(() => {
  process.exit()
})
