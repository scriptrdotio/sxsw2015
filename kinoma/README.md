#How this folder is organized

This folder contains multiple sample IoT applications that have a "front-end" and a "back-end" part. 
* The front-ends are Kinoma projects that you can import to [Kinoma studio](http://www.kinoma.com/studio/) then further run from there or deploy to a [Kinoma Create](http://www.kinoma.com/create/) device.
* The back-ends are scriptr.io scripts that need to be deployed to your [scriptr.io](https://www.scriptr.io) account.
* The scriptr.io scripts are all contained in the "scripts" folder, regardless of the application they are part of.
 
#Applications

##sound_level_management demo

This is a simple IoT demo application that implements a collaboration among two Kinoma devices, scriptr.io and wot.io.
* A first Kinoma device runs an application that uses a sound sensor (e.g. the microphone) and sends the sound level
to a script on scriptr.io
* Depending on the received value of the sound level, the scriptr.io script determines an instruction to run on the 
second device (in the example, the instruction is merely the "face" to display on the second device's screen).
  * The selected instruction is then pushed to a wot.io channel, from which the second Kinoma devices 
reads.
  * If the sound level is too high, the script sends an email to a predefined user and also sends a tweet.
* The second Kinoma device receives the messages that are sent by scriptr.io, from the wot.io channel and executes 
the instruction it contains (in the default implementation, it displays a face - happy, neutral or sad - depending on the content of the message).

###Components

* **audio-detect-scriptr**: this is a Kinoma application project. It represents the sound sensor that sends the values of the sound level to scriptr.io.
* **SoundOMeter**: this is a Kinoma application project. It is the application that receives the instructions sent by scriptr.io through the wot.io channel and executes them.
* **soundLevelManagement**: this is a scriptr.io script that implements the "business" logic of the IoT applicaiton. You can find it the "kinoma/scripts" folder
* **urlBuildModule": this is a scriptr.io script that provides utilities to connect to wot.io. You can find it the "kinoma/scripts" folder.

###How to deploy and configure

**Note** You need to have a [wot.io](http://wot.io/) account for this demo to work properly

* Deploy the aforementioned scripts to your scriptr.io account (you can do this from your scriptr.io IDE by importing them from Github)
 * Replace the values of the WOTIO_USER and WOTIO_TOKEN variables in the "wot.io connection config" section with your wot.io user id and wot.io auth token respectively
 * Replace the values of variables in the "SendMail config" section with values that match your needs
 * Replace the values of the TWITTER_KEY, TWITTER_SECRET, TWITTER_TOKEN and TWITTER_TOKEN_SECRET variables in the "Twitter config" section with the corresponding values that you obtained from Twitter for your app.
 * If needed, you can play with the values of the ACCEPTABLE and TOO_HIGH variables in the "script behavior config" section to modify the sound level thresholds used by the script to determine what instruction to send.
* Import the **audio-detect-scriptr** project to Kinoma studio then run it from the IDE or from a Kinoma Create device. 
 * You can modify the SCRIPT_URL variable if needed in case you deployed the soundLevelManagement script in a folder that is not called "demo"
 * Replace the value of the TOKEN variable with either your scriptr.io token or your scriptr.io anonymous token. In the latter case, do not forget to authorize anonymous calls on the script.
 * You can modify the SIGNIFICANT_LEVEL variable in order to increase/decrease the number of requests sent to scriptr.io
* Import the **SoundOMeter** project to Kinoma studio then run it from the IDE or from a Kinoma Create device.
 * Replace the value of the DEVICE_ID variable with a value of your owb
 * Replace the USER_ID variable with your wot.io user ID
 * Replace the TOKEN variable with your wot.io auth token

###How it works

* First, launch the SoundOMeter application
* Then, launch the audio-detect-scriptr application. Make some noise.
* The face displayed on the screen of the device running the SoundOMeter application should switch from happy to neutral to sad depending on the noise you are making.

##ScriptrdotioNotifications

This is a "kitchen sink" application to demonstrate multiple features of scriptr.io. There are two front-ends: 
* The first front-end is an application running on a Kinoma Create device. It displays a group of radio buttons (tweet, email, push) and a "Send" button. Pressing on the latter triggers the execution of a script, which send a weather notification throug a tweet, an email or a push notification. 
* The second front-end is an Android application from which the end user can select a city (for which she will obtain the weather forecast). The mobile app also send the identifier of the mobile device it is running on to scriptr.io to enable push notifications.

###Components

* ScriptrdotioNotifications: this is a Kinoma application project.
* sendNotification: this is a scriptr.io script that is invoked by the former. It is responsible for calling a remote weather API then sending the result as a notification (tweet, email or push, depending on the choice made by the user on the Kinoma device)
* updatePrefs: this is a scriptr.io implemented using the Blockly editor. It is invoked by the mobile application whenever a new city is chosen by the end user.
* ScriptrNotifications.apk: this is the apk of the android mobile application. You can find it the [sxsw2015_mobile](https://github.com/scriptrdotio/sxsw2015_mobile/tree/master/mobile_apps) repository
 
###How to deploy and configure

* Import the **ScriptrdotioNotifications** Kinoma project into Kinoma studio. In the main.js file, set the value of the TOKEN variable to your scriptr.io authentication token.
* Deploy the **ScriptrNotifications.apk** file on an Android device (make sure that Google play services are installed).
* Deploy the **updatePrefs** and **sendNotification** scripts into your scriptr.io account (you can do this from your scriptr.io IDE by importing them from Github)
 * Set the values of the TWITTER_KEY, TWITTER_SECRET, TWITTER_TOKEN and TWITTER_TOKEN_SECRET variables to those you obtaine from twitter for your application.
 * Modify the recipient email address at line 67.

###How it works

* First, launch the ScriptrNotifications application on the Android device. Select a city from the list.
* Then, launch the ScriptrdotioNotifications Kinoma application, check one of the radio buttons and press "Send"
* Verify that you received a notification using the selected channel
