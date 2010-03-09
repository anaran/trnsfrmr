

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

// init extension
function init() {
	// TODO show icon in omnimbar
	
	
}

// trigger replaceKeysWithValues method on key event space or enter
function findAndReplace()
 {
 
	chrome.extension.sendRequest({read: "map"}, refreshMap);
	var keyId = event.keyCode;
	switch(keyId) {
		case KEYCODE_SPACE:
			replaceKeysWithValues();
			break;
		case KEYCODE_ENTER:
			replaceKeysWithValues();
			break;
	}
}

// find input types text and text area
function replaceKeysWithValues()
{
	var elem = document.getElementsByTagName("input");
	replace(elem);
	
	var elem = document.getElementsByTagName("textarea");
	replace(elem);
}

//replaces the keys with the assigned values in the element.
function replace(elem) {
	for(var i = 0; i < elem.length; i++) { // check all elements
		var type = elem[i].type;
		if ((type == INPUT_TYPE_TEXT) || (type = INPUT_TYPE_PASSWORD) || (type = INPUT_TYPE_TEXTAREA)){
			var id = elem[i].id;
			
			for(var j = 0; j++ < map.size; map.next()) { // check all keys
				var value = document.getElementById(id).value;
				document.getElementById(id).value = value.replace(map.key(),  map.value());
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
		map.put(a[i], a[i+1])	
	}
}

 setTimeout("init()",0);
