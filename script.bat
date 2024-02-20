@echo off

if "%~1"=="save" (
  git add .
  git commit -m "bot: auto saving today's the progress."
  git push --all
)


if "%~1"=="restore" (
  git pull
  yarn install
)



:: Cleans the android gradle
::
:: script clean

if "%~1"=="clean" (
  cd "android"
  gradlew clean
  cd "../"
)


:: Builds the release version of android app (.apk file)
::
:: script build [-c] [-i]
::
:: -c cleans the android gradle
:: -i install the apk in connected devices

if "%~1"=="build" (
  cd "android"

  for %%a in (%*) do (
    if "%%a"=="-c" (
      gradlew clean
    )
  )

  :: "Build release apk"
  gradlew assembleRelease
  cd "../"

  copy "android/app/build/outputs/apk/release\app-release.apk" "app-release.apk"
  del "dhwajdialer.apk"
  rename "app-release.apk" "dhwajdialer.apk"

  for %%a in (%*) do (
    if "%%a"=="-i" (
      adb install "dhwajdialer.apk"
    )
  )
)


if "%~1"=="page" (
  set "pagename=%2"
  set "firstLetter=%pagename:~0,1%"
  if not "%firstLetter%"=="%firstLetter:u=%" (
    echo Error: First letter of page name must be uppercase.
    exit /b 1
  ) else (
    echo import { Text } from 'react-native-paper'; >> "./app/pages/%pagename%.tsx"
    echo import { PaperScreen } from '../components'; >> "./app/pages/%pagename%.tsx"
    echo  >> "./app/pages/%pagename%.tsx"
    echo export function LoginPage() { >> "./app/pages/%pagename%.tsx"
    echo   return ( >> "./app/pages/%pagename%.tsx"
    echo     <PaperScreen> >> "./app/pages/%pagename%.tsx"
    echo       <Text>%pagename%</Text> >> "./app/pages/%pagename%.tsx"
    echo     </PaperScreen> >> "./app/pages/%pagename%.tsx"
    echo )} >> "./app/pages/%pagename%.tsx"
  )

)