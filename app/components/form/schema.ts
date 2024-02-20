import * as y from 'yup';

export const Schema = {

  name: y.string()
    .min(3, 'min 3 characters required.')
    .max(50, 'you exceeded max 50 characters length.')
    .required('Required.'),

  email: y.string()
    .email('Please enter valid email'),

  emailRequire: y.string()
    .email('Please enter valid email')
    .required('Required'),

  // mobile: Yup.number().min(10, 'min 10 digits require.').max(10, 'max 10 digits limit').required('Required'),

  mobile: y.number()
    .test(
      'exact 10 Digits',
      'Must be a 10-digit number',
      (value) => {
        return /^\d{10}$/.test(`${value || 0}`);
      })
    .required('Required'),

  password: y.string().required('Required'),

  date: y.date().nullable().default(undefined),

  dateRequire: y.date().required('Date Required'),

  pincode: y.number().min(6).max(6),

  pincodeRequire: y.number().min(6).max(6).required('Picode Required.'),

  // maxDateRequire: (key: string) => Yup.date().when(key, (minDate, schema) => {

  //   minDate.setHours(sDate.getHours() + 1);
  //   return schema.isValidSync(sDate)
  //     ? schema.min(sDate, 'Invalid Date')
  //     : schema.min(currentDate.toISOString());
  // })
  //   .typeError('Invalid date')
  //   .required()

  string: y.string(),
  stringRequire: y.string().required("Required"),

  stringArray: y.array().of(y.string()),
  stringArrayRequire: y.array().of(y.string()).required('Required'),

  number: y.number(),
  numberRequire: y.number().min(1).required('Required'),

  numberArray: y.array().of(y.number()),
  numberArrayRequire: y.array().of(y.number()).required('Required'),

  create: (schema: { [x: string]: any }) => y.object().shape(schema)
}

