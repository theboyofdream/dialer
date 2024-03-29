import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Formik } from "formik";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, IconButton, Text, TextInput, useTheme } from "react-native-paper";
import { DatePickerModal, TimePicker, TimePickerModal } from "react-native-paper-dates";
import * as yup from 'yup';
import { StackNavigatorParams } from "../Navigation";
import { Button, Dropdown, Input, Screen, Spacer } from "../components";
import { call } from "../services";
import { useStores } from "../stores";
import { Lead, LeadHistory } from "../stores/leadStore";
import { dateFns, delay, openWhatsApp } from "../utils";
import { runInAction } from "mobx";


function DisabledText({ text }: { text: string }) {
  const { colors } = useTheme()
  return <Text style={{ color: colors.onSurfaceDisabled, fontStyle: 'italic' }} variant="labelSmall">{text}</Text>
}


const schema = yup.object().shape({
  id: yup.number().min(1, 'Lead ID is required').required('Lead ID is required'),
  // franchiseId: yup.number().min(1, 'Franchise ID is required').required('Franchise ID is required'),
  franchiseId: yup.number(),
  firstname: yup.string().required('Firstname is required'),
  lastname: yup.string().required('Lastname is required'),
  mobile: yup.string().matches(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number').required("Mobile number is required"),
  email: yup.string().email('Invalid email format'),
  address: yup.string(),
  location: yup.string(),
  stateId: yup.number(),
  city: yup.string(),
  pincode: yup.string().matches(/^\d{6}$/, 'Please enter a valid 6-digit pincode'),
  statusId: yup.number().min(1, "Status name is required").required("Status name is required"),
  dispositionId: yup.number().min(1, "Disposition name is required").required("Disposition name is required"),
  followUpDate: yup.date(),
  projectIds: yup.array().of(yup.number().min(1, 'Project name is required')).required('Project name is required'),
  typologyIds: yup.array().of(yup.number()),//.min(1, 'Must select at least one typology')),
  remarks: yup.string().required('Remarks is required'),
  sourceId: yup.number(),//.min(1, 'Source name required').required("Source name required"),
  dateOfVisit: yup.date()
});

type LeadDetailsPageProps = NativeStackScreenProps<StackNavigatorParams, 'lead details'>;
export const LeadDetailPage = observer((props: LeadDetailsPageProps) => {
  const { leadStore, dispositionStore, statusStore, projectStore, typologyStore, leadSourceStore, errorStore } = useStores()
  const { colors } = useTheme()
  const { canGoBack, goBack, navigate } = props.navigation;

  function handleBack() {
    canGoBack() ? goBack() : navigate('home')
  }

  const leadId = props.route.params.leadId;

  // if (!leadId || leadId < 1) {
  //   handleBack()
  // }

  const [lead, setLead] = useState<Lead | null>(leadStore.getLeadById(leadId));
  const [loading, setLoading] = useState(false);

  const [historyVisible, setHistoryVisible] = useState(false)

  const { dispositionName, statusName, statusColor, projectName } = useMemo(() => {
    let dispositionName = '', statusName = '', statusColor = '', projectName = '';
    if (lead) {
      dispositionName = dispositionStore.getById(lead.dispositionId)?.name || ''
      let status = statusStore.getById(lead.statusId)
      statusName = status?.name || ''
      statusColor = status?.color || ''
      let names: string[] = []
      lead.projectIds.map(id => {
        let p = projectStore.getById(id)
        if (p) names.push(p.name);
      })
      projectName = names.join(', ')
    }
    return { dispositionName, statusName, statusColor, projectName }
  }, [lead])

  const [isDateTimePickerOpen, setDateTimePickerOpen] = useState<'date' | 'time' | null>(null);
  const onDismiss = () => setDateTimePickerOpen(null);

  async function fetchData() {
    setLoading(true)
    let r = await leadStore.fetchLeadById(leadId)
    r.data && setLead(r.data)
    setLoading(false)
  }
  useEffect(() => {
    console.log(lead?.franchiseId)
    !lead && fetchData()
  }, [lead])

  return (
    <>
      <Screen>
        <IconButton icon={"arrow-left"} onPress={handleBack} disabled={loading} />

        {loading &&
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text variant="titleMedium">Loading...</Text>
          </View>
        }
        {!loading && !lead &&
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text variant="titleMedium">No lead found!</Text>
            <Text variant="bodySmall">with id {leadId}</Text>
            <Button children="refresh" onPress={fetchData} disabled={loading || lead != null} />
          </View>
        }
        {!loading && lead &&
          <>
            <View style={styles.formContainer}>
              <View style={styles.form}>
                <View style={{
                  flexDirection: 'row',
                  gap: 12,
                }}
                >
                  <View style={{ alignItems: 'center', gap: 6 }}>
                    <Avatar.Icon icon={"account"} size={60} color={colors.onPrimary} style={{ backgroundColor: statusColor }} />
                    <Text variant="labelSmall" style={{ opacity: 0.6 }} children={"#" + lead.id} selectable />
                  </View>
                  <View>
                    <Text variant="bodyLarge" selectable>{lead.firstname} {lead.lastname}</Text>
                    <Text
                      variant='labelSmall'
                      style={{ opacity: 0.6 }}
                      children={"xxxxxx" + lead.mobile.substring(6)}
                    />

                    <Text style={{ opacity: 0.6 }} selectable>
                      <Text
                        variant='bodySmall'
                        children={dispositionName || <DisabledText text="No Disposition" />}
                      />
                      <Text
                        style={{ color: colors.onSurfaceDisabled }}
                        children={" • "}
                      />
                      <Text
                        variant='bodySmall'
                        children={projectName || <DisabledText text='No Project' />}
                      />
                    </Text>

                    <Text
                      children={lead.remarks || <DisabledText text="No Remarks" />}
                      selectable
                    />

                    <Text style={{ opacity: 0.6 }} selectable>
                      <Text
                        variant='bodySmall'
                        children={statusName || <DisabledText text="No Status" />}
                      />
                      <Text
                        style={{ color: colors.onSurfaceDisabled }}
                        children=" • "
                      />
                      <Text
                        variant='bodySmall'
                        children={lead.followUpDate ? dateFns.toHumanReadleDate(lead.followUpDate) : <DisabledText text='No Follow Up' />}
                      />
                    </Text>
                  </View>
                </View>
                <Formik
                  initialValues={{ ...lead, remarks: "", dispositionId: 0 }}
                  validationSchema={schema}
                  validateOnMount={true}
                  // children={({ handleBlur, handleChange, setFieldValue, handleSubmit, errors, values, isValid, isSubmitting, dirty, touched }) => (
                  children={({ handleBlur, handleChange, setFieldValue, handleSubmit, errors, values, isValid, isSubmitting }) => {
                    console.log({ isValid, errors, values })

                    return (<View style={{ flex: 1, }}>
                      <ScrollView showsVerticalScrollIndicator={false}>

                        <Input
                          placeholder='First name'
                          onChangeText={handleChange('firstname')}
                          onBlur={handleBlur('firstname')}
                          value={values.firstname}
                          // errorText={touched.firstname && errors.firstname ? errors.firstname : undefined}
                          errorText={errors.firstname}
                          required
                        />

                        <Input
                          placeholder='Last name'
                          onChangeText={handleChange('lastname')}
                          onBlur={handleBlur('lastname')}
                          value={values.lastname}
                          // errorText={touched.lastname && errors.lastname ? errors.lastname : undefined}
                          errorText={errors.lastname}
                          required
                        />

                        {errors.mobile &&
                          <Input
                            placeholder='Mobile Number'
                            onChangeText={handleChange('mobile')}
                            onBlur={handleBlur('mobile')}
                            value={values.mobile}
                            // errorText={touched.mobile && errors.mobile ? errors.mobile : undefined}
                            errorText={errors.mobile}
                            textContentType='telephoneNumber'
                            required
                          />
                        }

                        <Input
                          placeholder='Email ID'
                          onChangeText={(mail) => {
                            setFieldValue('email', mail.toLowerCase())
                            handleChange('email')
                          }}
                          onBlur={handleBlur('email')}
                          value={values.email.toLowerCase()}
                          // errorText={touched.email && errors.email ? errors.email : undefined}
                          textContentType='emailAddress'
                          errorText={errors.email}
                        />

                        <Input
                          placeholder='Address'
                          multiline
                          numberOfLines={5}
                          onChangeText={handleChange('address')}
                          onBlur={handleBlur('address')}
                          value={values.address}
                          // errorText={touched.address && errors.address ? errors.address : undefined}
                          errorText={errors.address}
                        />

                        <Input
                          placeholder='Location'
                          onChangeText={handleChange('location')}
                          onBlur={handleBlur('location')}
                          value={values.location}
                          textContentType="location"
                          // errorText={touched.location && errors.location ? errors.location : undefined}
                          errorText={errors.location}
                        />

                        <Dropdown
                          data={statusStore.statusArray}
                          initialValue={[]}
                          refresh={statusStore.fetch}
                          placeholder='State (api pending)'
                          onHide={(v) => {
                            setFieldValue('stateId', v[0])
                            handleBlur('stateId')
                          }}
                          // errorText={touched.stateId && errors.stateId ? "Invalid value" : undefined}
                          errorText={errors.stateId}
                        />

                        <Input
                          placeholder='City'
                          onChangeText={handleChange('city')}
                          onBlur={handleBlur('city')}
                          value={values.city}
                          // errorText={touched.city && errors.city ? errors.city : undefined}
                          errorText={errors.city}
                        />

                        <Input
                          placeholder='Pincode'
                          onChangeText={handleChange('pincode')}
                          onBlur={handleBlur('pincode')}
                          value={values.pincode}
                          // errorText={touched.pincode && errors.pincode ? errors.pincode : undefined}
                          errorText={errors.pincode}
                        />

                        <Dropdown

                          data={statusStore.statusArray}
                          initialValue={[values.statusId]}
                          refresh={statusStore.fetch}
                          placeholder='Status'
                          onHide={(v) => {
                            setFieldValue('dispositionId', 0)
                            setFieldValue('statusId', v[0])
                            handleBlur('statusId')
                          }}
                          // errorText={touched.statusId && errors.statusId ? "Invalid value" : undefined}
                          errorText={errors.statusId}
                          required
                        />

                        <Dropdown
                          data={dispositionStore.dispositionArray.filter(d => d.statusId === values.statusId)}
                          initialValue={[values.dispositionId]}
                          refresh={dispositionStore.fetch}
                          disabled={values.statusId < 1}
                          placeholder='Disposition'
                          onHide={(v) => {
                            setFieldValue('dispositionId', v[0])
                            handleBlur('dispositionId')
                          }}
                          // errorText={touched.dispositionId && errors.dispositionId ? "Invalid value" : undefined}
                          errorText={errors.dispositionId}
                          required
                        />

                        {dispositionStore.getById(values.dispositionId)?.showDatetimePicker === true &&
                          <>
                            <DatePickerModal
                              locale="en"
                              mode="single"
                              visible={isDateTimePickerOpen === 'date'}
                              onDismiss={onDismiss}
                              date={values.followUpDate}
                              onConfirm={({ date }) => {
                                setFieldValue('followUpDate', date)
                                handleChange('followUpDate')
                                handleBlur('followUpDate')
                                setDateTimePickerOpen('time')
                              }}
                            />
                            <TimePickerModal
                              visible={isDateTimePickerOpen === 'time'}
                              onDismiss={onDismiss}
                              onConfirm={({ hours, minutes }) => {
                                let date = values.followUpDate;
                                if (date) {
                                  date.setHours(hours)
                                  date.setMinutes(minutes)
                                }
                                setFieldValue('followUpDate', date)
                                handleChange('followUpDate')
                                handleBlur('followUpDate')
                                setDateTimePickerOpen(null)
                              }}
                            />


                            <Pressable onPress={() => setDateTimePickerOpen('date')}>
                              <Input
                                label="Select Follow-up Date"
                                value={values.followUpDate ? `${dateFns.toReadable(values.followUpDate, "datetime")}` : ''}
                                errorText={errors.followUpDate}
                                editable={false}
                                right={
                                  <TextInput.Icon
                                    icon={"calendar-month"}
                                    onPress={() => setDateTimePickerOpen('date')}
                                  />
                                }
                                required
                              />
                            </Pressable>
                          </>
                        }

                        <Dropdown
                          multiSelect
                          data={projectStore.projectArray}
                          initialValue={values.projectIds}
                          refresh={projectStore.fetch}
                          placeholder='Projects'
                          onHide={(v) => {
                            setFieldValue('projectIds', v)
                            handleBlur('projectIds')
                          }}
                          // errorText={touched.projectIds && errors.projectIds ? "Invalid value" : undefined}
                          errorText={errors.projectIds ? "Invalid value" : undefined}
                          required
                          enableSearch
                        />

                        <Dropdown
                          multiSelect
                          data={typologyStore.typologies}
                          initialValue={values.typologyIds}
                          refresh={typologyStore.fetch}
                          placeholder='Typology'
                          onHide={(v) => {
                            setFieldValue('typologyIds', v)
                            handleBlur('typologyIds')
                          }}
                          // errorText={touched.typologyIds && errors.typologyIds ? "Invalid value" : undefined}
                          errorText={errors.typologyIds ? "Invalid value" : undefined}
                        />

                        <Dropdown
                          data={leadSourceStore.leadSources}
                          initialValue={[values.sourceId]}
                          refresh={leadSourceStore.fetch}
                          placeholder='Lead Source'
                          onHide={(v) => {
                            setFieldValue('sourceId', v[0])
                            handleBlur('sourceId')
                          }}
                          // errorText={touched.sourceId && errors.sourceId ? "Invalid value" : undefined}
                          errorText={errors.sourceId}
                        // required
                        />

                        <Input
                          label="Remarks"
                          placeholder={lead.remarks}
                          multiline
                          numberOfLines={5}
                          onChangeText={handleChange('remarks')}
                          onBlur={handleBlur('remarks')}
                          value={values.remarks}
                          // errorText={touched.remarks && errors.remarks ? errors.remarks : undefined}
                          errorText={errors.remarks}
                          required
                        />

                        <Spacer size={12} />
                        <View style={styles.submitBtn}>
                          <Button
                            mode="contained"
                            children={isSubmitting ? "Saving..." : "Save"}
                            // disabled={!(isValid && dirty) || isSubmitting}
                            disabled={!isValid || isSubmitting}
                            onPress={() => handleSubmit()}
                          />
                        </View>

                        <Spacer size={50} />
                      </ScrollView>
                    </View>
                    )
                  }}
                  onSubmit={async (form, { setSubmitting }) => {
                    setSubmitting(true)
                    let { error, message } = await leadStore.updateLead(form)
                    if (error) {
                      runInAction(() =>
                        errorStore.add({
                          id: `update-lead`,
                          title: `Error - update lead`,
                          content: `Unable to update lead. Try again.\n\nerror message:\n${message}`
                        })
                      )
                    }
                    setSubmitting(false)
                    if (!error) {
                      await delay(500)
                      handleBack()
                    }
                  }}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignSelf: 'center', marginBottom: 6, gap: 6 }}>
              <Button
                icon="history"
                children="history"
                style={{ justifyContent: 'center', alignItems: 'center' }}
                onPress={() => setHistoryVisible(true)}
              />

              <IconButton
                icon="whatsapp"
                style={{ aspectRatio: 1, backgroundColor: "#d8f7de" }}
                iconColor="#3BD759"
                size={30}
                onPress={() => openWhatsApp(lead.mobile)}
              />
              <IconButton
                icon="phone"
                style={{ aspectRatio: 1, backgroundColor: "#cce5ff" }}
                iconColor="#007FFF"
                size={30}
                onPress={() => call(lead.mobile)}
              />
            </View>

          </>
        }

      </Screen>
      <History
        id={lead?.id}
        visible={historyVisible}
        setVisibility={setHistoryVisible}
      />
    </>
  )
})


const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24
  },
  form: {
    minWidth: 300,
    maxWidth: 350,
    gap: 8,
  },
  submitBtn: {
    alignSelf: 'flex-end',
  }
})



const History = observer(({ id, visible, setVisibility }: { id: number | undefined, visible: boolean, setVisibility: (visible: boolean) => void }) => {
  const { leadStore: { fetchLeadHistoryById } } = useStores()
  const { colors } = useTheme()

  // const [visible, setVisibility] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [history, setHistory] = useState<LeadHistory[]>([])

  async function fetchData() {
    if (!id) return;
    setFetching(true)
    let { data } = await fetchLeadHistoryById(id)
    setHistory(data)
    setFetching(false)
  }

  useEffect(() => {
    if (!history || history.length < 1) {
      fetchData()
    }
  }, [])


  return (
    <View style={{
      display: visible ? "flex" : "none",
      flex: 1,
      position: 'absolute',
      // width: deviceWidth,
      width: '100%',
      maxHeight: 500,
      padding: 24,
      backgroundColor: colors.background,
      bottom: 0,
      left: 0,
      right: 0,
      borderTopWidth: 1,
      borderTopColor: colors.elevation.level5,
      elevation: 24
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="headlineSmall">History</Text>
        <Button
          icon="refresh"
          children="refresh"
          onPress={fetchData}
        />
      </View>

      {fetching &&
        <View style={{ flex: 1, minHeight: 100, justifyContent: 'center', alignItems: 'center' }}>
          <Text variant="bodyLarge">Loading...</Text>
        </View>
      }
      {!fetching && history.length < 1 &&
        <View style={{ flex: 1, minHeight: 100, justifyContent: 'center', alignItems: 'center' }}>
          <Text variant="bodyLarge">No history found!</Text>
          <Button icon="refresh" children="refresh" onPress={fetchData} />
        </View>
      }
      {!fetching && history.length > 0 &&
        <ScrollView>
          {
            history.map((h, index) =>
              <View key={index} style={{ paddingVertical: 24 }}>
                <Text
                  variant="labelSmall"
                  style={{ opacity: 0.6 }}
                  children={h.ownBy || <DisabledText text="Owned by" />}
                />
                {/* <Text
                  variant="bodyLarge"
                  children={h.lead.fullName || <DisabledText text="Lead Full name" />}
                /> */}
                <Text
                  children={h.lead.remarks || <DisabledText text="Remarks" />}
                />
                {
                  h.lead.followUpDate ?
                    <Text
                      style={{ opacity: 0.6 }}
                      children={"Follow up date: " + dateFns.toHumanReadleDate(h.lead.followUpDate)}
                    /> :
                    <DisabledText text="Follow up date" />
                }
                {h.lastModifiedDate ?
                  <Text
                    style={{ textAlign: 'right', opacity: 0.6 }}
                    // children={"Last modified date: " + dateFns.toHumanReadleDate(h.lastModifiedDate)}
                    children={dateFns.toHumanReadleDate(h.lastModifiedDate)}
                  /> :
                  <DisabledText text="Last Modified date" />
                }
              </View>
            )
          }
        </ScrollView>
      }
      <Button
        icon="close"
        children="close"
        mode="contained"
        style={{ alignSelf: 'center', backgroundColor: colors.errorContainer }}
        labelStyle={{ color: colors.onErrorContainer }}
        onPress={() => setVisibility(false)}
      />
    </View>
  )
})
