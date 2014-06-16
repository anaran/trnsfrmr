/* -*- Mode: js; tab-width: 8; indent-tabs-mode: t; js-indent-level: 8; fill-column: 80 -*- */
/*jslint browser: true, devel: true, todo: false */
/*global Map, window: false, chrome: false, localStorage: false, $: false, KeyInfo: false */
"use strict"; //$NON-NLS-0$

// TODO "Format JS" in eclipse orion moves trailing comments on case labels to next line!
// Use find regexp replace to fix that for now:
// From:\n[ \t]+(//\$NON.+)
// To: $1
// Options: [v] Regular expression

// TODO Find unquoted object properties and double-quote them (conforms to JSON)
// Use find regexp replace to fix that for now:
// From:([{,]\s+)((//.*\n)*)([^'"/ ]+):
// To:$1$2"$4":
// Options: [v] Regular expression

// TODO Find double-quoted object properties and single-quote them (does not conform to JSON)
// Use find regexp replace to fix that for now:
// From:([{,]\s+)((\s*//.*\n)*)(\s*)"([^'"/ ]+)":
// To:$1$2$3'$4':
// Options: [v] Regular expression

//TODO Convert from querySelector() to $() jQuery
// Use find regexp replace to fix that for now:
// From:document.querySelector\(((['"]).+\2)\)
// To:$$($1)[0]
// Options: [v] Regular expression

var default_icon = chrome.extension.getURL("icons/icon-16x16.png"); //$NON-NLS-0$
var toggleMarkText;
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
			"tabId": tabId, //$NON-NLS-0$
			"path": notifyImages[pos++] //$NON-NLS-0$
		});
		setTimeout(function() {
			animateNotify(tabId, pos);
		}, notifyDelay);
	} else {
		chrome.pageAction.setIcon({
			"tabId": tabId, //$NON-NLS-0$
			"path": default_icon //$NON-NLS-0$
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
		'cmd': "push", //$NON-NLS-0$ //$NON-NLS-1$
		"map": localStorage.map, //$NON-NLS-0$
		"selectPhrase": localStorage.selectphrase, //$NON-NLS-0$
		"replaceKey": localStorage.replacekey //$NON-NLS-0$
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
		case "show": //$NON-NLS-0$
			if (localStorage.hideicon !== "true") { //$NON-NLS-0$
				chrome.pageAction.setIcon({
					"tabId": sender.tab.id, //$NON-NLS-0$
					"path": default_icon //$NON-NLS-0$
				});
				chrome.pageAction.show(sender.tab.id);
			}
			break;
		case "hide": //$NON-NLS-0$
			chrome.pageAction.hide(sender.tab.id);
			break;
		case "notify": //$NON-NLS-0$
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
			"paste": getClipboard() //$NON-NLS-0$
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
		case "options": //$NON-NLS-0$
			reloadOptionsPage("createAsWell"); //$NON-NLS-0$
			break;
		case "read": //$NON-NLS-0$
			onReadMessage(request, sender, sendResponse);
			break;
		case "pageaction": //$NON-NLS-0$
			onPageActionMessage(request, sender, sendResponse);
			break;
		case "clipboard": //$NON-NLS-0$
			onClipboardMessage(request, sender, sendResponse);
			break;
		case "issuedetails": //$NON-NLS-0$
			chrome.tabs.query({
				"active": true, //$NON-NLS-0$
				"currentWindow": true //$NON-NLS-0$
			}, function(tab) {
				chrome.tabs.sendMessage(tab[0].id, {
					"cmd": "onSubmitPopchromIssue", //$NON-NLS-1$ //$NON-NLS-0$
					"url": tab[0].url, //$NON-NLS-0$
					"appDetails": JSON.stringify(chrome.app.getDetails()) //$NON-NLS-0$
				}, function(response) {
					if (response) {
						sendResponse({
							"summary": response.summary, //$NON-NLS-0$
							"body": response.body //$NON-NLS-0$
						});
						chrome.tabs.update(sender.tab.id, {
							"highlighted": true //$NON-NLS-0$
							//					active: true
						});
					} else {
						console.log("onSubmitPopchromIssue leads undefined " + JSON.stringify(response)); //$NON-NLS-0$
						// TODO Yep I am the background page, I just use what other scripts should.
						chrome.extension.getBackgroundPage().alert(chrome.i18n.getMessage("bad_issue_tab")); //$NON-NLS-1$ //$NON-NLS-0$
					}
				});
			});
			// TODO Note that I am fixing following problem here: Could not send response: The chrome.runtime.onMessage listener must return true if you want to send a response after the listener returns  (message was sent by extension hiefpgnngkikffmhgghabfikbbeilkif).
			return true;
			// TODO Note that not all message types are handled for a single content script.
			// It is OK to not understand a message.
			// don't respond if you don't understand the message.
			// sendResponse({}); // snub them.
	}
}

// Updates all settings in all tabs
function updateSettings(windows) {
	// TODO same function in backgroundpage... migrate!
	var settings = getSettings(),
		w, t, callback = function(response) {};
	if (toggleMarkText) {
		chrome.contextMenus.update(toggleMarkText, {
			checked: JSON.parse(settings.selectPhrase)
		});
	}
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
		"populate": true //$NON-NLS-0$
	}, updateSettings);
}

function save_default() {
	localStorage.hideicon = "false"; //$NON-NLS-0$
	localStorage.animate = "true"; //$NON-NLS-0$
	localStorage.sound = "true"; //$NON-NLS-0$
	localStorage.selectphrase = "true"; //$NON-NLS-0$
	localStorage.map = chrome.i18n.getMessage("map_template"); //$NON-NLS-0$
}

function addOrImportAbbrevs(text) {
	var parsedText;
	try {
		parsedText = JSON.parse(text);
		if (parsedText instanceof Array) {
			if (chrome.extension.getBackgroundPage().confirm(chrome.i18n.getMessage("import_set") + parsedText.length / 2 + chrome.i18n.getMessage("import_selected_text"))) {
				import_settings(parsedText);
			}
			return;
		}
	} catch (e) {
		// NOTE OK, this does not look like an import data array.
		var name = chrome.extension.getBackgroundPage().prompt(chrome.i18n.getMessage("name_abbrev"));
		if (name === null || name === "") {} else {
			var re = chrome.extension.getBackgroundPage().prompt(chrome.i18n.getMessage("enter_pattern") + name + chrome.i18n.getMessage("or_delete_pattern"),
				"\\s+(\\d+)\\s+(\\w+)"); //$NON-NLS-0$
			var regexp = new RegExp(re);
			if (re === null || re === "") {
				import_settings([name, text]);
			} else {
				if (regexp && regexp instanceof RegExp) {
					import_settings([name, JSON.stringify([re, text])]);
					chrome.extension.getBackgroundPage().confirm(chrome.i18n.getMessage("review_expansion") + name + chrome.i18n.getMessage("place_substitutions"));
				} else {
					chrome.extension.getBackgroundPage().confirm(chrome.i18n.getMessage("cannot_construct_regexp") + re + "'");
				}
			}
		}
	}
}

function reloadOptionsPage(create) {
	var url = chrome.extension.getURL("options.html"); //$NON-NLS-0$
	chrome.tabs.query({
		"url": url //$NON-NLS-0$
	}, function(tabs) {
		// Just update an open options page, don't open it.
		if (tabs.length === 1) {
			chrome.tabs.update(tabs[0].id, {
				"highlighted": true //$NON-NLS-0$
				// active: true
			});
			chrome.tabs.reload(tabs[0].id);
		} else if (create) {
			chrome.tabs.query({
				"active": true, //$NON-NLS-0$
				"currentWindow": true //$NON-NLS-0$
			}, function(tab) {
				chrome.tabs.create({
					"url": url, //$NON-NLS-0$
					// TODO Please note that when we specify openerTabId closing the new tab brings us back to that tab when it still exists.
					"openerTabId": tab[0].id //$NON-NLS-0$
				}, function(tab) {});
			});
		}
	});
}

function init() {
	chrome.extension.onMessage.addListener(handleMessage);
	if (localStorage.used_before !== "true") { //$NON-NLS-0$
		save_default();
	}
	localStorage.used_before = "true"; //$NON-NLS-0$
	// TODO Please note this removeAll is necessary to avoid following warning when extension is reloaded:
	// contextMenus.create: Cannot create item with duplicate id ID
	chrome.contextMenus.removeAll(function() {
		if (chrome.extension.lastError) {
			console.log("lastError:" + chrome.extension.lastError.message);
		}
	});
	var onAddOrImportAbbrevs = function(info, tab) {
		console.log(JSON.stringify([info, tab]));
		chrome.tabs.sendMessage(tab.id, {
			"cmd": "getSelection", //$NON-NLS-1$ //$NON-NLS-0$
			"url": tab.url //$NON-NLS-0$
		}, function(response) {
			if (response && response.selection) {
				addOrImportAbbrevs(response.selection);
			} else {
				// TODO Yep I am the background page, I just use what other scripts should.
				chrome.extension.getBackgroundPage().alert(chrome.i18n.getMessage("bad_abbrev_tab")); //$NON-NLS-1$ //$NON-NLS-0$
				addOrImportAbbrevs(info.selectionText);
			}
		});
	};
	var addAbbrevId = chrome.contextMenus.create({
		// TODO Causes lastError:Cannot create item with duplicate id addAbbrevId background.js:250
		// but multiple items are created if id is absent. Live with the error for now.
		"id": "addAbbrevId", //$NON-NLS-1$ //$NON-NLS-0$
		"type": "normal", //$NON-NLS-1$ //$NON-NLS-0$
		"title": chrome.i18n.getMessage("add_import_for"), //$NON-NLS-0$
		"onclick": onAddOrImportAbbrevs, //$NON-NLS-0$
		"contexts": ["selection"] //$NON-NLS-1$ //$NON-NLS-0$
	}, function() {
		if (chrome.extension.lastError) {
			console.log("lastError:" + chrome.extension.lastError.message);
		}
	});
	var onSubmitPopchromIssue = function(info, tab) {
		try {
			console.log(JSON.stringify([info, tab]));
			// TODO This URL is duplicated in search.js so that the content script can determine whether it has to send an "issuedetails" message.
			var newIssueUrl = "https://code.google.com/p/trnsfrmr/issues/entry"; //$NON-NLS-0$
			// TODO Note that the content script of the issue page will send us a "issuedetails" message.
			chrome.tabs.create({
				"active": false, //$NON-NLS-0$
				"url": newIssueUrl //$NON-NLS-0$
			}, function(tab) {});
		} catch (e) {
			console.log("onSubmitPopchromIssue reports " + e); //$NON-NLS-0$
		}
	};
	var submitPopchromIssueId = chrome.contextMenus.create({
		// TODO Causes lastError:Cannot create item with duplicate id submitPopchromIssueId
		// but multiple items are created if id is absent. Live with the error for now.
		"id": "submitPopchromIssueId", //$NON-NLS-1$ //$NON-NLS-0$
		"type": "normal", //$NON-NLS-1$ //$NON-NLS-0$
		"title": chrome.i18n.getMessage("submit_issue_for"), //$NON-NLS-0$
		"onclick": onSubmitPopchromIssue, //$NON-NLS-0$
		"contexts": ["all"] //$NON-NLS-1$ //$NON-NLS-0$
	}, function() {
		if (chrome.extension.lastError) {
			console.log("lastError:" + chrome.extension.lastError.message);
		}
	});
	var toggleMarkingText = function(info, tab) {
		localStorage.selectphrase = JSON.stringify(!JSON.parse(localStorage.selectphrase));
		broadcastSettings();
		reloadOptionsPage();
	};
	toggleMarkText = chrome.contextMenus.create({
		// TODO Causes lastError:Cannot create item with duplicate id
		// toggleMarkText but multiple items are created if id is
		// absent. Live with the error for now.
		"id": "toggleMarkText", //$NON-NLS-1$ //$NON-NLS-0$
		"type": "checkbox", //$NON-NLS-1$ //$NON-NLS-0$
		"checked": JSON.parse(localStorage.selectphrase), //$NON-NLS-0$
		"title": chrome.i18n.getMessage("selectphrase"), //$NON-NLS-1$ //$NON-NLS-0$
		"onclick": toggleMarkingText, //$NON-NLS-0$
		"contexts": ["all"] //$NON-NLS-1$ //$NON-NLS-0$
	}, function() {
		if (chrome.extension.lastError) {
			console.log("lastError:" + chrome.extension.lastError.message);
		}
	});
	chrome.pageAction.onClicked.addListener(function(tab) {
		console.log("clicked popchrom pageAction on tab " + tab.url); //$NON-NLS-0$
		reloadOptionsPage("createAsWell"); //$NON-NLS-0$
	});
}

init();
