import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import { observable, runInAction, set } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { Badge, Chip, ChipProps, Dialog, FAB, IconButton, Portal, RadioButton, Text, TextInput, TouchableRipple, useTheme } from "react-native-paper";
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

export function FilterChip({ active, ...props }: { active: boolean } & ChipProps) {
  const { colors } = useTheme()
  props = {
    ...props,
    style: [
      { justifyContent: 'center', backgroundColor: 'transparent' },
      active && { backgroundColor: colors.primaryContainer },
      active && props.disabled && { backgroundColor: colors.surfaceDisabled },
      props.style
    ],
    textStyle: [
      { textTransform: 'capitalize', fontWeight: '100' },
      active && { color: colors.primary },
      props.disabled && { color: colors.onSurfaceDisabled },
      props.textStyle
    ],
    icon: active ? "check" : undefined
  }
  return <Chip {...props} />
}






export const LeadsPage = observer(() => {
  const { colors, roundness } = useTheme()
  const { leadStore, statusStore, dispositionStore, projectStore } = useStores()

  useEffect(() => {
    setActivePreFilter(filterState.on ? null : 'follow-ups')
  }, [filterState.on])

  // const searchRef = useRef('')
  const [searchText, setSearchText] = useState('')
  const [searchQuery, setSearchQuery] = useState('');

  function search() {
    // if (searchRef.current.length > 2) {
    // setSearchQuery(searchRef.current)
    // }
    if (searchText.length > 2) {
      setSearchQuery(searchText)
    }
  }
  function onSearchTextChange(text: string) {
    // searchRef.current = text;
    setSearchText(text)
    if (text.length < 3) {
      setSearchQuery('')
    }
  }

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

      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        // paddingBottom: 0,
        paddingLeft: 10,
      }}>
        <Text variant='titleLarge'>Leads</Text>
        <Button
          icon="cloud-search"
          labelStyle={[
            { color: colors.primary },
            fetchingData && { color: colors.onSurfaceDisabled },
            onlineSearchState.on && { color: colors.onError }
          ]}
          style={[
            { backgroundColor: colors.primaryContainer },
            fetchingData && { backgroundColor: colors.surfaceDisabled },
            onlineSearchState.on && { backgroundColor: colors.error }
          ]}
          onPress={() => runInAction(() => onlineSearchState.visible = true)}
          disabled={fetchingData}
        >Online Search</Button>
      </View>


      {/* <View style={{ margin: 6, marginTop: 3 }}> */}
      <View style={{ marginHorizontal: 6, paddingBottom: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <View style={{ flexDirection: 'row' }}>
            <Text variant='titleSmall'>{leadStore.count}</Text>
            <Text style={{ color: colors.onSurfaceDisabled }}> Total</Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 6,
          }}
        >
          <View style={{
            flexDirection: 'row',
            backgroundColor: colors.elevation.level2,
            borderRadius: roundness * 3,
          }}>
            <View style={{ flex: 1 }}>
              <Input
                hideLabel
                placeholder="Search by name/mobile"
                onChangeText={onSearchTextChange}
                style={{ backgroundColor: colors.elevation.level2 }}
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
        </View>


        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexDirection: 'row' }}
          contentContainerStyle={{ gap: 6 }}
        >
          {
            PreDefinedFilters.map(item =>
              <FilterChip
                key={item}
                children={item}
                active={activePreFilter === item}
                disabled={onlineSearchState.on || fetchingData || filterState.on}
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
        !fetchingData && leadStore.leads.length < 1 &&
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text variant='titleMedium'>No data found!</Text>
          <Button onPress={fetchData} icon="refresh">refresh</Button>
        </View>
      }
      {
        !fetchingData && leadStore.leads.length > 0 &&
        <View style={{ flex: 1 }}>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={fetchingData}
                onRefresh={fetchData}
              />
            }
          >
            {
              leadStore.leads.map((lead, index) => {
                if (searchQuery.length > 2) {
                  // console.log(lead.firstname.toLowerCase().includes(searchQuery.toLowerCase()),
                  //   lead.lastname.toLowerCase().includes(searchQuery.toLowerCase()),
                  //   lead.mobile.toLowerCase().includes(searchQuery.toLowerCase()),
                  //   { firstname: lead.firstname, lastname: lead.lastname, mobile: lead.mobile, searchQuery }
                  // )
                  if (
                    lead.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    lead.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    lead.mobile.toLowerCase().includes(searchQuery.toLowerCase())
                  ) {
                    // if (JSON.stringify(Object.values(lead)).toLowerCase().includes(searchQuery.toLowerCase())) {
                    return <LeadListItem key={index} leadId={lead.id} />
                  }
                  return undefined
                }
                return <LeadListItem key={index} leadId={lead.id} />
              })
            }
            <Spacer size={50} />
          </ScrollView>
        </View>
      }

      <Button
        style={[
          { position: 'absolute', right: 0, bottom: 0, margin: 12 },
          filterState.on && { backgroundColor: colors.error }
        ]}
        mode='contained'
        icon={filterState.on ? "filter-remove" : "filter"}
        children={filterState.on ? "clear" : "filter"}
        onPress={() => runInAction(() => filterState.visible = true)}
        disabled={fetchingData}
      />
      <FilterPopup />
      <OnlineSearchPopup />
    </Screen>
  )
})




















const filterState = observable({
  startDate: new Date(),
  endDate: new Date(),
  statusId: 0,
  dispositionIds: [],
  visible: false,
  on: false,
})
const filterSchema = yup.object().shape({
  startDate: yup.date().required('Start date is required'),
  endDate: yup.date().required('End date is required'),
  statusId: yup.number().min(1, 'Select status').required('Status is required'),
  dispositionIds: yup.array(yup.number()),
  // dispositionIds: yup.array(yup.number()).min(1, 'Select atleast one disposition').required('Disposition is required'),
})
// const Filter = observer(({ active, setActive, visible, setVisibility, disabled }: { active: boolean, setActive: (active: boolean) => void, visible: boolean, setVisibility: (visible: boolean) => void, disabled: boolean }) => {
const FilterPopup = observer(() => {
  const { statusStore, dispositionStore, leadStore, errorStore } = useStores()
  // const { colors } = useTheme()
  // const showDialog = () => setVisibility(true)
  // const hideDialog = () => setVisibility(false)
  const hideDialog = () => runInAction(() => filterState.visible = false)

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const showDatePicker = () => setDatePickerVisibility(true)
  const hideDatePicker = () => setDatePickerVisibility(false)

  return (
    <>
      {/* <Button
        style={[
          { position: 'absolute', right: 0, bottom: 0, margin: 12 },
          active && { backgroundColor: colors.error }
        ]}
        mode='contained'
        icon={active ? "filter-remove" : "filter"}
        children={active ? "clear" : "filter"}
        onPress={showDialog}
        disabled={disabled}
      /> */}

      <Portal>
        <Dialog visible={filterState.visible} onDismiss={hideDialog}>
          <Dialog.Title>Filters</Dialog.Title>
          <Dialog.Content>
            <Formik
              initialValues={filterState}
              validationSchema={filterSchema}
              children={({ errors, values, isSubmitting, isValid, handleBlur, handleSubmit, setFieldValue, handleReset }) => (
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
                    errorText={errors.statusId}
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
                    errorText={errors.dispositionIds ? `${errors.dispositionIds}` : undefined}
                  />

                  <Spacer size={12} />

                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    gap: 4
                  }}>
                    <Button
                      onPress={() => handleReset()}
                      children="clear"
                    />
                    <Button
                      mode="contained"
                      disabled={!isValid || isSubmitting}
                      onPress={() => handleSubmit()}
                      children={isSubmitting ? "Submitting..." : "Submit"}
                    />
                  </View>

                </View>
              )}
              onSubmit={async ({ startDate, endDate, statusId, dispositionIds }, { setSubmitting }) => {
                setSubmitting(true)

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
                    runInAction(() => filterState.on = !error)
                  })

                runInAction(() => {
                  filterState.statusId = statusId
                  filterState.dispositionIds = dispositionIds
                  filterState.startDate = startDate
                  filterState.endDate = endDate
                })

                setSubmitting(false)
                setTimeout(hideDialog, 500)
              }}
              onReset={() => {
                runInAction(() => {
                  filterState.statusId = 0
                  filterState.dispositionIds = []
                  filterState.startDate = new Date()
                  filterState.endDate = new Date()
                  filterState.on = false
                  filterState.visible = false
                })
              }}
            />

          </Dialog.Content>
        </Dialog>
      </Portal>
    </>
  )
})


























const onlineSearchState = observable({
  visible: false,
  on: false,
  name: '',
  mobile: ''
})
const schema = yup.object().shape({
  name: yup.string(),
  mobile: yup.string().matches(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number').nullable(),
});

const OnlineSearchPopup = observer(() => {
  const { leadStore, errorStore } = useStores()
  const [radioBtnValue, setRadioBtnValue] = useState<'name' | 'mobile'>('mobile')
  return (
    <Portal>
      <Dialog visible={onlineSearchState.visible} onDismiss={() => runInAction(() => onlineSearchState.visible = false)}>
        <Dialog.Title>Online search</Dialog.Title>
        <Dialog.Content>
          <Formik
            initialValues={{
              name: onlineSearchState.name,
              mobile: onlineSearchState.mobile
            }}
            validationSchema={schema}
            children={({ values, errors, isValid, isSubmitting, handleBlur, handleChange, handleSubmit, handleReset }) => (
              <View>
                <View style={{ flexDirection: 'row' }}>
                  {
                    (Array('name', 'mobile') as Array<typeof radioBtnValue>)
                      // (Array('mobile') as Array<typeof radioBtnValue>)
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
                    onBlur={handleBlur('name')}
                    value={values.name}
                    errorText={errors.name}
                    required
                  />
                }
                {
                  radioBtnValue === 'mobile' &&
                  <Input
                    placeholder='Mobile Number'
                    onChangeText={handleChange('mobile')}
                    onBlur={handleBlur('mobile')}
                    value={values.mobile}
                    errorText={errors.mobile}
                    textContentType='telephoneNumber'
                    required
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
                    children={isSubmitting ? "Searching..." : "Search"}
                  />
                </View>
              </View>
            )}
            onSubmit={async ({ name, mobile }, { setSubmitting }) => {
              setSubmitting(true)
              await leadStore.searchLeads(name, mobile)
                .then(({ error, message }) => {
                  if (error) {
                    runInAction(() => {
                      errorStore.add({
                        id: `search-lead`,
                        title: `Error`,
                        content: `Unable to find lead. Try again.\n\nerror message:\n${message}`
                      });
                    })
                  }
                  runInAction(() => {
                    onlineSearchState.on = true
                    onlineSearchState.visible = false
                    onlineSearchState.name = name
                    onlineSearchState.mobile = mobile
                  })
                })
              setSubmitting(false)
            }}
            onReset={() => {
              runInAction(() => {
                onlineSearchState.visible = false
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

