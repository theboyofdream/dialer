import { ReactNode, useState } from "react";
import { StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import { IconButton, List, useTheme } from "react-native-paper";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";

type PaperAccordion = {
  open?: boolean
  title: string;
  titleStyle?: TextStyle;
  description?: string;
  style?: ViewStyle;
  leftIcon?: IconSource;
  children: ReactNode
}
export function Accordion(props: PaperAccordion) {
  const { fonts } = useTheme()
  const [open, setOpen] = useState(props.open)
  const styles = StyleSheet.create({
    title: {
      ...fonts.titleLarge,
    },
    container: {
      display: open ? 'flex' : 'none',
      // backgroundColor: 'red',
      padding: fonts.titleSmall.fontSize / 2,
    }
  })

  return (
    <View>
      <List.Item
        title={props.title}
        titleStyle={[styles.title, props.titleStyle]}
        description={props.description}
        style={props.style}
        left={() => props.leftIcon && <IconButton icon={props.leftIcon} mode="contained-tonal" />}
        right={() => <IconButton icon={open ? 'chevron-up' : 'chevron-down'} iconColor={props.titleStyle?.color as string} />}
        onPress={() => setOpen(!open)}
      />
      <View style={styles.container}>
        {props.children}
      </View>
    </View>
  )
}


