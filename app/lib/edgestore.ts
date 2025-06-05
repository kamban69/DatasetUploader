'use client';

import { type EdgeStoreRouter } from '../api/edgestore/[...edgestore]/route';
import { createEdgeStoreProvider } from '@edgestore/react';

// Create the EdgeStore provider with default options
const { EdgeStoreProvider, useEdgeStore } = createEdgeStoreProvider<EdgeStoreRouter>({
  maxConcurrentUploads: 3,
});

export { EdgeStoreProvider, useEdgeStore };
