import { TextStyle, View } from 'react-native';
import { Text, TextInput, TextInputProps, useTheme } from 'react-native-paper';


export type InputProps = TextInputProps & {
  label?: string;
  hideLabel?: boolean;
  errorText?: string;
};


export const Input = ({ errorText, label, hideLabel, ...props }: InputProps) => {
  const { colors } = useTheme()
  const styles = {
    text: [
      { color: colors.onSurface },
      errorText && { color: colors.error }
    ] as TextStyle,
    input: {
      backgroundColor: errorText ? colors.errorContainer : colors.surfaceVariant,
      paddingHorizontal: 8,
      height: props.multiline ? undefined : 46,
      marginVertical: 4,
    }
  }

  return (
    <View>
      {
        !hideLabel &&
        <Text style={[styles.text, props.disabled && { opacity: 0.6 }]} >
          {label ?? props.placeholder}
        </Text>
      }

      <TextInput
        maxLength={props.multiline ? undefined : 100}
        {...props}
        style={[styles.text, styles.input, props.style]}
        underlineStyle={[{ display: 'none' }, props.underlineStyle]}
      />

      {errorText &&
        <Text
          style={{ color: colors.error }}
          children={errorText}
        />
      }
    </View>
  );
};


// import { View } from 'react-native';
// import { Text, TextInput, TextInputProps, useTheme } from 'react-native-paper';

// export type InputProps = TextInputProps & {
//   errorText?: string;
//   // hints?: string[];
//   // hintStyle?: TextStyle;
//   // hintsContainerStyle?: ViewStyle;
// };

// export const Input = ({ mode, multiline, errorText, ...props }: InputProps) => {
//   const { colors } = useTheme();
//   return (
//     <View>
//       <TextInput {...props} mode='flat' maxLength={multiline ? undefined : 100} error={errorText != undefined} />
//       {errorText && <Text style={{ color: colors.error }} children={errorText} />}
//       {/* {props.hints &&
//         <View style={props.hintsContainerStyle}>
//           {props.hints.map((hint, index) =>
//             <Text key={index} style={props.hintStyle}>• {hint}</Text>
//           )}
//         </View>
//       } */}
//     </View>
//   );
// };
