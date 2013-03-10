/*jslint browser: true, devel: true, todo: false */
/*global window: false, chrome: false, localStorage: false, $: false, KeyInfo: false */
	"use strict"; //$NON-NLS-0$
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

function onKeyDownEvent(event) {
	// prevent spaces
	if (event.keyCode === 32) {
		event.preventDefault();
	}
}

function removeWhitespaces(str) {
	str = str.replace(/\s/g, "");
}

function onInputChange(event) {
	event.srcElement.value = event.srcElement.value.replace(/\s/g, "");
	// removeWhitespaces( event.srcElement.value );
}

function keysUnique(a) {
	for (var i = 0; i < a.length; i += 2) {
		for (var j = 0; j < a.length; j += 2) {
			if (i !== j && a[i] === a[j]) {
				return false;
			}
		}
	}
	return true;
}

function isKeyUnique(a, key) {
	var counter = 0;
	for (var i = 0; i < a.length; i += 2) {
		if (a[i] === key) {
			counter++;
		}
	}
	return (counter <= 1) ? true : false;
}

function del(event) {
	var row = event.srcElement.parentElement.parentElement;

	row.outerHTML = "";
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

function add(event) {
	var subs = $("#subs");
	var line = createSubLine("", "");
	subs.prepend(line);
}

// Restores select box state to saved value from localStorage.
function restore_options(event) {
	$("#subs .sub_line").remove();

	var map = chrome.extension.getBackgroundPage().getHashMap();

	var subs = $("#subs");
	var a = [];
	for (var j = 0; j++ < map.size; map.next()) {
		a.push(map.key());
	}
	var keyArray = a.sort();
	for (var k = 0; k < keyArray.length; k++) {
		var line = createSubLine(a[k], map.get(a[k]));
		subs.append(line);
	}

	$("#checkbox_hideicon").attr('checked', localStorage.hideicon === "true");
	$("#checkbox_animate").attr('checked', localStorage.animate === "true");
	$("#checkbox_sound").attr('checked', localStorage.sound === "true");
	$("#checkbox_selectphrase").attr('checked', localStorage.selectphrase === "true");

	if (localStorage.replacekey) {
		replaceKey.fromStore(localStorage.replacekey);
	} else {
		replaceKey = new KeyInfo(32, true, false, false, false, false);
	}

	document.getElementById('spanExpandShortcut').innerText = replaceKey.toString();


	add();
}

var current_keylearner;

function keyUpEventListener(event) {
	replaceKey.fromEvent(event);

	document.getElementById('spanExpandShortcut').innerText = replaceKey.toString();

	document.removeEventListener('keyup', keyUpEventListener);

	//save();
}

function createShortcut(event) {
	current_keylearner = event.srcElement;

	document.addEventListener('keyup', keyUpEventListener);
	event.srcElement.innerText = chrome.i18n.getMessage("option_shortcut_press");
}

function deleteShortcut(event) {
	event.srcElement.innerText = "";

	replaceKey = null;

}

function setKeyErrorColors(a) {
	var lines = $("#subs .sub_line");
	for (var i = 0; i < lines.length; i++) {
		var key = $(".sub_key", lines[i])[0].value;
		if (!isKeyUnique(a, key)) {
			$(".sub_key", lines[i]).addClass("bg_key_error"); //$NON-NLS-0$ //$NON-NLS-1$
		} else {
			$(".sub_key", lines[i]).removeClass("bg_key_error"); //$NON-NLS-0$ //$NON-NLS-1$
		}
	}
}

function export_settings(event) {
	window.alert(localStorage.map.toString());
}

function import_settings(event) {
	var importData;
	var importMap;
	var importArray;
	var newAbbreviations = [];
	var changedAbbreviations = [];
	var mapArray = JSON.parse(localStorage.map);
	try {
		importData = window.prompt("paste your data below (see export for examples)");
		if (importData === null) {} else {
			if (importData.length === 0) {
				window.alert("Nothing to import");
			} else {
				importArray = JSON.parse(importData);
				importMap = new Map();
				var map = chrome.extension.getBackgroundPage().getHashMap();
				for (var i = 0;
				(i + 1) < importArray.length; i += 2) {
					if (map.get(importArray[i]) === undefined) {
						importMap.put(importArray[i], importArray[i + 1]);
						newAbbreviations.push(importArray[i]);
					} else if (map.get(importArray[i]) !== importArray[i + 1]) {
						importMap.put(importArray[i], importArray[i + 1]);
						changedAbbreviations.push(importArray[i]);
					}
				}
				if (newAbbreviations.length > 0) {}
				if (changedAbbreviations.length > 0) {
					if (!window.confirm("Following abbreviations will be replaced by newly imported definitions (no undo):\n" + changedAbbreviations.toString())) {
						changedAbbreviations.forEach(function(value, index, object) {
							importMap.remove(value);
						});
						window.alert("Changes to following abbreviations were not imported:\n" + changedAbbreviations.toString());
					}
				}
				for (var j = 0; j++ < importMap.size; importMap.next()) {
					mapArray.push(importMap.key());
					mapArray.push(importMap.value());
				}
				localStorage.map = JSON.stringify(mapArray);
				restore_options();
			}
		}
	} catch (e) {
		window.alert("Your import data is invalid.\nWe are keeping old abbreviations.\ndata:\n" + importData + "\n" + e);
	}
}

// Saves options to localStorage.
function save_options(event) {
	$("#saving").html(chrome.i18n.getMessage("saving")); //$NON-NLS-0$ //$NON-NLS-1$

	$.Watermark.HideAll();

	var lines = $("#subs .sub_line"); //$NON-NLS-0$ //$NON-NLS-1$

	var a = [];

	for (var i = 0; i < lines.length; i++) {
		var key = $(".sub_key", lines[i])[0].value; //$NON-NLS-0$ //$NON-NLS-1$
		var value = $(".expand50-1000", lines[i])[0].value; //$NON-NLS-0$

		if (key !== "" || value !== "") { //$NON-NLS-0$ //$NON-NLS-1$
			a.push(key);
			a.push(value);
		}
	}
	if (keysUnique(a)) {

		localStorage.map = JSON.stringify(a);

		$.Watermark.ShowAll();

		localStorage.hideicon = $("#checkbox_hideicon").attr('checked'); //$NON-NLS-0$ //$NON-NLS-1$
		localStorage.animate = $("#checkbox_animate").attr('checked'); //$NON-NLS-0$ //$NON-NLS-1$
		localStorage.sound = $("#checkbox_sound").attr('checked'); //$NON-NLS-0$ //$NON-NLS-1$
		localStorage.selectphrase = $("#checkbox_selectphrase").attr('checked'); //$NON-NLS-0$ //$NON-NLS-1$

		localStorage.replacekey = replaceKey.toStore();


		chrome.extension.getBackgroundPage().broadcastSettings();

		setTimeout(function() {
			$("#saving").html(""); //$NON-NLS-0$ //$NON-NLS-1$
		}, 750);
		restore_options();

	} else {
		setKeyErrorColors(a);
		$("#saving").html(chrome.i18n.getMessage("keys_not_unique")); //$NON-NLS-0$ //$NON-NLS-1$
	}
}

function onKeyDown(event) {
	// ctrl-s
	if (event.ctrlKey && event.keyCode === 83) {
		save_options();
		event.returnValue = false;
	}
}

// Inits Strings (i18n) and restores data
function init() {
	document.title = chrome.i18n.getMessage("extname") + " - " + chrome.i18n.getMessage("options"); //$NON-NLS-0$ //$NON-NLS-1$ //$NON-NLS-2$

	localizeString("caption", document.title); //$NON-NLS-0$

	localize("save", "save"); //$NON-NLS-0$ //$NON-NLS-1$
	localize("export", "export"); //$NON-NLS-0$ //$NON-NLS-1$
	localize("import", "import"); //$NON-NLS-0$ //$NON-NLS-1$
	localize("restore", "restore"); //$NON-NLS-0$ //$NON-NLS-1$
	localize("add", "option_add"); //$NON-NLS-0$ //$NON-NLS-1$
	localize("delete", "option_del"); //$NON-NLS-0$ //$NON-NLS-1$

	localize("guide", "guide"); //$NON-NLS-0$ //$NON-NLS-1$
	localize("abbr", "abbr"); //$NON-NLS-0$ //$NON-NLS-1$
	localize("long", "long"); //$NON-NLS-0$ //$NON-NLS-1$
	localize("texttab", "texttab"); //$NON-NLS-0$ //$NON-NLS-1$
	localize("settingstab", "settingstab"); //$NON-NLS-0$ //$NON-NLS-1$
	localize("helptab", "helptab"); //$NON-NLS-0$ //$NON-NLS-1$
	localize("changelogtab", "changelogtab"); //$NON-NLS-0$ //$NON-NLS-1$
	localize("changelog", "changelog_text"); //$NON-NLS-0$ //$NON-NLS-1$

	localize("hideicon", "hideicon"); //$NON-NLS-0$ //$NON-NLS-1$
	localize("anim", "anim"); //$NON-NLS-0$ //$NON-NLS-1$
	localize("sound", "sound"); //$NON-NLS-0$ //$NON-NLS-1$
	localize("selectphrase", "selectphrase"); //$NON-NLS-0$ //$NON-NLS-1$

	localize("editshortcut", "option_shortcut_edit"); //$NON-NLS-0$ //$NON-NLS-1$
	localize("deleteshortcut", "option_shortcut_delete"); //$NON-NLS-0$ //$NON-NLS-1$
	localize("expandshortcut", "option_shortcut_expand"); //$NON-NLS-0$ //$NON-NLS-1$

	restore_options();

	//		document.getElementById("hiddenExpandShortcut").value = shortcuts.copy;
	//		document.getElementById("spanExpandShortcut").innerText = getStringByShortcutCode(shortcuts.copy);

}

document.addEventListener("keydown", onKeyDown, false); //$NON-NLS-0$

// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', function() { //$NON-NLS-0$
	init();
	document.querySelector('button[name=export]').addEventListener('click', export_settings); //$NON-NLS-0$ //$NON-NLS-1$
	document.querySelector('button[name=import]').addEventListener('click', import_settings); //$NON-NLS-0$ //$NON-NLS-1$
	document.querySelector('button[name=add]').addEventListener('click', add); //$NON-NLS-0$ //$NON-NLS-1$
	//	NOTE: See createSubLine(key, value) for delete button event listener setup. //$NON-NLS-0$ //$NON-NLS-1$
	//	document.querySelector('button[name=delete]').addEventListener('click', del);
	document.querySelector('span[name=editshortcut]').addEventListener('click', createShortcut); //$NON-NLS-0$ //$NON-NLS-1$
	document.querySelector('span[name=deleteshortcut]').addEventListener('click', deleteShortcut); //$NON-NLS-0$ //$NON-NLS-1$
	document.querySelector('button[name=save]').addEventListener('click', save_options); //$NON-NLS-0$ //$NON-NLS-1$
	//  document.querySelector('button').addEventListener('click', clickHandler);
	//  main();
});