import { defineConfig } from 'cypress'
import registerCodeCoverageTasks from '@cypress/code-coverage/task.js'

export default defineConfig({
  projectId: 'dpucip',
  e2e: {
    baseUrl: 'http://localhost:8080',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config)
      return config
    }
  }
})
