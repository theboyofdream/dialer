import { observer } from "mobx-react-lite";
import { Screen, Spacer } from "../components";
import { Card, Text } from "react-native-paper";
import { Platform, View } from "react-native";

export const PermissionPage = observer(() => {
  return (
    <Screen>
      <View style={{ padding: 12, paddingTop: 24, flex: 1 }}>
        <Text variant='headlineSmall'>Welcome to</Text>
        <Text variant='displaySmall'>Dhwaj Dialer.</Text>
        <Spacer size={24} />

        <Text variant='titleMedium'>For Calling</Text>
        <Text variant='bodyLarge'>
          We need <Text style={{ fontWeight: 'bold' }}>Call permission. <Text style={{ fontWeight: 'bold', color: 'blue' }}>Grant</Text></Text>
        </Text>

        <Spacer size={12} />

        <Text variant='titleMedium'>For Notification</Text>
        <Text variant='bodyLarge'>
          Give <Text style={{ fontWeight: 'bold' }}>Notification permission. <Text style={{ fontWeight: 'bold', color: 'blue' }}>Grant</Text></Text>
        </Text>
        {
          (Platform.OS === 'android' && Platform.Version >= 30) &&
          <Text variant='bodyLarge'>
            Disable <Text style={{ fontWeight: 'bold' }}>Battery optimization. <Text style={{ fontWeight: 'bold', color: 'blue' }}>Open settings</Text></Text>
          </Text>
        }
        {
          (Platform.OS === 'android' && Platform.Version >= 32) &&
          <Text variant='bodyLarge'>
            Give <Text style={{ fontWeight: 'bold' }}>Alaram permission. <Text style={{ fontWeight: 'bold', color: 'blue' }}>Open settings</Text></Text>
          </Text>
        }

        {/* <Text variant='bodyLarge'>
          Dhwaj dialer needs <Text style={{ fontWeight: 'bold' }}>Notification{'\n'}permission. <Text style={{ fontWeight: 'bold', color: 'blue' }}>Grant</Text></Text>
        </Text> */}
        <Spacer size={100} />

      </View>
    </Screen>
  )
})