# ASI Active

#### Prerequisites
1. Node.js 6 or greater
2. [XCode 7.0 or higher](https://cordova.apache.org/docs/en/latest/guide/platforms/ios/) (iOS 9 or higher development)
3. [Android Studio](https://cordova.apache.org/docs/en/latest/guide/platforms/android/) (Android development)

### Installing
```sh
npm install -g ionic cordova
```

### Clone Repository
```sh
git clone https://github.com/SonDaniel/WellnessApp.git
```

### Add Platforms to ionic project
This is required for building the respective platform.
```sh
ionic platform add ios
ionic platform add android
```

### Running the App

##### Web View
*Note: Web view does NOT support Native phone plugins (ex: Cordova-plugin-Sqlite)*
```sh
ionic serve
```

##### iOS Emulator

###### Additional Setup
1. ios-deploy
```sh
npm install -g ios-deploy
```
###### Run App
To build for deployment:
```sh
ionic build ios 
```
To run emulator:
```sh
# -l for livereload
# -c for console output
ionic emulate ios -lc
```

##### Android Emulator

###### Additional Setup
1. [Android Studio](https://developer.android.com/studio/index.html)
2. Android SDK 14 - 23

###### Run App
To build for deployment:
```sh
ionic build android 
```
To run emulator:
```sh
# -l for livereload
# -c for console output
ionic emulate android -lc
```
Check database:
```sh
adb root # restart adb in root mode
adb pull /data/data/<package_name>/databases/<database_name> <local_storage> # Copy database from device/emulator to host machine
# adb pull /data/data/com.ionicframework.asiactive423469/databases/asi_active.db C:\Users\<username>\Desktop

adb devices # list all connected devices (e.g. emulators/devices)

 # -e: connect to only running emulator, -d: connect to only running USB device, -s <specific device>: connect directly to emulator or device
adb [-e|-d|-s {<serialNumber>}] shell
cd /data/data/<package_name>/databases/ # Navigate to database directory. e.g. cd /data/data/com.ionicframework.asiactive423469/databases/
sqlite3 <database_name> # e.g. sqlite3 asi_active.db

# Following command is run from sqlite interpreter: e.g. sqlite> <command>
.dump # Dump the database in SQL text format
.help # See all available commands
# CTRL + D to exit sqlite>
exit # To exit adb shell
```

#### Testing
When testing using `ionic emulate (ios | android)` change API route from production to testing URL visa versa:

- src/AjaxUtil.service.ts - main url
- src/database.service.ts - inside saveAvatar function
- src/pages/leaderboard/leaderboard.ts - look for `this.students[i]['avatar'] = "http://"`
- src/pages/signup/signup.ts - for uploading photo
- src/pages/profile/edit-profile.ts - for uploading photo