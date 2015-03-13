//@module
/*
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

// scriptr.io parameters
var SCRIPT_URL = "https://api.scriptr.io/sendNotification?apsws.responseType=json"; // The URL of the scriptr.io script  
var TOKEN = ""; // Replace with your scriptr.io auth token

var THEME = require('themes/flat/theme');
var BUTTONS = require('controls/buttons');

var background = Container( {}, { left: 0, right: 0, top: 0, bottom: 0, skin: THEME.whiteSkin } );

var myLabeledButton = BUTTONS.LabeledButton( { name : "Send" }, { 
	width: 90, left: 50, top: 160, height: 30,
	behavior: BUTTONS.LabeledButtonBehavior({
		onTap: function(button) {
			
			trace("Asking scriptr.io to send a notification through " +  myRadioGroup.behavior.data.selected);
			
			var container = new Container();
		    var containerBehavior = new Behavior();
		    containerBehavior.onComplete = function(container, message, data) {
		     	trace("Response from scriptr.io " + data + "\n");
		    };
		        
		    container.behavior = containerBehavior;
	       	
	       	// Send the audio peaks to scriptr.io for processing using a Kinoma Message instance
	        var message = new Message(SCRIPT_URL);
	        message.method = "POST";
	        message.requestText =  "channel=" + myRadioGroup.behavior.data.selected + "&apsws.time=" + new Date().getTime();
	        message.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	        message.setRequestHeader("Content-Length", message.requestText.length);
	        message.setRequestHeader("Authorization", "bearer " + TOKEN);
	        container.invoke(message, Message.TEXT); 			
		}
	})
});

var myRadioGroup = BUTTONS.RadioGroup( { buttonNames : "tweet,email,push", selected : "tweet" }, { 
	top: 50, left: 20, width: 120,
	behavior: BUTTONS.RadioGroupBehavior({
		onRadioGroupButtonSelected: function(group, buttonName) {
		
			myRadioGroup.behavior.data.selected = buttonName;
			trace("You selected to send through " + buttonName  + "\n");
		}
	})
});


application.add( background );

application.add( myLabeledButton );
application.add( myRadioGroup );
