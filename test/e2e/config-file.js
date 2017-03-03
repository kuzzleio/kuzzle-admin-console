exports.config = {
  project: "YG2S7yvx",
  token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2IjowLCJkIjp7InVpZCI6ImNpOllHMlM3eXZ4IiwiZW1haWwiOiJqZW5vdmEua2UyMEBnbWFpbC5jb20ifSwiaWF0IjoxNDg3NjY2MjU4fQ.x5nLn_vXkYQyUuiNdB85b6SpShP-rwDjXpkpT6d5wjU",
  host: "hub",
  "report-file": "testim-report.xml",
  label: "main",
  browser: process.env.BROWSER,

  beforeSuite: () => {
    return {
      env_name: "local",
      login: "kuzzle-bo-admin",
      password: "test"
    }
  }
}