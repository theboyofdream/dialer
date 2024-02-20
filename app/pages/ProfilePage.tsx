import { Linking, ScrollView, ToastAndroid, View } from "react-native";
import { Avatar, IconButton, Text, useTheme } from "react-native-paper";
import { Button, Screen, Spacer } from "../components";
import { useStores } from "../stores";
import { observer } from "mobx-react";
import { Formik } from "formik";
import SendIntentAndroid from "react-native-send-intent";
import Sound from "react-native-sound";

const appInfo = {
  version: "1.0",
  'react native': '0.71',
  hermes: 'enabled',
}

export const ProfilePage = observer(() => {
  const { authStore: { user, logout }, appInfoStore: { checkForUpdate, updateAvailable } } = useStores();
  const { colors } = useTheme();

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, flex: 1 }}
      >

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
            <IconButton icon={"play"} mode="contained" />
            <View style={{ flex: 1 }}>
              <Text>File name</Text>
              <Text style={{ color: colors.onSurfaceDisabled }}>path</Text>
            </View>
            <Button
              compact
              onPress={() => {

              }}
              children="choose file"
            />
          </View>
        </View>

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
            const r = await checkForUpdate()
            console.log(r)
            if (!r.updateAvailable) {
              ToastAndroid.show("Already upto date", ToastAndroid.LONG);
            }
            setSubmitting(false)
          }}
        />

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