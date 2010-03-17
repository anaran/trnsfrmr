

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
function findAndReplace(e)
{
	var element = e.srcElement;
	
 	if (e.ctrlKey && (e.keyCode == KEYCODE_SPACE)) {
		checkElements(element);
		e.returnValue=false;
		
		chrome.extension.sendRequest({pageaction: "notify"}, function(response) {});
 	}
}

function findKeyWord(element)
{
	var result = new Object()
	result.before = "";
	result.after  = "";
	result.key = "";
	
	var s = element.selectionStart;
	var e = element.selectionEnd;
	var word;

	// find word boundaries
	if(s==e)
	{
		var b = element.value.substring(0,s);
		var a = element.value.substring(e);
	
		var rb = b.match(/\w*$/);
		var ra = a.match(/^\w*/);
		
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
		var r = findKeyWord(element);
		var value = map.get(r.key);
		
		if(value)
			element.value = r.before + value + r.after;
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
