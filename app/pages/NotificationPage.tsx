import FeatherIcon from 'react-native-vector-icons/Feather';

import { observer } from "mobx-react-lite";
import { Button, Input, LeadListItem, Screen, Spacer, View } from "../components";
import { Lead, useStores } from "../stores";
import { useCallback, useEffect, useRef, useState } from "react";
import { Checkbox, IconButton, Text, TextInput, TouchableRipple, useTheme } from "react-native-paper";
import { ButtonProps, RefreshControl, ScrollView, ToastAndroid } from "react-native";
import { delay } from "../utils";
import { clearNotification, handleNotificationPermission, setNotification } from '../services';
import { FilterChip } from './LeadsPage';

type preFilters = 'all' | 'past' | 'upcoming'
// const preFilters = ['all', 'past', 'upcoming']

export const NotificationPage = observer(() => {
  const { colors, roundness } = useTheme()
  const { leadStore, errorStore, notificationStore } = useStores()

  const [notificationType, setNotificationType] = useState<preFilters>('upcoming')

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
    for (let notification of notificationStore.upcomingNotifications) {
      if (!hasNotificationPermission) { break }
      if (
        notification.followUpDate &&
        notification.followUpDate.getTime() > new Date().getTime()
      ) {
        setNotification({
          leadId: notification.id,
          fullName: notification.firstname + ' ' + notification.lastname,
          remarks: notification.remarks,
          notificationDate: notification.followUpDate,
          // notificationDate: new Date(new Date().getTime() + 30000),
          mobile: notification.mobile
        })
        // break;
      }
    }
    hasNotificationPermission &&
      ToastAndroid.show(`${notificationStore.upcomingNotifications.length} notifications set`, ToastAndroid.SHORT)

  }
  useEffect(() => {
    notificationStore.upcomingNotifications.length > 0 && handleNotificationsRefresh()
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

      <View style={{ marginHorizontal: 6, paddingBottom: 6 }}>
        <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <View style={{ flexDirection: 'row' }}>
            <Text variant='titleSmall'>
              {notificationType === 'all' && notificationStore.notifications.length}
              {notificationType === 'past' && notificationStore.pastNotifications.length}
              {notificationType === 'upcoming' && notificationStore.upcomingNotifications.length}
            </Text>
            <Text style={{ color: colors.onSurfaceDisabled }}> Count</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text variant='titleSmall'>{notificationStore.notifications.length}</Text>
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexDirection: 'row' }}
          contentContainerStyle={{ gap: 6 }}
        >
          {
            (new Array('all', 'past', 'upcoming') as preFilters[]).map(item => {
              const active = notificationType === item;

              return (
                <FilterChip
                  key={item}
                  children={item}
                  active={active}
                  disabled={fetchingData}
                  onPress={() => setNotificationType(item)}
                />
                // <Button
                //   style={{ minWidth: 0, gap: 10,bordr }}
                //   labelStyle={{ marginVertical: 6 }}
                //   mode={active ? 'contained-tonal' : 'text'}
                //   compact
                //   onPress={() => setNotificationType(item)}
                // >
                //   {active && <FeatherIcon name='check' size={18} />}
                //   {item}
                // </Button>
                // <TouchableRipple onPress={() => setNotificationType(item)}>
                //   <View style={{ flexDirection: 'row', gap: 4 }} key={item}>
                //     <FeatherIcon name='check' size={18} />
                //     <Text variant='bodyLarge'>{item}</Text>
                //     <Text variant='labelSmall'>10</Text>
                //   </View>
                // </TouchableRipple>
              )
              // <FilterChip
              //   key={item}
              //   children={item}
              //   active={notificationType === item}
              //   disabled={fetchingData}
              //   onPress={() => setNotificationType(item)}
              // />
            })
          }
          {/* <FilterChip
            key={'all'}
            children={'all'}
            active={notificationType === 'all'}
            disabled={fetchingData}
            onPress={() => setNotificationType('all')}
          />
          <FilterChip
            key={'past'}
            children={'past'}
            active={notificationType === 'past'}
            disabled={fetchingData}
            onPress={() => setNotificationType('past')}
          />
          <FilterChip
            key={'upcoming'}
            children={'upcoming'}
            active={notificationType === 'upcoming'}
            disabled={fetchingData}
            onPress={() => setNotificationType('upcoming')}
          /> */}
        </ScrollView>

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
              notificationType === 'all' &&
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
            {
              notificationType === 'past' &&
              notificationStore.pastNotifications.map((lead, index) => {
                if (searchQuery.length > 2) {
                  if (
                    lead.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    lead.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    lead.mobile.toLowerCase().includes(searchQuery.toLowerCase())
                  ) {
                    return <LeadListItem key={index} leadId={lead.id} />
                  }
                  return undefined
                }
                return <LeadListItem key={index} leadId={lead.id} />
              })
            }
            {
              notificationType === 'upcoming' &&
              notificationStore.upcomingNotifications.map((lead, index) => {
                if (searchQuery.length > 2) {
                  if (
                    lead.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    lead.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    lead.mobile.toLowerCase().includes(searchQuery.toLowerCase())
                  ) {
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
        !fetchingData && notificationStore.notifications.length < 1 &&
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text variant='titleMedium'>No data found!</Text>
          <Button onPress={fetchData} icon="refresh">refresh</Button>
        </View>
      }
    </Screen>
  )
})