

// run findAndRepleacer method on key up event
// document.onkeyup = findAndReplace; 


// class for shorcut keys
function KeyInfo(keyCode, ctrl, alt, shift, meta, altGraph)
{
	this.keyCode  = keyCode;
	this.ctrlKey  = ctrl;
	this.altKey   = alt;
	this.shiftKey = shift;
	this.metaKey  = meta;
	this.altGraphKey = altGraph;
	
	this.equals = function (event)
	{
		return ((this.keyCode  == event.keyCode) &&
				(this.ctrlKey  == event.ctrlKey) &&
				(this.altKey   == event.altKey)  &&
				(this.shiftKey == event.shiftKey)  &&
				(this.metaKey  == event.metaKey)  &&
				(this.altGraphKey == event.altGraphKey) );		
	}
}


// constants

var KEYCODE_SPACE = 32;
var KEYCODE_ENTER = 13;

var map;

var replaceKey = new KeyInfo(KEYCODE_SPACE, true, false, false, false, false);
var replaceGlobalKey = new KeyInfo(KEYCODE_SPACE, true, false, true, false, false);


setTimeout("init()", 0);

// init extension
function init()
{
	addEventListenerToIframes();
	
	document.addEventListener("keydown", onKeyEvent, false); 
	
 	chrome.extension.sendRequest({read: "map"}, refreshMap);
	chrome.extension.onRequest.addListener(onMessage);
	
}

function onMessage(msg, sender, sendResponse)
{
	if (msg.push == "map")
	{
		refreshMap(msg.map);
		sendResponse({}); // snub them.
	}
}

function addEventListenerToIframes() 
{
	iframes = document.getElementsByTagName("iframe");
	
	for ( var i = 0; i < iframes.length; i++) 
	{
		var iframe = iframes[i];
		if(iframe.contentDocument)
			iframe.contentDocument.addEventListener("keydown", onKeyEvent, false);
		else if (iframe.contentWindow)
			iframe.contentWindow.addEventListener("keydown", onKeyEvent, false);
	}
	
	if (pageHasEditableElements()) 
	{
		chrome.extension.sendRequest({pageaction: "show"}, function(response) {});
	}
	
	setTimeout("addEventListenerToIframes()", 500);
}

function pageHasEditableElements() {
	var elemInput = document.getElementsByTagName("input");
	var elemTextarea = document.getElementsByTagName("textarea");
	if (checkElements(elemInput) || elemTextarea.length > 0 ) {
		return true;
	} else {
		return false;
	}
}

function checkElements(elem) {
	for(var i = 0; i < elem.length; i++) {
		var type = elem[i].type;
		type.toLocaleLowerCase();
		if ((type == "text") || (type == "password") || (type == "textarea")) {
			return true;
		}
	}
	return false;
}

// trigger replaceKeysWithValues method on key event space or enter
function onKeyEvent(e)
{
 	if ( replaceKey.equals(e) )
	{
		var element = e.srcElement;

		checkElements(element);
		
		// consume event
		e.returnValue=false;
		
		// TODO only if something was replaced
		chrome.extension.sendRequest({pageaction: "notify"}, function(response) {});
 	}
}

function extractKeyWord(element)
{
	var result = new Object()
	result.before = "";
	result.after  = "";
	result.key = "";
	
	var s = element.selectionStart;
	var e = element.selectionEnd;
	var word;

	// if nothing is selected find word boundaries
	if(s==e)
	{
		// string b(efore) and a(fter) cursor
		var b = element.value.substring(0,s);
		var a = element.value.substring(e);
	
		var rb = b.match(/\S*$/);
		var ra = a.match(/^\S*/);
		
		s -= rb[0].length;
		e += ra[0].length;
	}
	

	result.before = element.value.substring(0,s);
	result.key    = element.value.substring(s,e);
	result.after  = element.value.substring(e);
	
	return result;
}


//replaces the keys with the assigned values in the element.
function checkElements(element)
{
	if( (element.tagName=="INPUT" && ((element.type == "text") || (element.type == "password"))) || element.tagName=="TEXTAREA")
	{
		var r = extractKeyWord(element);
		var value = map.get(r.key);
		
		if(value)
		{
			// date subsitution
			value = replaceDates(value);
			
			var tmp = r.before + value;
			
			var cursor = tmp.length;
			element.value = tmp + r.after;
			
			element.selectionStart = r.before.length;
			element.selectionEnd = cursor
		}
	}
	else if (element.tagName=="BODY" && element.contentEditable)
	{	
		element.innerHTML = globalReplacer(element.innerHTML);		
	}
	else if (element.tagName=="HTML" && element.isContentEditable)
	{	
		var body = element.getElementsByTagName("body")[0];
		body.innerHTML = globalReplacer(body.innerHTML);		body.focus();		
	}
}


// global replacer
function globalReplacer(value) {
	for(var j = 0; j++ < map.size; map.next()) { // check all keys
		value = value.replace(new RegExp("\\b"+map.key()+"\\b", "g"),  map.value());
		value = replaceDates(value);
	}
	return value;
}

function refreshMap(response)
{
	console.log("refreshMap");
	
	var a = JSON.parse(response);
	
	map = new Map;
	
	for (var i = 0; (i+1) < a.length; i+=2)
	{
		map.put(a[i], a[i+1]);
	}
}
