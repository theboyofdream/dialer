import { observer } from "mobx-react-lite";
import { useStores } from "../stores";
import { Dialog, Portal, Text } from "react-native-paper";
import { Button } from ".";

export const ErrorAlert = observer(() => {
  const store = useStores().errorStore

  return (
    <>
      {
        store.getAll().map((error, index) =>
          <Portal key={index}>
            <Dialog visible={true} dismissable={false}>
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
