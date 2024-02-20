import notifee, { AndroidCategory, AndroidImportance, AndroidNotificationSetting, AndroidStyle, AuthorizationStatus, TimestampTrigger, TriggerType } from '@notifee/react-native';
import { BackHandler, Platform } from 'react-native';
import NotificationSounds from 'react-native-notification-sounds';
import { dateFns } from '../utils';

type errorCategory = 'battery' | 'notification' | 'alarm' | null
export async function handleNotificationPermission() {
  let errorCategory: errorCategory = null
  let errorMessage = undefined

  if (
    Platform.OS === 'android' &&
    Platform.Version > 30 &&
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
  notificationDate: Date

}
export async function setNotification(params: notificationParams) {
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
    })

    const notificationTrigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: time,
      alarmManager: true,
    }

    await notifee.createTriggerNotification({
      title: `<b>Follow up</b> of <b>${params.fullName}</b>`,
      android: {
        channelId: notificationChannel,
        category: AndroidCategory.REMINDER,
        showTimestamp: true,
        style: { type: AndroidStyle.BIGTEXT, text: `<i><small style="opacity:0.5;">remarks:</small></i> ${params.remarks}<br>Follow up at ${dateFns.toHumanReadleDate(new Date(datetime))}` },
        autoCancel: false,
        pressAction: { id: 'default' },
        fullScreenAction: {
          id: 'default',
        },
      }
    }, notificationTrigger)
  })

}

export async function removeNotification(notificationId: string) {
  await notifee.cancelNotification(notificationId);
}

export async function clearNotification() {
  await notifee.cancelAllNotifications();
}
