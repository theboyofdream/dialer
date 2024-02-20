import { Linking } from "react-native";

export async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export function openWhatsApp(mobile: string) {
  Linking.openURL(`whatsapp://send?phone=${mobile}`)
}

