import EntypoIcon from 'react-native-vector-icons/Entypo';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ColorValue, Pressable, View } from "react-native";
import { Badge, Text, useTheme } from "react-native-paper";

import { observer } from 'mobx-react-lite';
import { CreateLeadPage, LeadDetailPage, LeadsPage, LoadingPage, LoginPage, NotFoundPage, NotificationPage, ReportPage } from "./pages";
import { ProfilePage } from './pages/ProfilePage';
import { useStores } from './stores';
import { PropsWithChildren } from 'react';


const defaultScreenOptions = { headerShown: false }


export type StackNavigatorParams = {
  loading: undefined,
  home: undefined,
  "lead details": { leadId: number },
  // notifications: undefined,
  login: undefined,
  '404': undefined
}

const Stack = createStackNavigator<StackNavigatorParams>()
const StackNavigator = observer(() => {
  const { authStore: { user } } = useStores()

  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      {
        user.loggedIn ?
          <>
            <Stack.Screen name='loading' component={LoadingPage} />
            <Stack.Screen name='home' component={BottomTabNavigator} />
            <Stack.Screen name='lead details' component={LeadDetailPage} />
            <Stack.Screen name='404' component={NotFoundPage} />
            {/* <Stack.Screen name='notifications' component={NotificationPage} /> */}
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
    'leads': <EntypoIcon {...props} name='list' />,
    'alerts': <EntypoIcon {...props} name='bell' />,
    'reports': <EntypoIcon {...props} name='bar-graph' />,
    'create lead': <MaterialCommunityIcons {...props} name='account-plus' />,
    'profile': <MaterialCommunityIcons {...props} name='account-circle' />
  }
  return bottomTabIcons[name as keyof typeof bottomTabIcons];
}


type BottomTabNavigatorParams = {
  leads: undefined,
  alerts: undefined,
  'create lead': undefined,
  reports: undefined,
  profile: undefined
}

const Tab = createBottomTabNavigator<BottomTabNavigatorParams>();
const BottomTabNavigator = observer(() => {
  const { colors } = useTheme()
  const upcomingNotificationCount = useStores().notificationStore.upcomingNotifications.length

  return (
    <Tab.Navigator
      // initialRouteName='alerts'
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
                      alignItems: 'center',
                      position: 'relative'
                    }}
                    onPress={onPress}
                  >
                    {upcomingNotificationCount > 0 && route.name === 'alerts' &&
                      <Badge style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        zIndex: 999,
                        transform: [
                          { translateX: -15 },
                          { translateY: -5 }
                        ]
                      }}
                      >{upcomingNotificationCount}</Badge>
                    }
                    {generateBottomTabIcon(route.name, color)}
                    <Text variant='bodySmall' style={{ color, textTransform: 'capitalize' }}>
                      {route.name.slice(0, 7)}
                    </Text>

                  </Pressable>
                )
              })
            }
          </View>
        )
      }}
    >
      <Tab.Screen name='leads' component={LeadsPage} />
      <Tab.Screen name='alerts' component={NotificationPage} />
      <Tab.Screen name='create lead' component={CreateLeadPage} />
      <Tab.Screen name='reports' component={ReportPage} />
      <Tab.Screen name='profile' component={ProfilePage} />
    </Tab.Navigator>
  )
})


/**
 * Linking Configuration
 */
const linking = {
  // Prefixes accepted by the navigation container, should match the added schemes
  prefixes: ["dhwajdialer://"],
  // Route config to map uri paths to screens
  config: {
    // Initial route name to be added to the stack before any further navigation,
    // should match one of the available screens
    initialRouteName: "loading" as const,
    screens: {
      // dhwajdialer:// -> LoadingPage
      loading: "/",
      // dhwajdialer://lead/1 -> LeadDetailsPage with param leadId: 1
      "lead details": "lead/:leadId"
    },

  },
};

export function Navigation(props: PropsWithChildren) {
  return (
    <NavigationContainer linking={{
      // Prefixes accepted by the navigation container, should match the added schemes
      prefixes: ["dhwajdialer://"],
      // Route config to map uri paths to screens
      config: {
        // Initial route name to be added to the stack before any further navigation,
        // should match one of the available screens
        initialRouteName: "loading" as const,
        screens: {
          // dhwajdialer:// -> LoadingPage
          loading: "/",
          // dhwajdialer://lead/1 -> LeadDetailsPage with param leadId: 1
          "lead details": "lead/:leadId",
          '404': '/*'
        },
      },
    }}>
      <StackNavigator />
      {props.children}
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
