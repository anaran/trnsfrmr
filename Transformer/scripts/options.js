/*jslint browser: true, devel: true, todo: false */
/*global Map, window: false, chrome: false, localStorage: false, $: false, KeyInfo: false */
	"use strict"; //$NON-NLS-0$
//var settings = new Settings();

// TODO Find unquoted object properties and double-quote them (conforms to JSON)
// Use find regexp replace to fix that for now:
// From:([{,]\s+)((//.*\n)*)([^'"/ ]+):
// To:$1$2"$4":

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
			window.alert(chrome.i18n.getMessage("odd_map_array_length") + arrayLength);
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
	//	var dateTimeFileString = dt.toTimeString().replace(/[^-+0-9]+/g, '');
	//		var fileName = 'popchrom-'+dateTimeFileString+'.txt';
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

function exportToFileSystem() {
	window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
	var errorHandler = function(e) {
		//  var msg = '';
		//
		//  switch (e.code) {
		//    case FileError.QUOTA_EXCEEDED_ERR:
		//      msg = 'QUOTA_EXCEEDED_ERR';
		//      break;
		//    case FileError.NOT_FOUND_ERR:
		//      msg = 'NOT_FOUND_ERR';
		//      break;
		//    case FileError.SECURITY_ERR:
		//      msg = 'SECURITY_ERR';
		//      break;
		//    case FileError.INVALID_MODIFICATION_ERR:
		//      msg = 'INVALID_MODIFICATION_ERR';
		//      break;
		//    case FileError.INVALID_STATE_ERR:
		//      msg = 'INVALID_STATE_ERR';
		//      break;
		//    default:
		//      msg = 'Unknown Error';
		//      break;
		//  };

		console.log('Error: ' + e); //$NON-NLS-0$
	};
	var onInitFs = function(fs) {
		// Remove file if it already exists since existing file will not be truncated by write!
		fs.root.getFile('popchrom.txt', { //$NON-NLS-0$
			"create": false //$NON-NLS-0$
		}, function(fileEntry) {
			fileEntry.remove(function onSuccess() {
				console.log("Removed " + fileEntry.toURL()); //$NON-NLS-0$
			}, function onError() {
				console.log("Cannot remove " + fileEntry.toURL()); //$NON-NLS-0$
			});
		});
		var abbrevCount;
		try {
			var arrayLength = JSON.parse(localStorage.map).length;
			if (arrayLength % 2) {
				window.alert("Please report an issue! arrayLength = " + arrayLength); //$NON-NLS-0$
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
		//	var dateTimeFileString = dt.toTimeString().replace(/[^-+0-9]+/g, '');
		//		var fileName = 'popchrom-'+dateTimeFileString+'.txt';
		fileName += '.txt'; //$NON-NLS-0$
		fs.root.getFile(fileName, {
			"create": true //$NON-NLS-0$
		}, function(fileEntry) {

			// Create a FileWriter object for our FileEntry (log.txt).
			fileEntry.createWriter(function(fileWriter) {

				fileWriter.onwriteend = function(e) {
					console.log('Write completed.'); //$NON-NLS-0$
					console.log('See ' + fileEntry.fullPath); //$NON-NLS-0$
					console.log('fileEntry.toURL() = ' + fileEntry.toURL()); //$NON-NLS-0$
					exportFileURL = fileEntry.toURL();
					$('a[download]')[0].href = fileEntry.toURL(); //$NON-NLS-0$
					$('a[download]')[0].download = decodeURIComponent(fileEntry.toURL().split("/").pop()); //$NON-NLS-1$ //$NON-NLS-0$
				};

				fileWriter.onerror = function(e) {
					console.log('Write failed: ' + e.toString()); //$NON-NLS-0$
				};

				// Create a new Blob and write it to log.txt.
				var blob = new window.Blob([localStorage.map], {
					"type": 'text/plain' //$NON-NLS-1$ //$NON-NLS-0$
				});
				fileWriter.write(blob);

			}, errorHandler);

		}, errorHandler);

	};
	window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024 /*5MB*/ , onInitFs, errorHandler);
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
		console.log(event.timeStamp);
		console.log(event);
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
		console.log("tc.length = " + tc.length); //$NON-NLS-0$
		console.log("rows = " + rows); //$NON-NLS-0$
		//    this.cols = cols; 
		//    this.rows = rows; 
		event.target.cols = cols > 78 ? cols : 78;
		event.target.rows = rows > 4 ? rows : 4;
		console.log("cols = " + cols); //$NON-NLS-0$
	});
	$(".del_button>button", line).click(del); //$NON-NLS-0$
	return line;
}

function add(event) {
	var subs = $("#subs"); //$NON-NLS-0$
	var line = createSubLine("", "", ""); //$NON-NLS-0$ //$NON-NLS-1$
	subs.prepend(line);
	$("a[name=texttab]").click(); //$NON-NLS-0$
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
				console.error(chrome.i18n.getMessage("Please report an issue! arrayLength = ") + arrayLength);
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

function export_settings(event) {
	// Send message to content page to export to local, sandboxed, filesystem.
	var etfs = exportToFileSystem();
	//    var etfs = chrome.extension.getBackgroundPage().exportToFileSystem();
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
				if (!window.confirm("Do you want to import " + newAbbreviations.length + " new abbreviations?")) { //$NON-NLS-0$ //$NON-NLS-1$
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
		window.alert(chrome.i18n.getMessage("invalid_data") + importArray + "\n" + exception); //$NON-NLS-0$ //$NON-NLS-1$
	}
}

// Saves options to localStorage.
function save_options(event) {
	//	$("#saving").html(chrome.i18n.getMessage("saving")); //$NON-NLS-0$ //$NON-NLS-1$
	//	$("#saving_progress").style.display = "saving"; //$NON-NLS-0$ //$NON-NLS-1$
	$('#saving_progress')[0].style.visibility = "visible"; //$NON-NLS-1$ //$NON-NLS-0$

	$.Watermark.HideAll();

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
			$('#saving_progress')[0].style.visibility = "hidden"; //$NON-NLS-1$ //$NON-NLS-0$
			//	$("#saving_progress").style.display = "saving"; //$NON-NLS-0$ //$NON-NLS-1$
		}, 1000);
		restore_options();
		var blob = new window.Blob([localStorage.map], {
			"type": 'text/plain' //$NON-NLS-1$ //$NON-NLS-0$
		});
		var href = URL.createObjectURL(blob);
		$('a[download]')[0].href = href; //$NON-NLS-0$
		$('a[download]')[0].download = getDownloadFileName(); //$NON-NLS-0$
		//        exportToFileSystem();
		//        chrome.extension.getBackgroundPage().exportToFileSystem();
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
//	localize("export", "export"); //$NON-NLS-0$ //$NON-NLS-1$
//	localize("import", "import"); //$NON-NLS-0$ //$NON-NLS-1$
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

	//		document.getElementById("hiddenExpandShortcut").value = shortcuts.copy;
	//		document.getElementById("spanExpandShortcut").innerText = getStringByShortcutCode(shortcuts.copy);
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

function reportDragDrop(event) {
	// this / event.target is current target element.
	//   if (event.preventDefault) {
	//   }
	//   if (event.stopPropagation) {
	//     event.stopPropagation(); // stops the browser from redirecting.
	//   }
	switch (event.type) {
		case "dragstart": //$NON-NLS-0$
			//         event.stopPropagation(); // stops the browser from redirecting.
			break;
		case "dragenter": //$NON-NLS-0$
			// TODO needed for drop to work!
			event.preventDefault(); // stops the browser from redirecting.
			break;
		case "dragend": //$NON-NLS-0$
			//			console.log("onDragEnd: event.dataTransfer.dropEffect = " + event.dataTransfer.dropEffect);
			//			console.log("onDragEnd: event.dataTransfer = " + JSON.stringify(event.dataTransfer));
			var el = event.srcElement;
			//	var href = chrome.extension.getBackgroundPage().getExportFileURL();
			//	var name = href.split("/").pop();
			el.href = "";
			el.innerText = "";
			switch (event.dataTransfer.dropEffect) {
				case "copy": //$NON-NLS-0$
					break;
				case "move": //$NON-NLS-0$
					localStorage.map = "[]"; //$NON-NLS-0$
					restore_options();
					break;
				case "none": //$NON-NLS-0$
					if (window.confirm("cannot distinguish drag move vs. copy on your platform.\nDo you want to delete all abbreviations in popchrom now?")) { //$NON-NLS-0$
						localStorage.map = "[]"; //$NON-NLS-0$
						restore_options();
					} else {}
					break;
				default:
					break;
			}
			break;
		case "dragover": //$NON-NLS-0$
			// TODO needed for drop to work!
			event.preventDefault(); // stops the browser from redirecting.
			break;
		case "dragexit": //$NON-NLS-0$
			break;
		case "dragleave": //$NON-NLS-0$
			break;
		case "drop": //$NON-NLS-0$
			// TODO needed for drop to work!
			event.preventDefault(); // stops the browser from redirecting.
			//            var item = event.dataTransfer.items[0];
			//            if (!item || !item.type.match('text/*')) {
			//                console.log("Sorry. That's not a text file.");
			//                return;
			//            }

			//            var chosenFileEntry = event.dataTransfer.files[0].webkitGetAsEntry();
			//            readAsText(chosenFileEntry, function(result) {
			//                console.log(result);
			//                chrome.extension.getBackgroundPage().addOrImportAbbrevs(result);
			//            });
			document.querySelector('a[download]').click(); //$NON-NLS-0$
			var reader = new FileReader();

			reader.onerror = errorHandler;
			reader.onload = function(domError) {
				//            callback(domError.target.result);
				var result = domError.target.result;
				console.log(result);
				chrome.extension.getBackgroundPage().addOrImportAbbrevs(result);
			};
			reader.readAsText(event.dataTransfer.files[0]);
			break;
		default:
			break;
	}
	//	console.log("event.type = " + event.type + ": event = " + JSON.stringify(event, function(key, value) {
	//		if (key.length > 0 && value instanceof Object) {
	//			return typeof value;
	//		} else {
	//			return value;
	//		}
	//	}).replace(/([{,])("\w+":)/g, "$1\n$2"));
	console.log("event.type = " + event.type + ": event.dataTransfer = " + JSON.stringify(event.dataTransfer)); //$NON-NLS-1$ //$NON-NLS-0$
	console.log(event.srcElement.localName + '#' + event.srcElement.id + '["' + event.srcElement.classList + '"]'); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
	console.log(event.target.localName + '#' + event.target.id + '["' + event.target.classList + '"]'); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
	//    console.log("event.type = " + event.type + ": event.dataTransfer.getData('DownloadURL') = " + event.dataTransfer.getData("DownloadURL"));
	//    console.log("event.type = " + event.type + ": event.dataTransfer.getData('downloadurl') = " + event.dataTransfer.getData("downloadurl"));
	//    var length = event.dataTransfer.items.length;
	//    for (var i = 0; i < length; i++) {
	//        console.log("event.type = " + event.type + ": event.dataTransfer.items[i].webkitGetAsEntry() = " + event.dataTransfer.items[i].webkitGetAsEntry());
	//        console.log("event.type = " + event.type + ": event.dataTransfer.getData(\"URL\") = " + event.dataTransfer.getData("URL"));
	//        console.log("event.type = " + event.type + ": event.dataTransfer.items[" + i + "].type = " + event.dataTransfer.items[i].type);
	//        if (event.dataTransfer.items[i].type === "downloadurl") {
	//            // console.log("event.type = " + event.type + ": event.dataTransfer.items[i].getData(event.dataTransfer.items[i].type) = " + event.dataTransfer.items[i].getData(event.dataTransfer.items[i].type));
	//        }
	//    }
	// See the section on the DataTransfer object.

	return false;
}

//function onDragEnd(event) {
//	var el = event.srcElement;
//	//   var name = el.innerText.replace(":", "");
//	//   var download_url_data = "application/octet-stream:" + name + ":" + el.href;
//	//   event.dataTransfer.setData("DownloadURL", download_url_data);
//	//   //  event.dataTransfer.effectAllowed = "copy";
//	switch (event.dataTransfer.dropEffect) {
//		case "move":
//			break;
//		case "copy":
//			break;
//		case "none":
//			break;
//		default:
//			break;
//	}
//	console.log("onDragEnd: event.dataTransfer.dropEffect = " + event.dataTransfer.dropEffect);
//	console.log("onDragEnd: event.dataTransfer = " + JSON.stringify(event.dataTransfer));
//}

function onDragStart(event) {
	var el = event.srcElement;
	//    var href = getExportFileURL();
	//    var href = chrome.extension.getBackgroundPage().getExportFileURL();
	//    var name = decodeURIComponent(href.split("/").pop());
	//    el.href = href;
	//    el.innerText = name;
	var download_url_data = "application/octet-stream:" + name + ":" + href; //$NON-NLS-1$ //$NON-NLS-0$
	//   if (event.preventDefault) {
	//     event.preventDefault(); // stops the browser from redirecting.
	//   }
	//   if (event.stopPropagation) {
	//     event.stopPropagation(); // stops the browser from redirecting.
	//   }
	// event.dataTransfer.setData("DownloadURL", download_url_data);
	event.dataTransfer.setData("downloadurl", download_url_data); //$NON-NLS-0$
	event.dataTransfer.effectAllowed = "copy"; //$NON-NLS-0$
	event.dataTransfer.dropEffect = undefined;
	reportDragDrop(event);
	// event.dataTransfer.effectAllowed = "move";
}

// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', function() { //$NON-NLS-0$
	try {
		// TODO options.js is also loaded by background.html to get access to export and import functionality.
		if (document.URL !== chrome.extension.getURL("options.html")) { //$NON-NLS-0$
			console.log("early exit being loaded from other than options page..."); //$NON-NLS-0$
			return;
		}
		init();
		//        document.querySelector('button[name=export]').addEventListener('click', export_settings); //$NON-NLS-0$ //$NON-NLS-1$
		//        document.querySelector('label[name=export]').title = chrome.i18n.getMessage("export_help"); //$NON-NLS-0$ //$NON-NLS-1$
		//		document.querySelector('span[name=caption]').title = "Version " + chrome.app.getDetails().version; //$NON-NLS-0$ //$NON-NLS-1$
		//		document.querySelector('span#version').innerText = "Version " + chrome.app.getDetails().version; //$NON-NLS-0$ //$NON-NLS-1$
		//        document.querySelector('button[name=import]').addEventListener('click', import_settings); //$NON-NLS-0$ //$NON-NLS-1$
		//        var dropzoneImport = $('div#tabs-1')[0];
		var dropzoneImport = $('a[name=texttab]')[0]; //$NON-NLS-0$
		var invalidDropTarget;
		//        var dropzoneImport = $('label[name=import]')[0];
		if (dropzoneImport) {
			//		dropzoneImport.draggable = "false";
			//			dropzoneImport.addEventListener("click", function doNothing(event) {
			//				event.preventDefault();
			//			}, false);
			dropzoneImport.addEventListener("dragstart", function doNothing(event) { //$NON-NLS-0$
				event.preventDefault();
			}, false);
			if (false) {
				dropzoneImport.addEventListener("dragenter", function(event) { //$NON-NLS-0$
					if (event.srcElement !== dropzoneImport || invalidDropTarget) {
						return false;
					}
					reportDragDrop(event);
				}, false);
				//  TODO needed for drop to work!
				dropzoneImport.addEventListener("dragover", function(event) { //$NON-NLS-0$
					event.preventDefault();
					event.dataTransfer.effectAllowed = "none"; //$NON-NLS-0$
					event.dataTransfer.dropEffect = "none"; //$NON-NLS-0$
					return false;
				}, false);
			} else {
				document.addEventListener("dragover", function(event) { //$NON-NLS-0$
					event.preventDefault();
					if ((event.srcElement !== dropzoneImport) || invalidDropTarget) {
						event.dataTransfer.effectAllowed = "none"; //$NON-NLS-0$
						event.dataTransfer.dropEffect = "none"; //$NON-NLS-0$
					}
					console.log("ignore event.type = " + event.type); //$NON-NLS-0$
					console.log("invalidDropTarget = " + invalidDropTarget); //$NON-NLS-0$
					console.log(event.srcElement.localName + '#' + event.srcElement.id + '["' + event.srcElement.classList + '"]'); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
					console.log(event.target.localName + '#' + event.target.id + '["' + event.target.classList + '"]'); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
					return false;
				}, false && "useCapture"); //$NON-NLS-0$ //$NON-NLS-1$
				document.addEventListener("dragenter", function(event) { //$NON-NLS-0$
					//								invalidDropTarget = true;
					console.log("invalidDropTarget = " + invalidDropTarget); //$NON-NLS-0$
					if (event.srcElement === dropzoneImport && !invalidDropTarget) {
						reportDragDrop(event);
					}
					console.log("ignore event.type = " + event.type); //$NON-NLS-0$
					console.log(event.srcElement.localName + '#' + event.srcElement.id + '["' + event.srcElement.classList + '"]'); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
					console.log(event.target.localName + '#' + event.target.id + '["' + event.target.classList + '"]'); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
					//				return false;
				}, false && "useCapture"); //$NON-NLS-0$ //$NON-NLS-1$
				//				document.addEventListener("dragleave", function(event) {
				//					console.log("ignore event.type = " + event.type);
				//								invalidDropTarget = false;
				//				console.log("invalidDropTarget = " + invalidDropTarget);
				//					console.log(event.srcElement.localName + '#' + event.srcElement.id + '["' + event.srcElement.classList + '"]');
				//					console.log(event.target.localName + '#' + event.target.id + '["' + event.target.classList + '"]');
				//					//				return false;
				//				}, false && "useCapture"); //$NON-NLS-0$ //$NON-NLS-1$
				dropzoneImport.addEventListener("dragenter", reportDragDrop, false); //$NON-NLS-0$ //$NON-NLS-1$
			}
			//                        dropzoneImport.addEventListener("dragexit", reportDragDrop, false);
			//                        dropzoneImport.addEventListener("dragleave", reportDragDrop, false);
			dropzoneImport.addEventListener("drop", function(event) { //$NON-NLS-0$
				if (!invalidDropTarget) {
					//				if (event.srcElement === draggableExport) {
					reportDragDrop(event);
				}
			}, false && "useCapture"); //$NON-NLS-0$ //$NON-NLS-1$
			//			document.addEventListener("drop", function(event) {
			//				//				invalidDropTarget = true;
			//				if (true) {
			//					//			if (event.target === dropzoneImport) {
			//					event.stopPropagation();
			//					event.preventDefault();
			//					//				} else {
			//					//				event.stopPropagation(); 
			//				} else {}
			//				console.log("ignore event.type = " + event.type);
			//				console.log("invalidDropTarget = " + invalidDropTarget);
			//				console.log(event.srcElement.localName + '#' + event.srcElement.id + '["' + event.srcElement.classList + '"]');
			//				console.log(event.target.localName + '#' + event.target.id + '["' + event.target.classList + '"]');
			//			}, false && "useCapture"); //$NON-NLS-0$ //$NON-NLS-1$
			document.addEventListener("dragstart", function(event) { //$NON-NLS-0$
				invalidDropTarget = true;
				if (false && true || event.target === dropzoneImport) {
					event.preventDefault();
					//				} else {
					//				event.stopPropagation(); 
				} else {}
				console.log("ignore event.type = " + event.type); //$NON-NLS-0$
				console.log("invalidDropTarget = " + invalidDropTarget); //$NON-NLS-0$
				console.log(event.srcElement.localName + '#' + event.srcElement.id + '["' + event.srcElement.classList + '"]'); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
				console.log(event.target.localName + '#' + event.target.id + '["' + event.target.classList + '"]'); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
			}, false && "useCapture"); //$NON-NLS-0$ //$NON-NLS-1$
			//			document.addEventListener("dragend", function(event) {
			//				//				invalidDropTarget = true;
			//					event.stopPropagation();
			//				event.preventDefault();
			//				console.log("ignore event.type = " + event.type);
			//				console.log("ignore event.returnValue = " + event.returnValue);
			//				console.log("invalidDropTarget = " + invalidDropTarget);
			//				console.log(event.srcElement.localName + '#' + event.srcElement.id + '["' + event.srcElement.classList + '"]');
			//				console.log(event.target.localName + '#' + event.target.id + '["' + event.target.classList + '"]');
			//	console.log("ignore event.type = " + event.type + ": event.dataTransfer = " + JSON.stringify(event.dataTransfer));
			//			}, true && "useCapture");
			dropzoneImport.title = chrome.i18n.getMessage("dropzone_help"); //$NON-NLS-0$ //$NON-NLS-1$
		}
		document.querySelector('button[name=add]').addEventListener('click', add); //$NON-NLS-0$ //$NON-NLS-1$
		//	NOTE: See createSubLine(key, value) for delete button event listener setup. //$NON-NLS-0$ //$NON-NLS-1$
		//	document.querySelector('button[name=delete]').addEventListener('click', del);
		document.querySelector('span[name=editshortcut]').addEventListener('click', createShortcut); //$NON-NLS-0$ //$NON-NLS-1$
		document.querySelector('span[name=deleteshortcut]').addEventListener('click', deleteShortcut); //$NON-NLS-0$ //$NON-NLS-1$
		document.querySelector('button[name=download]').addEventListener('click', function(event) { //$NON-NLS-0$ //$NON-NLS-1$
			console.time("download"); //$NON-NLS-0$
			document.querySelector('a[download]').click(); //$NON-NLS-0$
			console.timeEnd("download"); //$NON-NLS-0$
		});
		document.querySelector('button[name=delete_all]').title = chrome.i18n.getMessage("delete_all_help"); //$NON-NLS-0$ //$NON-NLS-1$
		document.querySelector('button[name=delete_all]').addEventListener('click', function(event) { //$NON-NLS-0$ //$NON-NLS-1$
			document.querySelector('a[download]').click(); //$NON-NLS-0$
			console.time("delete_all"); //$NON-NLS-0$
			localStorage['map' + (new Date()).getTime()] = localStorage.map; //$NON-NLS-0$
			localStorage.map = "[]"; //$NON-NLS-0$
			console.timeEnd("delete_all"); //$NON-NLS-0$
			restore_options();
		});
		document.querySelector('button[name=save]').addEventListener('click', save_options); //$NON-NLS-0$ //$NON-NLS-1$
		document.querySelector('button[name=save]').click(); //$NON-NLS-0$
		//        var draggableExport;
		//        var draggableExport = $('div#tabs-1')[0];
		var draggableExport = $('a[download]')[0]; //$NON-NLS-0$
		//        draggableExport.href = getExportFileURL();
		//        draggableExport.href = chrome.extension.getBackgroundPage().getExportFileURL();
		//		var draggableExport = $('a[name=texttab]')[0];
		//        draggableExport.draggable = "true";
		//        var draggableExport = $('label[name=export]')[0];
		if (false && draggableExport) {
			draggableExport.addEventListener("dragstart", onDragStart, false && "useCapture"); //$NON-NLS-1$ //$NON-NLS-0$
			draggableExport.addEventListener("click", function doNothing(event) { //$NON-NLS-0$
				console.log(event);
				//				event.preventDefault();
			}, false);
			//            draggableExport.addEventListener("dragenter", reportDragDrop, false);
			draggableExport.addEventListener("dragend", function(event) { //$NON-NLS-0$
				event.stopPropagation();
				event.preventDefault();
				console.log("event.type = " + event.type); //$NON-NLS-0$
				console.log("event.returnValue = " + event.returnValue); //$NON-NLS-0$
				if (outsideBrowser(event)) {
					//                    console.log("Elvis has left the building.");
					//				if (event.srcElement === draggableExport) {
					reportDragDrop(event);
				}
				invalidDropTarget = false;
			}, false && "useCapture"); //$NON-NLS-0$
			draggableExport.title += chrome.i18n.getMessage("export_help"); //$NON-NLS-0$ //$NON-NLS-1$
			//            draggableExport.addEventListener("dragover", reportDragDrop, false);
			//            draggableExport.addEventListener("dragexit", reportDragDrop, false);
			//            draggableExport.addEventListener("dragleave", reportDragDrop, false);
			//			draggableExport.addEventListener("drop", reportDragDrop, false);
		} else {
			console.log("draggableExport = " + draggableExport); //$NON-NLS-0$
		}
		// TODO testing an empty event type: ""
		//        draggableExport.addEventListener("", logEvent, false);
		draggableExport.addEventListener("click", function(event) { //$NON-NLS-0$
			logEvent(event);
			if (event.altKey) {
				if (window.confirm(chrome.i18n.getMessage("You requested to remove all abbreviations. Please perform a download without removing abbreviations first."))) {
					localStorage.map = "[]"; //$NON-NLS-0$
					restore_options();
				}
			}
		}, false);
		draggableExport.addEventListener("load", logEvent, false); //$NON-NLS-0$
		draggableExport.addEventListener("error", logEvent, false); //$NON-NLS-0$
		draggableExport.addEventListener("abort", logEvent, false); //$NON-NLS-0$
		//        chrome.webRequest.onBeforeRequest.addListener(function(details) {
		//            console.log(JSON.stringify(details));
		//        }, {
		//            urls: ["<all_urls>"]
		//        });
		//        chrome.webRequest.onCompleted.addListener(function(details) {
		//            console.log(JSON.stringify(details));
		//        }, {
		//            urls: ["<all_urls>"]
		//        });
		//        chrome.webRequest.onErrorOccurred.addListener(function(details) {
		//            console.log(JSON.stringify(details));
		//        }, {
		//            urls: ["<all_urls>"]
		//        });
	} catch (exception) {
		console.log(Date() + ":\n" + "document.readyState:" + document.readyState + "\ndocument.URL:" + document.URL + "\ne.stack:" + exception.stack); //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
	}
});
