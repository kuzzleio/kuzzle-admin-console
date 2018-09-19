const BlinkDiff = require('blink-diff')
const cloudinary = require('cloudinary')
const fs = require('fs')
const path = require('path')

const threshold = 0.1
const defaultWaitElTimeout = process.env.waitElTimeout || 3000
const paths = {
  base: `${__dirname}/visual-regression`,
  reference: 'reference',
  current: 'current',
  diff: 'diff'
}

cloudinary.config({
  cloud_name: process.env.cloudinary_cloud_name || 'kuzzle',
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_api_secret
})

const sendToCloudinary = (path, publicId, tags) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(
      path,
      {
        public_id: publicId,
        tags
      },
      (error, result) => {
        if (error) {
          return reject(error)
        }
        return resolve()
      }
    )
  })
}

const getCurrentScreenshotPath = name => {
  return path.join(paths.base, paths.current, name + '.png')
}

const compareScreenshot = async name => {
  const currentScreenshotPath = getCurrentScreenshotPath(name)
  const referenceScreenshotPath = path.join(
    paths.base,
    paths.reference,
    name + '.png'
  )
  const diffScreenshotPath = path.join(paths.base, paths.diff, name + '.png')

  if (!fs.existsSync(referenceScreenshotPath)) {
    if (process.env.updatingVisualReference) {
      return true
    }
    throw new Error(
      `Missing reference for screenshot ${name}. Did you run "npm run e2e-update-reference" ?`
    )
  }

  const diff = new BlinkDiff({
    imageAPath: referenceScreenshotPath,
    imageBPath: currentScreenshotPath,
    thresholdType: BlinkDiff.THRESHOLD_PERCENT,
    threshold,
    imageOutputPath: diffScreenshotPath
  })

  const diffResult = await diff.runWithPromise()

  if (diffResult.code === 1) {
    throw new Error(
      `Screenshot differences are over the threshold: ${diffResult.differences}`
    )
  }
}

const waitForSelector = async (page, selector, timeout) => {
  if (!page) {
    throw new Error('waitForSelector: Please provide a page instance')
  }
  try {
    await page.waitForSelector(selector, {
      timeout: timeout || defaultWaitElTimeout
    })
  } catch (error) {
    throw new Error(
      `Something went wrong waiting for ${selector} to appear. ${error.message}`
    )
  }
}

const click = async (page, selector) => {
  if (!page) {
    throw new Error('click: Please provide a page instance')
  }
  try {
    await page.click(selector)
  } catch (error) {
    throw new Error(
      `Something went wrong clicking ${selector}. ${error.message}`
    )
  }
}

const wait = async (page, timeout) => {
  try {
    await page.waitForFunction(() => false, { timeout })
  } catch (error) {}
}

const screenshot = async (page, path) => {
  await page.screenshot({
    path
  })
  try {
    fs.chmodSync(path, 0o777)
  } catch (error) {}
}

module.exports = {
  getCurrentScreenshotPath,
  compareScreenshot,
  visualRegressionPaths: paths,
  sendToCloudinary,
  waitForSelector,
  click,
  wait,
  screenshot
}
