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
import { useEffect, useState } from 'react';
import { Navigation } from './Navigation';
import { AppUpdateAlert, ErrorAlert, InAppNotificationAlert } from './components';
import { removeNotification } from './services';
import { RootStoreProvider, rootStore } from './stores';
import { theme } from './utils';
import { NavigationAction, createNavigationContainerRef } from '@react-navigation/native';
import { useLinkTo } from '@react-navigation/native';
import { Linking } from 'react-native';


notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification } = detail;
  if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
    if (notification && notification.data) {
      Linking.openURL(`dhwajdialer://lead/${notification.data.leadId}`)
        .then(onfulfilled => {
          if (notification.id) {
            removeNotification(notification.id)
          }
        })
    }
  }
});


export default function App() {

  useEffect(function () {

    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      const { notification } = detail
      if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
        if (notification && notification.data) {
          Linking.openURL(`dhwajdialer://lead/${notification.data.leadId}`)
            .then(onfulfilled => {
              if (notification.id) {
                removeNotification(notification.id)
              }
            })
        }
      }
    });

    return () => { unsubscribe() };
  }, []);

  return (
    <PaperProvider>
      <RootStoreProvider value={rootStore}>
        <Navigation>
          <AppUpdateAlert />
          <ErrorAlert />
          <InAppNotificationAlert />
        </Navigation>
      </RootStoreProvider>
    </PaperProvider>
  )
}
