import { useNavigation } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { View } from "react-native";
import { Avatar, IconButton, Text, TouchableRipple, useTheme } from "react-native-paper";
import { Spacer } from ".";
import { call } from "../services";
import { useStores } from "../stores";
import { dateFns } from "../utils";

function DisabledText({ text }: { text: string }) {
  const { colors } = useTheme()
  return <Text style={{ color: colors.onSurfaceDisabled, fontStyle: 'italic' }} variant="labelSmall">{text}</Text>
}

export const LeadListItem = observer(({ leadId }: { leadId: number }) => {
  const { colors } = useTheme()
  const { navigate } = useNavigation()
  const { leadStore, dispositionStore, statusStore, projectStore } = useStores()
  const lead = leadStore.getLeadById(leadId)

  if (!lead) {
    return <></>
  }

  const dispositionName = useMemo(() => {
    return dispositionStore.getById(lead.dispositionId)?.name
  }, [lead.dispositionId])

  const [statusName, statusColor] = useMemo(() => {
    let status = statusStore.getById(lead.statusId)
    return [status?.name, status?.color]
  }, [lead.statusId])

  const projectName = useMemo(() => {
    let names: string[] = []
    lead.projectIds.map(id => {
      let p = projectStore.getById(id)
      if (p) names.push(p.name);
    })
    return names.join(', ')
  }, [lead.projectIds])

  return (
    <TouchableRipple
      onPress={() => {
        navigate('lead details', { leadId })
      }}
      rippleColor={statusColor || colors.primaryContainer}
    >
      <View style={{ padding: 12, paddingRight: 0 }}>
        <View style={{ flexDirection: 'row', gap: 9 }}>
          <Avatar.Icon icon={"account"} size={45} color={colors.onPrimary} style={{ backgroundColor: statusColor }} />

          <View style={{ flex: 1 }}>

            <Text
              variant="bodyLarge"
              children={lead.firstname + " " + lead.lastname}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                variant='bodySmall'
                style={{ opacity: 0.6 }}
                children={dispositionName || <DisabledText text="No Disposition" />}
              />
              <Text
                style={{ color: colors.onSurfaceDisabled }}
                children={" • "}
              />
              <Text
                variant='bodySmall'
                style={{ opacity: 0.6 }}
                children={projectName || <DisabledText text='No Project' />}
              />
            </View>

            <Spacer size={4} />

            <Text
              children={lead.remarks || <DisabledText text="No Remarks" />}
            />
          </View>

          <IconButton icon={"phone"} onPress={() => call(lead.mobile)} />
        </View>

        <Text style={{ textAlign: 'right', opacity: 0.6, paddingRight: 21 }}>
          <Text
            variant='bodySmall'
            children={statusName || <DisabledText text="No Status" />}
          />
          <Text
            style={{ color: colors.onSurfaceDisabled }}
            children=" • "
          />
          <Text
            variant='bodySmall'
            children={lead.followUpDate ? dateFns.toHumanReadleDate(lead.followUpDate) : <DisabledText text='No Follow Up' />}
          />
        </Text>
      </View>
    </TouchableRipple>
  )
})

