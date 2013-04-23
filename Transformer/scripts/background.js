/*jslint browser: true, devel: true, todo: false */
/*global Map, window: false, chrome: false, localStorage: false, $: false, KeyInfo: false */
"use strict"; //$NON-NLS-0$

var exportFileURL;

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

		console.log('Error: ' + e);
	};
	var onInitFs = function(fs) {
		// Remove file if it already exists since existing file will not be truncated by write!
		fs.root.getFile('popchrom.txt', {
			create: false
		}, function(fileEntry) {
			fileEntry.remove(function onSuccess() {
				console.log("Removed " + fileEntry.toURL());
			}, function onError() {
				console.log("Cannot remove " + fileEntry.toURL());
			});
		});
		fs.root.getFile('popchrom.txt', {
			create: true
		}, function(fileEntry) {

			// Create a FileWriter object for our FileEntry (log.txt).
			fileEntry.createWriter(function(fileWriter) {

				fileWriter.onwriteend = function(e) {
					console.log('Write completed.');
					console.log('See ' + fileEntry.fullPath);
					console.log('fileEntry.toURL() = ' + fileEntry.toURL());
					exportFileURL = fileEntry.toURL();
					//					chrome.tabs.create({
					//						url: "filesystem.html"
					//					},
					//
					//					function(tab) {});
					// 	chrome.tabs.create({
					// 	  url: fileEntry.filesystem.root.toURL()
					// 	      }, function(tab) {
					// 		if (chrome.extension.lastError) {
					// 			console.log("lastError:" + chrome.extension.lastError.message);
					// 			return;
					// 		}
					// 		chrome.tabs.executeScript(tab.id, { file: "scripts/filesystem.js", runAt: "document_end" }, function callback(arrayOfAny) {});
					// // 			     if (tab.status === "complete") {
					// 		console.log("document.URL = " + document.URL);
					// 		console.log("tab = " + JSON.stringify(tab));
					// 			     document.body.title = "Please drag files to your desktop for backup";
					// 			     tab.title = "Popchrom Exports";
					// // 			     }
					// });
				};

				fileWriter.onerror = function(e) {
					console.log('Write failed: ' + e.toString());
				};

				// Create a new Blob and write it to log.txt.
				var blob = new window.Blob([localStorage.map], {
					type: 'text/plain'
				});
				fileWriter.write(blob);

			}, errorHandler);

		}, errorHandler);

	};
	window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024 /*5MB*/ , onInitFs, errorHandler);
}

var default_icon = chrome.extension.getURL("icons/icon-16x16.png"); //$NON-NLS-0$

var notifyImages = [
chrome.extension.getURL("icons/anim/notify0.png"), //$NON-NLS-0$
chrome.extension.getURL("icons/anim/notify1.png"), //$NON-NLS-0$
chrome.extension.getURL("icons/anim/notify2.png"), //$NON-NLS-0$
chrome.extension.getURL("icons/anim/notify3.png"), //$NON-NLS-0$
chrome.extension.getURL("icons/anim/notify4.png"), //$NON-NLS-0$
chrome.extension.getURL("icons/anim/notify5.png"), //$NON-NLS-0$
chrome.extension.getURL("icons/anim/notify6.png"), //$NON-NLS-0$
chrome.extension.getURL("icons/anim/notify7.png"), //$NON-NLS-0$
chrome.extension.getURL("icons/anim/notify8.png"), //$NON-NLS-0$
chrome.extension.getURL("icons/anim/notify9.png")]; //$NON-NLS-0$

var notifyDelay = 100;

function getHashMap() {
	var o = localStorage.map;
	var a = JSON.parse(o);

	var map = new Map();

	for (var i = 0;
	(i + 1) < a.length; i += 2) {
		map.put(a[i], a[i + 1]);
	}

	return map;
}

function playSound() {
	try {
		document.getElementById('notify_sound').currentTime = 0; //$NON-NLS-0$
		document.getElementById('notify_sound').play(); //$NON-NLS-0$
	} catch (e) {
		console.error(e);
	}
}

function animateNotify(tabId, pos) {
	if (pos < notifyImages.length) {
		chrome.pageAction.setIcon({
			tabId: tabId,
			path: notifyImages[pos++]
		});
		setTimeout(function() {
			animateNotify(tabId, pos);
		}, notifyDelay);
	} else {
		chrome.pageAction.setIcon({
			tabId: tabId,
			path: default_icon
		});
	}
}

function notify(tabId) {
	if (localStorage.animate === "true") { //$NON-NLS-0$
		animateNotify(tabId, 0);
	}
	if (localStorage.sound === "true") { //$NON-NLS-0$
		playSound();
	}
}

function getSettings() {
	// TODO pack all settings into response
	return {
		cmd: "push", //$NON-NLS-0$
		map: localStorage.map,
		selectPhrase: localStorage.selectphrase,
		replaceKey: localStorage.replacekey
	};
}

function onReadMessage(request, sender, sendResponse) {
	sendResponse(getSettings());
}

function onPageActionMessage(request, sender, sendResponse) {
	// TODO "Format JS" in eclipse orion moves trailing comments on case labels to next line!
	// Use find regexp replace to fix that for now:
	// From:\n[ \t]+(//\$NON.+)
	// To: $1
	// Options: [v] Regular expression
	switch (request.action) {
		case "show":
			//$NON-NLS-0$
			if (localStorage.hideicon !== "true") { //$NON-NLS-0$
				chrome.pageAction.show(sender.tab.id);
			}
			break;
		case "hide":
			//$NON-NLS-0$
			chrome.pageAction.hide(sender.tab.id);
			break;
		case "notify":
			//$NON-NLS-0$
			notify(sender.tab.id);
			break;
		default:
			console.warn("unknown pageaction request"); //$NON-NLS-0$
			console.warn(request);
			// don't respond if you don't understand the message.
			return;
	}
	sendResponse({}); // snub them.
}

function onClipboardMessage(request, sender, sendResponse) {
	if (request.action === "paste") { //$NON-NLS-0$
		sendResponse({
			paste: getClipboard()
		});
	}
}

function handleMessage(request, sender, sendResponse) {
	// TODO "Format JS" in eclipse orion moves trailing comments on case labels to next line!
	// Use find regexp replace to fix that for now:
	// From:\n[ \t]+(//\$NON.+)
	// To: $1
	// Options: [v] Regular expression
	switch (request.cmd) {
		case "read":
			//$NON-NLS-0$
			onReadMessage(request, sender, sendResponse);
			break;
		case "pageaction":
			//$NON-NLS-0$
			onPageActionMessage(request, sender, sendResponse);
			break;
		case "clipboard":
			//$NON-NLS-0$
			onClipboardMessage(request, sender, sendResponse);
			break;
		case "export":
			//$NON-NLS-0$
			exportToFileSystem();
			sendResponse({}); // snub them.
			break;
		default:
			console.warn("unknown request"); //$NON-NLS-0$
			console.warn(request);
			// don't respond if you don't understand the message.
			//		sendResponse({}); // snub them.
	}
}

// Updates all settings in all tabs
function updateSettings(windows) {
	// TODO same function in backgroundpage... migrate!
	var settings = getSettings(),
		w, t, callback = function(response) {};

	for (w in windows) {
		var tabs = windows[w].tabs;
		for (t in tabs) {
			var tab = tabs[t];
			chrome.tabs.sendMessage(tab.id, settings, callback);
		}
	}
}

function broadcastSettings() {
	chrome.windows.getAll({
		populate: true
	}, updateSettings);
}

function save_default() {
	localStorage.hideicon = "false"; //$NON-NLS-0$
	localStorage.animate = "true"; //$NON-NLS-0$
	localStorage.sound = "true"; //$NON-NLS-0$
	localStorage.selectphrase = "true"; //$NON-NLS-0$

	localStorage.map = chrome.i18n.getMessage("map_template"); //$NON-NLS-0$
}

function init() {
	chrome.extension.onMessage.addListener(handleMessage);
	if (localStorage.used_before !== "true") { //$NON-NLS-0$
		save_default();
	}
	var onSubmitPopchromIssue = function(info, tab) {
		try {
			chrome.tabs.query({
				'active': true
			}, function(tab) {
				try {
					console.log(JSON.stringify(tab));
					chrome.tabs.sendMessage(tab[0].id, {
						greeting: "hollow",
						appDetails: JSON.stringify(chrome.app.getDetails())
					}, function(response) {
						chrome.tabs.create({
							url: response.newIssueQueryUrl
						}, function(tab) {});
					});
				} catch (e) {
					console.log("tabs.query reports:\n" + JSON.stringify(e));
				}
			});
		} catch (e) {
			console.log("onSubmitPopchromIssue reports " + e);
		}
	};
	var onAddOrImportAbbrevs = function(info, tab) {
		var parsedText;
		try {
			parsedText = JSON.parse(info.selectionText);
			if (parsedText instanceof Array) {
				if (window.confirm("Do you want to import a set of " + parsedText.length / 2 + " abbreviations defined by the text you selected?")) {
					import_settings(parsedText);
				}
				return;
			}
		} catch (e) {
			//			NOTE OK, this does not look like and import data array.
			var name = window.prompt("Name for new abbreviation?");
			if (name === null || name === "") {} else {
				var re = window.prompt("Enter Pattern below if abbreviation '" + name + "' should take arguments\ne.g.\n\\s+(\\d+)\\s+(\\w+)");
				var regexp = new RegExp(re);
				if (re === null || re === "") {
					import_settings([name, info.selectionText]);
				} else {
					if (regexp && regexp instanceof RegExp) {
						import_settings([name, JSON.stringify([re, info.selectionText])]);
						//    		import_settings("[\""+name+"\", \"[\\\""+re+"\\\", \\\""+info.selectionText+"\\\"]\"]");
						window.confirm("Please review expansion text of '" + name + "' and place symbol substitutions like $1 or $& where appropriate.\nReplace a literal $ with $$.\nAdd \\n line breaks where needed .");
					} else {
						window.confirm("Cannot construct RegExp from String '" + re + "'");
					}
				}
			}
		}
	};
	localStorage.used_before = "true"; //$NON-NLS-0$
	//	//	TODO Need to understand why this removeAll is necessary. I had this code in another extension where I struggled with two calls to the oncLicked listener as well.
	//	chrome.contextMenus.removeAll(function() {
	//		if (chrome.extension.lastError) {
	//			console.log("lastError:" + chrome.extension.lastError.message);
	//		}
	//	});
	var addAbbrevId = chrome.contextMenus.create({
		// TODO Causes lastError:Cannot create item with duplicate id addAbbrevId background.js:250
		// but multiple items are crated if id is absent. Live with the error for now.
		id: "addAbbrevId",
		type: "normal",
		title: "Add/Import Popchrom abbreviation(s) for '%s'",
		onclick: onAddOrImportAbbrevs,
		contexts: ["selection"]
	}, function() {
		if (chrome.extension.lastError) {
			console.log("lastError:" + chrome.extension.lastError.message);
		}
	});
	var submitPopchromIssueId = chrome.contextMenus.create({
		// TODO Causes lastError:Cannot create item with duplicate id submitPopchromIssueId
		// but multiple items are crated if id is absent. Live with the error for now.
		id: "submitPopchromIssueId",
		type: "normal",
		title: "Submit New Popchrom Issue for '%s'",
		onclick: onSubmitPopchromIssue,
		contexts: ["all"]
	}, function() {
		if (chrome.extension.lastError) {
			console.log("lastError:" + chrome.extension.lastError.message);
		}
	});
	var toggleMarkingText = function(info, tab) {
		localStorage.selectphrase = JSON.stringify(!JSON.parse(localStorage.selectphrase));
		broadcastSettings();
		chrome.tabs.query({
			url: chrome.extension.getURL("options.html")
		}, function(tabs) {
			//				if (tabs.length === 0) {
			//					window.open(chrome.extension.getURL("options.html"), "", "");
			//				}
			// Just update an open options page, don't open it.
			if (tabs.length === 1) {
				chrome.tabs.update(tabs[0].id, {
					highlighted: true
					//					active: true
				});
				chrome.tabs.reload(tabs[0].id);
			}
		});
	};
	var toggleMarkText = chrome.contextMenus.create({
		// TODO Causes lastError:Cannot create item with duplicate id toggleMarkText
		// but multiple items are crated if id is absent. Live with the error for now.
		id: "toggleMarkText",
		type: "checkbox",
		checked: JSON.parse(localStorage.selectphrase),
		title: chrome.i18n.getMessage("selectphrase"),
		onclick: toggleMarkingText,
		contexts: ["all"]
	}, function() {
		if (chrome.extension.lastError) {
			console.log("lastError:" + chrome.extension.lastError.message);
		}
	});
	//	chrome.contextMenus.onClicked.addListener(onClick);
	chrome.pageAction.onClicked.addListener(function(tab) {
		console.log("clicked popchrom pageAction on tab " + tab.url);
		chrome.tabs.query({
			url: chrome.extension.getURL("options.html")
		}, function(tabs) {
			if (tabs.length === 0) {
				chrome.pageAction.getTitle({
					tabId: tab.id
				}, function(result) {
					window.open(chrome.extension.getURL("options.html"), result, "");
				});
			}
			if (tabs.length === 1) {
				chrome.tabs.update(tabs[0].id, {
					highlighted: true
					//					active: true
				});
			}
		});
	});
}

init();