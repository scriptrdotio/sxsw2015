/*
 * This script expects to find the soundLevel parameter in the request. This value is
 * sent by a Kinoma device that plays the role of a sound sensor.
 * The script compares this level to the ACCEPTABLE and TOO_HIGH values and accordingly determines
 * the instruction to send to another Kinoma device (soundOMeter). The instruction is sent
 * to the latter by pushing (HTTP) a message to a wot.io sink bound to a wot.io source from which
 * the soundOMeter reads (WS) the instruction.
 * If the sound level is above a given threshold, the script will also send an email to a predefined
 * user and tweet on a given twitter account
 */ 

// script behavior config
var ACCEPTABLE = "1000";
var TOO_HIGH = "2000";

// wot.io connection config
var WOTIO_USER = ""; // replace with your wot.io user
var WOTIO_TOKEN = ""; // replace with your wot.io token
var WOTIO_APP = "echo"; // keep it as is
var DEVICE_ID = "soundOMeter"; // keep it as is or replace with another id

// SendMail config
var SEND_TO = "rabih@scriptr.io";
var SEND_FROM = "demo@scriptr.io";
var SUBJECT = "The sound level is too high!";
var BODY_HTML = "The sound level is too high! Please wear ear protection";

// Twitter config. Replace with your own config
var TWITTER_KEY = "";
var TWITTER_SECRET = "";
var TWITTER_TOKEN = "";
var TWITTER_TOKEN_SECRET = ""; 
var TWEET_TEXT = BODY_HTML;

// Retrieve the sound level as sent by a Kinoma device with an audio sensor
var soundLevel = parseFloat(request.parameters.soundLevel);

// Determine the instruction to take according to the sound level
var face = "happy";
if (soundLevel > ACCEPTABLE && soundLevel < TOO_HIGH) {
  	face = "neutral";
}

if (soundLevel >= TOO_HIGH ) {
  
    face = "sad";
    sendWarning();
}

// Publish the selected instruction to the soundOMeter running on a Kinoma device
var config = {

    deviceId: DEVICE_ID,
    user: WOTIO_USER, // the wot.io username
    token: WOTIO_TOKEN, // the wot.io token
    application: WOTIO_APP
};

try {

    var urlBuilderModule = require("demo/urlBuilderModule");
    var urlBuilder = new urlBuilderModule.URLBuilder(config);

    // Get the binding URL to use to create a binding between the target wot.io sink and source 
    // (the source from which the soundOMeter receives the action)
    var bindUrl = urlBuilder.buildHttpbindForecho();

    // Push the message to the wot.io sink
    var pushUrl = urlBuilder.buildHttppushForecho();
    var headers = {
      "Authorization": "bearer " + config.token
    };

    // Create a binding between the target wot.io sink and source (the source from which the soundOMeter receives the action)
    bind(bindUrl, headers); 

    // push a message using the binding and return the result to the caller
    return push(pushUrl, headers, {"face": face});
}catch(exception) {
  	return exception;
}

function bind(url, headers) {

  var response = this.apsdb.callHttp(url, "POST", null, null, headers, null, false, null, false, false);
  if (response.status != "201" && response.status != "200") {

      throw {

        "errorCode": response.status,
        "errorDetail": "Failed create binding " + url 
      }
  }

  var result = JSON.parse(response.body);
  if (!result[0] == "ok") {

      throw {

        "errorCode": "BINDING_CREATION_FAILED",
        "errorDetail": "Failed to create binding " + url
      }
  }

  return result;
}

function push(url, headers, message) {

    var body = JSON.stringify(message ? message : {});
    var response = this.apsdb.callHttp(url, "PUT", null, null, headers, null, false, body, false, false);
    if (response.status != "200" && response.status != "201") {

      throw {

          "errorCode": response.status,
          "errorDetail": "Could not push a message to the sink " + url
      }
    }

    var result = response.body ? JSON.parse(response.body) : "";
    if (result[0] != "ok") {

      throw {

          "errorCode": "PUSH_FAILED",
          "errorDetail": "Could not push a message to the sink " + url
      }
    }

  	return result;
}

function sendWarning() {
  
 	sendMail(SEND_TO, SEND_FROM, SUBJECT, BODY_HTML);
	tweet(TWITTER_KEY, TWITTER_SECRET, TWITTER_TOKEN, TWITTER_TOKEN_SECRET, "On " +  new Date() + " : " + TWEET_TEXT);
}   				   				