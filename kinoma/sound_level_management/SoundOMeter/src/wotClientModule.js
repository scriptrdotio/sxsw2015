//@module

/**
 * @class WotClient
 * @constructor WotClient
 * @param {Object} config configuration of the client 
 *	{String} config.user the name of the wot.io user
 *	{String} config.application the name of the wot.io application (one of bip.io, echo, etc.) (optional, defaults to echo)
 * 	{String} config.token the authentication token of the user on wot.io
 *	{String} config.deviceId the identifier of the current device 
 * 	{Boolean} config.autoConnect if true, the wotClient will re-create a connection if 
 *	the current connection was closed abruptly (optional, defaults to false)
 */
function WotClient(config) {
	
	var allParametersDefined = config && config.user && config.token && config.deviceId;
	if (!allParametersDefined) {
		throw {
		
			"errorCode": "Invalid_Parameter",
			"errorDetail": "All required config fields must be defined (user, token, deviceId)"
		}
	}
	
	this.user = config.user;
	this.token = config.token;
	this.application = config.application || "echo";
	this.deviceId = config.deviceId;
	this.wsConnection = null;
	this.autoConnect = config.autoConnect || false;
	
	// this is set to true when createConnection() is invoked. The purpose is the prevent the creation
	// of a new connection while one is currently being created (the process is asynchronous)
	this.connecting = false;
	
	// this is set to true when discardConnection() is invoked. It is used when autoConnect is set to true
	this.closing = false;
	
	// create an instance of URLBuilder that will provide the adequate URL to use depending on the applications
	// (i.e. echo or bipio)
	var URLBuilder = require("urlBuilderModule");
	var builderConfig = {
		user: this.user,
		application: this.application,
		token: this.token,
		deviceId: this.deviceId		
	};
	
	this.urlBuilder = new URLBuilder(builderConfig);
}

/**
 * creates and open a Web Socket connection to wot.io using the provided configuration
 * @method createConnection
 * @param {Object} statusCallback a callback function that is invoked when the status of the Web Socket connection changes
 * The statusCallback function should expect a parameter such as {"status": "the_status"}
 * @param {Object} messageCallback a callback function that is invoked upon reception of a message received on the socket connection
 */
WotClient.prototype.createConnection = function(statusCallback, messageCallback) {
	
	if (!this.connecting) {	
		
		this.connecting = true;
		var self = this;
		this.unbind(function() {
			self.connect(self, statusCallback, messageCallback);
		});	
	}
};

WotClient.prototype.connect = function(self, statusCallback, messageCallback) {

	trace("WotClient: setting up wot.io connection\n");	
	self.url = self.urlBuilder.buildUrl();
    self.wsConnection = new WebSocket(this.url);
	self.wsConnection.ready = false;
	self.wsConnection.onopen = function() { 
	
		trace("WotClient: websocket connected\n"); 
		trace("WotClient: binding is " + self.url + "\n");
		self.connecting = false;
		self.wsConnection.ready = true;
		if (statusCallback) {
			statusCallback({"status":"ready"});
		}		
	 }
		
	self.wsConnection.onerror = function(error) {
		
		trace("Error: " + error.message + "\n");
		self.connecting = false;
		if (statusCallback) {
			statusCallback({"status":"error", "error": error});
		}
	}
		
		
	self.wsConnection.onmessage = function(msg) {
	
		var data = "";
		if (msg.data) {
			data = decodeBase64(msg.data);
			trace("WotClient: received msg " + data + "\n");
			trace("WotClient: binding is " + self.url + "\n");
		}			
		
		if (messageCallback) {
			messageCallback(data);
		}
	}
		
	self.wsConnection.onclose = function(params) { 
		
		self.connecting = false;
		if (self.closing || (self.autoConnect == false)) {
		
			trace("WotClient: websocket closed\n");
			trace("WotClient: binding was " + self.url + "\n");
			self.unbind();
			if (statusCallback) {
				statusCallback({"status":"closed"});
			}
			
			self.wsConnection.ready = false;
		}else {
		
			trace("WotClient: websocket connection abruptly closed. Re-connecting...\n");
			self.unbind(function() {self.createConnection(statusCallback, messageCallback)});
		}
	}
}

/**
 * Close the current web socket connection if any
 * @method dropConnection
 */
WotClient.prototype.dropConnection = function() {

	if (this.wsConnection && this.wsConnection.ready) {
		
		this.closing = true;
		this.wsConnection.close();
	}
};

/**
 * Publish a message to the sink wrapped by the current WotClient instance
 * @method publish
 * @param {Object} msg a JSON object
 */
WotClient.prototype.publish = function(msg) {	
	
	if (this.wsConnection && this.wsConnection.ready) {
		
		var msgStr = JSON.stringify(msg);
		trace("WotClient: sending msg " + msgStr + "\n");
		trace("WotClient: binding is " + this.url + "\n");
		this.wsConnection.send(msgStr);
	}else {
	 	throw {
	 	
	 		errorCode: "Not_Connected",
	 		errorDetail: "No ready connection available yet"
	 	}
	}
};

/**
 * @method isReady
 * @return true if a web socket connection exists and is in the ready state, false otherwise
 */
WotClient.prototype.isReady = function() {
	return this.wsConnection && this.wsConnection.ready;
};

/**
 * Temporary workaround
 * @method unbind
 * @param callback
 * Issue http calls to unbind
 */
WotClient.prototype.unbind = function(callback) {
	this.httpUnbind(callback);
	//callback();	   	
};

/**
	applicationId, method, callback
*/

WotClient.prototype.httpBind = function(callback) {
	
	var config = {
	
		method: "post",
		url: this.urlBuilder.buildHttpUrl("bind"),
		callback: callback
	};
	
	this.callHttp(config);
};

WotClient.prototype.httpUnbind = function(callback) {
	
	var config = {
	
		method: "delete",
		url: this.urlBuilder.buildHttpUrl("bind"),
		callback: callback
	};
	
	this.callHttp(config);
};

WotClient.prototype.httpPush = function(message, callback) {
	
	var config = {
	
		method: "put",
		url: this.urlBuilder.buildHttpUrl("push"),
		callback: callback,
		queryStr: JSON.stringify(message)
	};
	
	this.callHttp(config);
};

WotClient.prototype.callHttp = function(httpConfig) {

	var container = new Container();
	var containerBehavior = new Behavior();
	var self = this;
	var url = httpConfig.url;
	containerBehavior.onComplete = function(container, message, data) {
		
		if (httpConfig.callback) {
			httpConfig.callback(data);			
		}
	};
	
	container.behavior = containerBehavior;
	var method = httpConfig.method ? httpConfig.method : "get";	
	if (method == "get" && httpConfig.queryStr) {		
		url += "?" + httpConfig.queryStr
	}
	
	var message = null;	
	message = new Message(url);
	message.method = method.toUpperCase();
	
	// Define specific headers according to method and authorization mode to use
	if (method == "post" || method == "put") {
		
		message.setRequestHeader("Content-Type", "text/plain");
		if (httpConfig.queryStr) {
		
			message.setRequestHeader("Content-Length", httpConfig.queryStr.length);
			message.requestText = httpConfig.queryStr;
		}
	}

	message.setRequestHeader("authorization", "bearer " +  this.token);
	trace("Authorization header: " + message.getRequestHeader("authorization") + "\n");	
	trace(url + "\n");
	try {
		container.invoke(message, Message.TEXT);
	}catch(exception) {
		
		throw {
			"errorCode": "RuntimeError",
			"errorDetail": JSON.stringify(exception)
		}	
	}
}

module.exports = WotClient;	