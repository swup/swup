import { defineConfig } from 'cypress'
import registerCodeCoverageTasks from '@cypress/code-coverage/task.js'

export default defineConfig({
  projectId: 'dpucip',
  e2e: {
    baseUrl: 'http://localhost:8274',
    specPattern: 'cypress/e2e/**/[^_]*.{js,jsx,ts,tsx}',
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config)
      return config
    }
  }
})
