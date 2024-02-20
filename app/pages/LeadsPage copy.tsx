
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import { observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Chip, ChipProps, Dialog, IconButton, Portal, Text, TextInput, useTheme } from "react-native-paper";
import { DatePickerModal } from 'react-native-paper-dates';
import { Button, Checkbox, Dropdown, Input, LeadListItem, Screen, Spacer } from "../components";
import { Lead, fetchTypes, useStores } from '../stores';
import { dateFns, delay } from '../utils';

const PreDefinedFilters: fetchTypes["type"][] = [
  "follow-ups",
  "fresh-leads",
  "interested-leads",
];

function PreDefinedFilterChip({ active, activeColor, ...props }: { active: boolean, activeColor: string } & ChipProps) {
  props = {
    ...props,
    style: [
      { justifyContent: 'center' },
      !active && { backgroundColor: 'transparent' },
      props.style
    ],
    textStyle: [
      { textTransform: 'capitalize' },
      active && { color: activeColor },
      props.textStyle
    ],
    icon: active ? "check" : undefined
  }
  return <Chip {...props} />
}


const state = observable({
  isFilterOn: false,
  isFilterDialogVisible: false,
  activeFilterChip: 'follow-ups' as typeof PreDefinedFilters[number] | null,
  searchQuery: '',
  isGlobaleSearchOn: false
})


export const LeadsPage = observer(() => {
  const { colors } = useTheme()
  const { navigate } = useNavigation()
  const { leadStore, authStore: { user }, statusStore, dispositionStore, projectStore } = useStores()

  const [isFilterOn, setFilterState] = useState(false)
  const [filterDialogVisible, setFilterDialogVisibility] = useState(false);
  useEffect(() => {
    setActivePreFilter(isFilterOn ? null : 'follow-ups')
  }, [isFilterOn])

  const [searchQuery, setSearchQuery] = useState('');
  const searching = searchQuery.length > 0;
  const [globalSearchEnabled, setGobalSearch] = useState(false);
  function toggleGlobalSearch() { setGobalSearch(!globalSearchEnabled) }
  useEffect(function () {
    setActivePreFilter(globalSearchEnabled ? null : 'follow-ups')
  }, [globalSearchEnabled])

  const [leads, setLeads] = useState<Lead[]>([])
  function search() {
    let arr = [...leadStore.filteredLeads]
    if (searching && !globalSearchEnabled) {
      arr = arr.filter(i => JSON.stringify(Object.values(i)).includes(searchQuery))
    }
    if (searching && globalSearchEnabled) {
      leadStore.applyFilters()
    }
    setLeads(arr)
  }
  useEffect(function reset() {
    setLeads(leadStore.filteredLeads)
  }, [searchQuery.length === 0, leadStore.filteredLeads])

  const [activePreFilter, setActivePreFilter] = useState<typeof PreDefinedFilters[number] | null>('follow-ups')
  const togglePreFilter = (name: typeof PreDefinedFilters[number]) => setActivePreFilter(activePreFilter === name ? null : name)

  const [fetchingData, setFetchingData] = useState(false)
  async function fetchData() {
    setFetchingData(true)

    if (statusStore.statusArray.length < 1) {
      await statusStore.fetch()
    }

    if (dispositionStore.dispositionArray.length < 1) {
      await dispositionStore.fetch()
    }

    if (projectStore.projectArray.length < 1) {
      await projectStore.fetch()
    }

    if (activePreFilter) {
      await leadStore.fetch({
        type: activePreFilter,
        user: {
          id: user.userId,
          franchiseId: user.franchiseId
        }
      })
    }

    await delay(500)
    setFetchingData(false)
  }
  useEffect(() => {
    if (activePreFilter) fetchData()
    else setLeads([])
  }, [activePreFilter])

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant='titleMedium' style={{ paddingLeft: 8 }}>
          <Text disabled style={{ color: colors.primary, fontWeight: 'bold' }}>{leadStore.leadsCount}</Text>
          <Text style={{ color: colors.onSurfaceDisabled, fontWeight: 'bold' }}> • </Text>
          <Text>LEADS</Text>
        </Text>
        <IconButton iconColor={colors.primary} icon={"bell"} onPress={() => navigate('notifications')} />
      </View>

      <View style={{ marginBottom: 6 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 3
          }}
        >
          <View style={{ flex: 1 }}>
            <Input
              hideLabel
              placeholder="Search Name/Mobile"
              value={searchQuery}
              onChangeText={setSearchQuery}
              // left={
              //   <TextInput.Icon
              //     style={{
              //       marginLeft: 0,
              //       borderRadius: 0,
              //       backgroundColor: isFilterOn ? colors.primary : undefined,
              //     }}
              //     icon={isFilterOn ? "filter-remove" : "filter"}
              //     disabled={globalSearchEnabled}
              //     onPress={showFilterDialog}
              //     forceTextInputFocus={false}
              //   />
              // }
              right={
                <TextInput.Icon
                  style={{
                    marginRight: 0,
                    borderRadius: 0,
                    backgroundColor: searching ? colors.primary : undefined,
                  }}
                  color={searching ? colors.onPrimary : undefined}
                  icon="magnify"
                  onPress={search}
                  forceTextInputFocus={false}
                />
              }
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row' }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexDirection: 'row', marginHorizontal: 3 }}
            contentContainerStyle={{ gap: 6 }}
          >
            {
              PreDefinedFilters.map(item =>
                <PreDefinedFilterChip
                  key={item}
                  children={item}
                  active={activePreFilter === item}
                  activeColor={colors.primary}
                  disabled={globalSearchEnabled}
                  onPress={() => togglePreFilter(item)}
                />
              )
            }
          </ScrollView>
          <Checkbox
            status={globalSearchEnabled ? 'checked' : 'unchecked'}
            label='Global search'
            onPress={toggleGlobalSearch}
          />
        </View>

      </View>

      {
        fetchingData &&
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text variant="titleMedium">Fetching Data...</Text>
        </View>
      }
      {
        !fetchingData && leadStore.filteredLeads.length > 0 &&
        <View style={{ flex: 1 }}>
          <ScrollView>
            {
              leads.map(lead =>
                <LeadListItem key={lead.id} leadId={lead.id} />
              )
            }
            <Spacer size={50} />
          </ScrollView>
        </View>
      }
      {
        !fetchingData && leadStore.filteredLeads.length < 1 &&
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text variant='titleMedium'>No data found!</Text>
          <Button onPress={fetchData} icon="refresh">refetch</Button>
        </View>
      }
      <Filter
        active={isFilterOn}
        setActive={setFilterState}
        visible={filterDialogVisible}
        setVisibility={setFilterDialogVisibility}
      />
    </Screen>
  )
})


const initialFilterValues = observable({
  startDate: new Date(),
  endDate: new Date(),
  statusId: 0,
  dispositionIds: [],
})

const Filter = observer(({ active, setActive, visible, setVisibility }: { active: boolean, setActive: (active: boolean) => void, visible: boolean, setVisibility: (visible: boolean) => void }) => {
  const { statusStore, dispositionStore } = useStores()
  const { colors } = useTheme()
  const showDialog = () => setVisibility(true)
  const hideDialog = () => setVisibility(false)

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const showDatePicker = () => setDatePickerVisibility(true)
  const hideDatePicker = () => setDatePickerVisibility(false)

  return (
    <>
      <Button
        style={[
          { position: 'absolute', right: 0, bottom: 0, margin: 12 },
          active && { backgroundColor: colors.error }
        ]}
        mode='contained'
        icon={active ? "filter-remove" : "filter"}
        children={active ? "clear" : "filter"}
        onPress={showDialog}
      />
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>Filters</Dialog.Title>
          <Dialog.Content>
            <Formik
              initialValues={initialFilterValues}
              children={({ errors, values, touched, isSubmitting, isValid, dirty, handleBlur, handleSubmit, setFieldValue, handleReset }) => (
                <View>
                  <DatePickerModal
                    locale="en"
                    mode="range"
                    visible={isDatePickerVisible}
                    onDismiss={hideDatePicker}
                    startDate={values.startDate}
                    endDate={values.endDate}
                    validRange={{ endDate: new Date() }}
                    onConfirm={({ startDate, endDate }) => {
                      setFieldValue('startDate', startDate)
                      setFieldValue('endDate', endDate)

                      hideDatePicker()
                    }}
                  />
                  <Pressable onPress={showDatePicker}>
                    <Input
                      label="Select dates"
                      value={`${dateFns.toReadable(values.startDate, "date")} - ${dateFns.toReadable(values.endDate, "date")}`}
                      errorText={
                        (errors.startDate || errors.endDate) && "Invalid dates"
                      }
                      editable={false}
                      right={
                        <TextInput.Icon
                          icon={"calendar-month"}
                          onPress={showDatePicker}
                        />
                      }
                    />
                  </Pressable>

                  <Dropdown
                    data={statusStore.statusArray}
                    initialValue={[values.statusId]}
                    refresh={statusStore.fetch}
                    placeholder='Status'
                    onHide={(v) => {
                      // let ids = dispositionStore.dispositionArray.filter(d => d.statusId === v[0]).map(d => d.id)
                      setFieldValue('dispositionIds', [])
                      setFieldValue('statusId', v[0])
                      handleBlur('statusId')
                    }}
                    errorText={touched.statusId && errors.statusId ? "Invalid value" : undefined}
                  />

                  <Dropdown
                    multiSelect
                    data={dispositionStore.dispositionArray.filter(d => d.statusId === values.statusId)}
                    initialValue={values.dispositionIds}
                    refresh={dispositionStore.fetch}
                    placeholder='Disposition'
                    disabled={values.statusId < 1}
                    onHide={(v) => {
                      setFieldValue('dispositionIds', v)
                      handleBlur('dispositionIds')
                    }}
                    errorText={touched.dispositionIds && errors.dispositionIds ? "Invalid value" : undefined}
                  />

                  <Spacer size={12} />

                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end'
                  }}>
                    <Button
                      onPress={() => handleReset()}
                      children="clear"
                    />
                    <Button
                      mode="contained"
                      disabled={!isValid || isSubmitting || !dirty}
                      onPress={() => handleSubmit()}
                      children="Apply"
                    />
                  </View>

                </View>
              )}
              onSubmit={async ({ startDate, endDate, statusId, dispositionIds }, { setSubmitting }) => {
                setSubmitting(true)
                initialFilterValues.statusId = statusId
                initialFilterValues.dispositionIds = dispositionIds
                initialFilterValues.startDate = startDate
                initialFilterValues.endDate = endDate
                setActive(true)
                setSubmitting(false)
                hideDialog()
              }}
              onReset={() => {
                initialFilterValues.statusId = 0
                initialFilterValues.dispositionIds = []
                initialFilterValues.startDate = new Date()
                initialFilterValues.endDate = new Date()
                setActive(false)
                hideDialog()
              }}
            />

          </Dialog.Content>
        </Dialog>
      </Portal>
    </>
  )
})


