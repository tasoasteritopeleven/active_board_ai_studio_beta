import type { useCatanStore } from '../store/catanStore';

export type CatanStoreSnapshot = ReturnType<typeof useCatanStore.getState>;
