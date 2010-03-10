

// run findAndRepleacer method on key up event
document.onkeyup = findAndReplace; 

// constants
var DELIMITER = '!';
var KEYCODE_SPACE = 32;
var KEYCODE_ENTER = 13;
var INPUT_TYPE_TEXT = "text";
var INPUT_TYPE_PASSWORD = "password";
var INPUT_TYPE_TEXTAREA = "textarea";
var map;

var elemInput = document.getElementsByTagName("input");
var elemTextarea = document.getElementsByTagName("textarea");

// init extension
function init() {
	if (pageHasEditableElements()) {
		chrome.extension.sendRequest({}, function(response) {});
	}
}

function pageHasEditableElements() {
	if (checkElements(elemInput) || checkElements(elemTextarea)) {
		return true;
	} else {
		return false;
	}
}

function checkElements(elem) {
	for(var i = 0; i < elem.length; i++) {
		var type = elem[i].type;
		if ((type == INPUT_TYPE_TEXT) || (type = INPUT_TYPE_PASSWORD) || (type = INPUT_TYPE_TEXTAREA)) {
			return true;
		}
	}
	return false;
}

// trigger replaceKeysWithValues method on key event space or enter
function findAndReplace()
 {
 	chrome.extension.sendRequest({read: "map"}, refreshMap);
 	var e = window.event;
 	if (e.ctrlKey && (e.keyCode == KEYCODE_SPACE)) {
		replaceKeysWithValues();
 	}
}

// find input types text and text area
function replaceKeysWithValues() {
	replace(elemInput);
	replace(elemTextarea);
}

//replaces the keys with the assigned values in the element.
function replace(elem) {
	for(var i = 0; i < elem.length; i++) { // check all elements
		var e = elem[i];
		var type = e.type;
		if ((type == INPUT_TYPE_TEXT) || (type = INPUT_TYPE_PASSWORD) || (type = INPUT_TYPE_TEXTAREA)) {
			for(var j = 0; j++ < map.size; map.next()) { // check all keys
				// TODO just replace focused phrase 
				e.value = e.value.replace(map.key(),  map.value());
			}
		}
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

 setTimeout("init()",0);
