// Create hook to consume context in easy way
// /hooks/useStore.ts
import { useContext } from 'react';

import { RootStore } from './rootStore';
import { RootStoreContext } from './RootStoreProvider';


export const useStores = (): RootStore => useContext(RootStoreContext);
