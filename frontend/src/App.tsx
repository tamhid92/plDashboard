import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { OverviewPage } from './pages/OverviewPage';
import { MatchDetailsPage } from './pages/MatchDetailsPage';
import { PlayersPage } from './pages/PlayersPage';
import { PlayerProfilePage } from './pages/PlayerProfilePage';
import { TeamDetailsPage } from './pages/TeamDetailsPage';
import { FPLPage } from './pages/FPLPage';
import { AppLayout } from './components/layout/AppLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <AppLayout>
              <OverviewPage />
            </AppLayout>
          } />
          <Route path="/match/:id" element={<MatchDetailsPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/team/:id" element={<TeamDetailsPage />} />
          <Route path="/player/:id" element={<PlayerProfilePage />} />
          <Route path="/fpl" element={<FPLPage />} />
          <Route path="/fantasy" element={<FPLPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
