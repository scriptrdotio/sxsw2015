var ECHO_URL = "ws://kinoma.wot.io:8080";
var BIP_IO_URL = "ws://websocket.kinoma.wot.io";
var BIP_IO_HTTP_URL = "http://http.kinoma.wot.io";
var ECHO_HTTP_URL = "http://http.kinoma.wot.io";
var supportedApps = ["echo", "bipio"];

/**
 * This class handles the creation of URL (http and ws) for the creation of bindings between wot.io sinks and sources
 * and for pushing messages to a wot.io sink
 * @class URLBuilder
 * @constructor URLBuilder
 * @param {Object} config
 *	{String} config.user the name of the wot.io user
 *	{String} config.application the name of the wot.io application (one of apstrata, bip.io, echo) (optional, defaults to echo)
 * 	{String} config.token the authentication token of the user on wot.io
 *	{String} config.deviceId the identifier of the current device
 */ 
function URLBuilder(config) {

  var allParametersDefined = config && config.user && config.application && config.token && config.deviceId;
  if (!allParametersDefined) {
    throw {

      "errorCode": "Invalid_Parameter",
      "errorDetail": "All config fields must be defined (user, application, token, deviceId)"
    }
  }

  if (supportedApps.indexOf(config.application) == -1) {
    throw {

      "errorCode": "Invalid_Parameter",
      "errorDetail": "Unsupported application " + config.application
    }
  }

  this.config = config;
}

URLBuilder.prototype.buildUrl = function() {
  return this["buildFor" + this.config.application]();
}

URLBuilder.prototype.buildHttpUrl = function(action) {
  return this["buildHttp" + action + "For" + this.config.application]();
}

URLBuilder.prototype.buildForecho = function() {

  var source = "kinoma/" + this.config.user + "." + this.config.application + "/" + this.config.application + "/" + this.config.user + ".kinoma." + this.config.deviceId;
  var sink = this.config.user + "." + this.config.application + "/" + this.config.application;
  return ECHO_URL + "/" + source + "/" +  sink + "/" +  this.config.token;
}

URLBuilder.prototype.buildForbipio = function() {

  var source = "kinoma/" + this.config.user + "." + this.config.application + "/" + this.config.application + "/" + this.config.user + ".kinoma." + this.config.deviceId;
  var sink = this.config.application + "/" + this.config.user;
  return BIP_IO_URL + "/" + source + "/" +  sink + "/" +  this.config.token;
}

URLBuilder.prototype.buildHttpbindForecho = function() {

  var sink = "kinoma/" + this.config.user + "." + this.config.application;
  var source =  this.config.application + "/" + this.config.user + ".kinoma." + this.config.deviceId;
  return ECHO_HTTP_URL + "/" + sink + "/" +  source;
}

URLBuilder.prototype.buildHttpbindForbipio = function() {

  var sink = "kinoma/" + this.config.user + "." + this.config.application;
  var source =  this.config.application + "/" + this.config.user + ".kinoma." + this.config.deviceId;
  return BIP_IO_HTTP_URL + "/" + sink + "/" +  source;
}

URLBuilder.prototype.buildHttppushForecho = function() {

  var sink = this.config.user + "." +  this.config.application + "/" + this.config.application;
  return ECHO_HTTP_URL + "/kinoma/" +  sink;
}

URLBuilder.prototype.buildHttppushForbipio = function() {

  var sink = "kinoma/" + this.config.application + "/" + this.config.user;
  return BIP_IO_HTTP_URL + "/" + sink;
}   				