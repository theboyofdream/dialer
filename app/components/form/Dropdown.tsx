import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { ActivityIndicator, Checkbox, Dialog, IconButton, Portal, RadioButton, Text, TextInput, TouchableRipple, useTheme } from "react-native-paper";
import { Button, Input, InputProps, Spacer } from "..";
import { observer } from "mobx-react-lite";


type DropdownProps = InputProps & {
  multiSelect?: boolean,
  data: { id: number, name: string }[],
  initialValue: number[],
  refresh: () => void,
  onHide: (values: number[]) => void,
  enableSearch?: boolean,
}


// export function Dropdown({ multiSelect, data, refresh, initialValue, ...props }: DropdownProps) {
export const Dropdown = observer(({ multiSelect, data, refresh, onHide, initialValue, ...props }: DropdownProps) => {
  const { colors, roundness } = useTheme()
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
  function select(id: number) {
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

  const [searchText, setSearchText] = useState('')
  const [searchQuery, setSearchQuery] = useState('');

  function search() {
    if (searchText.length > 2) {
      setSearchQuery(searchText)
    }
  }
  function onSearchTextChange(text: string) {
    setSearchText(text)
    if (text.length < 3) {
      setSearchQuery('')
    }
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
              <>
                {
                  props.enableSearch &&
                  // <Input
                  //   hideLabel
                  //   placeholder="Search names"
                  //   left={<TextInput.Icon icon='magnify' />}
                  //   onChangeText={setSearchQuery}
                  // />
                  <View style={{
                    flexDirection: 'row',
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: roundness * 3,
                    marginTop: 3,
                  }}>
                    <View style={{ flex: 1 }}>
                      <Input
                        hideLabel
                        placeholder="Search name"
                        onChangeText={onSearchTextChange}
                        style={{ backgroundColor: 'transparent' }}
                        left={<TextInput.Icon icon='magnify' />}
                        value={searchText}
                        returnKeyType='search'
                        onSubmitEditing={search}
                      />
                    </View>
                    <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                      {searchText.length > 0 &&
                        <IconButton
                          icon='close-circle'
                          onPress={() => onSearchTextChange('')}
                        />
                      }
                      <Button
                        mode='contained'
                        children='search'
                        style={{ minWidth: 0, marginRight: 6 }}
                        disabled={searchText.length < 3}
                        onPress={search}
                      />
                    </View>
                  </View>
                }
                <ScrollView>
                  {data.map(d => {
                    if (searchQuery.length > 2) {
                      if (d.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                        return <DropdownItem id={d.id} name={d.name} key={d.id} />
                      }
                      return undefined
                    }
                    return <DropdownItem id={d.id} name={d.name} key={d.id} />
                  }
                  )}
                </ScrollView>
              </>
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
      </Portal >
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

  function DropdownItem({ id, name }: { id: number, name: string }) {
    // console.log('RENDERING - dropdown item', id)
    const props = {
      status: values.includes(id) ? 'checked' : 'unchecked' as "checked" | "unchecked",
      onPress: () => select(id)
    }
    return (
      <TouchableRipple onPress={props.onPress}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {
            multiSelect ?
              <Checkbox {...props} />
              :
              <RadioButton {...props} value={`${id}`} />
          }
          <Text>{name}</Text>
        </View>
      </TouchableRipple>
    )
  }
})
// }