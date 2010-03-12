

// run findAndRepleacer method on key up event
// document.onkeyup = findAndReplace; 

// constants
var DELIMITER = '!';
var KEYCODE_SPACE = 32;
var KEYCODE_ENTER = 13;
var INPUT_TYPE_TEXT = "text";
var INPUT_TYPE_PASSWORD = "password";
var INPUT_TYPE_TEXTAREA = "textarea";
var map;

// init extension
function init()
{

	addEventListenerToIframes(document.getElementsByTagName("iframe"));
	
	document.addEventListener("keydown", findAndReplace, false); 
	
 	chrome.extension.sendRequest({read: "map"}, refreshMap);
	
	if (pageHasEditableElements()) 
	{
		chrome.extension.sendRequest({pageaction: "show"}, function(response) {});
	}
}

function addEventListenerToIframes(iframes) 
{
	for ( var i = 0; i < iframes.length; i++) 
	{
		var iframe = iframes[i];
		(iframe.contentWindow || iframe.contentDocument).addEventListener("keydown", findAndReplace, false);
	}
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
		if ((type == INPUT_TYPE_TEXT) || (type == INPUT_TYPE_PASSWORD) || (type == INPUT_TYPE_TEXTAREA)) {
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
		replaceKeysWithValues(element);
 	}
}

//replaces the keys with the assigned values in the element.
function replaceKeysWithValues(element)
{
	if(element.tagName=="INPUT")
	{
		var type = element.type;

		if ((type == INPUT_TYPE_TEXT) || (type == INPUT_TYPE_PASSWORD) || (type == INPUT_TYPE_TEXTAREA) ) {
			for(var j = 0; j++ < map.size; map.next()) { // check all keys
				element.value = element.value.replace(new RegExp("\\b"+map.key()+"\\b", "g"),  map.value());
			}
		}
	}
	else if (element.tagName=="BODY" && element.contentEditable)
	{	
		for(var j = 0; j++ < map.size; map.next()) { // check all keys
			element.innerHTML = element.innerHTML.replace(new RegExp("\\b"+map.key()+"\\b", "g"),  map.value());
		}
		
	} else 
	{
		console.warn("nothing replaced " + element.innerHTML);
	}
}

function refreshMap(response)
{
	var a = JSON.parse(response);
	
	map = new Map;
	
	for (var i = 0; (i+1) < a.length; i+=2)
	{
		map.put(a[i], a[i+1]);
	}
}

 setTimeout("init()", 1000);
