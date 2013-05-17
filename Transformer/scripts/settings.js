/*jslint browser: true, devel: true, todo: true */
/*global Map, window: false, chrome: false*/
"use strict"; //$NON-NLS-0$
// class for pageaction commands
function PageAction() {
	this.visible = false;

	this.show = function() {
		if (!this.visible) {
			chrome.extension.sendMessage({
				cmd: "pageaction", //$NON-NLS-0$
				action: "show" //$NON-NLS-0$
			}, this.onResponse);
			this.visible = true;
		}
	};

	this.hide = function() {
		chrome.extension.sendMessage({
			cmd: "pageaction", //$NON-NLS-0$
			action: "hide" //$NON-NLS-0$
		}, this.onResponse);
		this.visible = false;
	};

	this.notify = function() {
		chrome.extension.sendMessage({
			cmd: "pageaction", //$NON-NLS-0$
			action: "notify" //$NON-NLS-0$
		}, this.onResponse);
	};

	// wo dont expect response
	this.onResponse = function(response) {
		// console.log(response);
	};
}

// class for shorcut keys
function KeyInfo(keyCode, ctrl, alt, shift, meta, altGraph) {
	function KeyData() {
		this.keyCode = keyCode;
		this.ctrlKey = ctrl;
		this.altKey = alt;
		this.shiftKey = shift;
		this.metaKey = meta;
		this.altGraphKey = altGraph;
	}

	this.D = new KeyData();

	this.equals = function(event) {
		return ((this.D.keyCode === event.keyCode) && (this.D.ctrlKey === event.ctrlKey) && (this.D.altKey === event.altKey) && (this.D.shiftKey === event.shiftKey) && (this.D.metaKey === event.metaKey) && (this.D.altGraphKey === event.altGraphKey));
	};

	this.fromEvent = function(event) {
		this.D.keyCode = event.keyCode;
		this.D.ctrlKey = event.ctrlKey;
		this.D.altKey = event.altKey;
		this.D.shiftKey = event.shiftKey;
		this.D.metaKey = event.metaKey;
		this.D.altGraphKey = event.altGraphKey;
	};

	this.toString = function() {
		var result = "";

		result += this.D.ctrlKey === true ? chrome.i18n.getMessage("ctrl") + " + " : ""; //$NON-NLS-0$ //$NON-NLS-1$
		result += this.D.altKey === true ? chrome.i18n.getMessage("alt") + " + " : ""; //$NON-NLS-0$  //$NON-NLS-1$
		result += this.D.shiftKey === true ? chrome.i18n.getMessage("shift") + " + " : ""; //$NON-NLS-0$ //$NON-NLS-1$
		result += this.D.metaKey === true ? chrome.i18n.getMessage("meta") + " + " : ""; //$NON-NLS-0$ //$NON-NLS-1$
		result += this.D.altGrKey === true ? chrome.i18n.getMessage("altgr") + " + " : ""; //$NON-NLS-0$ //$NON-NLS-1$

		if (this.D.keyCode === 32) {
			result += chrome.i18n.getMessage("space"); //$NON-NLS-0$
		} else {
			result += String.fromCharCode(this.D.keyCode);
		}

		return result;
	};

	this.fromStore = function(jsonString) {
		this.D = JSON.parse(jsonString);
	};

	this.toStore = function() {
		return JSON.stringify(this.D);
	};
}

// Settings class
function Settings() {
	this.map = new Map();

	this.replaceKey = new KeyInfo(32, true, false, false, false, false);
	this.globalReplaceKey = new KeyInfo(32, true, false, true, false, false);

	this.selectPhrase = true;

	// workaround for callbacks.
	var S = this;

	this.readRequest = function() {
		chrome.extension.sendMessage({
			cmd: "read" //$NON-NLS-0$
		}, this.processMessage);
	};

	this.enableListener = function() {
		chrome.extension.onMessage.addListener(this.onMessage);
	};

	this.onMessage = function(msg, sender, sendResponse) {
		if (msg.cmd === "push") { //$NON-NLS-0$
			// "this" does not work.
			S.processMessage(msg);
		} else {
			console.warn("unknown command message"); //$NON-NLS-0$
		}
		// don't respond if you don't understand the message.
//		sendResponse({}); // snub them.
	};

	this.processMessage = function(msg) {
		// "this" does not work.
		if (msg.map) {
			S.refreshMap(msg.map);
		}
		if (msg.replaceKey) {
			S.replaceKey.fromStore(msg.replaceKey);
		}
		if (msg.globalReplaceKey) {
			S.globalReplaceKey.fromStore(msg.globalReplaceKey);
		}
		if (msg.selectPhrase) {
			S.selectPhrase = JSON.parse(msg.selectPhrase);
		}
	};

	this.refreshMap = function(mapdata) {
		var a = JSON.parse(mapdata);

		this.map = new Map();

		// read array pairwise to fill hashmap
		for (var i = 0;
		(i + 1) < a.length; i += 2) {
			this.map.put(a[i], a[i + 1]);
		}
	};
}
