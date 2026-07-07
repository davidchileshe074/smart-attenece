import { Suspense } from 'react';
import { LoadingState } from '@/components/ui/status-state';
import DashboardSearchClient from './search-page-client';

export default function DashboardSearchPage() {
  return (
    <Suspense
      fallback={
        <LoadingState
          title="Searching dashboard"
          description="Loading the course, session, and attendance sources."
          compact
        />
      }
    >
      <DashboardSearchClient />
    </Suspense>
  );
}
