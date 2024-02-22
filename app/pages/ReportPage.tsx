import { Divider, Text, TextInput, useTheme } from "react-native-paper";
import { Button, Form, Input, Screen, Spacer } from "../components";
import { DatePickerModal, TimePickerModal } from "react-native-paper-dates";
import { useCallback, useEffect, useRef, useState } from "react";
import React from "react";
import { Accordion } from "../components/ui/Accordion";
import { Animated, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Formik } from "formik";
import * as yup from 'yup'
import { dateFns } from "../utils";
import { getDispositionWiseCallReport, useStores } from "../stores";
import { observer } from "mobx-react-lite";


type DispositionWiseCalls = {
  Fresh: number
  Lead: number
  "Callback Later": number
  "Not Interested": number
  "Wrong Number": number
  "Appointment Book": number
  "Visit Done": number
  "Not Reachable": number
  "VC VP": number
  "Follow-Up Date": number
  "Booking Done": number
  Junk: number
  Ringing: number
  "Already Call Done": number
  DND: number
  Interested: number
}


const defaultFormValues = {
  startDate: new Date(),
  endDate: new Date(),
}
const schema = yup.object().shape({
  startDate: yup.date().required('Start date is required'),
  endDate: yup.date().required('End date is required'),
})

export const ReportPage = observer(() => {
  const { authStore: { user: { userId, franchiseId } } } = useStores()
  const { colors } = useTheme()
  const [open, setOpen] = React.useState(false);
  const onDismiss = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const [dispositionWiseCallReport, setDispositionWiseCallReport] = useState<DispositionWiseCalls | null>(null);
  const [maxCount, setMaxCount] = useState(0)

  return (
    <Screen style={{ paddingTop: 15 }}>

      <View>
        <Text variant="headlineLarge">Reports</Text>
        <Text variant="bodySmall">Disposition-wise call report.</Text>
      </View>
      <Spacer size={12} />

      <View style={styles.formContainer}>
        <Formik
          // enableReinitialize
          initialValues={defaultFormValues}
          validationSchema={schema}
          children={({ values, setFieldValue, errors, isValid, dirty, isSubmitting, handleSubmit, handleBlur, handleChange }) => (
            <View style={styles.form}>
              <DatePickerModal
                locale="en"
                mode="range"
                visible={open}
                onDismiss={onDismiss}
                startDate={values.startDate}
                endDate={values.endDate}
                validRange={{ endDate: new Date() }}
                onConfirm={({ startDate, endDate }) => {
                  setFieldValue('startDate', startDate)
                  handleChange('startDate')
                  handleBlur('startDate')
                  setFieldValue('endDate', endDate)
                  handleChange('endDate')
                  handleBlur('endDate')
                  setOpen(false)
                }}
              />

              <Pressable onPress={() => setOpen(true)}>
                <Input
                  label="Select dates"
                  // value={`${values.startDate.getDate()} ${dateFns.getMonthInfo(values.startDate).shortName} ${values.startDate.getFullYear()} - ${values.endDate.getDate()} ${dateFns.getMonthInfo(values.endDate).shortName} ${values.endDate.getFullYear()}`}
                  value={`${dateFns.toReadable(values.startDate, "date")} - ${dateFns.toReadable(values.endDate, "date")}`}
                  errorText={
                    (errors.startDate || errors.endDate) && "Invalid dates"
                  }
                  editable={false}
                  right={
                    <TextInput.Icon
                      icon={"calendar-month"}
                      onPress={() => setOpen(true)}
                    />
                  }
                />
              </Pressable>

              <Button
                style={{ alignSelf: 'flex-end' }}
                mode="contained"
                disabled={!(isValid && dirty) || isSubmitting}
                onPress={() => handleSubmit()}
              >
                Apply
              </Button>
            </View>
          )}
          onSubmit={async ({ startDate, endDate }, { setSubmitting }) => {
            setSubmitting(true)
            const { data } = await getDispositionWiseCallReport({
              userId,
              franchiseId,
              startDate,
              endDate
            })
            setMaxCount(Math.max(...Object.values(data)))
            setDispositionWiseCallReport(data)
            setSubmitting(false)
          }}
        />
      </View>

      <Spacer size={24} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        {dispositionWiseCallReport &&
          Object.keys(dispositionWiseCallReport).map((k, i) =>
            <View key={i}>
              <Text>
                <Text>{k}</Text>
                <Text style={{ color: colors.onSurfaceDisabled }}> • </Text>
                <Text>{dispositionWiseCallReport[k as keyof DispositionWiseCalls]}</Text>
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <View style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 20,
                  padding: 1,
                  width: `${Math.round((dispositionWiseCallReport[k as keyof DispositionWiseCalls] / maxCount) * 100) || 0}%`,
                  minWidth: 1
                }}
                />
              </View>
            </View>
          )
        }
        <Spacer size={100} />
      </ScrollView>

    </Screen>
  )
})


const styles = StyleSheet.create({
  formContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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