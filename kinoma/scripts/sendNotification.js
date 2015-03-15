/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
var http = require("http");
var log = require("log");

function getWeather(location) {
 return {temperature: 23, humidity: 70, main: "cloudy"};
  var weatherService = "http://api.openweathermap.org/data/2.5/weather?q=" + encodeURIComponent(location);
  var callResult = http.request({"url":weatherService});

  if (callResult && callResult.body) {
	  var weatherInfo = JSON.parse(callResult.body);
      return  {

        temperature: weatherInfo.main.temp,
        humidity: weatherInfo.main.humidity,
        main: weatherInfo.weather[0].main
      }
  } else {
    return null;
  }
}

function buildMessageContent(jsonContent) {
  
  var weatherInfo = JSON.stringify(jsonContent);
  var lastLocation = storage.global.lastCity;
  var location = storage.global.city;
  var content = "";
  console.log(location);
  if (location) {
    content = content + location + " on " + new Date() + ": " + weatherInfo;
  }
  
  if (lastLocation) {
    content = content + ". \nLast requested location: " + lastLocation + ". ";
  }
  
  return content;
}

try {
  //channel can be one of email, tweet, push
  var channel = request.parameters.channel;

  var location = storage.global.city;
  var weatherInfo = getWeather(location);

  if (!weatherInfo) {
    return {"status": "failure", "errorDetail": "Unable to contact weather API in a timely manner. Please try again."}
  }
  var message = buildMessageContent(weatherInfo);

  // log to the console the message to be sent
  console.log("Message to be sent: " + message);
  console.log("Message length: " + message.length);

  // add to the script logs the message to be sent
  log.setLevel("info");
  log.info("Message to be sent: " + message);

  switch(channel) {
    case "email":
      sendMail("rabih@scriptr.io", "demo@scriptr.io", "Weather Info", message);
      break;
    case "tweet":
      var TWITTER_KEY = "";
      var TWITTER_SECRET = "";
      var TWITTER_TOKEN = "";
      var TWITTER_TOKEN_SECRET = ""; 
      tweet(TWITTER_KEY, TWITTER_SECRET, TWITTER_TOKEN, TWITTER_TOKEN_SECRET, message);
      break;
    case "push":
      var gcmToken = storage.global.gcmToken;
      message = '{"Content":' +  JSON.stringify(message) + '}';
      push([gcmToken], message , "android"); 	
      break;
  }

  return {"status": "success"};   				   				
} catch(e) {
  return {"status": "failure", "errorDetail": "An unexpected error occurred. Please try again."}
}
   				   				   				   				   				   				   							
