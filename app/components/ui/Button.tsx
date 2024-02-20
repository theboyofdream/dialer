import { Button as PprButton, ButtonProps, useTheme } from 'react-native-paper'

export function Button(props: ButtonProps) {
  const { colors } = useTheme()
  return (
    <PprButton
      {...props}
      style={[
        {
          minWidth: 100,
          // borderRadius: 15,
          // alignSelf: 'flex-start'
        },
        props.style
      ]}
      labelStyle={[
        { textTransform: 'capitalize' },
        props.mode === 'contained-tonal' && { color: colors.primary },
        props.labelStyle
      ]}
    />
  )
}