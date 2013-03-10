//var settings = new Settings();
var replaceKey = new KeyInfo();

function localizeString(elementname, text) {
	var el = document.getElementsByName(elementname);
	for (var i = 0; i < el.length; i++) {
		el[i].innerHTML = text;
	}
}

function localize(elementname, messageid) {
	localizeString(elementname, chrome.i18n.getMessage(messageid));
}

// Inits Strings (i18n) and restores data
function init() {
	document.title = chrome.i18n.getMessage("extname") + " - " + chrome.i18n.getMessage("options");

	localizeString("caption", document.title);

	localize("save", "save");
	localize("export", "export");
	localize("import", "import");
	localize("restore", "restore");
	localize("add", "option_add");
	localize("delete", "option_del");

	localize("guide", "guide");
	localize("abbr", "abbr");
	localize("long", "long");
	localize("texttab", "texttab");
	localize("settingstab", "settingstab");
	localize("helptab", "helptab");
	localize("changelogtab", "changelogtab");
	localize("changelog", "changelog_text");

	localize("hideicon", "hideicon");
	localize("anim", "anim");
	localize("sound", "sound");
	localize("selectphrase", "selectphrase");

	localize("editshortcut", "option_shortcut_edit");
	localize("deleteshortcut", "option_shortcut_delete");
	localize("expandshortcut", "option_shortcut_expand");

	restore_options();

	//		document.getElementById("hiddenExpandShortcut").value = shortcuts.copy;
	//		document.getElementById("spanExpandShortcut").innerText = getStringByShortcutCode(shortcuts.copy);

}


function onKeyDownEvent(event) {
	// prevent spaces
	if (event.keyCode == 32) event.preventDefault();
}

function removeWhitespaces(str) {
	str = str.replace(/\s/g, "");
}

function onInputChange(event) {
	event.srcElement.value = event.srcElement.value.replace(/\s/g, "");
	// removeWhitespaces( event.srcElement.value );
}

function add(e) {
	var subs = $("#subs");
	var line = createSubLine("", "");
	subs.prepend(line);
}

function del(e) {
	var row = e.srcElement.parentElement.parentElement;

	row.outerHTML = "";
}


function export_settings(e) {
	window.alert(localStorage["map"].toString());
}

function import_settings(e) {
	try {
		var importData = window.prompt("paste your data below (see export for examples)");
		if (importData.length == 0) {
			window.alert("Nothing to import");
		} else {
			JSON.parse(importData);
			localStorage["map"] = importData;
			restore_options();
		}
	} catch (e) {
		window.alert("Your import data is invalid.\nWe are keeping old abbreviations.\ndata:\n" + importData + "\n" + e);
	}
}


// Saves options to localStorage.
function save_options(e) {
	$("#saving").html(chrome.i18n.getMessage("saving"));

	$.Watermark.HideAll();

	var lines = $("#subs .sub_line");

	var a = new Array();

	for (var i = 0; i < lines.length; i++) {
		var key = $(".sub_key", lines[i])[0].value;
		var value = $(".expand50-1000", lines[i])[0].value;

		if (key != "" || value != "") {
			a.push(key);
			a.push(value);
		}
	}
	if (keysUnique(a)) {

		localStorage["map"] = JSON.stringify(a);

		$.Watermark.ShowAll();

		localStorage["hideicon"] = $("#checkbox_hideicon").attr('checked');
		localStorage["animate"] = $("#checkbox_animate").attr('checked');
		localStorage["sound"] = $("#checkbox_sound").attr('checked');
		localStorage["selectphrase"] = $("#checkbox_selectphrase").attr('checked');

		localStorage["replacekey"] = replaceKey.toStore();


		chrome.extension.getBackgroundPage().broadcastSettings();

		setTimeout(function() {
			$("#saving").html("")
		}, 750);
		restore_options();

	} else {
		setKeyErrorColors(a);
		$("#saving").html(chrome.i18n.getMessage("keys_not_unique"));
	}
}

function keysUnique(a) {
	for (var i = 0; i < a.length; i += 2) {
		for (var j = 0; j < a.length; j += 2) {
			if (i != j && a[i] == a[j]) return false;
		}
	}
	return true;
}

function setKeyErrorColors(a) {
	var lines = $("#subs .sub_line");
	for (var i = 0; i < lines.length; i++) {
		var key = $(".sub_key", lines[i])[0].value;
		if (!isKeyUnique(a, key)) {
			$(".sub_key", lines[i]).addClass("bg_key_error");
		} else {
			$(".sub_key", lines[i]).removeClass("bg_key_error");
		}
	}
}

function isKeyUnique(a, key) {
	var counter = 0;
	for (var i = 0; i < a.length; i += 2) {
		if (a[i] == key) {
			counter++;
		}
	}
	return (counter <= 1) ? true : false;
}

function createSubLine(key, value) {
	var line = $("#subs .sub_line_template").clone();
	line.removeClass("sub_line_template").addClass("sub_line");

	$(".sub_key", line).val(key);
	$(".sub_key", line).Watermark(chrome.i18n.getMessage("abbr"));
	$(".sub_key", line).keydown(onKeyDownEvent);
	$(".sub_key", line).change(onInputChange);

	$(".expand50-1000", line).val(value);
	$(".expand50-1000", line).Watermark(chrome.i18n.getMessage("long"));
	$(".del_button. button", line).click(del);
	return line;
}

// Restores select box state to saved value from localStorage.
function restore_options(e) {
	$("#subs .sub_line").remove();

	var map = chrome.extension.getBackgroundPage().getHashMap();

	var subs = $("#subs");
	var a = new Array();
	for (var j = 0; j++ < map.size; map.next()) {
		a.push(map.key());
	}
	var keyArray = a.sort();
	for (var k = 0; k < keyArray.length; k++) {
		var line = createSubLine(a[k], map.get(a[k]));
		subs.append(line);
	}

	$("#checkbox_hideicon").attr('checked', localStorage["hideicon"] == "true");
	$("#checkbox_animate").attr('checked', localStorage["animate"] == "true");
	$("#checkbox_sound").attr('checked', localStorage["sound"] == "true");
	$("#checkbox_selectphrase").attr('checked', localStorage["selectphrase"] == "true");

	if (localStorage["replacekey"]) {
		replaceKey.fromStore(localStorage["replacekey"]);
	} else {
		replaceKey = new KeyInfo(32, true, false, false, false, false);
	}

	document.getElementById('spanExpandShortcut').innerText = replaceKey.toString();


	add();
}

function onKeyDown(e) {
	// ctrl-s
	if (e.ctrlKey && e.keyCode == 83) {
		save_options();
		e.returnValue = false;
	}
}

var current_keylearner;

function keyUpEventListener(e) {
	replaceKey.fromEvent(e);

	document.getElementById('spanExpandShortcut').innerText = replaceKey.toString();

	document.removeEventListener('keyup', keyUpEventListener);

	//save();
}

function createShortcut(e) {
	current_keylearner = e.srcElement;

	document.addEventListener('keyup', keyUpEventListener);
	e.srcElement.innerText = chrome.i18n.getMessage("option_shortcut_press");
}

function deleteShortcut(e) {
	e.srcElement.innerText = "";

	replaceKey = null;

}

document.addEventListener("keydown", onKeyDown, false);

// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', function() {
	init();
	document.querySelector('button[name=export]').addEventListener('click', export_settings);
	document.querySelector('button[name=import]').addEventListener('click', import_settings);
	document.querySelector('button[name=add]').addEventListener('click', add);
//	NOTE: See createSubLine(key, value) for delete button event listener setup.
//	document.querySelector('button[name=delete]').addEventListener('click', del);
	document.querySelector('span[name=editshortcut]').addEventListener('click', createShortcut);
	document.querySelector('span[name=deleteshortcut]').addEventListener('click', deleteShortcut);
	document.querySelector('button[name=save]').addEventListener('click', save_options);
	//  document.querySelector('button').addEventListener('click', clickHandler);
	//  main();
});