/*jslint browser: true, devel: true, todo: false */
/*global Map, window: false, chrome: false, localStorage: false, $: false, KeyInfo: false */
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
	var line = $("#subs .sub_line_template").clone(); //$NON-NLS-0$
	line.removeClass("sub_line_template").addClass("sub_line"); //$NON-NLS-0$ //$NON-NLS-1$

	$(".sub_key", line).val(key); //$NON-NLS-0$
	$(".sub_key", line).Watermark(chrome.i18n.getMessage("abbr")); //$NON-NLS-0$ //$NON-NLS-1$
	$(".sub_key", line).keydown(onKeyDownEvent); //$NON-NLS-0$
	$(".sub_key", line).change(onInputChange); //$NON-NLS-0$

	$(".expand50-1000", line).val(value); //$NON-NLS-0$
	$(".expand50-1000", line).Watermark(chrome.i18n.getMessage("long")); //$NON-NLS-0$ //$NON-NLS-1$
	$(".del_button. button", line).click(del); //$NON-NLS-0$
	return line;
}

function add(event) {
	var subs = $("#subs"); //$NON-NLS-0$
	var line = createSubLine("", ""); //$NON-NLS-0$
	subs.prepend(line);
}

// Restores select box state to saved value from localStorage.
function restore_options(event) {
	$("#subs .sub_line").remove(); //$NON-NLS-0$

	var map = chrome.extension.getBackgroundPage().getHashMap();

	var subs = $("#subs"); //$NON-NLS-0$
	var a = [];
	for (var j = 0; j++ < map.size; map.next()) {
		a.push(map.key());
	}
	var keyArray = a.sort();
	for (var k = 0; k < keyArray.length; k++) {
		var line = createSubLine(a[k], map.get(a[k]));
		subs.append(line);
	}

	$("#checkbox_hideicon").attr('checked', localStorage.hideicon === "true"); //$NON-NLS-0$ //$NON-NLS-1$ //$NON-NLS-2$
	$("#checkbox_animate").attr('checked', localStorage.animate === "true"); //$NON-NLS-0$ //$NON-NLS-1$ //$NON-NLS-2$
	$("#checkbox_sound").attr('checked', localStorage.sound === "true"); //$NON-NLS-0$ //$NON-NLS-1$ //$NON-NLS-2$
	$("#checkbox_selectphrase").attr('checked', localStorage.selectphrase === "true"); //$NON-NLS-0$ //$NON-NLS-1$ //$NON-NLS-2$

	if (localStorage.replacekey) {
		replaceKey.fromStore(localStorage.replacekey);
	} else {
		replaceKey = new KeyInfo(32, true, false, false, false, false);
	}

	document.getElementById('spanExpandShortcut').innerText = replaceKey.toString(); //$NON-NLS-0$


	add();
}

var current_keylearner;

function keyUpEventListener(event) {
	replaceKey.fromEvent(event);

	document.getElementById('spanExpandShortcut').innerText = replaceKey.toString(); //$NON-NLS-0$

	document.removeEventListener('keyup', keyUpEventListener); //$NON-NLS-0$

	//save();
}

function createShortcut(event) {
	current_keylearner = event.srcElement;

	document.addEventListener('keyup', keyUpEventListener); //$NON-NLS-0$
	event.srcElement.innerText = chrome.i18n.getMessage("option_shortcut_press"); //$NON-NLS-0$
}

function deleteShortcut(event) {
	event.srcElement.innerText = "";

	replaceKey = null;

}

function setKeyErrorColors(a) {
	var lines = $("#subs .sub_line"); //$NON-NLS-0$
	for (var i = 0; i < lines.length; i++) {
		var key = $(".sub_key", lines[i])[0].value; //$NON-NLS-0$
		if (!isKeyUnique(a, key)) {
			$(".sub_key", lines[i]).addClass("bg_key_error"); //$NON-NLS-0$ //$NON-NLS-1$
		} else {
			$(".sub_key", lines[i]).removeClass("bg_key_error"); //$NON-NLS-0$ //$NON-NLS-1$
		}
	}
}

function export_settings(event) {
	if (window.confirm(chrome.i18n.getMessage("select_copy_save"))) { //$NON-NLS-0$
		window.alert(localStorage.map.toString());
	}
}

function import_settings(event) {
	var importMap;
	var importArray;
	var newAbbreviations = [];
	var changedAbbreviations = [];
	var mapArray = JSON.parse(localStorage.map);
	var optionsDocument;
	try {
		if (event.hasOwnProperty("srcElement")) {
			importArray = JSON.parse(window.prompt(chrome.i18n.getMessage("paste_below"))); //$NON-NLS-0$
		} else {
			importArray = event;
		}
		if (importArray instanceof Array) {
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
			if (newAbbreviations.length > 0) {
			if (!window.confirm("Do you want to import "+newAbbreviations.length+" new abbreviations?")) { //$NON-NLS-0$ //$NON-NLS-1$
				return;
			}
			}
			if (changedAbbreviations.length > 0) {
				if (!window.confirm(chrome.i18n.getMessage("will_replace") + changedAbbreviations.toString())) { //$NON-NLS-0$
					changedAbbreviations.forEach(function(value, index, object) {
						importMap.remove(value);
					});
					window.alert(chrome.i18n.getMessage("changes_not_imported") + changedAbbreviations.toString()); //$NON-NLS-0$
				}
			}
			if (importMap.size === 0) {
				window.alert(chrome.i18n.getMessage("nothing_to_import")); //$NON-NLS-0$
			} else {
				for (var j = 0; j++ < importMap.size; importMap.next()) {
					mapArray.push(importMap.key());
					mapArray.push(importMap.value());
				}
				localStorage.map = JSON.stringify(mapArray);
				if (event.hasOwnProperty("srcElement")) {
					restore_options();
				} else {
					chrome.tabs.query({
						url: chrome.extension.getURL("options.html")
					}, function(tabs) {
						if (tabs.length === 0) {
							window.open(chrome.extension.getURL("options.html"), "", "");
						}
						if (tabs.length === 1) {
							chrome.tabs.update(tabs[0].id, {
								highlighted: true
								//					active: true
							});
							chrome.tabs.reload(tabs[0].id);
						}
					});
				}
			}
		}
	} catch (e) {
		window.alert(chrome.i18n.getMessage("invalid_data") + importArray + "\n" + e); //$NON-NLS-0$ //$NON-NLS-1$
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
	try {
		//TODO options.js is also loaded by background.html to get access to export and import functionality.
		if (document.URL !== chrome.extension.getURL("options.html")) {
			console.log("early exit being loaded background page..."); //$NON-NLS-0$
			return;
		}
		init();
		document.querySelector('button[name=export]').addEventListener('click', export_settings); //$NON-NLS-0$ //$NON-NLS-1$
		document.querySelector('button[name=export]').title = chrome.i18n.getMessage("export_help"); //$NON-NLS-0$ //$NON-NLS-1$
		document.querySelector('span[name=caption]').title = "Version " + chrome.app.getDetails().version; //$NON-NLS-0$ //$NON-NLS-1$
		document.querySelector('button[name=import]').addEventListener('click', import_settings); //$NON-NLS-0$ //$NON-NLS-1$
		document.querySelector('button[name=import]').title = chrome.i18n.getMessage("import_help"); //$NON-NLS-0$ //$NON-NLS-1$
		document.querySelector('button[name=add]').addEventListener('click', add); //$NON-NLS-0$ //$NON-NLS-1$
		//	NOTE: See createSubLine(key, value) for delete button event listener setup. //$NON-NLS-0$ //$NON-NLS-1$
		//	document.querySelector('button[name=delete]').addEventListener('click', del);
		document.querySelector('span[name=editshortcut]').addEventListener('click', createShortcut); //$NON-NLS-0$ //$NON-NLS-1$
		document.querySelector('span[name=deleteshortcut]').addEventListener('click', deleteShortcut); //$NON-NLS-0$ //$NON-NLS-1$
		document.querySelector('button[name=save]').addEventListener('click', save_options); //$NON-NLS-0$ //$NON-NLS-1$
		document.querySelector('button[name=save]').click();
	} catch (e) {
		console.log(Date() + ":\n" + "document.readyState:" + document.readyState + "\ndocument.URL:" + document.URL + "\ne.stack:" + e.stack);
	}
});
