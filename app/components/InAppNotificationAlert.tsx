import { useEffect, useMemo, useReducer, useRef, useState } from "react"
import { Dialog, Icon, IconButton, Portal, Text, useTheme } from "react-native-paper"
import { Button, Spacer } from "."
import { Lead, useStores } from "../stores"
import { observe } from "mobx"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { call } from "../services"
import { dateFns } from "../utils"

export const InAppNotificationAlert = observer(() => {
  const { navigate } = useNavigation()
  const [visible, setVisibility] = useState(true)
  const { colors } = useTheme()
  const { notificationStore: { upcomingNotifications }, dispositionStore, statusStore, projectStore } = useStores()
  const [lead, setLead] = useState<Lead>()

  const timeouts = useRef<NodeJS.Timeout[]>([])

  useEffect(() => {
    const now = new Date().getTime();

    for (let notification of upcomingNotifications) {
      if (
        notification.followUpDate &&
        notification.followUpDate.getTime() - now > 0
      ) {
        timeouts.current.push(
          setTimeout(() => {
            setLead(notification)
          }, notification.followUpDate.getTime() - now)
          // }, 1000)
        );
        // break;
      }
    }

    return () => {
      timeouts.current.map(t => clearTimeout(t))
    }
  }, [upcomingNotifications])

  const { dispositionName, statusName, statusColor, projectName } = useMemo(() => {
    let dispositionName = '', statusName = '', statusColor = '', projectName = '';
    if (lead) {
      dispositionName = dispositionStore.getById(lead.dispositionId)?.name || ''
      let status = statusStore.getById(lead.statusId)
      statusName = status?.name || ''
      statusColor = status?.color || ''
      let names: string[] = []
      lead.projectIds.map(id => {
        let p = projectStore.getById(id)
        if (p) names.push(p.name);
      })
      projectName = names.join(', ')
    }
    return { dispositionName, statusName, statusColor, projectName }
  }, [lead])

  if (!lead) {
    return <></>
  }

  return (
    <Portal>
      <Dialog visible={visible} dismissable={false}>

        <Dialog.Icon icon="calendar-clock" color={colors.error} />

        <Dialog.Title style={{ color: colors.error, textAlign: 'center' }}>Follow up</Dialog.Title>

        {/* <View style={{
          flexDirection: 'row',
          marginTop: 0,
          // justifyContent: 'space-between',
          // justifyContent: 'center',
          // marginRight: 12,
          marginLeft: 18,
          gap: 8,
          alignItems: 'center'
        }}>
          <Icon
            source='calendar-clock'
            size={24}
            color={colors.error}
          />
          <Dialog.Title style={{ color: colors.error, marginLeft: 0 }}>Follow up</Dialog.Title>
        </View> */}

        <Dialog.Content>
          <Text variant="headlineMedium">{lead.firstname} {lead.lastname}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <Text style={{ opacity: 0.4 }} variant='labelSmall'>STATUS: </Text>
            <Text>{statusName}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <Text style={{ opacity: 0.4 }} variant='labelSmall'>DISPOSITION: </Text>
            <Text>{dispositionName}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <Text style={{ opacity: 0.4 }} variant='labelSmall'>PROJECT: </Text>
            <Text>{projectName}</Text>
          </View>

          <Text variant='labelSmall' style={{ opacity: 0.4 }}>REMARKS: </Text>
          <Text variant='bodyLarge'>{lead.remarks}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <Text style={{ opacity: 0.4 }} variant='labelSmall'>FOLLOW UP: </Text>
            {lead.followUpDate && <Text>{dateFns.toHumanReadleDate(lead.followUpDate)}</Text>}
          </View>

        </Dialog.Content>

        <Dialog.Actions>
          <IconButton
            icon='phone'
            mode='contained'
            style={{ backgroundColor: 'transparent' }}
            onPress={() => {
              call(lead.mobile)
              navigate('lead details', { leadId: lead.id })
              setVisibility(false)
            }}
          />
          <Spacer size={0} stretch />
          <Button
            onPress={() => setVisibility(false)}
            children="skip"
          />
          <Button
            mode="contained"
            onPress={() => {
              setVisibility(false)
              navigate('lead details', { leadId: lead.id })
            }}
            children="open"
          />
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
})