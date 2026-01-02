import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/standings': 'http://127.0.0.1:8000',
      '/completedFixtures': 'http://127.0.0.1:8000',
      '/upcomingFixtures': 'http://127.0.0.1:8000',
      '/upcomingGameweek': 'http://127.0.0.1:8000',
      '/weeklyTable': 'http://127.0.0.1:8000',
      '/players': 'http://127.0.0.1:8000',
      '/playersById': 'http://127.0.0.1:8000',
      '/playersByTeam': 'http://127.0.0.1:8000',
      '/teams': 'http://127.0.0.1:8000',
      '/teamsById': 'http://127.0.0.1:8000',
      '/completedGamebyTeamId': 'http://127.0.0.1:8000',
      '/completedGamebyId': 'http://127.0.0.1:8000',
      '/matchReport': 'http://127.0.0.1:8000',
      '/fixtures': 'http://127.0.0.1:8000',
      '/fixturesById': 'http://127.0.0.1:8000',
    }
  }
})
