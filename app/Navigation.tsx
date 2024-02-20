import EntypoIcon from 'react-native-vector-icons/Entypo';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ColorValue, Pressable, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

import { observer } from 'mobx-react-lite';
import { CreateLeadPage, LeadDetailPage, LeadsPage, LoginPage, NotificationPage, ReportPage } from "./pages";
import { ProfilePage } from './pages/ProfilePage';
import { useStores } from './stores';


const defaultScreenOptions = { headerShown: false }


export type StackNavigatorParams = {
  home: undefined,
  "lead details": { leadId: number },
  notifications: undefined,
  login: undefined
}

const Stack = createStackNavigator<StackNavigatorParams>()
const StackNavigator = observer(() => {
  const { authStore: { user } } = useStores()

  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      {
        user.loggedIn ?
          <>
            <Stack.Screen name='home' component={BottomTabNavigator} />
            <Stack.Screen name='lead details' component={LeadDetailPage} />
            <Stack.Screen name='notifications' component={NotificationPage} />
          </>
          :
          <Stack.Screen name='login' component={LoginPage} />
      }
    </Stack.Navigator>
  )
})


function generateBottomTabIcon(name: string, color: number | ColorValue | undefined) {
  const props = { size: 24, color }
  const bottomTabIcons = {
    'list': <EntypoIcon {...props} name='list' />,
    'search': <FeatherIcon {...props} name='search' />,
    'reports': <EntypoIcon {...props} name='bar-graph' />,
    'create lead': <MaterialCommunityIcons {...props} name='account-plus' />,
    'profile': <MaterialCommunityIcons {...props} name='account-circle' />
  }
  return bottomTabIcons[name as keyof typeof bottomTabIcons];
}


type BottomTabNavigatorParams = {
  list: undefined,
  'create lead': undefined,
  reports: undefined,
  profile: undefined
}

const Tab = createBottomTabNavigator<BottomTabNavigatorParams>();
function BottomTabNavigator() {
  const { colors } = useTheme()
  return (
    <Tab.Navigator
      screenOptions={defaultScreenOptions}
      tabBar={({ state, navigation }) => {
        return (
          <View
            style={{
              backgroundColor: colors.surface,
              flexDirection: 'row',
              elevation: 24,
              paddingVertical: 12,
            }}>
            {
              state.routes.map((route, index) => {
                const isFocused = state.index === index;
                const color = isFocused ? colors.primary : colors.onSurfaceDisabled;

                function onPress() {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true
                  })
                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name)
                  }
                }

                return (
                  <Pressable
                    key={route.key}
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                    onPress={onPress}
                  >
                    {generateBottomTabIcon(route.name, color)}
                    <Text variant='bodySmall' style={{ color, textTransform: 'capitalize' }}>{route.name}</Text>
                  </Pressable>
                )
              })
            }
          </View>
        )
      }}
    >
      <Tab.Screen name='list' component={LeadsPage} />
      <Tab.Screen name='create lead' component={CreateLeadPage} />
      <Tab.Screen name='reports' component={ReportPage} />
      <Tab.Screen name='profile' component={ProfilePage} />
    </Tab.Navigator>
  )
}


export function Navigation() {
  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  )
}


declare global {
  namespace ReactNavigation {
    interface RootParamList
      extends
      StackNavigatorParams, BottomTabNavigatorParams { }
  }
}