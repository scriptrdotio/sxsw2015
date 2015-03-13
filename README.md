#About this repository

This repository contains sample applications that demonstrate how to use scriptr.io to implement full-fledged IoT applications. The sample applications described hereafter also leverage Kinoma Create devices and wot.io, a Data Exchane platform on the Cloud.

Available applications:
* soundOMeterDemo
* 

##soundOMeterDemo

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

* **audio-detect-scriptr**: this is a Kinoma application project, based on the Kinoma [audio-detect](https://github.com/Kinoma/KPR-examples/tree/master/audio-detect) sample application. It represents the sound sensor that sends the values of the sound level to scriptr.io.
* **SoundOMeter2**: this is a Kinoma application project. It is the application that receives the instructions sent by scriptr.io through the wot.io channel and executes them.
* **SoundOMeter2_backend**: this is a scriptr.io project. Copy the two scripts that are contained in the project and deploy them to your scriptr.io account (you should normally deploy them in a folder called "demo").

###How to deploy and configure

* Copy the scripts that are contained in the **SoundOMeter2_backend** project to your scriptr.io account. By default, the two scripts should be placed in a folder called "demo". Note that the "urlBuilderModule" script is a utility that facilitates the communication with wot.io. **Do not use the ".js" extension when naming your scripts on scriptr.io**.
 * Replace the values of the WOTIO_USER and WOTIO_TOKEN variables in the "wot.io connection config" section with your wot.io user id and wot.io auth token respectively
 * Replace the values of variables in the "SendMail config" section with values that match your needs
 * Replace the values of the TWITTER_KEY, TWITTER_SECRET, TWITTER_TOKEN and TWITTER_TOKEN_SECRET variables in the "Twitter config" section with the corresponding values that you obtained from Twitter for your app.
 * If needed, you can play with the values of the ACCEPTABLE and TOO_HIGH variables in the "script behavior config" section to modify the sound level thresholds used by the script to determine what instruction to send.
* Import the **audio-detect-scriptr** project to Kinoma studio then run it from the IDE or from a Kinoma Create device. 
 * You can modify the SCRIPT_URL variable if needed in case you deployed the soundLevelManagement script in a folder that is not called "demo"
 * Replace the value of the TOKEN variable with either your scriptr.io token or your scriptr.io anonymous token. In the latter case, do not forget to authorize anonymous calls on the script.
 * You can modify the SIGNIFICANT_LEVEL variable in order to increase/decrease the number of requests sent to scriptr.io
* Import the **SoundOMeter2** project to Kinoma studio then run it from the IDE or from a Kinoma Create device.
 * Replace the value of the DEVICE_ID variable with a value of your owb
 * Replace the USER_ID variable with your wot.io user ID
 * Replace the TOKEN variable with your wot.io auth token


###How it works

* First, launch the SoundOMeter2 application
* Then, launch the audio-detect-scriptr application. Make some noise.
* The face displayed on the screen of the device running the SoundOMeter2 application should switch from happy to neutral to sad depending on the noise you are making.
