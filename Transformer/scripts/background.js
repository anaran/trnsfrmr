/*jslint browser: true, devel: true, todo: false */
/*global Map, window: false, chrome: false, localStorage: false, $: false, KeyInfo: false */
	"use strict";
var default_icon = chrome.extension.getURL("icons/icon-16x16.png");

var notifyImages = [
chrome.extension.getURL("icons/anim/notify0.png"),
chrome.extension.getURL("icons/anim/notify1.png"),
chrome.extension.getURL("icons/anim/notify2.png"),
chrome.extension.getURL("icons/anim/notify3.png"),
chrome.extension.getURL("icons/anim/notify4.png"),
chrome.extension.getURL("icons/anim/notify5.png"),
chrome.extension.getURL("icons/anim/notify6.png"),
chrome.extension.getURL("icons/anim/notify7.png"),
chrome.extension.getURL("icons/anim/notify8.png"),
chrome.extension.getURL("icons/anim/notify9.png")];

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
		document.getElementById('notify_sound').currentTime = 0;
		document.getElementById('notify_sound').play();
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
	if (localStorage.animate === "true") {
		animateNotify(tabId, 0);
	}
	if (localStorage.sound === "true") {
		playSound();
	}
}

function getSettings() {
	// TODO pack all settings into response
	return {
		cmd: "push",
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
		case "show":
			if (localStorage.hideicon !== "true") {
				chrome.pageAction.show(sender.tab.id);
			}
			break;
		case "hide":
			chrome.pageAction.hide(sender.tab.id);
			break;
		case "notify":
			notify(sender.tab.id);
			break;
		default:
			console.warn("unknown pageaction request");
			console.warn(request);
	}
	sendResponse({}); // snub them.
}

function onRequest(request, sender, sendResponse) {
	switch (request.cmd) {
		case "read":
			onReadRequest(request, sender, sendResponse);
			break;

		case "pageaction":
			onPageActionRequest(request, sender, sendResponse);
			break;

		default:
			console.warn("unknown request");
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
	localStorage.hideicon = "false";
	localStorage.animate = "true";
	localStorage.sound = "true";
	localStorage.selectphrase = "false";

	localStorage.map = chrome.i18n.getMessage("map_template");
}

function init() {
	if (localStorage.used_before !== "true") {
		save_default();
	}
	localStorage.used_before = "true";
}

chrome.extension.onRequest.addListener(onRequest);
init();