// Create store context
// /context/store.ts


// Add context to the app
// /index.tsx
import { createContext } from 'react';

import { RootStore, rootStore } from './rootStore';


export const RootStoreContext = createContext<RootStore>({} as typeof rootStore);
export const RootStoreProvider = RootStoreContext.Provider;