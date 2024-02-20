import format from 'date-fns/format';
import { useState } from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { TextInput } from 'react-native-paper';
import { Input } from './Input';

type DateTimePicker = {
  label?: string;
  value: Date;
  mode: 'date' | 'time' | 'datetime';
  minDate?: Date;
  maxDate?: Date;
  onChange: (date: Date) => void;
  errorText?: string | undefined;
  style?: ViewStyle;
};

const helper = {
  // icon name & input format for selected date
  date: { i: 'calendar', f: 'dd/MM/yyy' },
  datetime: { i: 'calendar-clock', f: 'dd/MM/yyy hh:mm a' },
  time: { i: 'clock-outline', f: 'hh:mm a' },
};

export function DateTimePickerInput(props: DateTimePicker) {
  // const [selectedDate, setSelectedDate] = useState<Date>(props.value);
  const selectedDate = props.value;
  const [visible, setVisibility] = useState(false);

  function show() {
    setVisibility(true);
  }
  function hide() {
    setVisibility(false);
  }
  function handleChange(date: Date) {
    hide();
    // setSelectedDate(date);
    props.onChange(date);
  }

  return (
    <View style={props.style}>
      <DateTimePickerModal date={selectedDate} isVisible={visible} mode={props.mode} minimumDate={props.minDate} maximumDate={props.maxDate} onConfirm={handleChange} onCancel={hide} />

      <Pressable onPress={show}>
        <Input
          label={props.label}
          editable={false}
          value={format(selectedDate, helper[props.mode].f)}
          right={<TextInput.Icon icon={helper[props.mode].i} onPress={show} />}
          errorText={props.errorText}
        />
      </Pressable>
    </View>
  );
}
