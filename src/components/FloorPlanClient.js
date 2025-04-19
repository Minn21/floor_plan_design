'use client';

import dynamic from 'next/dynamic';

const FloorCanvas = dynamic(
  () => import('./FloorCanvas'),
  { 
    ssr: false,
    loading: () => <p>Loading...</p>
  }
);

export default function FloorPlanClient() {
  return <FloorCanvas />;
}