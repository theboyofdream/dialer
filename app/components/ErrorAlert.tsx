import { observer } from "mobx-react-lite";
import { useStores } from "../stores";
import { Dialog, Portal, Text, useTheme } from "react-native-paper";
import { Button } from ".";

export const ErrorAlert = observer(() => {
  const store = useStores().errorStore
  const colors = useTheme().colors

  return (
    <>
      {
        store.getAll().map((error, index) =>
          <Portal key={index}>
            <Dialog visible={true} dismissable={false}>
              {/* <Dialog.Icon icon='alert-circle' color={colors.primary} /> */}
              <Dialog.Title>{error.title}</Dialog.Title>
              <Dialog.Content>
                <Text>{error.content}</Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button
                  children="skip"
                  onPress={() => store.remove(error.id)}
                />
                {/* <Button
                  mode='contained'
                  icon='share'
                  children="share"
                /> */}
              </Dialog.Actions>
            </Dialog>
          </Portal>
        )
      }
    </>
  )
})
