import { Formik, FormikErrors, FormikHelpers, FormikTouched, FormikValues } from "formik";
import { ReactNode, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { TextProps as RNTextProps } from "react-native";
import { ButtonProps, Text, TextInputProps, TextProps } from "react-native-paper";
import * as yup from 'yup';
import { Button, Input } from "..";


const VALIDATION_SCHEMA = {
  firstname: yup.string().required('Firstname is required'),
  lastname: yup.string(),
  email: yup.string().email('Invalid email format'),
  mobile: yup.string().matches(/^\d{10}$/, 'Invalid mobile number format').required('Mobile is required'),
  password: yup.string().min(3, 'Password must be at least 3 characters').required('Password is required'),
  'lead status': yup.array().of(yup.number()),
  'lead disposition': yup.array().of(yup.number()),
  'lead project': yup.array().of(yup.number()),
  'lead typology': yup.array().of(yup.number()),
  'datetime': yup.date(),
  'date range': yup.array().of(yup.date()).min(2, 'Date range must have two dates'),
  location: yup.string(),
  city: yup.string(),
  'state': yup.number(),
  address: yup.string(),
  pincode: yup.string().matches(/^\d{6}$/, 'Invalid pincode format'),
  'follow-up date': yup.date(),
  remarks: yup.string().required('Remarks is required'),
};


type section = { type: 'section', text: string, props?: TextProps<RNTextProps> }
type inputFields =
  { type: 'firstname', initialValue: string, props?: TextInputProps } |
  { type: 'lastname', initialValue: string, props?: TextInputProps } |
  { type: 'email', initialValue: string, props?: TextInputProps, required?: boolean } |
  { type: 'mobile', initialValue: string, props?: TextInputProps, hide?: boolean } |
  { type: 'password', initialValue: string, props?: TextInputProps } |
  { type: 'lead status', initialValue: string, props?: TextInputProps, required?: boolean } |
  { type: 'lead disposition', initialValue: string, props?: TextInputProps, required?: boolean } |
  { type: 'lead project', initialValue: string, props?: TextInputProps, required?: boolean } |
  { type: 'lead typology', initialValue: string, props?: TextInputProps } |
  { type: 'datetime', initialValue: string, props?: TextInputProps, required?: boolean } |
  { type: 'date range', initialValue: string, props?: TextInputProps, required?: boolean } |
  { type: 'remarks', initialValue: string, props?: TextInputProps } |
  { type: 'city', initialValue: string, props?: TextInputProps } |
  { type: 'state', initialValue: string, props?: TextInputProps } |
  { type: 'address', initialValue: string, props?: TextInputProps } |
  { type: 'pincode', initialValue: string, props?: TextInputProps } |
  { type: 'follow-up date', initialValue: string, props?: TextInputProps } |
  { type: 'location', initialValue: string, props?: TextInputProps }
type action =
  { type: 'submit', props?: ButtonProps } |
  { type: 'reset', props?: ButtonProps };
type FormProps = {
  header?: ReactNode;
  body: inputFields[] | [section, ...inputFields[]][];
  actions: action[];
}



export function Form({ header, body, actions }: FormProps) {
  const [defaultFormValues, validationSchema] = useMemo(() => {
    let values = {} as { [key in inputFields['type']]: any }
    let schema = {} as { [key in inputFields['type']]: any }
    let _body_ = body;
    for (let obj of _body_.flat()) {
      if (obj.type === 'section') {
        continue
      }
      values[obj.type] = obj.initialValue
      if (obj?.required) {
        schema[obj.type] = VALIDATION_SCHEMA[obj.type].required(`${obj.type[0].toUpperCase()}${obj.type.slice(1)} is required`)
      } else {
        schema[obj.type] = VALIDATION_SCHEMA[obj.type]
      }
    }
    return [values, yup.object().shape(schema)];
  }, [body]);

  return (
    <Formik
      enableReinitialize
      initialValues={defaultFormValues}
      validationSchema={validationSchema}
      children={({ handleChange, handleBlur, errors, values, touched, setFieldValue, handleSubmit, handleReset, dirty, isValid }) => (
        <View style={styles.form}>
          {header}
          <View style={styles.body}>

            {
              body.map(input =>
                getFormField({
                  input,
                  handleChange,
                  handleBlur,
                  setFieldValue,
                  values,
                  errors,
                  touched
                })
                // <Input
                //   label="Email ID"
                //   placeholder='Email ID'
                //   onChangeText={(mail) => {
                //     setFieldValue('email', mail.toLowerCase())
                //     handleChange('email')
                //   }}
                //   onBlur={handleBlur('email')}
                //   value={values.email.toLowerCase()}
                //   errorText={touched.email && errors.email ? errors.email : undefined}
                // />
              )
            }
          </View>
          <View style={styles.actionContainer}>
            {
              actions.map(action =>
                <>
                  {
                    action.type === 'submit' &&
                    <Button
                      {...action.props}
                      key={action.type}
                      mode='contained'
                      disabled={!(dirty && isValid)}
                      onPress={() => handleSubmit()}
                    >
                      {action.type}
                    </Button>
                  }
                  {
                    action.type === 'reset' &&
                    <Button
                      {...action.props}
                      key={action.type}
                      mode='contained-tonal'
                      onPress={() => handleReset()}
                    >
                      {action.type}
                    </Button>
                  }
                </>
              )
            }
          </View>
        </View>
      )}
      onSubmit={function (values: FormikValues, formikHelpers: FormikHelpers<FormikValues>): void | Promise<any> {
        console.log(values)
        // throw new Error("Function not implemented.");
      }}
    />
  )
  function getFormField({
    input,
    handleChange,
    handleBlur,
    setFieldValue,
    values,
    errors,
    touched
  }: {
    input: inputFields,
    handleChange: (e: React.ChangeEvent<any>) => void,
    handleBlur: (e: React.FocusEvent<any, Element>) => void,
    setFieldValue: any,
    values: FormikValues<typeof defaultFormValues>,
    errors: FormikErrors<typeof defaultFormValues>,
    touched: FormikTouched<typeof defaultFormValues>,
  }
  ) {
    console.log(
      input,
      handleChange,
      handleBlur,
      setFieldValue,
      values,
      errors,
      touched
    )
    // return <></>
    switch (input['type']) {
      case 'firstname':
      case 'lastname':
      case 'email':
        return (
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
        )
      case 'mobile':
      case 'password':
      case 'lead status':
      case 'lead disposition':
      case 'lead project':
      case 'lead typology':
      case 'datetime':
      case 'date range':
      case 'remarks':
      case 'city':
      case 'state':
      case 'address':
      case 'pincode':
      case 'follow-up date':
      case 'location':
    }
  }
}

// type FormFieldProps = {
//   input: inputFields;
//   handleChange:(e: React.ChangeEvent<any>)=> void;
//   handleBlur:(e: React.FocusEvent<any, Element>)=>void;
//   values;
//   errors;
//   touched;
// }


const styles = StyleSheet.create({
  form: {
    minWidth: 300,
    maxWidth: 400,
    gap: 8,
  },
  body: {
    gap: 8,
    marginVertical: 6,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end'
  }
})