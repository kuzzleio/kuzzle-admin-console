exports.config = {
  project: process.env.TESTIM_PROJECT,
  token: process.env.TESTIM_TOKEN,
  host: "hub",
  "report-file": "testim-report.xml",
  browser: process.env.BROWSER,

  beforeSuite: () => {
    return {
      kuzzle_env: 'proxy'
    }
  }
}
