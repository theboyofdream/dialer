import 'react-native-gesture-handler';

import { Provider as PaperProvider } from 'react-native-paper';
import { en, registerTranslation } from 'react-native-paper-dates';
registerTranslation('en', en)

import { configure } from "mobx";
configure({
  // enforceActions: "always",
  // computedRequiresReaction: true,
  // reactionRequiresObservable: true,
  // observableRequiresReaction: true,
  // disableErrorBoundaries: true
})

import notifee, { EventType } from '@notifee/react-native';
import { useEffect } from 'react';
import { Navigation } from './Navigation';
import { AppUpdateAlert } from './components';
import { removeNotification } from './services';
import { RootStoreProvider, rootStore } from './stores';
import { theme } from './utils';


export default function App() {

  async function init() {
    // listNotificationSounds()
  }

  useEffect(function () {
    init()
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.PRESS:
          if (detail && detail.notification && detail.notification.id) {
            removeNotification(detail.notification?.id)
          }
          break;
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <PaperProvider theme={theme}>
      <RootStoreProvider value={rootStore}>
        <AppUpdateAlert />
        <Navigation />
      </RootStoreProvider>
    </PaperProvider>
  )
}


