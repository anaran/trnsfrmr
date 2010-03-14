

// run findAndRepleacer method on key up event
// document.onkeyup = findAndReplace; 

// constants
var DELIMITER = '!';
var KEYCODE_SPACE = 32;
var KEYCODE_ENTER = 13;
var map;

setTimeout("init()", 0);

// init extension
function init()
{

	addEventListenerToIframes();
	
	document.addEventListener("keydown", findAndReplace, false); 
	
 	chrome.extension.sendRequest({read: "map"}, refreshMap);
	chrome.extension.onRequest.addListener(onRequest);
	
}

function onRequest(request, sender, sendResponse)
{
	if (request.push == "map")
	{
		refreshMap(request.map);
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
			iframe.contentDocument.addEventListener("keydown", findAndReplace, false);
		else if (iframe.contentWindow)
			iframe.contentWindow.addEventListener("keydown", findAndReplace, false);
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
function findAndReplace()
{
	console.warn("key event");
 	var e = window.event;		
	var element = e.srcElement;
	
 	if (e.ctrlKey && (e.keyCode == KEYCODE_SPACE)) {
		checkElements(element);
		e.returnValue=false;
		
		chrome.extension.sendRequest({pageaction: "notify"}, function(response) {});
 	}
}

//replaces the keys with the assigned values in the element.
function checkElements(element)
{
	if(element.tagName=="INPUT")
	{
		var type = element.type;

		if ((type == INPUT_TYPE_TEXT) || (type == INPUT_TYPE_PASSWORD) ) {
			element.value = replacer(element.value);
		}
	}
	else if (element.tagName=="TEXTAREA")
	{
		element.value = replacer(element.value);
	}
	else if (element.tagName=="BODY" && element.contentEditable)
	{	
		element.innerHTML = replacer(element.innerHTML);		
	}
	else if (element.tagName=="HTML" && element.isContentEditable)
	{	
		var body = element.getElementsByTagName("body")[0];
		body.innerHTML = replacer(body.innerHTML);		body.focus();		
	}
}

function replacer(value) {
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
