import { View, ViewProps } from "react-native";

export function Row(props: ViewProps) {
  return (
    <View
      {...props}
      style={[
        { flexDirection: 'row' },
        props.style
      ]} />
  )
}