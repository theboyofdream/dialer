import IntentLauncherUtils, { IntentConstant } from "@yz1311/react-native-intent-launcher";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Linking, View, NativeModules, PermissionsAndroid } from "react-native";
import * as RNFS from 'react-native-fs';
import { Dialog, Portal, Text, useTheme } from "react-native-paper";
import { Button } from ".";
import { useStores } from "../stores";
import SendIntentAndroid from "react-native-send-intent";


// const tempApkPath = RNFS.TemporaryDirectoryPath + '/dialer.apk'
// const tempApkPath = RNFS.DownloadDirectoryPath + '/dialer.apk'
/**
 * @ReactMethod
  public void install(String path) {
    String cmd = "chmod 777 " + path;
    try {
      Runtime.getRuntime().exec(cmd);
    } catch (Exception e) {
      e.printStackTrace();
    }
    Intent intent = new Intent(Intent.ACTION_VIEW);
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    intent.setDataAndType(Uri.parse("file://" + path), "application/vnd.android.package-archive");
    _context.startActivity(intent);
  }
 */


export const AppUpdateAlert = observer(() => {
  const { colors } = useTheme()
  const store = useStores().appInfoStore;

  const [visible, setVisibility] = useState(store.updateAvailable)

  const [downloadProgress, setDownloadProgress] = useState(0)
  const [updating, setUpdating] = useState(false)
  async function update() {
    setUpdating(true)
    let filePath = RNFS.DownloadDirectoryPath + `/com.dialer.apk`;
    let download = RNFS.downloadFile({
      fromUrl: store.appInfo.uri,
      toFile: filePath,
      progress: res => {
        const progress = (res.bytesWritten / res.contentLength) * 100;
        setDownloadProgress(Math.round(progress))
      },
      progressDivider: 1
    });
    download.promise.then(result => {
      if (result.statusCode == 200) {
        SendIntentAndroid.openFileChooser(
          {
            // subject: "Install Update", //optional,
            fileUrl: `${filePath}`,
            type: "application/vnd.android.package-archive",
          },
          "Install update"
        )
      }
    })
    setUpdating(false)
  }

  function openUpdateLinkInBrowser() {
    Linking.openURL(store.appInfo.uri)
      .then(console.log)
      .catch(console.error)
  }

  return (
    <Portal>
      <Dialog visible={visible} dismissable={false}>
        <Dialog.Title>
          New update available
        </Dialog.Title>
        <Dialog.Content>
          <Text>{store.appInfo.message}</Text>
          <Text style={{ color: 'blue', textDecorationLine: 'underline' }} onPress={openUpdateLinkInBrowser}>{'\n'}Download from browser!</Text>
          {
            updating &&
            <View style={{ gap: 8, alignItems: 'center' }}>
              <Text variant="labelLarge">Downloading {downloadProgress}%</Text>
              <View style={{ width: '100%', height: 3, borderRadius: 3, backgroundColor: colors.surfaceDisabled }}>
                <View style={{ width: `${downloadProgress}%`, height: 3, borderRadius: 3, backgroundColor: colors.onSurfaceVariant }} />
              </View>
            </View>
          }
        </Dialog.Content>
        <Dialog.Actions>
          <Button disabled={updating} onPress={() => setVisibility(false)}>skip</Button>
          <Button
            mode="contained"
            disabled={updating}
            onPress={update}
            children={updating ? 'downloading...' : 'update'}
          />
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
})
