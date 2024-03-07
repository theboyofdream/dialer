import { Formik } from "formik";
import { useEffect } from "react";
import { ScrollView, StyleSheet, ToastAndroid, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Button, Dropdown, Input, Screen, Spacer } from "../components";

import { observer } from "mobx-react-lite";
import * as yup from 'yup';
import { useStores } from "../stores";
import { CreateLead } from "../stores/leadStore";
import { runInAction } from "mobx";


const schema = yup.object().shape({
  firstname: yup.string().required('Firstname is required'),
  lastname: yup.string().required('Lastname is required'),
  email: yup.string().email('Invalid email format'),
  // mobile: yup.string().matches(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number').required("Mobile number is required"),
  mobile: yup.string().matches(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number').required("Mobile number is required"),
  statusId: yup.number(),
  // dispositionId: yup.number(),
  projectIds: yup.array().of(yup.number()).min(1, 'Project name is required').required('Project name is required'),
  // typologyIds: yup.array().of(yup.number()),//.min(1, 'Must select at least one typology')),
  sourceId: yup.number().min(1, 'Source name required').required("Source name required"),
});
const defaultValues: CreateLead = {
  firstname: '',
  lastname: '',
  email: '',
  mobile: '',
  statusId: 0,
  // dispositionId: 0,
  projectIds: [] as number[],
  // typologyIds: [] as number[],
  sourceId: 0,
}


export const CreateLeadPage = observer(() => {
  const { statusStore, errorStore, projectStore, leadStore, leadSourceStore } = useStores()

  return (
    <Screen style={[{ padding: 12, paddingBottom: 0 }, styles.screen]}>
      <Formik
        initialValues={defaultValues}
        validationSchema={schema}
        validateOnMount={true}
        // children={({ handleChange, handleBlur, handleSubmit, setFieldValue, isSubmitting, dirty, errors, values, touched, isValid }) => (
        children={({ handleChange, handleBlur, handleSubmit, setFieldValue, isSubmitting, dirty, errors, values, isValid }) => {
          // console.log({ errors, values })
          return (
            <View style={styles.form}>
              <Spacer size={100} />
              <View>
                <Text variant="headlineLarge">Create</Text>
                <Text variant="bodySmall">NEW LEAD</Text>
              </View>

              <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
                <Spacer size={12} />

                <Input
                  placeholder="First name"
                  onChangeText={handleChange('firstname')}
                  onBlur={handleBlur('firstname')}
                  value={values.firstname}
                  errorText={errors.firstname}
                  required
                />

                <Input
                  placeholder="Last name"
                  onChangeText={handleChange('lastname')}
                  onBlur={handleBlur('lastname')}
                  value={values.lastname}
                  errorText={errors.lastname}
                  required
                />

                <Input
                  placeholder="Email ID"
                  onChangeText={(mail) => {
                    setFieldValue('email', mail.toLowerCase())
                    handleChange('email')
                  }}
                  onBlur={handleBlur('email')}
                  value={values.email?.toLowerCase()}
                  errorText={errors.email}
                  textContentType="emailAddress"
                />

                <Input
                  placeholder="Mobile Number"
                  onChangeText={handleChange('mobile')}
                  onBlur={handleBlur('mobile')}
                  value={values.mobile}
                  errorText={errors.mobile}
                  textContentType="telephoneNumber"
                  required
                />

                <Dropdown
                  data={statusStore.statusArray}
                  initialValue={[]}
                  refresh={statusStore.fetch}
                  placeholder="Status"
                  onHide={(v) => {
                    setFieldValue('statusId', v[0])
                    handleBlur('statusId')
                  }}
                  errorText={errors.statusId}
                />

                {/* <Dropdown
                data={dispositionStore.dispositionArray.filter(d => d.statusId === values.statusId)}
                initialValue={[values.dispositionId]}
                refresh={dispositionStore.fetch}
                disabled={values.statusId < 1}
                placeholder='Disposition'
                onHide={(v) => {
                  setFieldValue('dispositionId', v[0])
                  handleBlur('dispositionId')
                }}
                errorText={ errors.dispositionId ? "Invalid value" : undefined}
              /> */}

                <Dropdown
                  enableSearch
                  multiSelect
                  data={projectStore.projectArray}
                  initialValue={[]}
                  refresh={projectStore.fetch}
                  placeholder="Projects"
                  onHide={(v) => {
                    setFieldValue('projectIds', v)
                    handleBlur('projectIds')
                  }}
                  errorText={errors.projectIds ? `${errors.projectIds}` : undefined}
                  required
                />

                {/* <Dropdown
                multiSelect
                data={typologyStore.typologies}
                initialValue={[]}
                refresh={typologyStore.fetch}
                placeholder='Typology'
                onHide={(v) => {
                  setFieldValue('typologyIds', v)
                  handleBlur('typologyIds')
                }}
                errorText={ errors.typologyIds ? "Invalid value" : undefined}
              /> */}

                <Dropdown
                  data={leadSourceStore.leadSources}
                  initialValue={[]}
                  refresh={leadSourceStore.fetch}
                  placeholder="Lead Source"
                  onHide={(v) => {
                    setFieldValue('sourceId', v[0])
                    handleBlur('sourceId')
                  }}
                  errorText={errors.sourceId}
                  required
                />

                <Spacer size={6} />
                <Button
                  mode="contained"
                  onPress={() => handleSubmit()}
                  style={styles.submitBtn}
                  disabled={isSubmitting || !isValid}
                  children="submit"
                />
                <Spacer size={100} />
              </ScrollView>
            </View>
          )
        }}
        onSubmit={async (form, { setSubmitting, resetForm }) => {
          setSubmitting(true);
          await leadStore.createLead(form)
            .then(({ error, message }) => {
              if (error) {
                runInAction(() =>
                  errorStore.add({
                    id: `create-lead`,
                    title: `Error - create lead`,
                    content: `Something went wrong. Try again.\n\nerror message:\n${message}`
                  })
                )
              } else {
                ToastAndroid.show('Lead created successfully', ToastAndroid.LONG);
                resetForm();
              }
            })
          setSubmitting(false);
        }}
      />
    </Screen>
  )
})


const styles = StyleSheet.create({
  screen: {
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
