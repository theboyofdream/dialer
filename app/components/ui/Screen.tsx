import React from 'react';
import { ViewProps, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Screen as RNScreen } from 'react-native-screens';

export function Screen(props: ViewProps) {
  const { colors } = useTheme();
  const style = [
    {
      flex: 1,
      paddingTop: 4,
      paddingHorizontal: 15,
      backgroundColor: colors.background,
    },
    props.style
  ]

  return (
    <RNScreen {...props} style={style} />
  );
}
