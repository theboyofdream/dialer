import {Pressable, ViewStyle} from 'react-native';
import {RadioButton, RadioButtonProps, Text} from 'react-native-paper';

type PaperRadioButton = RadioButtonProps & {
  label: string;
};
export function PaperRadioButton(props: PaperRadioButton) {
  return (
    <Pressable style={$radioButtonContainer} onPress={props.onPress}>
      <RadioButton {...props} />
      <Text>{props.label}</Text>
    </Pressable>
  );
}

const $radioButtonContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
};
