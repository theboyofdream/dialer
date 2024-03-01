import { Text } from "react-native-paper";
import { Button, Screen, Spacer } from "../components";
import { Link, useNavigation } from "@react-navigation/native";

export function NotFoundPage() {
  const { navigate } = useNavigation()
  return (
    <Screen style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text variant='displayMedium'>404</Text>
      <Text>Not Found!</Text>
      <Spacer size={24} />
      <Button mode='contained-tonal' onPress={() => navigate('loading')}>Go Home</Button>
    </Screen>
  )
}