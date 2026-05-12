// DEMO MODE — no real database. These exports are kept for type compatibility but are never called.
export async function getDatabase(): Promise<never> {
  throw new Error('Demo mode: no database connected');
}

export async function getCollection(_collectionName: string): Promise<never> {
  throw new Error('Demo mode: no database connected');
}

export const COLLECTIONS = {
  USERS: 'users',
  STORES: 'stores',
  TRANSACTIONS: 'transactions',
  UPLOADS: 'uploads',
  SUPPLIER_PURCHASES: 'supplier_purchases',
};
