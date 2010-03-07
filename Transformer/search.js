// TODO remove JUST FOR DEV - START
// includes all necessary java script files for the extension
function include(file) {
	 var script  = document.createElement('script');
	 script.src  = file;
	 script.type = 'text/javascript';
	 script.defer = true;
	 document.getElementsByTagName('head').item(0).appendChild(script);
}

// include java script files
include('./hashmap.js');
//TODO remove JUST FOR DEV - END

// run findAndRepleacer method on key up event
document.onkeyup = findAndReplace; 

// constants
var DELIMITER = '!';
var KEYCODE_SHIFT = 32;
var KEYCODE_ENTER = 13;
var INPUT_TYPE_TEXT = "text";
var INPUT_TYPE_PASSWORD = "password";
var INPUT_TYPE_TEXTAREA = "textarea";

// init extension
function init() {
	// TODO show icon in omnimbar
}

// trigger replaceKeysWithValues method on key event shift or enter
function findAndReplace() {
	var keyId = event.keyCode;
	switch(keyId) {
		case KEYCODE_SHIFT:
			replaceKeysWithValues();
			break;
		case KEYCODE_ENTER:
			replaceKeysWithValues();
			break;
	}
}

// find input types text and text area
function replaceKeysWithValues() {
	var elem = document.getElementsByTagName("input");
	alert("input elements:" + elem.length);
	replace(elem);
	var elem = document.getElementsByTagName("textarea");
	alert("textarea elements:" + elem.length);
	replace(elem);
}

//replaces the keys with the assigned values in the element.
function replace(elem) {
	for(var i = 0; i < elem.length; i++) { // check all elements
		var type = elem[i].type;
		if ((type == INPUT_TYPE_TEXT) || (type = INPUT_TYPE_PASSWORD) || (type = INPUT_TYPE_TEXTAREA)){
			var id = elem[i].id;
			var map = getHashMap();
			for(var j = 0; j++ < map.size; map.next()) { // check all keys
				var value = document.getElementById(id).value;
				document.getElementById(id).value = value.replace(map.key(),  map.value());
			}
		}
	}
}

// get hash map for key -> value transformation
function getHashMap() {
	var map = new Map;
	map
		.put(DELIMITER + 'mp', 'Max Power')
		.put(DELIMITER + 'mfg', 'Mit freundlichen Grüßen')
		.put(DELIMITER + 'hp', 'Sehr geehrter Herr Prof. Dr.');
	return map;
}