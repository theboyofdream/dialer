import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { ActivityIndicator, Checkbox, Dialog, IconButton, Portal, RadioButton, Text, TextInput, TouchableRipple } from "react-native-paper";
import { Button, Input, InputProps, Spacer } from "..";
import { observer } from "mobx-react";


type DropdownProps = InputProps & {
  multiSelect?: boolean,
  data: { id: number, name: string }[],
  initialValue: number[],
  refresh: () => void,
  onHide: (values: number[]) => void,
}


// export function Dropdown({ multiSelect, data, refresh, initialValue, ...props }: DropdownProps) {
export const Dropdown = observer(({ multiSelect, data, refresh, onHide, initialValue, ...props }: DropdownProps) => {
  const [visible, setVisible] = useState(false);
  const showDialog = () => setVisible(true);
  const hideDialog = () => {
    onHide(values)
    setVisible(false)
  };

  const [refreshing, setRefreshing] = useState(false)
  async function onRefresh() {
    setRefreshing(true)
    await refresh();
    setRefreshing(false)
  }

  const [values, setValues] = useState(initialValue);
  const inputValues = useMemo(() => {
    let txt = data
      .filter(o => values.includes(o.id))
      .map(filteredData => filteredData.name);
    return txt.join(', ')
  }, [values, initialValue])
  function onSelect(id: number) {
    let tmpArr = [...values]
    if (multiSelect) {
      let i = tmpArr.indexOf(id)
      if (i !== -1) {
        tmpArr.splice(i, 1)
      } else {
        tmpArr.push(id)
      }
      setValues(tmpArr)
      return
    }
    setValues([id])
  }
  function clear() {
    setValues([])
  }

  useEffect(() => {
    if (data.length < 1 && visible) {
      onRefresh()
    }
  }, [visible])

  return (
    <>
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <View style={{
            flexDirection: 'row',
            marginTop: 0,
            justifyContent: 'space-between',
            marginRight: 12,
            alignItems: 'center'
          }}>
            <Dialog.Title>
              {props.label || props.placeholder}
            </Dialog.Title>
            <Button onPress={onRefresh} icon={"refresh"}>refresh</Button>
          </View>
          <Dialog.ScrollArea style={{ maxHeight: 300 }}>
            {
              refreshing &&
              <View style={{
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ActivityIndicator />
                <Spacer size={12} />
                <Text variant="bodyLarge">Please wait</Text>
                <Text>refreshing</Text>
              </View>
            }
            {!refreshing && data.length > 0 &&
              <ScrollView>
                {data.map(d =>
                  <TouchableRipple key={d.id} onPress={() => onSelect(d.id)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {
                        multiSelect ?
                          <Checkbox
                            status={values.includes(d.id) ? "checked" : "unchecked"}
                            onPress={() => onSelect(d.id)}
                          />
                          :
                          <RadioButton
                            status={values.includes(d.id) ? "checked" : "unchecked"}
                            onPress={() => onSelect(d.id)}
                            value=""
                          />
                      }
                      <Text>{d.name}</Text>
                    </View>
                  </TouchableRipple>
                )}
              </ScrollView>
            }
            {
              !refreshing && data.length < 1 &&
              <View style={{
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text variant="bodyLarge">No data found!</Text>
                <Button icon={"refresh"} onPress={onRefresh}>refresh</Button>
              </View>
            }
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={clear}>clear</Button>
            <Button onPress={hideDialog} mode="contained">Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Pressable onPress={showDialog} disabled={props.disabled}>
        <Input
          editable={false}
          multiline={multiSelect}
          value={inputValues}
          right={<TextInput.Icon icon={"chevron-down"} onPress={showDialog} />}
          {...props}
        />
      </Pressable>
    </>
  )
})
// }