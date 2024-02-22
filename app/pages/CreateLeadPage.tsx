import { Formik } from "formik";
import { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Button, Dropdown, Input, Screen, Spacer } from "../components";

import { observer } from "mobx-react-lite";
import * as yup from 'yup';
import { useStores } from "../stores";
import { CreateLead } from "../stores/leadStore";


const schema = yup.object().shape({
  firstname: yup.string().required('Firstname is required'),
  lastname: yup.string().required('Lastname is required'),
  email: yup.string().email('Invalid email format'),
  mobile: yup.string().matches(/^\d{10}$/, 'Please enter a valid 10-digit mobile number').required("Mobile number is required"),
  statusId: yup.number(),
  dispositionId: yup.number(),
  projectId: yup.array().of(yup.number()).required('Project name is required'),
  typologyIds: yup.array().of(yup.number()),//.min(1, 'Must select at least one typology')),
  sourceId: yup.number().required("Source name required"),
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
  const { dispositionStore, statusStore, projectStore, typologyStore, leadStore, leadSourceStore } = useStores()
  const { colors } = useTheme();

  useEffect(() => {
    // fetch()
  }, [])

  return (
    <Screen style={[{ padding: 12, paddingBottom: 0 }, styles.screen]}>
      <Formik
        initialValues={defaultValues}
        validationSchema={schema}
        children={({ handleChange, handleBlur, handleSubmit, setFieldValue, isSubmitting, dirty, errors, values, touched, isValid }) => (
          <View style={styles.form}>
            <Spacer size={100} />
            <View>
              <Text variant="headlineLarge">Create</Text>
              <Text variant="bodySmall">NEW LEAD</Text>
            </View>

            <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
              <Spacer size={12} />

              <Input
                placeholder='First name'
                onChangeText={handleChange('firstname')}
                onBlur={handleBlur('firstname')}
                value={values.firstname}
                errorText={touched.firstname && errors.firstname ? errors.firstname : undefined}
              />

              <Input
                placeholder='Last name'
                onChangeText={handleChange('lastname')}
                onBlur={handleBlur('lastname')}
                value={values.lastname}
                errorText={touched.lastname && errors.lastname ? errors.lastname : undefined}
              />

              <Input
                placeholder='Email ID'
                onChangeText={(mail) => {
                  setFieldValue('email', mail.toLowerCase())
                  handleChange('email')
                }}
                onBlur={handleBlur('email')}
                value={values.email?.toLowerCase()}
                errorText={touched.email && errors.email ? errors.email : undefined}
              />

              <Input
                placeholder='Mobile Number'
                onChangeText={handleChange('mobile')}
                onBlur={handleBlur('mobile')}
                value={values.mobile}
                errorText={touched.mobile && errors.mobile ? errors.mobile : undefined}
              />

              <Dropdown
                data={statusStore.statusArray}
                initialValue={[]}
                refresh={statusStore.fetch}
                placeholder='Status'
                onHide={(v) => {
                  setFieldValue('statusId', v[0])
                  handleBlur('statusId')
                }}
                errorText={touched.statusId && errors.statusId ? "Invalid value" : undefined}
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
                errorText={touched.dispositionId && errors.dispositionId ? "Invalid value" : undefined}
              /> */}

              <Dropdown
                multiSelect
                data={projectStore.projectArray}
                initialValue={[]}
                refresh={projectStore.fetch}
                placeholder='Projects'
                onHide={(v) => {
                  setFieldValue('projectIds', v)
                  handleBlur('projectIds')
                }}
                errorText={touched.projectIds && errors.projectIds ? "Invalid value" : undefined}
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
                errorText={touched.typologyIds && errors.typologyIds ? "Invalid value" : undefined}
              /> */}

              <Dropdown
                data={leadSourceStore.leadSources}
                initialValue={[]}
                refresh={leadSourceStore.fetch}
                placeholder='Lead Source'
                onHide={(v) => {
                  setFieldValue('sourceId', v[0])
                  handleBlur('sourceId')
                }}
                errorText={touched.sourceId && errors.sourceId ? "Invalid value" : undefined}
              />

              <Spacer size={6} />
              <Button
                mode="contained"
                onPress={() => handleSubmit()}
                style={styles.submitBtn}
                disabled={isSubmitting || !(isValid && dirty)}
                children="submit"
              />
              <Spacer size={100} />
            </ScrollView>
          </View>
        )}
        onSubmit={async (form, { setSubmitting }) => {
          setSubmitting(true);
          // await login(email, password);
          let { error, message } = await leadStore.createLead(form)
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
