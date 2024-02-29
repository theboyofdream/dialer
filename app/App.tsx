import 'react-native-gesture-handler';

import { MD3Colors, Provider as PaperProvider, configureFonts } from 'react-native-paper';
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
import { AppUpdateAlert, ErrorAlert } from './components';
import { removeNotification } from './services';
import { RootStoreProvider, rootStore } from './stores';
import { theme } from './utils';


notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;
  if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
    if (notification) {
      notification
    }
  }
});


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
            console.log(detail)
            removeNotification(detail.notification?.id)
          }
          break;
      }
    });
    return () => {
      unsubscribe()
    };
  }, []);

  return (
    // <PaperProvider theme={theme}>
    // <PaperProvider theme={{
    //   ...MD3Colors,
    //   // mode: 'exact',
    //   // roundness: 0,
    //   // fonts: customFonts
    // }}>
    <PaperProvider>
      <RootStoreProvider value={rootStore}>
        <AppUpdateAlert />
        <ErrorAlert />
        <Navigation />
      </RootStoreProvider>
    </PaperProvider>
  )
}
