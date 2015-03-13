//@program

var SENSITIVITY = 16;
var SIGNIFICANT_LEVEL = 1000; // this is used to limit the number of requests sent to scriptr.io 

// scriptr.io parameters
var SCRIPT_URL = "https://api.scriptr.io/soundLevelManagement?apsws.responseType=json"; // The URL of the scriptr.io script
var TOKEN = ""; // Replace with your scriptr.io auth token or anonymous token (in that latter case make sure to allow anonymous calls on the script

Handler.bind("/gotAudio", {
	onInvoke: function(handler, message) {
        var response = message.requestObject;
        var power = response.rms;
        var power = response.rms * SENSITIVITY;

        power = Math.min(power, 32767);
        var gray = Math.round(power / 256).toString(16);
        if (gray.length < 2) gray = "0" + gray;
        application.skin = new Skin({fill: "#" + gray + gray + gray});

        model.data.labels.average.string = "Average: " + response.average;
        model.data.labels.peak.string = "Peak: " + response.peak;
        model.data.labels.rms.string = "RMS: " + response.rms;
        model.data.labels.count.string = "Samples: " + response.count;
        
        /* 
         * Invocation of scriptr.io 
         */
          
        // We voluntarily limit the number of invocations to our scriptr.io script to sound peaks > 4000
        if (response.average > SIGNIFICANT_LEVEL || application.behavior.wasAboveLimit) {
        	
        	application.behavior.wasAboveLimit = response.average > SIGNIFICANT_LEVEL;
        	
	        // Create a scriptr.io invocation handler using a Kinoma container
	      	var container = new Container();
		    var containerBehavior = new Behavior();
		    containerBehavior.onComplete = function(container, message, data) {
		     	trace("Response from scriptr.io " + data);
		    };
		        
		    container.behavior = containerBehavior;
	       	
	       	// Send the audio peaks to scriptr.io for processing using a Kinoma Message instance
	        var message = new Message(SCRIPT_URL);
	        message.method = "POST";
	        message.requestText =  "soundLevel=" + response.average + "&apsws.time=" + new Date().getTime();
	        message.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	        message.setRequestHeader("Content-Length", message.requestText.length);
	        message.setRequestHeader("Authorization", "bearer " +  TOKEN);
	        container.invoke(message, Message.TEXT);   
        }   
        
        /*
         * Done invoking scriptr.io and handling its response
         */  
	}
});

var model = application.behavior = Object.create(Object.prototype, {
	onLaunch: { value: function(application) {
        application.invoke(new MessageWithObject("pins:configure", {
           microphone: {
               require: "audioin",
               pins: {
                    audio: {sampleRate: 8000, channels: 1}
               }
            }}));
        application.invoke(new MessageWithObject("pins:/microphone/read?repeat=on&timer=audio&callback=/gotAudio"));

        this.data = { labels: {} };

        application.skin = new Skin({fill: "#76b321"});
        var style = new Style({ font:"bold 34px", color:"white", horizontal:"left", vertical:"middle" });
        application.add(model.data.labels.rms = new Label({left: 30, right: 0, top: 0, height: 60, style: style}));
        application.add(model.data.labels.peak = new Label({left: 30, right: 0, top: 60, height: 60, style: style}));
        application.add(model.data.labels.average = new Label({left: 30, right: 0, top: 120, height: 60, style: style}));
        application.add(model.data.labels.count = new Label({left: 30, right: 0, top: 180, height: 60, style: style}));
        
        // scriptr.io
        application.behavior.wasAboveLimit = false;
    }}
});
