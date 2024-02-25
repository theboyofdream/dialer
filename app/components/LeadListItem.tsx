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

function useNames(dispositionId: number = 0, statusId: number = 0, projectIds: number[] = []) {
  const { dispositionStore, statusStore, projectStore } = useStores()
  const dispositionName = useMemo(() => dispositionStore.getById(dispositionId)?.name, [dispositionId])
  const status = useMemo(() => statusStore.getById(statusId), [statusId])
  const projectNames = useMemo(() => {
    let names: string[] = []
    projectIds.map(id => {
      let p = projectStore.getById(id)
      if (p) { names.push(p.name); }
    })
    return names.join(', ')
  }, [projectIds])

  return {
    dispositionName,
    statusName: status?.name,
    statusColor: status?.color,
    projectNames
  }
}


export const LeadListItem = observer(({ leadId }: { leadId: number }) => {
  const { colors } = useTheme()
  const { navigate } = useNavigation()
  const { leadStore } = useStores()
  const lead = leadStore.getLeadById(leadId)
  const { dispositionName, statusName, statusColor, projectNames } = useNames(lead?.dispositionId, lead?.statusId, lead?.projectIds)

  if (!lead) {
    return <></>
  }

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
                children={projectNames || <DisabledText text='No Project' />}
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

