/*jslint browser: true, devel: true, todo: false */
/*global Map, window: false, chrome: false, localStorage: false, $: false, KeyInfo: false */
	"use strict"; //$NON-NLS-0$
//var settings = new Settings();

// TODO Find unquoted object properties and double-quote them (conforms to JSON)
// Use find regexp replace to fix that for now:
// From:([{,]\s+)((//.*\n)*)([^'"/ ]+):
// To:$1$2"$4":
// Options: [v] Regular expression

//TODO Convert from querySelector() to $() jQuery
// Use find regexp replace to fix that for now:
// From:document.querySelector\(((['"]).+\2)\)
// To:$$($1)[0]
// Options: [v] Regular expression

function logEvent(event) {
	var text = JSON.stringify([event.type,
	event.srcElement.localName + (event.srcElement.id ? '#' + event.srcElement.id : "") + (event.srcElement.classList.length ? '[class=' + event.srcElement.classList + ']' : "")]); //$NON-NLS-1$ //$NON-NLS-0$
	console.log(text);
}

var exportFileURL;

function getDownloadFileName() {
	var abbrevCount;
	try {
		var arrayLength = JSON.parse(localStorage.map).length;
		if (arrayLength % 2) {
			chrome.extension.getBackgroundPage().alert(chrome.i18n.getMessage("odd_map_array_length") + arrayLength);
		}
		abbrevCount = arrayLength / 2;
	} catch (e) {}
	var d = new Date();
	var fileName = 'popchrom-' + abbrevCount + '-'; //$NON-NLS-1$ //$NON-NLS-0$
	fileName += d.getFullYear();
	var month = d.getMonth() + 1;
	fileName += "-" + ((month < 10) ? "0" + month : month); //$NON-NLS-0$ //$NON-NLS-1$
	//	TODO getDay() returns the day of week,
	//	see http://www.ecma-international.org/ecma-262/5.1/#sec-15.9.5.16
	var day = d.getDate();
	fileName += "-" + ((day < 10) ? "0" + day : day); //$NON-NLS-0$ //$NON-NLS-1$
	var hours = d.getHours();
	fileName += "T" + ((hours < 10) ? "0" + hours : hours); //$NON-NLS-0$ //$NON-NLS-1$
	var minutes = d.getMinutes();
	fileName += ((minutes < 10) ? "0" + minutes : minutes); //$NON-NLS-0$
	var seconds = d.getSeconds();
	fileName += ((seconds < 10) ? "0" + seconds : seconds); //$NON-NLS-0$
	var timeZoneOffset = -d.getTimezoneOffset();
	var offsetMinutes = timeZoneOffset % 60;
	var offsetHours = (timeZoneOffset - offsetMinutes) / 60;
	fileName += (offsetHours > 0 ? "+" : "") + ((offsetHours < 10) ? "0" + offsetHours : offsetHours) + ((offsetMinutes < 10) ? "0" + offsetMinutes : offsetMinutes); //$NON-NLS-0$ //$NON-NLS-2$ //$NON-NLS-1$
	fileName += '.txt'; //$NON-NLS-0$
	return fileName;
}

function getExportFileURL() {
	return exportFileURL;
}

function getClipboard() {
	var pasteTarget = document.createElement("div"); //$NON-NLS-0$
	pasteTarget.contentEditable = true;
	var actElem = document.activeElement.appendChild(pasteTarget).parentNode;
	pasteTarget.focus();
	document.execCommand("Paste", null, null); //$NON-NLS-0$
	var paste = pasteTarget.innerText;
	actElem.removeChild(pasteTarget);
	return paste;
}

var replaceKey = new KeyInfo();

function outsideBrowser(event) {
	// |<>
	console.log(JSON.stringify([event.x, event.y, event.view.innerWidth, event.view.innerHeight, event.view.outerWidth, event.view.outerHeight]));
	return (event.x < 0 || event.y < 0 || event.x > event.view.innerWidth || event.y > event.view.innerHeight);
}

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
	// TODO Please note that the dynamically added value properties are distinct from the element's value attribute!
	//	var nl = document.querySelectorAll('.sub_key[value="'+event.srcElement.value+'"]');
	var nl = document.querySelectorAll('.sub_key[value]'); //$NON-NLS-0$
	for (var i = 0, count = 0; i < nl.length; i++) {
		if (nl[i].value === event.srcElement.value) {
			count++;
		}
	}
	if (count > 1) {
		event.srcElement.value = event.srcElement.value + "2"; //$NON-NLS-0$
		chrome.extension.getBackgroundPage().alert(event.srcElement.title = chrome.i18n.getMessage("abbrev_exists", [event.srcElement.value])); //$NON-NLS-0$
	}
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
	var row = event.srcElement.parentElement.parentElement.parentElement;

	row.outerHTML = "";
}

function createSubLine(key, args, value) {
	var line = $("#subs .sub_line_template").clone(); //$NON-NLS-0$
	line.removeClass("sub_line_template").addClass("sub_line"); //$NON-NLS-0$ //$NON-NLS-1$

	$(".sub_key", line).val(key); //$NON-NLS-0$
	$(".sub_key", line).Watermark(chrome.i18n.getMessage("abbr")); //$NON-NLS-0$ //$NON-NLS-1$
	$(".sub_args", line).val(args); //$NON-NLS-0$
	$(".sub_args", line).Watermark(chrome.i18n.getMessage("args")); //$NON-NLS-0$ //$NON-NLS-1$
	$(".sub_key", line).keydown(onKeyDownEvent); //$NON-NLS-0$
	$(".sub_key", line).change(onInputChange); //$NON-NLS-0$

	$(".expand50-1000", line).val(value); //$NON-NLS-0$
	$(".expand50-1000", line).Watermark(chrome.i18n.getMessage("long")); //$NON-NLS-0$ //$NON-NLS-1$
	$(".expand50-1000", line).focusout(function(event) { //$NON-NLS-0$
		// TODO initialize from current unfocussed values instead.
		event.target.cols = 78;
		event.target.rows = 4;
	});
	$(".expand50-1000", line).focus(function(event) { //$NON-NLS-0$
//		console.log(event.timeStamp);
//		console.log(event);
		var tc = event.target.value;
		var rowIndex = 0;
		var cols = 0;
		var rows = 0;
		tc.split("\n").forEach(function(value, index, object) { //$NON-NLS-0$
			rowIndex = index;
			if (value.length > cols) {
				cols = value.length;
			}
		});
		rows = rowIndex + 1;
//		console.log("tc.length = " + tc.length); //$NON-NLS-0$
//		console.log("rows = " + rows); //$NON-NLS-0$
		event.target.cols = cols > 78 ? cols : 78;
		event.target.rows = rows > 4 ? rows : 4;
//		console.log("cols = " + cols); //$NON-NLS-0$
	});
	$(".del_button>button", line).click(del); //$NON-NLS-0$
	return line;
}

function add(event) {
	var subs = $("#subs"); //$NON-NLS-0$
	var line = createSubLine("", "", ""); //$NON-NLS-0$ //$NON-NLS-1$
	subs.prepend(line);
	// $("a[name=texttab]").click(); //$NON-NLS-0$
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
		var args = "";
		var expansion = "";
		try {
			var array = JSON.parse(map.get(a[k]));
			var arrayLength = array.length;
			if (arrayLength !== 2) {
				chrome.extension.getBackgroundPage().alert(chrome.i18n.getMessage("odd_map_array_length") + arrayLength); //$NON-NLS-0$
			} else {
				args = array[0];
				expansion = array[1];
			}
		} catch (e) {
			expansion = map.get(a[k]);
		}
		var line = createSubLine(a[k], args, expansion);
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
	localize("editshortcut", "option_shortcut_edit"); //$NON-NLS-0$ //$NON-NLS-1$
	document.removeEventListener('keyup', keyUpEventListener); //$NON-NLS-0$
}

function createShortcut(event) {
	current_keylearner = event.srcElement;
	document.addEventListener('keyup', keyUpEventListener); //$NON-NLS-0$
	event.srcElement.innerText = chrome.i18n.getMessage("option_shortcut_press"); //$NON-NLS-0$
}

function deleteShortcut(event) {
	event.srcElement.innerText = "";
	replaceKey = new KeyInfo();
	localStorage.replacekey = replaceKey.toStore();
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

function import_settings(event) {
	var importMap;
	var importArray;
	var newAbbreviations = [];
	var changedAbbreviations = [];
	var mapArray = JSON.parse(localStorage.map);
	var optionsDocument;
	try {
		if (event.hasOwnProperty("srcElement")) { //$NON-NLS-0$
			importArray = JSON.parse(chrome.extension.getBackgroundPage().prompt(chrome.i18n.getMessage("paste_below"))); //$NON-NLS-0$
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
				if (!chrome.extension.getBackgroundPage().confirm(chrome.i18n.getMessage("import_new_before") + newAbbreviations.length + chrome.i18n.getMessage("import_new_after"))) { //$NON-NLS-0$ //$NON-NLS-1$
					return;
				}
			}
			if (changedAbbreviations.length > 0) {
				if (!chrome.extension.getBackgroundPage().confirm(chrome.i18n.getMessage("will_replace") + changedAbbreviations.toString())) { //$NON-NLS-0$
					changedAbbreviations.forEach(function(value, index, object) {
						importMap.remove(value);
					});
					chrome.extension.getBackgroundPage().alert(chrome.i18n.getMessage("changes_not_imported") + changedAbbreviations.toString()); //$NON-NLS-0$
				}
			}
			if (importMap.size === 0) {
				chrome.extension.getBackgroundPage().alert(chrome.i18n.getMessage("nothing_to_import")); //$NON-NLS-0$
			} else {
				for (var j = 0; j++ < importMap.size; importMap.next()) {
					mapArray.push(importMap.key());
					mapArray.push(importMap.value());
				}
				localStorage.map = JSON.stringify(mapArray);
				if (event.hasOwnProperty("srcElement")) { //$NON-NLS-0$
					restore_options();
				} else {
					chrome.tabs.query({
						"url": chrome.extension.getURL("options.html") //$NON-NLS-1$ //$NON-NLS-0$
					}, function(tabs) {
						if (tabs.length === 0) {
							window.open(chrome.extension.getURL("options.html"), "", ""); //$NON-NLS-1$ //$NON-NLS-0$
						}
						if (tabs.length === 1) {
							chrome.tabs.update(tabs[0].id, {
								"highlighted": true //$NON-NLS-0$
								//					active: true
							});
							chrome.tabs.reload(tabs[0].id);
						}
					});
				}
			}
		}
	} catch (exception) {
		chrome.extension.getBackgroundPage().alert(chrome.i18n.getMessage("invalid_data") + importArray + "\n" + exception); //$NON-NLS-0$ //$NON-NLS-1$
	}
}

// Saves options to localStorage.
function save_options(event) {
	// TODO Look into alternatives to provide non-blocking progress feedback.
	// This nesting of setTimeout calls is a really limited solution.
	window.setTimeout(function() {
		var progress = document.querySelector('#saving_progress');
		progress.max = 100;
		progress.value = 0;
		progress.style.visibility = "visible"; //$NON-NLS-0$
		$.Watermark.HideAll();
		progress.value = 20;
		window.setTimeout(function() {
			var lines = $("#subs .sub_line"); //$NON-NLS-0$ //$NON-NLS-1$
			var a = [];
			for (var i = 0; i < lines.length; i++) {
				var key = $(".sub_key", lines[i])[0].value; //$NON-NLS-0$ //$NON-NLS-1$
				var args = $(".sub_args", lines[i])[0].value; //$NON-NLS-0$ //$NON-NLS-1$
				var value = $(".expand50-1000", lines[i])[0].value; //$NON-NLS-0$
				if (key !== "" || value !== "") { //$NON-NLS-0$ //$NON-NLS-1$
					a.push(key);
					a.push(JSON.stringify([args, value]));
				}
			}
			//			console.log('before on at ' + (new Date()).toJSON());
			progress.value = 40;
			window.setTimeout(function() {
				// TODO Please note that uniqueness is not enforces during entry.
				// Import will also not create duplicates but ask for permission to overwrite.
				//				if (keysUnique(a)) {
				localStorage.map = JSON.stringify(a);
				$.Watermark.ShowAll();
				progress.value = 50;
				window.setTimeout(function() {
					localStorage.hideicon = $("#checkbox_hideicon").attr('checked'); //$NON-NLS-0$ //$NON-NLS-1$
					localStorage.animate = $("#checkbox_animate").attr('checked'); //$NON-NLS-0$ //$NON-NLS-1$
					localStorage.sound = $("#checkbox_sound").attr('checked'); //$NON-NLS-0$ //$NON-NLS-1$
					localStorage.selectphrase = $("#checkbox_selectphrase").attr('checked'); //$NON-NLS-0$ //$NON-NLS-1$
					localStorage.replacekey = replaceKey.toStore();
					chrome.extension.getBackgroundPage().broadcastSettings();
					progress.value = 60;
					window.setTimeout(function() {
						restore_options();
						progress.value = 70;
						window.setTimeout(function() {
							var blob = new window.Blob([localStorage.map], {
								"type": 'text/plain' //$NON-NLS-1$ //$NON-NLS-0$
							});
							progress.value = 80;
							window.setTimeout(function() {
								var href = URL.createObjectURL(blob);
								progress.value = 90;
								window.setTimeout(function() {
									$('a[download]')[0].href = href; //$NON-NLS-0$
									$('a[download]')[0].download = getDownloadFileName(); //$NON-NLS-0$
									//				} else {
									//					setKeyErrorColors(a);
									//					$("#saving").html(chrome.i18n.getMessage("keys_not_unique")); //$NON-NLS-0$ //$NON-NLS-1$
									//				}
									progress.value = 100;
									window.setTimeout(function() {
										//							console.log('before off at ' + (new Date()).toJSON());
										progress.style.visibility = "hidden"; //$NON-NLS-0$
									}, 200);
								}, 200);
							}, 200);
						}, 200);
					}, 200);
				}, 200);
			}, 200);
		}, 200);
	}, 200);
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
	localize("restore", "restore"); //$NON-NLS-0$ //$NON-NLS-1$
	localize("add", "option_add"); //$NON-NLS-0$ //$NON-NLS-1$
	localize("delete", "option_del"); //$NON-NLS-0$ //$NON-NLS-1$
	localize("delete_all", "option_delete_all"); //$NON-NLS-0$ //$NON-NLS-1$
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
}

document.addEventListener("keydown", onKeyDown, false); //$NON-NLS-0$

function errorHandler(domError) {
	console.error(domError);
}

function readAsText(fileEntry, callback) {
	fileEntry.file(function(file) {
		var reader = new FileReader();
		reader.onerror = errorHandler;
		reader.onload = function(domError) {
			callback(domError.target.result);
		};
		reader.readAsText(file);
	});
}

// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', function() { //$NON-NLS-0$
	try {
		// TODO Please note options.js is also loaded by background.html to get access to export and import functionality.
		if (document.URL !== chrome.extension.getURL("options.html")) { //$NON-NLS-0$
			console.log("early exit being loaded from other than options page..."); //$NON-NLS-0$
			return;
		}
		init();
		$('span#version')[0].innerText = " Version " + chrome.app.getDetails().version; //$NON-NLS-0$ //$NON-NLS-1$
		var dropzoneImport = $('a[name=texttab]')[0]; //$NON-NLS-0$
		var invalidDropTarget;
		if (dropzoneImport) {
			dropzoneImport.addEventListener("dragstart", function doNothing(event) { //$NON-NLS-0$
				event.preventDefault();
			}, false);
			if (true) {
				document.addEventListener("dragover", function(event) { //$NON-NLS-0$
					event.preventDefault();
					if ((event.srcElement !== dropzoneImport) || invalidDropTarget) {
						event.dataTransfer.effectAllowed = "none"; //$NON-NLS-0$
						event.dataTransfer.dropEffect = "none"; //$NON-NLS-0$
					}
					return false;
				}, false && "useCapture"); //$NON-NLS-0$ //$NON-NLS-1$
				document.addEventListener("dragenter", function(event) { //$NON-NLS-0$
					// return false;
				}, false && "useCapture"); //$NON-NLS-0$ //$NON-NLS-1$
				//				dropzoneImport.addEventListener("dragenter", reportDragDrop, false); //$NON-NLS-0$ //$NON-NLS-1$
			}
			dropzoneImport.addEventListener("drop", function(event) { //$NON-NLS-0$
				if (!invalidDropTarget) {
					// TODO needed for drop to work!
					event.preventDefault(); // stops the browser from redirecting.
					$('a[download]')[0].click(); //$NON-NLS-0$
					var reader = new FileReader();
					reader.onerror = errorHandler;
					reader.onload = function(domError) {
						var result = domError.target.result;
						console.log(result);
						chrome.extension.getBackgroundPage().addOrImportAbbrevs(result);
					};
					reader.readAsText(event.dataTransfer.files[0]);
				}
			}, false && "useCapture"); //$NON-NLS-0$ //$NON-NLS-1$
			document.addEventListener("dragstart", function(event) { //$NON-NLS-0$
				invalidDropTarget = true;
			}, false && "useCapture"); //$NON-NLS-0$ //$NON-NLS-1$
			dropzoneImport.title = chrome.i18n.getMessage("dropzone_help"); //$NON-NLS-0$ //$NON-NLS-1$
		}
		$('button[name=add]')[0].addEventListener('click', add); //$NON-NLS-0$ //$NON-NLS-1$
		//	NOTE: See createSubLine(key, value) for delete button event listener setup. //$NON-NLS-0$ //$NON-NLS-1$
		//	$('button[name=delete]')[0].addEventListener('click', del);
		$('span[name=editshortcut]')[0].addEventListener('click', createShortcut); //$NON-NLS-0$ //$NON-NLS-1$
		$('span[name=deleteshortcut]')[0].addEventListener('click', deleteShortcut); //$NON-NLS-0$ //$NON-NLS-1$
		$('button[name=download]')[0].addEventListener('click', function(event) { //$NON-NLS-0$ //$NON-NLS-1$
			console.time("download"); //$NON-NLS-0$
			$('a[download]')[0].click(); //$NON-NLS-0$
			console.timeEnd("download"); //$NON-NLS-0$
		});
		$('button[name=delete_all]')[0].title = chrome.i18n.getMessage("delete_all_help"); //$NON-NLS-0$ //$NON-NLS-1$
		$('button[name=delete_all]')[0].addEventListener('click', function(event) { //$NON-NLS-0$ //$NON-NLS-1$
			$('a[download]')[0].click(); //$NON-NLS-0$
			console.time("delete_all"); //$NON-NLS-0$
			localStorage['map' + (new Date()).getTime()] = localStorage.map; //$NON-NLS-0$
			localStorage.map = "[]"; //$NON-NLS-0$
			console.timeEnd("delete_all"); //$NON-NLS-0$
			restore_options();
		});
		$('button[name=save]')[0].addEventListener('click', save_options); //$NON-NLS-0$ //$NON-NLS-1$
		$('button[name=save]')[0].click(); //$NON-NLS-0$
		var draggableExport = $('a[download]')[0]; //$NON-NLS-0$
		draggableExport.addEventListener("click", function(event) { //$NON-NLS-0$
			logEvent(event);
			if (event.altKey) {
				if (chrome.extension.getBackgroundPage().confirm(chrome.i18n.getMessage("You requested to remove all abbreviations. Please perform a download without removing abbreviations first."))) {
					localStorage.map = "[]"; //$NON-NLS-0$
					restore_options();
				}
			}
		}, false);
	} catch (exception) {
		console.log(Date() + ":\n" + "document.readyState:" + document.readyState + "\ndocument.URL:" + document.URL + "\ne.stack:" + exception.stack); //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
	}
});
