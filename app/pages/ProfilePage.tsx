import { Linking, ScrollView, ToastAndroid, View } from "react-native";
import { Avatar, Dialog, IconButton, List, Portal, RadioButton, Text, TouchableRipple, useTheme } from "react-native-paper";
import { Button, Screen, Spacer } from "../components";
import { useStores } from "../stores";
import { observer } from "mobx-react-lite";
import { Formik } from "formik";
import SendIntentAndroid from "react-native-send-intent";
import { appInfo } from "../stores/config";
import { useEffect, useMemo, useState } from "react";
import { getNotificationSounds, setNotificationSound } from "../services";
import { Sound, playSampleSound } from "react-native-notification-sounds";


export const ProfilePage = observer(() => {
  const { authStore: { user, logout }, appInfoStore: { checkForUpdate, updateAvailable } } = useStores();
  const { colors } = useTheme();

  const [notificationData, setNotificationData] = useState<{
    current: Sound;
    list: Sound[];
  }>()
  const [selectedNotificationSound, setSelectedNotificationSound] = useState<Sound>()
  const [notificationDialogVisible, setNotificationDialogVisibile] = useState(false)

  useEffect(() => {
    getNotificationSounds()
      .then(setNotificationData)
  }, [])

  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: 12, paddingTop: 100 }}>
        {user.loggedIn && user.pic ?
          <Avatar.Image
            size={120}
            source={{ uri: user.pic }}
          />
          :
          <Avatar.Icon
            size={120}
            icon={'account'}
          />
        }
        <View style={{ alignItems: 'center' }}>
          <Text variant="titleLarge">
            {user.firstname} {user.lastname}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceDisabled }}>User ID: #{user.userId}</Text>
        </View>
      </View>
      <Spacer size={12} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        <View style={{
          backgroundColor: colors.elevation.level1,
          padding: 12
        }}>
          <Text variant="bodyLarge" style={{ paddingLeft: 8 }}>Notification</Text>
          <Spacer size={8} />
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingRight: 12
          }}>
            <IconButton icon={"play"} mode="contained" onPress={() => {
              notificationData &&
                playSampleSound(notificationData.current)
            }} />
            <View style={{ flex: 1 }}>
              <Text>{notificationData?.current.title}</Text>
              <Text style={{ color: colors.onSurfaceDisabled }}>
                {notificationData?.current.url}
              </Text>
            </View>
            <Button
              compact
              onPress={() => {
                setNotificationDialogVisibile(true)
              }}
              children="choose"
            />
          </View>
        </View>

        <Portal>
          <Dialog visible={notificationDialogVisible} dismissable={false}>
            <Dialog.Title>Select Notification Sound</Dialog.Title>
            <Dialog.Content>
              <Dialog.ScrollArea style={{ maxHeight: 300 }}>
                <ScrollView>
                  {notificationData?.list.map(s =>
                    <TouchableRipple key={s.soundID} onPress={() => {
                      playSampleSound(s)
                      setSelectedNotificationSound(s)
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <RadioButton
                          status={selectedNotificationSound?.soundID === s.soundID ? 'checked' : 'unchecked'}
                          value={s.soundID}
                          onPress={() => {
                            playSampleSound(s)
                            setSelectedNotificationSound(s)
                          }}
                        />
                        <Text>{s.title}</Text>
                      </View>
                    </TouchableRipple>
                  )}
                </ScrollView>
              </Dialog.ScrollArea>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={async () => {
                if (selectedNotificationSound) {
                  setNotificationSound(selectedNotificationSound)
                  setNotificationDialogVisibile(false)
                  await getNotificationSounds()
                    .then(setNotificationData)
                  return
                }
                ToastAndroid.show('Unkown error occurred.', ToastAndroid.SHORT)
              }}
                mode='contained'
                disabled={selectedNotificationSound === undefined}
              >
                Save
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <View style={{
          backgroundColor: colors.elevation.level1,
          padding: 12,
          paddingLeft: 20,
        }}>
          <Text variant="bodyLarge" >About App</Text>
          <Spacer size={8} />
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              {Object.keys(appInfo).map((k, i) => <Text key={i}>{k}</Text>)}
            </View>
            <View style={{ flex: 1 }}>
              {Object.values(appInfo).map((k, i) => <Text key={i}>{k}</Text>)}
            </View>
          </View>
        </View>

        <View style={{
          backgroundColor: colors.elevation.level1,
          padding: 12,
          paddingLeft: 20,
        }}>
          <Text variant="bodyLarge" >Credits</Text>
          <Spacer size={8} />
          <Text>Work on Progress!</Text>
        </View>


        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
          <Button
            icon={"forum"}
            onPress={() => Linking.openURL("https://chat.whatsapp.com/BJntbDAR8FuBJmQt7hE8UT")}
            children={'Send Feedback'}
          />
          {/* <Text variant="labelSmall">Join whatsapp group!</Text> */}
          <Button mode="contained" onPress={logout}>logout</Button>
        </View>

        <View style={{ flex: 1 }} />

        <Formik
          initialValues={{}}
          children={({ handleSubmit, isSubmitting }) =>
            <View style={{ alignItems: 'center' }}>
              <Button style={{ alignSelf: 'center' }} mode="contained-tonal" disabled={isSubmitting} onPress={() => handleSubmit()}>
                {updateAvailable ? "Update" : "check for update"}
              </Button>
            </View>
          }
          onSubmit={async (v, { setSubmitting }) => {
            setSubmitting(true)
            const { updateAvailable } = await checkForUpdate()
            if (!updateAvailable) {
              ToastAndroid.show("Already upto date", ToastAndroid.LONG);
            }
            setSubmitting(false)
          }}
        />

        <Spacer size={50} />

        <View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}>
            <Text style={{ color: colors.primary }}>Privacy Policy</Text>
            <Text style={{ color: colors.onSurfaceDisabled }}> • </Text>
            <Text style={{ color: colors.primary }}>Terms of Service</Text>
          </View>
          <Text style={{ alignSelf: 'center', marginBottom: 12, color: colors.onSurfaceDisabled }}>
            &copy; {new Date().getFullYear()}, Dhwaj Platform Pvt Ltd. All rights reserved.
          </Text>
        </View>

      </ScrollView>
    </Screen >
  )
})