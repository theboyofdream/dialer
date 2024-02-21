import IntentLauncherUtils, { IntentConstant } from "@yz1311/react-native-intent-launcher";
import { observer } from "mobx-react";
import { useState } from "react";
import { Linking, View } from "react-native";
import * as RNFS from 'react-native-fs';
import { Dialog, Portal, Text, useTheme } from "react-native-paper";
import { Button } from ".";
import { useStores } from "../stores";


// const tempApkPath = RNFS.TemporaryDirectoryPath + '/dialer.apk'
const tempApkPath = RNFS.DownloadDirectoryPath + '/dialer.apk'


export const AppUpdateAlert = observer(() => {
  const { colors } = useTheme()
  const { appInfoStore } = useStores()

  // const [visible, setVisible] = useState(appInfoStore.updateAvailable);
  const [visible, setVisible] = useState(true);

  const [downloadProgress, setDownloadProgress] = useState(0)
  const [updating, setUpdating] = useState(false)
  async function update() {
    setUpdating(true)
    if (await RNFS.exists(tempApkPath)) {
      await RNFS.unlink(tempApkPath)
    }
    await RNFS.downloadFile({
      fromUrl: appInfoStore.appInfo.uri,
      toFile: tempApkPath,
      progress: (res) => {
        // Handle download progress updates if needed
        const progress = (res.bytesWritten / res.contentLength) * 100;
        setDownloadProgress(Math.round(progress))
      },
    })
      .promise.then((response) => {
        console.log('File downloaded!', { ...response, filePath: tempApkPath });
        // console.log(tempApkPath)

        /** 
        SendIntentAndroid.openChooserWithOptions({
          // text
          // imageUrl
          // videoUrl
          // subject
        }, "Install Update")
        */

        IntentLauncherUtils.startActivity({
          // action: IntentConstant.ACTION_INSTALL_PACKAGE,
          action: IntentConstant.ACTION_VIEW,
          category: IntentConstant.CATEGORY_OPENABLE,
          // flags: IntentConstant.FLAG_ACTIVITY_NEW_TASK,
          data: `${tempApkPath}`,
          type: "application/*",
          // type: "application/vnd.android.package-archive",
          // packageName: "application/vnd.android.package-archive"
        })
          .then(console.log)
          .catch(console.error)

      })
      .catch((err) => {
        console.log('Download error:', err);
      });

    setUpdating(false)
  }
  function openUpdateLinkInBrowser() {
    Linking.openURL(appInfoStore.appInfo.uri)
      .then(console.log)
      .catch(console.error)
  }

  return (
    <Portal>
      <Dialog visible={visible} dismissable={false}>
        <Dialog.Title>Update Available</Dialog.Title>
        <Dialog.Content>
          <Text>{appInfoStore.appInfo.message}</Text>
          <Text style={{ color: 'blue', textDecorationLine: 'underline' }} onPress={openUpdateLinkInBrowser}>{appInfoStore.appInfo.uri}</Text>
          {
            updating &&
            <View style={{ gap: 8 }}>
              <Text variant="labelLarge" style={{ alignSelf: 'center' }}>Downloading {downloadProgress}%</Text>
              <View
                style={{ width: `${downloadProgress}%`, height: 3, backgroundColor: 'blue' }}
              />
            </View>
          }
        </Dialog.Content>
        <Dialog.Actions>
          <Button disabled={updating} onPress={() => setVisible(false)}>skip</Button>
          <Button mode="contained" disabled={updating} onPress={update}>update</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
})
