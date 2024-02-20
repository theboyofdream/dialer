import { Pressable, ViewStyle } from 'react-native';
import { Checkbox as PprCheckbox, CheckboxProps, Text } from 'react-native-paper';

type PaperCheckbox = CheckboxProps & {
  label: string;
};
export function Checkbox(props: PaperCheckbox) {
  return (
    <Pressable style={$checkboxContainer} onPress={props.onPress}>
      <PprCheckbox {...props} />
      <Text>{props.label}</Text>
    </Pressable>
  );
}

const $checkboxContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
};
