import FeatherIcon from 'react-native-vector-icons/Feather';

import { observer } from "mobx-react-lite";
import { Input, LeadListItem, Screen, Spacer, View } from "../components";
import { Lead, useStores } from "../stores";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, IconButton, Text, TextInput, useTheme } from "react-native-paper";
import { RefreshControl, ScrollView, ToastAndroid } from "react-native";
import { delay } from "../utils";
import { useNavigation } from '@react-navigation/native';
import { clearNotification, handleNotificationPermission, setNotification } from '../services';


export const NotificationPage = observer(() => {
  const { canGoBack, goBack, navigate } = useNavigation();
  const { colors, roundness } = useTheme()
  const { leadStore, errorStore, notificationStore } = useStores()

  const searchRef = useRef('')
  const [searchQuery, setSearchQuery] = useState('');

  function search() {
    if (searchRef.current.length > 2) {
      setSearchQuery(searchRef.current)
    }
  }
  function onSearchTextChange(text: string) {
    searchRef.current = text;
    if (text.length < 3) {
      setSearchQuery('')
    }
  }

  async function handleNotificationsRefresh() {
    let hasNotificationPermission = false;
    if (!hasNotificationPermission) {
      await handleNotificationPermission()
        .then(({ errorMessage }) => {
          if (errorMessage) {
            errorStore.add({
              id: `notification`,
              title: `Permission  error`,
              content: `Notification permission not found.\n\n${errorMessage}\nHence, unable to set notifications.`
            })
          } else {
            hasNotificationPermission = true;
          }
        })
    }
    hasNotificationPermission && await clearNotification()
    for (let notification of notificationStore.notifications) {
      if (!hasNotificationPermission) { break }
      if (notification.followUpDate) {
        setNotification({
          leadId: notification.id,
          fullName: notification.firstname + ' ' + notification.lastname,
          remarks: notification.remarks,
          // notificationDate: notification.followUpDate
          notificationDate: new Date(new Date().getTime() + 30000)
        })
        break;
      }
    }
    hasNotificationPermission &&
      ToastAndroid.show(`${notificationStore.upcomingCount} notifications set`, ToastAndroid.SHORT)

  }
  useEffect(() => {
    notificationStore.upcomingCount > 0 && handleNotificationsRefresh()
  }, [notificationStore.notifications])

  const [fetchingData, setFetchingData] = useState(false)
  async function fetchData() {
    setFetchingData(true)

    await notificationStore.fetch()
      .then(({ error, message }) =>
        error &&
        errorStore.add({
          id: 'notification-fetchData',
          title: `Error`,
          content: `Some error occurred while loading notifications.\n\nerror message:${message}`
        })
      )

    await delay(500)
    setFetchingData(false)
  }

  return (
    <Screen>

      <Text variant='titleLarge' style={{ padding: 12, paddingLeft: 10 }}>Notifications</Text>

      <View style={{ marginHorizontal: 6 }}>
        <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <View style={{ flexDirection: 'row' }}>
            <Text variant='titleSmall'>{notificationStore.upcomingCount}</Text>
            <Text style={{ color: colors.onSurfaceDisabled }}> Upcoming Notifications</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text variant='titleSmall'>{notificationStore.totalCount}</Text>
            <Text style={{ color: colors.onSurfaceDisabled }}> Total</Text>
          </View>
        </View>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <View style={{ flex: 1 }}>
            <Input
              hideLabel
              placeholder="Search by name/mobile"
              onChangeText={onSearchTextChange}
              right={
                <TextInput.Icon
                  icon="magnify"
                  onPress={search}
                  color={colors.onPrimary}
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: roundness * 2.5,
                    marginRight: 0,
                  }}
                />
              }
            />
          </View>
        </View>
      </View>

      {
        fetchingData &&
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text variant="titleMedium">Fetching Data...</Text>
        </View>
      }
      {
        !fetchingData && notificationStore.notifications.length > 0 &&
        <View style={{ flex: 1 }}>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={fetchingData}
                onRefresh={fetchData}
              />
            }
          >
            {
              notificationStore.notifications.map((lead, index) => {
                if (searchQuery.length > 2) {
                  if (
                    lead.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    lead.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    lead.mobile.toLowerCase().includes(searchQuery.toLowerCase())
                  ) {
                    // if (JSON.stringify(Object.values(lead)).toLowerCase().includes(searchQuery.toLowerCase())) {
                    return <LeadListItem key={index} leadId={lead.id} />
                  }
                  return undefined
                }
                return <LeadListItem key={index} leadId={lead.id} />
              })
            }
            <Spacer size={50} />
          </ScrollView>
        </View>
      }
      {
        !fetchingData && leadStore.leads.length < 1 &&
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text variant='titleMedium'>No data found!</Text>
          <Button onPress={fetchData} icon="refresh">refresh</Button>
        </View>
      }
    </Screen>
  )
})