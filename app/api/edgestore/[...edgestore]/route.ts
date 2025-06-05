import { initEdgeStore } from '@edgestore/server';
import { createEdgeStoreNextHandler } from '@edgestore/server/adapters/next/app';

// Initialize EdgeStore
const es = initEdgeStore.create();

// Configure the EdgeStore router with a public files bucket
const edgeStoreRouter = es.router({
  publicFiles: es.fileBucket({
    accept: ['.csv'],
  }),
});

// Create the API handler with debug logging enabled
const handler = createEdgeStoreNextHandler({
  router: edgeStoreRouter,
  logLevel: 'debug',
});

export { handler as GET, handler as POST };

/**
 * This type is used to create the type-safe client for the frontend.
 */
export type EdgeStoreRouter = typeof edgeStoreRouter;
