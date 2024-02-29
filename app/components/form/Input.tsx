import { TextStyle, View } from 'react-native';
import { Text, TextInput, TextInputProps, useTheme } from 'react-native-paper';


export type InputProps = TextInputProps & {
  label?: string;
  hideLabel?: boolean;
  errorText?: string;
  required?: boolean;
};


export const Input = ({ errorText, label, hideLabel, ...props }: InputProps) => {
  const { colors } = useTheme()
  // const isError = props.required && (errorText != undefined || props.value == undefined || props.value == '')
  const isError = errorText != undefined || (props.required && (props.value == undefined || props.value == ''))
  const styles = {
    text: [
      { color: colors.onSurface },
      isError && { color: colors.error }
    ] as TextStyle,
    input: {
      backgroundColor: isError ? colors.errorContainer : colors.surfaceVariant,
      paddingHorizontal: 8,
      height: props.multiline ? undefined : 46,
      marginVertical: 4,
      borderTopStartRadius: 9,
      borderTopEndRadius: 9,
      borderBottomStartRadius: 9,
      borderBottomEndRadius: 9,
      // borderRadius: 9
    } as TextStyle
  }

  return (
    <View>
      {
        !hideLabel &&
        <View style={{ flexDirection: 'row' }}>
          <Text style={[styles.text, props.disabled && { opacity: 0.6 }]} >
            {label ?? props.placeholder}
          </Text>
          {props.required &&
            <Text
              variant='labelMedium'
              // style={[isError && { color: colors.error }]}
              style={[{ color: colors.error }]}
            >*</Text>
          }
        </View>
      }

      <TextInput
        maxLength={props.multiline ? undefined : 100}
        {...props}
        style={[styles.text, styles.input, props.style]}
        underlineStyle={[{ display: 'none' }, props.underlineStyle]}
      />

      {isError && errorText &&
        <Text
          style={{ color: colors.error }}
          children={errorText}
        />
      }
    </View>
  );
};