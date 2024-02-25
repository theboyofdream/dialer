import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import { observable, runInAction, set } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { Badge, Chip, ChipProps, Dialog, IconButton, Portal, RadioButton, Text, TextInput, TouchableRipple, useTheme } from "react-native-paper";
import { DatePickerModal } from 'react-native-paper-dates';
import * as yup from 'yup';
import { Button, Dropdown, Input, LeadListItem, Screen, Spacer } from "../components";
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


export const LeadsPage = observer(() => {
  const { colors } = useTheme()
  const { navigate } = useNavigation()
  const { leadStore, statusStore, dispositionStore, projectStore } = useStores()

  const [isFilterOn, setFilterState] = useState(false)
  const [filterDialogVisible, setFilterDialogVisibility] = useState(false);
  useEffect(() => {
    setActivePreFilter(isFilterOn ? null : 'follow-ups')
  }, [isFilterOn])

  const [searchQuery, setSearchQuery] = useState('');
  const searching = searchQuery.length > 0;

  async function search() {
    let arr = [...leadStore.filteredLeads]
    if (searching) {
      arr = arr.filter(i => JSON.stringify(Object.values(i)).includes(searchQuery))
    }
    setLeads(arr)
  }
  useEffect(function reset() {
    setLeads(leadStore.filteredLeads)
  }, [searchQuery.length === 0, leadStore.filteredLeads])

  const [activePreFilter, setActivePreFilter] = useState<typeof PreDefinedFilters[number] | null>('follow-ups')
  const togglePreFilter = (name: typeof PreDefinedFilters[number]) => setActivePreFilter(activePreFilter === name ? null : name)

  const [leads, setLeads] = useState<Lead[]>([])
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
      await leadStore.fetch({ type: activePreFilter })
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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Button
            icon={"cloud-search"}
            children={"online search"}
            mode={onlineSearchState.on ? "contained" : undefined}
            style={[onlineSearchState.on && { backgroundColor: colors.errorContainer }]}
            labelStyle={[onlineSearchState.on && { color: colors.error }]}
            onPress={() => runInAction(() => onlineSearchState.open = true)}
          />
          <Button
            icon='bell'
            style={[
              { minWidth: 0, borderRadius: 100 },
              leadStore.upcomingNotificationCount > 0 && { backgroundColor: colors.errorContainer }
            ]}
            labelStyle={[leadStore.upcomingNotificationCount > 0 && { color: colors.error }]}
            children={leadStore.upcomingNotificationCount}
            onPress={() => navigate('notifications')}
          />
        </View>
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
              placeholder={`Search name or mobile`}
              value={searchQuery}
              onChangeText={setSearchQuery}
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
                  disabled={fetchingData}
                />
              }
            />
          </View>
        </View>


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
                disabled={onlineSearchState.on || fetchingData || isFilterOn}
                onPress={() => togglePreFilter(item)}
              />
            )
          }
        </ScrollView>

      </View>

      {
        fetchingData &&
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text variant="titleMedium">Fetching Data...</Text>
        </View>
      }
      {
        !fetchingData && leadStore.filteredLeads.length < 1 &&
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text variant='titleMedium'>No data found!</Text>
          <Button onPress={fetchData} icon="refresh">refetch</Button>
        </View>
      }
      {
        !fetchingData && leadStore.filteredLeads.length > 0 &&
        <View style={{ flex: 1 }}>
          <ScrollView
            refreshControl={<RefreshControl refreshing={fetchingData} onRefresh={fetchData} />}
          // showsVerticalScrollIndicator={false}
          >
            {
              leads.map((lead, index) =>
                <LeadListItem key={index} leadId={lead.id} />
              )
            }
            <Spacer size={50} />
          </ScrollView>
        </View>
      }

      <Filter
        active={isFilterOn}
        setActive={setFilterState}
        visible={filterDialogVisible}
        setVisibility={setFilterDialogVisibility}
        disabled={fetchingData}
      />
      <OnlineSearch />
    </Screen>
  )
})


const initialFilterValues = observable({
  startDate: new Date(),
  endDate: new Date(),
  statusId: 0,
  dispositionIds: [],
})
const filterSchema = yup.object().shape({
  startDate: yup.date().required('Start date is required'),
  endDate: yup.date().required('End date is required'),
  statusId: yup.number().min(1, 'Select status').required('Status is required'),
  dispositionIds: yup.array(yup.number()).min(1, 'Select atleast one disposition').required('Disposition is required'),
})
const Filter = observer(({ active, setActive, visible, setVisibility, disabled }: { active: boolean, setActive: (active: boolean) => void, visible: boolean, setVisibility: (visible: boolean) => void, disabled: boolean }) => {
  const { statusStore, dispositionStore, leadStore, errorStore } = useStores()
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
        disabled={disabled}
      />
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>Filters</Dialog.Title>
          <Dialog.Content>
            <Formik
              initialValues={initialFilterValues}
              validationSchema={filterSchema}
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
                    errorText={touched.statusId && errors.statusId ? errors.statusId : undefined}
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
                    errorText={touched.dispositionIds && errors.dispositionIds ? `${errors.dispositionIds}` : undefined}
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
                      disabled={!isValid || isSubmitting}
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

                await leadStore.applyFilters({
                  fromDate: startDate,
                  toDate: endDate,
                  statusId,
                  dispositionIds
                })
                  .then(({ error, message }) => {
                    error &&
                      runInAction(() =>
                        errorStore.add({
                          id: `apply-filter`,
                          title: `Error`,
                          content: `Error occurred while aplying filters. Try again.\n\nerror message:\n${message}`
                        })
                      )
                    setActive(!error)
                  })

                setSubmitting(false)
                setTimeout(hideDialog, 500)
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


const onlineSearchState = observable({
  open: false,
  on: false,
  name: '',
  mobile: ''
})
const schema = yup.object().shape({
  name: yup.string(),
  mobile: yup.string().matches(/^\d{10}$/, 'Please enter a valid 10-digit mobile number'),
});

const OnlineSearch = observer(() => {
  const { leadStore, errorStore } = useStores()
  const [radioBtnValue, setRadioBtnValue] = useState<'name' | 'mobile'>('name')
  return (
    <Portal>
      <Dialog visible={onlineSearchState.open} onDismiss={() => runInAction(() => onlineSearchState.open = false)}>
        <Dialog.Title>Online search</Dialog.Title>
        <Dialog.Content>
          <Formik
            initialValues={{
              name: onlineSearchState.name,
              mobile: onlineSearchState.mobile
            }}
            validationSchema={schema}
            children={({ values, errors, touched, isValid, isSubmitting, handleBlur, handleChange, handleSubmit, handleReset }) => (
              <View>
                <View style={{ flexDirection: 'row' }}>
                  {
                    (Array('name', 'mobile') as Array<typeof radioBtnValue>)
                      .map(i =>
                        <TouchableRipple key={i} onPress={() => setRadioBtnValue(i)}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 6 }}>
                            <RadioButton.Android value={i} status={radioBtnValue === i ? 'checked' : 'unchecked'} onPress={() => setRadioBtnValue(i)} />
                            <Text style={{ textTransform: 'capitalize' }}>{i}</Text>
                          </View>
                        </TouchableRipple>
                      )
                  }
                </View>

                <Spacer size={12} />

                {
                  radioBtnValue === 'name' &&
                  <Input
                    placeholder='Name'
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('firstname')}
                    value={values.name}
                    errorText={touched.name && errors.name ? errors.name : undefined}
                  />
                }
                {
                  radioBtnValue === 'mobile' &&
                  <Input
                    placeholder='Mobile Number'
                    onChangeText={handleChange('mobile')}
                    onBlur={handleBlur('mobile')}
                    value={values.mobile}
                    errorText={touched.mobile && errors.mobile ? errors.mobile : undefined}
                  />
                }
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
                    disabled={!isValid || isSubmitting}
                    onPress={() => handleSubmit()}
                    children="Search"
                  />
                </View>
              </View>
            )}
            onSubmit={async ({ name, mobile }, { setSubmitting }) => {
              setSubmitting(true)
              await leadStore.searchLeads(name, mobile)
                .then(({ error, message }) => {
                  error &&
                    runInAction(() => {
                      errorStore.add({
                        id: `search-lead`,
                        title: `Error`,
                        content: `Unable to find lead. Try again.\n\nerror message:\n${message}`
                      })
                      onlineSearchState.on = true
                      onlineSearchState.name = name
                      onlineSearchState.mobile = mobile
                    })
                })
              setSubmitting(false)
            }}
            onReset={() => {
              runInAction(() => {
                onlineSearchState.open = false
                onlineSearchState.on = false
                onlineSearchState.name = ''
                onlineSearchState.mobile = ''
              })
            }}
          />
        </Dialog.Content>
      </Dialog>
    </Portal>
  )
})

