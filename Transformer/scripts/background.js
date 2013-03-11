/*jslint browser: true, devel: true, todo: false */
/*global Map, window: false, chrome: false, localStorage: false, $: false, KeyInfo: false */
"use strict"; //$NON-NLS-0$
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

function onReadRequest(request, sender, sendResponse) {
	sendResponse(getSettings());
}

function onPageActionRequest(request, sender, sendResponse) {
	switch (request.action) {
		case "show": //$NON-NLS-0$
			if (localStorage.hideicon !== "true") { //$NON-NLS-0$
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
	}
	sendResponse({}); // snub them.
}

function onRequest(request, sender, sendResponse) {
	switch (request.cmd) {
		case "read": //$NON-NLS-0$
			onReadRequest(request, sender, sendResponse);
			break;

		case "pageaction": //$NON-NLS-0$
			onPageActionRequest(request, sender, sendResponse);
			break;

		default:
			console.warn("unknown request"); //$NON-NLS-0$
			console.warn(request);
			sendResponse({}); // snub them.
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
			chrome.tabs.sendRequest(tab.id, settings, callback);
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
	localStorage.selectphrase = "false"; //$NON-NLS-0$

	localStorage.map = chrome.i18n.getMessage("map_template"); //$NON-NLS-0$
}

function init() {
	if (localStorage.used_before !== "true") { //$NON-NLS-0$
		save_default();
	}
	localStorage.used_before = "true"; //$NON-NLS-0$
}

chrome.extension.onRequest.addListener(onRequest);
init();