import { PermissionsAndroid } from "react-native";
import SendIntentAndroid from "react-native-send-intent";

async function handlePhoneCallPermission() {
  let permissionGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CALL_PHONE)
  let status = PermissionsAndroid.RESULTS.GRANTED;
  if (!permissionGranted) {
    status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CALL_PHONE);
  }
  return status === PermissionsAndroid.RESULTS.GRANTED
}


export async function call(mobile: string) {
  if (await handlePhoneCallPermission()) {
    SendIntentAndroid.sendPhoneCall(mobile)
  }
}
