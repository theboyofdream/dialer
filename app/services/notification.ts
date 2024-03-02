import notifee, { AndroidCategory, AndroidImportance, AndroidLaunchActivityFlag, AndroidNotificationSetting, AndroidStyle, AuthorizationStatus, TimestampTrigger, TriggerType } from '@notifee/react-native';
import { BackHandler, InteractionManager, Platform } from 'react-native';
import NotificationSounds, { Sound } from 'react-native-notification-sounds';
import { dateFns } from '../utils';
import { localStorage } from '../stores/config';

type errorCategory = 'battery' | 'notification' | 'alarm' | null
export async function handleNotificationPermission() {
  let errorCategory: errorCategory = null
  let errorMessage: string | null = null

  if (
    Platform.OS === 'android' &&
    Platform.Version >= 30 &&
    await notifee.isBatteryOptimizationEnabled()
  ) {
    errorCategory = 'battery'
    errorMessage = "Battery Optimization enabled."
  }

  await notifee
    .getNotificationSettings()
    .then(settings => {
      switch (settings.authorizationStatus) {
        case AuthorizationStatus.DENIED:
          errorCategory = 'notification'
          errorMessage = "Notification permission denied."
          break;
        case AuthorizationStatus.NOT_DETERMINED:
          errorCategory = 'notification'
          errorMessage = "Notification permission not found."
          break;
        case AuthorizationStatus.PROVISIONAL:
          errorCategory = 'notification'
          errorMessage = "Notification permission is set to silent."
          break;
      }

      switch (settings.android.alarm) {
        case AndroidNotificationSetting.DISABLED:
          errorCategory = 'alarm'
          errorMessage = "Alarm permission denied."
          break;
        case AndroidNotificationSetting.NOT_SUPPORTED:
          errorCategory = 'alarm'
          errorMessage = "Alarm permission not supported."
          break;
      }
    })
    .catch(err => {
      errorMessage = `${err}`
    })

  return { errorCategory, errorMessage }
}

export async function openSettings(category: errorCategory) {
  switch (category) {
    case 'alarm':
      await notifee.openAlarmPermissionSettings()
      break;
    case 'battery':
      await notifee.openBatteryOptimizationSettings()
      break;
    case 'notification':
      await notifee.openNotificationSettings()
      break;
  }
  if (category) {
    BackHandler.exitApp()
  }
}

export async function listNotificationSounds() {
  // Retrieve a list of system notification sounds
  const soundsList = await NotificationSounds.getNotifications('notification');
  // console.log(soundsList)
  return soundsList
}


type notificationParams = {
  leadId: number,
  fullName: string,
  remarks: string,
  notificationDate: Date,
  mobile: string,
}
export async function setNotification(params: notificationParams) {
  if (params.notificationDate.getTime() < (new Date()).getTime()) {
    return;
  }

  const sound = (await getNotificationSounds()).current
  // return;
  const datetime = params.notificationDate.getTime()
  const before15mins = datetime - (15 * 60 * 1000)

  Array(datetime, before15mins).map(async time => {
    const notificationChannel = await notifee.createChannel({
      id: `${params.leadId}`,
      name: params.fullName,

      vibration: true,
      bypassDnd: true,
      importance: AndroidImportance.HIGH,

      sound: sound.title,
      soundURI: sound.url
    })

    const notificationTrigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: time,
      alarmManager: true,
    }

    await notifee.createTriggerNotification({
      title: `Follow up of <h3>${params.fullName}</h3>`,
      android: {
        channelId: notificationChannel,
        category: AndroidCategory.REMINDER,
        showTimestamp: true,
        style: { type: AndroidStyle.BIGTEXT, text: `<i>remarks:</i> ${params.remarks}<br><i style="opacity:0.5;">Follow up at</i> ${dateFns.toHumanReadleDate(new Date(datetime))}` },
        autoCancel: false,
        pressAction: { id: 'default' },
        // actions: [
        //   {
        //     title: '<button>Call now</button>',
        //     pressAction: {
        //       id: 'call-now',
        //       launchActivity: 'default'
        //       // launchActivity: 'com.android.server.telecom',
        //       // launchActivityFlags: [AndroidLaunchActivityFlag]
        //     }
        //     // launchActivity: 'com.android.server.telecom/tel:9321420119'
        //   }
        // ],
        // https://notifee.app/react-native/docs/android/behaviour#full-screen
        // fullScreenAction: {
        //   id: 'default',
        // },
        sound: sound.title
      },
      data: params,
    }, notificationTrigger)
  })
}

export async function removeNotification(notificationId: string) {
  await notifee.cancelNotification(notificationId);
}

export async function clearNotification() {
  await notifee.cancelAllNotifications();
}

const cnskey = 'current-notification-sound'
export async function getNotificationSounds() {
  const soundList = await NotificationSounds.getNotifications('notification');
  const currentSoundJson = localStorage.getString(cnskey)
  let currentSound = soundList[0]
  if (currentSoundJson) {
    currentSound = JSON.parse(currentSoundJson)
  }

  return {
    current: currentSound,
    list: soundList,
  }
}

export function setNotificationSound(sound: Sound) {
  localStorage.set(cnskey, JSON.stringify(sound))
}