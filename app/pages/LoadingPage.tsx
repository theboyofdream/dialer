import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { ToastAndroid, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Screen, Spacer } from "../components";
import { useStores } from "../stores";
import { delay } from "../utils";
import { clearNotification, handleNotificationPermission, setNotification } from "../services";
import { appVersion } from "../stores/config";


export const LoadingPage = observer(() => {
  const { navigate } = useNavigation()
  const { colors } = useTheme()
  const stores = useStores()

  const [progress, setProgress] = useState(0)

  function setError(key: string, msg: string) {
    stores.errorStore.add({
      id: `loading-${key}`,
      title: `Error`,
      content: `Unable to load ${key} from server.\n\nerror message:\n${msg}`
    })
  }

  async function init() {
    let progressCount = 8
    async function updateProgress() {
      setProgress(Math.round(100 / --progressCount))
      await delay(100)
    }

    await stores.appInfoStore.checkForUpdate()
      .then(({ error, message }) => error && setError('app-update', message))
    await updateProgress()

    await stores.notificationStore.fetch()
      .then(({ error, message }) => error && setError('notification', message))
    await updateProgress()

    if (stores.statusStore.statusArray.length < 1) {
      await stores.statusStore.fetch()
        .then(({ error, message }) => error && setError('status', message))
    }
    await updateProgress()

    if (stores.dispositionStore.dispositionArray.length < 1) {
      await stores.dispositionStore.fetch()
        .then(({ error, message }) => error && setError('disposition', message))
    }
    await updateProgress()

    if (stores.projectStore.projectArray.length < 1) {
      await stores.projectStore.fetch()
        .then(({ error, message }) => error && setError('project', message))
    }
    await updateProgress()

    await stores.leadStore.fetch({ type: 'follow-ups' })
      .then(({ error, message }) => error && setError('follow-ups', message))
    await updateProgress()


    // await stores.leadStore.fetch({ type: 'leads-with-notification' })
    //   .then(({ error, message }) => error && setError('notification', message))
    // await updateProgress()

    let hasNotificationPermission = false;
    if (!hasNotificationPermission) {
      await handleNotificationPermission()
        .then(({ errorMessage, errorCategory }) => {
          if (errorCategory) {
            setError('notification-permission', errorMessage + `\n\nHence, unable to set notifications.`)
          } else {
            hasNotificationPermission = true;
          }
        })
    }
    hasNotificationPermission && await clearNotification()
    for (let notification of stores.notificationStore.upcomingNotifications) {
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
      ToastAndroid.show(`${stores.notificationStore.upcomingNotifications.length} notifications set`, ToastAndroid.SHORT)

    await updateProgress()

    await delay(500)
    navigate('home')
  }

  useEffect(() => { init() }, [])

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', marginHorizontal: 24 }}>

        {/* <Text variant='displayLarge'>DHWAJ</Text>
        <Text variant='displaySmall'>Dialer</Text> */}

      </View>
      <View style={{
        // flex: 1,
        marginBottom: 50,
        gap: 10,
        justifyContent: 'flex-end',
        alignItems: 'center'
      }}>

        <View style={{
          padding: 30,
          paddingBottom: 0,
          minWidth: 300,
          maxWidth: 400
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'baseline' }}>
            <Text variant='displayMedium' children={progress} />
            <Text variant='headlineMedium' children={'%'} />
            <Spacer size={12} horizontal />
            <Text variant='labelLarge' children="Loading..." />
          </View>
        </View>

        <View style={{ width: 200, height: 3, borderRadius: 3, backgroundColor: colors.elevation.level3 }}>
          <View style={{ width: progress * 2, height: 3, borderRadius: 3, backgroundColor: colors.onSurfaceVariant }} />
        </View>

        <Text style={{ opacity: 0.6 }}>version {appVersion}</Text>
      </View>
    </Screen>
  )
})
