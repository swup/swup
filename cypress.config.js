const { defineConfig } = require('cypress')

module.exports = defineConfig({
  projectId: 'dpucip',
  e2e: {
    baseUrl: 'http://localhost:8274',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config)
      return config
    }
  }
})
