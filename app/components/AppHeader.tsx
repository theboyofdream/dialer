import { View } from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";

export function AppHeader() {
  const { colors } = useTheme()
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text variant='titleMedium'>
        <Text disabled style={{ color: colors.primary, fontWeight: 'bold' }}>{arr.length}</Text>
        <Text style={{ color: colors.onSurfaceDisabled, fontWeight: 'bold' }}> • </Text>
        <Text>LEADS</Text>
      </Text>
      <IconButton icon={"bell"} />
    </View>
  )
}