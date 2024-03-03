import IntentLauncherUtils, { IntentConstant } from "@yz1311/react-native-intent-launcher";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Linking, View, NativeModules } from "react-native";
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

  // const [visible, setVisible] = useState(store.updateAvailable);
  const visible = store.updateAvailable;

  const [downloadProgress, setDownloadProgress] = useState(0)
  const [updating, setUpdating] = useState(false)
  async function update() {
    setUpdating(true)
    // SendIntentAndroid.openFileChooser(
    //   {
    //     subject: "File subject", //optional,
    //     fileUrl: "/path_or_url/to/file",
    //     type: "file_mimetype",
    //   },
    //   "Open file with:"
    // );
    // return
    var filePath = RNFS.DownloadDirectoryPath + `/${store.appInfo.name}_${store.appInfo.version}.apk`;//'/dialer.apk';
    // var download = RNFS.downloadFile({
    //   fromUrl: store.appInfo.uri,
    //   toFile: filePath,
    //   progress: res => {
    //     const progress = (res.bytesWritten / res.contentLength) * 100;
    //     setDownloadProgress(Math.round(progress))
    //     console.log((res.bytesWritten / res.contentLength).toFixed(2));
    //   },
    //   progressDivider: 1
    // });
    // download.promise.then(result => {
    //   if (result.statusCode == 200) {
    // console.log(filePath)
    SendIntentAndroid.openFileChooser(
      {
        subject: "Install Update", //optional,
        fileUrl: `file://${filePath}`,
        type: "application/vnd.android.package-archive",
      },
      "Install app with:"
    )
    // Linking.openURL(`file://${filePath}`)
    //   .then(console.log)
    //   .catch(console.error)
    //   }
    // });
    setUpdating(false)
  }
  //   setUpdating(true)
  //   if (await RNFS.exists(tempApkPath)) {
  //     await RNFS.unlink(tempApkPath)
  //   }
  //   await RNFS.downloadFile({
  //     fromUrl: appInfoStore.appInfo.uri,
  //     toFile: tempApkPath,
  //     progress: (res) => {
  //       // Handle download progress updates if needed
  //       const progress = (res.bytesWritten / res.contentLength) * 100;
  //       setDownloadProgress(Math.round(progress))
  //     },
  //   })
  //     .promise.then((response) => {
  //       console.log('File downloaded!', { ...response, filePath: tempApkPath });
  //       // console.log(tempApkPath)

  //       /** 
  //       SendIntentAndroid.openChooserWithOptions({
  //         // text
  //         // imageUrl
  //         // videoUrl
  //         // subject
  //       }, "Install Update")
  //       */

  //       IntentLauncherUtils.startActivity({
  //         // action: IntentConstant.ACTION_INSTALL_PACKAGE,
  //         action: IntentConstant.ACTION_VIEW,
  //         category: IntentConstant.CATEGORY_OPENABLE,
  //         // flags: IntentConstant.FLAG_ACTIVITY_NEW_TASK,
  //         data: `${tempApkPath}`,
  //         type: "application/*",
  //         // type: "application/vnd.android.package-archive",
  //         // packageName: "application/vnd.android.package-archive"
  //       })
  //         .then(console.log)
  //         .catch(console.error)

  //     })
  //     .catch((err) => {
  //       console.log('Download error:', err);
  //     });

  //   setUpdating(false)
  // }
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
          <Text>{'\n'}Download Link:</Text>
          <Text style={{ color: 'blue', textDecorationLine: 'underline' }} onPress={openUpdateLinkInBrowser}>{store.appInfo.uri}</Text>
          {
            // updating &&
            <View style={{ gap: 8, alignItems: 'center' }}>
              <Text variant="labelLarge">Downloading {downloadProgress}%</Text>
              {/* <View
                style={{ width: `${downloadProgress}%`, height: 3, borderRadius: 3, backgroundColor: '' }}
              /> */}
              <View style={{ width: '100%', height: 3, borderRadius: 3, backgroundColor: colors.surfaceDisabled }}>
                <View style={{ width: `${downloadProgress}%`, height: 3, borderRadius: 3, backgroundColor: colors.onSurfaceVariant }} />
              </View>
            </View>
          }
        </Dialog.Content>
        <Dialog.Actions>
          {/* <Button disabled={updating} onPress={() => setVisible(false)}>skip</Button> */}
          <Button
            mode="contained"
            disabled={updating}
            onPress={update}
            children={updating ? 'downloading...' : 'update'}
          />
          {/* <Button mode="contained-tonal" disabled={updating} onPress={openUpdateLinkInBrowser}>Open Browser</Button> */}
          {/* <Button disabled={updating} onPress={openUpdateLinkInBrowser}>Open Browser</Button> */}
          {/* <Button mode="contained" disabled={updating} onPress={openUpdateLinkInBrowser}>Download</Button> */}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
})
