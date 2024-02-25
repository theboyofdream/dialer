import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text, TextInput, useTheme } from "react-native-paper";
import { Formik } from 'formik';
import * as yup from 'yup';

import { Input, Screen, Spacer, Button } from "../components";
import { useStores } from '../stores';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';


const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('required'),
  password: yup.string().required('required')
})

let defaultValues = {
  email: '',
  password: ''
}

if (__DEV__) {
  defaultValues = {
    email: 'inam@dhwajpartner.com',
    password: 'inam@12'
  }
}


export const LoginPage = observer(() => {
  const { authStore, errorStore } = useStores()
  const { colors } = useTheme();
  const [isPasswordVisible, setPasswordVisibility] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  return (
    <Screen style={styles.screen}>
      <Formik
        initialValues={defaultValues}
        validationSchema={loginSchema}
        children={({ handleChange, handleBlur, handleSubmit, setFieldValue, errors, values, touched, isValid, dirty }) => (
          <View style={styles.form}>
            <Text variant="displayMedium">Login</Text>

            <Spacer size={15} />

            <Input
              label="Email ID"
              placeholder='Email ID'
              keyboardType='email-address'
              onChangeText={(mail) => {
                setFieldValue('email', mail.toLowerCase())
                handleChange('email')
              }}
              onBlur={handleBlur('email')}
              value={values.email.toLowerCase()}
              errorText={touched.email && errors.email ? errors.email : undefined}
            />

            <Input
              label="Password"
              placeholder='Password'
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              secureTextEntry={!isPasswordVisible}
              errorText={touched.password && errors.password ? errors.password : undefined}
              right={
                <TextInput.Icon
                  color={touched.password && errors.password ? colors.error : colors.primary}
                  icon={isPasswordVisible ? 'eye' : 'eye-off'}
                  onPress={() => setPasswordVisibility(!isPasswordVisible)}
                />
              }
            />

            <Spacer size={6} />
            <Button
              mode="contained"
              onPress={() => handleSubmit()}
              style={styles.submitBtn}
              disabled={submitting || !(isValid && dirty)}
              children="login"
            />
          </View>
        )}
        onSubmit={async ({ email, password }) => {
          setSubmitting(true);
          await authStore.login({ email, password })
            .then(({ error, message }) => {
              error &&
                runInAction(() =>
                  errorStore.add({
                    id: `login`,
                    title: `Error - login`,
                    content: `Something went wrong during login. Try again.\n\nerror message:\n${message}`
                  })
                )
            })
          setSubmitting(false);
        }}
      />
    </Screen>
  )
});


const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    minWidth: 300,
    gap: 8,
  },
  submitBtn: {
    alignSelf: 'flex-end',
  }
})

