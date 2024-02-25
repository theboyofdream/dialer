import FeatherIcon from 'react-native-vector-icons/Feather';

import { observer } from "mobx-react-lite";
import { Input, LeadListItem, Screen, Spacer, View } from "../components";
import { Lead, useStores } from "../stores";
import { useCallback, useEffect, useState } from "react";
import { Button, IconButton, Text, TextInput, useTheme } from "react-native-paper";
import { RefreshControl, ScrollView, ToastAndroid } from "react-native";
import { delay } from "../utils";
import { useNavigation } from '@react-navigation/native';
import { clearNotification, handleNotificationPermission, setNotification } from '../services';


export const NotificationPage = observer(() => {
  const { canGoBack, goBack, navigate } = useNavigation();
  const { colors } = useTheme()
  const { leadStore, errorStore } = useStores()

  const [searchQuery, setSearchQuery] = useState('');
  const searching = searchQuery.length > 0;

  const [leads, setLeads] = useState<Lead[]>([])
  function search() {
    let arr = [...leadStore.leadsWithNotification]
    if (searching) {
      arr = arr
        .filter(i => JSON.stringify(Object.values(i))
          .includes(searchQuery))
    }
    setLeads(arr)
  }
  useEffect(function reset() {
    setLeads(leadStore.leadsWithNotification)
  }, [searchQuery.length === 0, leadStore.leadsWithNotification])

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
    for (let notification of leadStore.leadsWithNotification) {
      if (!hasNotificationPermission) { break }
      if (notification.followUpDate) {
        setNotification({
          leadId: notification.id,
          fullName: notification.firstname + ' ' + notification.lastname,
          remarks: notification.remarks,
          notificationDate: notification.followUpDate
        })
      }
    }
    hasNotificationPermission &&
      ToastAndroid.show(`${leadStore.upcomingNotificationCount} notifications set`, ToastAndroid.SHORT)

  }
  useEffect(() => {
    if (leadStore.leadsWithNotification.length > 0) {
      handleNotificationsRefresh()
    }
  }, [leadStore.leadsWithNotification])

  const [fetchingData, setFetchingData] = useState(false)
  async function fetchData() {
    setFetchingData(true)

    await leadStore.fetch({ type: "leads-with-notification" })
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

  useEffect(() => {
    leadStore.leadsWithNotification.length < 1 && fetchData()
  }, [])

  function handleBack() {
    canGoBack() ? goBack() : navigate('home')
  }

  return (
    <Screen>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <IconButton icon={"arrow-left"} onPress={handleBack} />
        <Text variant='titleMedium'>Notifications</Text>
        <IconButton icon={"arrow-left"} style={{ opacity: 0 }} />
      </View>

      <View style={{ marginHorizontal: 6 }}>
        <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <View style={{ flexDirection: 'row' }}>
            <Text variant='titleSmall'>{leadStore.upcomingNotificationCount}</Text>
            <Text style={{ color: colors.onSurfaceDisabled }}> Upcoming Notifications</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text variant='titleSmall'>{leadStore.notificationsCount}</Text>
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
              value={searchQuery}
              onChangeText={setSearchQuery}
              right={
                <TextInput.Icon
                  style={{
                    backgroundColor: searching ? colors.primary : undefined,
                    borderRadius: 0,
                    marginRight: 0
                  }}
                  color={searching ? colors.onPrimary : undefined}
                  icon="magnify"
                  onPress={search}
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
        !fetchingData && leadStore.filteredLeads.length > 0 &&
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
              leads.map(lead => <LeadListItem key={lead.id} leadId={lead.id} />)
            }
            <Spacer size={50} />
          </ScrollView>
        </View>
      }
      {
        !fetchingData && leadStore.filteredLeads.length < 1 &&
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text variant='titleMedium'>No data found!</Text>
          <Button onPress={fetchData} icon="refresh">refetch</Button>
        </View>
      }
    </Screen>
  )
})