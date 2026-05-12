// DEMO MODE — no real database connection
// This file is intentionally empty to prevent any real DB calls.
const clientPromise: Promise<never> = Promise.reject(
  new Error('Demo mode: no database connected')
);

export default clientPromise;
