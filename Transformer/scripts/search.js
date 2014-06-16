/* -*- Mode: js; tab-width: 8; indent-tabs-mode: t; js-indent-level: 8; fill-column: 80 -*- */
/*jslint browser: true, devel: true, todo: true */
/*global Settings, PageAction, replaceAllDates, window: false, chrome: false, $: false, KeyInfo: false */
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

//TODO Convert from querySelector() to $() jQuery
// Use find regexp replace to fix that for now:
// From:document.querySelector\(((['"]).+\2)\)
// To:$$($1)[0]
// Options: [v] Regular expression

var settings;
var pageaction;
var abbrevMostRecentlyUsed = window.localStorage.mru ? JSON.parse(window.localStorage.mru) : new Array(10);

function setNonEditableSelectionCursor(start, end, element, settings) {
	// set selection/cursor
	element.selectionStart = settings.selectPhrase ? start : end;
	element.selectionEnd = end;
}

function setEditableSelectionCursor(selection, doc, expansionNode, settings) {
	// set selection/cursor
	selection.removeAllRanges();
	var range = doc.createRange();
	range.selectNodeContents(expansionNode);
	if (!settings.selectPhrase) {
		// Collapse range to end, i.e. toStart argument is false.
		range.collapse(false);
	}
	// Always add the range to restore focus.
	selection.addRange(range);
}

function updateMostRecentlyUsedList(key) {
	var keyExists = abbrevMostRecentlyUsed.some(function(value, index, object) {
		if (value === key) {
			// Delete key from its current location in the array.
			object.splice(index, 1);
		}
	});
	if (abbrevMostRecentlyUsed.length > 9) {
		// Make room in the MRU array for a new key by popping off oldest key (not recently used).
		abbrevMostRecentlyUsed.pop();
	}
	// Place key on top of the array.
	abbrevMostRecentlyUsed.unshift(key);
	window.localStorage.mru = JSON.stringify(abbrevMostRecentlyUsed.filter(function(value, index, object) {
		return true;
	}));
}

function getMostRecentlyUsedList() {
	return abbrevMostRecentlyUsed;
}

function findInputElements(elem) {
	for (var i = 0; i < elem.length; i++) {
		var type = elem[i].type;
		type.toLocaleLowerCase();
		if ((type === "text") || (type === "password") || (type === "textarea")) { //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
			return true;
		}
	}
	return false;
}

// FIXME Eliminate this global variable.
var unExpandedValue;

function extractKeyWord(str, s, e) {
	var result = {};
	result.before = "";
	result.after = "";
	result.key = "";
	// if nothing is selected find word boundaries
	if (s === e) {
		// string b(efore) and a(fter) cursor
		var b = str.substring(0, s);
		var a = str.substring(e);
		// take care of U+00A0 NO-BREAK SPACE as well
		// Fixes issue 70.
		// take care of >;<& to fix issue 38.
		var rb = b.match(/[^ \t\n\u00A0>;]*$/);
		var ra = a.match(/^[^ \t\n\u00A0<&]*/);
		s -= rb[0].length;
		e += ra[0].length;
	}
	result.before = str.substring(0, s);
	result.key = str.substring(s, e);
	result.after = str.substring(e);
	return result;
}

function handleArguments(value, r) {
	var fromRegExp, offsetFromEnd, m;
	try {
		var x = JSON.parse(value);
		if (x.length !== 2) {
			chrome.extension.getBackgroundPage().alert(chrome.i18n.getMessage("two_elements") + chrome.i18n.getMessage("eg_regexp") + chrome.i18n.getMessage("fix_def") + r.key + "\"\n" + value); //$NON-NLS-5$ //$NON-NLS-1$ //$NON-NLS-0$
		}
		try {
			fromRegExp = new RegExp("^" + x[0], ""); //$NON-NLS-0$
		} catch (e) {
			// NOTE The initial array element is not a string (can be used in a RegExp constructor).
			chrome.extension.getBackgroundPage().prompt(e.toString(), //$NON-NLS-1$ //$NON-NLS-0$
			chrome.i18n.getMessage("see_regexp_help"));
		}
		var toReplacement = x[1];
		// NOTE Is replacement argument really a string?
		if (typeof(toReplacement) !== "string") { //$NON-NLS-0$
			chrome.extension.getBackgroundPage().alert(toReplacement + chrome.i18n.getMessage("fix_non_quoted") + r.key + "\"\n" + value); //$NON-NLS-3$ //$NON-NLS-1$ //$NON-NLS-0$
		}
		try {
			m = r.after.match(fromRegExp);
			if (m === null) {
				chrome.extension.getBackgroundPage().alert(chrome.i18n.getMessage("extname") + ": \"" + fromRegExp + chrome.i18n.getMessage("not_match_arguments") + r.key + "\" \"" + r.after.substring(0, Math.min(r.after.length, 15)) + (r.after.length > 15 ? "..." : "") + chrome.i18n.getMessage("fix_args_or_def") + r.key + "\"\n" + value); //$NON-NLS-7$ //$NON-NLS-5$ //$NON-NLS-4$ //$NON-NLS-3$ //$NON-NLS-1$ //$NON-NLS-0$
				return;
			}
			unExpandedValue = r.key + m[0];
			offsetFromEnd = r.after.length - m[0].length;
		} catch (e1) {
			chrome.extension.getBackgroundPage().alert(e1.toString()); //$NON-NLS-1$ //$NON-NLS-0$
		}
		value = m[0].replace(fromRegExp, toReplacement);
		r.after = r.after.substring(m[0].length);
	} catch (e2) {
		// NOTE Reporting all exceptions here would be annoying.
		// It would come up for every simple abbreviation expansion which is not a valid
		// JSON text.
		// It might still be useful to report other errors to point out likely
		// syntactical errors of advanced abbrevations.
		// TODO Please note that unexpected_token must be localized carefully because it is being compared to here.
		if (e2 && e2.toString() !== chrome.i18n.getMessage("unexpected_token") + typeof value === "string" ? value.substring(0, 1) : "") { //$NON-NLS-1$
			chrome.extension.getBackgroundPage().prompt(e2.toString() + chrome.i18n.getMessage("fix_def") + r.key + "\"\n" + value); //$NON-NLS-3$ //$NON-NLS-1$ //$NON-NLS-0$
		} else {
			unExpandedValue = r.key;
		}
	}
	return value;
}

//replaces the keys with the assigned values in the element.
function checkElements(elem) {
	// "use strict";
	var substituted = false,
		element = elem,
		s, r, value, expandedElementType;
	if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") { //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
		// if text is selected abort... see wysiwyg-editor
		if (element.selectionStart !== element.selectionEnd) {
			var oldSelectionStart = element.selectionStart;
			element.value = element.value.substring(0, element.selectionStart) + unExpandedValue + element.value.substring(element.selectionEnd, element.value.length);
			element.selectionStart = element.selectionEnd = oldSelectionStart;
			substituted = true;
			// TODO reenable when selection in wysiwyg-editor works
			return substituted;
		}
		r = extractKeyWord(element.value, element.selectionStart, element.selectionEnd);
		value = settings.map.get(r.key);
		value = handleArguments(value, r);
		if (value) {
			substituted = true;
			updateMostRecentlyUsedList(r.key);
			// date substitution
			value = replaceAllDates(value);
			if (element.tagName === "TEXTAREA") {} else { //$NON-NLS-0$
				value = value.replace(/[\n\r]+/g, " "); //$NON-NLS-0$
			}
			var tmp = r.before + value;
			element.value = tmp + r.after;
			element.selectionStart = r.before.length;
			element.selectionEnd = element.selectionStart;
			var clipParam = "%CLIPBOARD%"; //$NON-NLS-0$
			if (window.find(clipParam, "aCaseSensitive", !"aBackwards", !"aWrapAround", //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
			"aWholeWord", !"aSearchInFrames", !"aShowDialog")) { //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
				chrome.extension.sendMessage({
					cmd: "clipboard", //$NON-NLS-0$
					action: "paste" //$NON-NLS-0$
				}, function(response) {
					if (response.paste) {
						document.activeElement.setRangeText(response.paste);
					}
					setNonEditableSelectionCursor(r.before.length,
					tmp.length + response.paste.length - clipParam.length, element, settings);
				});
			} else {
				setNonEditableSelectionCursor(r.before.length, tmp.length, element, settings);
			}
		}
	} else if (element.isContentEditable) {
		// NOTE normalize split or empty text elements.
		// e.g. "badly " "split" "" "" "" " text" becomes "badly split text"
		// Don't do this here since it invalidates the current selection!
		// element.normalize();
		// var doc = element.ownerDocument;
		var doc = document;
		var selection = doc.getSelection();
		var kcc = document.body.querySelector('.kix-cursor-caret'); //$NON-NLS-0$
		var kso, gbcr, efp, crfp;
		if (kcc) { //$NON-NLS-0$
			// TODO Please note Google Drive (formerly Google Docs) uses KIX, mildly useful sources available at
			// https://github.com/benjamn/kix-standalone
			// found via http://stackoverflow.com/questions/7877225/google-docs-textcursor
			// or directly in Chrome DevTools Source views
			kso = document.body.querySelector('.kix-selection-overlay'); //$NON-NLS-0$
			gbcr = kcc.getBoundingClientRect();
			efp = document.elementFromPoint(gbcr.left, gbcr.bottom);
			crfp = document.caretRangeFromPoint(gbcr.left, gbcr.bottom);
		}
		if (selection.isCollapsed && !kso) {
			element = kcc ? efp : selection.anchorNode;
			s = kcc ? crfp.startOffset : selection.anchorOffset;
			r = extractKeyWord(element.textContent, s, s);
			value = settings.map.get(r.key);
			value = handleArguments(value, r);
			if (value) {
				substituted = true;
				updateMostRecentlyUsedList(r.key);
				value = replaceAllDates(value);

				var beforepos = r.before.length;
				if (kcc) {
					element.textContent = r.before + " " + value + " " + r.after;
				} else {
					// split text into "element" - "keyword" - "aftervalue"
					var keyword = element.splitText(beforepos);
					var aftervalue = keyword.splitText(unExpandedValue.length);
					// TODO check for other linebreaks like unix or mac style
					var lines = value.split("\n"); //$NON-NLS-0$
					var expansionNode = doc.createElement("div"); //$NON-NLS-0$
					if (lines.length > 1) {
						for (var i = 0; i < lines.length; i++) {
							var div = doc.createElement("div"); //$NON-NLS-0$
							if (lines[i].length > 0) {
								expansionNode.appendChild(div.appendChild(doc.createTextNode(lines[i])).parentNode);
							} else {
								expansionNode.appendChild(div.appendChild(doc.createElement("br")).parentNode); //$NON-NLS-0$
							}
						}
					} else {
						var span = doc.createElement("span"); //$NON-NLS-0$
						expansionNode.appendChild(span.appendChild(doc.createTextNode(lines[0])).parentNode);
					}
					element.parentNode.replaceChild(expansionNode, keyword);
					if (window.find("%CLIPBOARD%", "aCaseSensitive", !"aBackwards", !"aWrapAround", //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
					"aWholeWord", !"aSearchInFrames", !"aShowDialog")) { //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
						chrome.extension.sendMessage({
							cmd: "clipboard", //$NON-NLS-0$
							action: "paste" //$NON-NLS-0$
						}, function(response) {
							if (response.paste) {
								document.getSelection().getRangeAt(0).deleteContents();
								document.getSelection().getRangeAt(0).insertNode(document.createTextNode(response.paste));
							}
							setEditableSelectionCursor(selection, doc, expansionNode, settings);
						});
					} else {
						setEditableSelectionCursor(selection, doc, expansionNode, settings);
					}
				}
			}
		} else {
			try {
				var ancestor = selection.anchorNode;
				var unexpandedNode = doc.createTextNode(unExpandedValue);
				ancestor.parentNode.insertBefore(unexpandedNode, ancestor);
				selection.deleteFromDocument();
				var range = doc.createRange();
				range.selectNode(unexpandedNode);
				document.getSelection().removeAllRanges();
				document.getSelection().addRange(range);
				document.getSelection().collapseToStart();
				// Normalization also deactivated a selection.
				// Since it may change the HTML structure we
				// do this last.
				unexpandedNode.parentNode && unexpandedNode.parentNode.normalize();
			} catch (error) {
				console.log(error, range, unexpandedNode);
			}
			substituted = true;
		}
	}
	return substituted;
}

function pageHasEditableElements() {
	var elemInput = document.getElementsByTagName("input"); //$NON-NLS-0$
	var elemTextarea = document.getElementsByTagName("textarea"); //$NON-NLS-0$

	return (elemTextarea.length > 0 || findInputElements(elemInput));
}

// trigger replaceKeysWithValues method on key event space or enter
function onKeyEvent(e) {
	if (settings.replaceKey.equals(e)) {
		var element = e.srcElement;

		if (checkElements(element)) {
			pageaction.notify();
		} else {
			if (document.activeElement.isContentEditable || !document.activeElement.hasOwnProperty("readOnly") || !document.activeElement.readOnly) { //$NON-NLS-0$
				if (chrome.hasOwnProperty("notifications")) {
					var opt = {
						type: "basic",
						title: chrome.i18n.getMessage("extname") + chrome.i18n.getMessage("recent_expansions"),
						message: getMostRecentlyUsedList().filter(function(value, index, object) {
							return true;
						}).map(function(value, index, object) {
							return value;
						}).join(" "),
						iconUrl: chrome.extension.getURL("icons/icon-48x48.png")
					}
					var notification = chrome.notifications.create("", opt, function(notificationId) {
						return notificationId;
					});
				}
			    else if (window.hasOwnProperty('Notification')) {
				var notification = new Notification(
				    chrome.i18n.getMessage("extname") + chrome.i18n.getMessage("recent_expansions"), {
					icon: chrome.extension.getURL("icons/icon-48x48.png"),
					body: getMostRecentlyUsedList().filter(function(value, index, object) {
					    return true;
					}).map(function(value, index, object) {
					    return value;
					}).join(" ")
				    });
				}
				// //NOTE Don't try to use a smaller icon since it will be streched and become low-resolution.
				// //chrome.extension.getURL("icons/icon-16x16.png"), // icon url - can be relative
				// //TODO See issue chromium:134315 for possible trouble with this.
				// chrome.extension.getURL("icons/icon-48x48.png"), // icon url - can be relative, NOT! //$NON-NLS-0$
				// chrome.i18n.getMessage("extname") + chrome.i18n.getMessage("recent_expansions"), // notification title //$NON-NLS-0$
				// // HMTL content seems to be only supported by a possible future createHTMLNotification
				// // See http://www.chromium.org/developers/design-documents/desktop-notifications/api-specification
				// getMostRecentlyUsedList().filter(function(value, index, object) {
				// return true;
				// }).map(function(value, index, object) {
				// return value;
				// }).join(" ") // notification body text //$NON-NLS-0$
				// );
				// notification.show();
			} else {
				chrome.extension.sendMessage({
					cmd: "options" //$NON-NLS-0$
				}, function(response) {});
			}
		}
		// consume event
		e.returnValue = false;
	}
}

function addEventListenerToIframes() {
	var iframes = document.getElementsByTagName("iframe"); //$NON-NLS-0$

	for (var i = 0; i < iframes.length; i++) {
		var iframe = iframes[i];
		if (iframe.src.match("^https?://") === null && iframe.contentDocument) { //$NON-NLS-0$
			iframe.contentDocument.addEventListener("keydown", onKeyEvent, false); //$NON-NLS-0$
		} else if (iframe.src.match("^https?://") === null && iframe.contentWindow) { //$NON-NLS-0$
			iframe.contentWindow.addEventListener("keydown", onKeyEvent, false); //$NON-NLS-0$
		}
	}
	if (pageHasEditableElements()) {
		pageaction.show();
	}
	setTimeout(function() {
		addEventListenerToIframes();
	}, 500);
}

// init extension
function init() {
	settings = new Settings();
	pageaction = new PageAction();
	settings.readRequest();
	settings.enableListener();
	if (document.body) {
		// TODO This approach does not work in Google Drive yet (formerly Google Docs).
		// TODO Note that it works fine in Google Drive Spreadsheets and Forms.
		var mySpans = document.body.querySelectorAll('span[class="goog-inline-block kix-lineview-text-block"]'); //$NON-NLS-0$
		if (mySpans) {
			for (var i = 0; i < mySpans.length; i++) {
				mySpans[i].addEventListener("keydown", onKeyEvent, false); //$NON-NLS-0$
			}
		}
	}
	// addEventListenerToIframes();
	document.addEventListener("keydown", onKeyEvent, true); //$NON-NLS-0$
	if (pageHasEditableElements()) {
		pageaction.show();
	}
	var messageListener = function(request, sender, sendResponse) {
		switch (request.cmd) {
			case "onSubmitPopchromIssue":
				//$NON-NLS-0$
				if (document.URL === request.url) {
					try {
						var sel = document.getSelection();
						var additionalInformation = "document.URL = " + document.URL; //$NON-NLS-0$
						var rng;
						var childNodeCount;
						var rngValue;
						if (sel.type !== "None") { //$NON-NLS-0$
							rng = sel.getRangeAt(0);
						}
						var actElem = document.activeElement;
						additionalInformation += "\n(actElem = document.activeElement).nodeName = " + actElem.nodeName; //$NON-NLS-0$
						if (actElem.hasOwnProperty("selectionStart")) { //$NON-NLS-0$
							additionalInformation += "\nactElem.selectionStart = " + actElem.selectionStart; //$NON-NLS-0$
							additionalInformation += "\nactElem.selectionEnd = " + actElem.selectionEnd; //$NON-NLS-0$
							additionalInformation += "\nactElem.value = " + JSON.stringify(actElem.value); //$NON-NLS-0$
							additionalInformation += "\nactElem.value.substring(actElem.selectionStart, actElem.selectionEnd) = " + JSON.stringify(actElem.value.substring(actElem.selectionStart, actElem.selectionEnd)); //$NON-NLS-0$
						} else if (sel) {
							if (rng) {
								additionalInformation += "\nrng.commonAncestorContainer.parentNode.outerHTML = " + JSON.stringify(rng.commonAncestorContainer.parentNode.outerHTML); //$NON-NLS-0$
							}
							additionalInformation += "\nsel.toString() = " + JSON.stringify(sel.toString()); //$NON-NLS-0$
						}
						if (sel) {
							additionalInformation += "\ndocument.getSelection() = sel = " + JSON.stringify(sel, function(key, value) { //$NON-NLS-0$
								if (key.length > 0 && value instanceof Object) {
									return typeof value;
								} else {
									return value;
								}
							}).replace(/([{,])("\w+":)/g, "$1\n$2"); //$NON-NLS-1$ //$NON-NLS-0$
						}
						if (rng) {
							additionalInformation += "\ndocument.getSelection().getRangeAt(0) = rng = " + JSON.stringify(rng, function(key, value) { //$NON-NLS-0$
								if (key.length > 0 && value instanceof Object) {
									return typeof value;
								} else {
									return value;
								}
							}).replace(/([{,])("\w+":)/g, "$1\n$2"); //$NON-NLS-1$ //$NON-NLS-0$
						}
						var appDetails = JSON.parse(request.appDetails);
						var issueSummary = "What is the problem?"; //$NON-NLS-0$
						var issueBody = "What steps will reproduce the problem?\n1. Use testcase below in a" + (actElem.nodeName.match(/^[aeio]/i) ? "n" : "") + " " + actElem.nodeName + ".\n2. What to do now?\n3. What to do next?\n\n" + "What is the expected output? What do you see instead?\n\n\n" + "What version of the product are you using? On what operating system?" + "\n\nPopchrom Version " + appDetails.version + "\nPopchrom ID " + appDetails.id + "\nPopchrom Locale " + appDetails.current_locale + "\nBrowser " + navigator.appVersion + "\n\nPlease review information about your minimal testcase below.\n\n" + additionalInformation; //$NON-NLS-10$ //$NON-NLS-9$ //$NON-NLS-8$ //$NON-NLS-7$ //$NON-NLS-6$ //$NON-NLS-5$ //$NON-NLS-4$ //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
						console.log("issueBody.length = " + issueBody.length); //$NON-NLS-0$
						if (issueBody.length) {
							if (sendResponse) {
								sendResponse({
									summary: issueSummary,
									body: issueBody
								});
							}
						}
					} catch (e) {
						console.log("onMessage callback reports:\n" + e.stack); //$NON-NLS-0$
					}
				}
				break;
			case "getSelection":
				//$NON-NLS-0$
				try {
					if (document.URL === request.url) {
						var sel = document.getSelection();
						var rng;
						var text;
						var actElem = document.activeElement;
						if (actElem.hasOwnProperty("selectionStart")) { //$NON-NLS-0$
							text = actElem.value.substring(actElem.selectionStart, actElem.selectionEnd);
						} else if (sel) {
							text = sel.toString();
						}
						if (sendResponse) {
							sendResponse({
								selection: text
							});
						}
					}
				} catch (e) {
					console.log("onMessage callback getSelection reports:\n" + e.stack); //$NON-NLS-0$
				}
				break;
		}
	};
	chrome.extension.onMessage.addListener(messageListener);
	var newIssueUrl = "https://code.google.com/p/trnsfrmr/issues/entry"; //$NON-NLS-0$
	if (document.URL === newIssueUrl) {
		console.log("I need issuedetails"); //$NON-NLS-0$
		chrome.extension.sendMessage({
			cmd: "issuedetails" //$NON-NLS-0$
		}, function(response) {
			if (response && response.body && response.summary) {
				console.log("I got issuedetails " + JSON.stringify(response)); //$NON-NLS-0$
				$('textarea[name=comment]')[0].value = response.body; //$NON-NLS-0$
				$('input#summary')[0].value = response.summary; //$NON-NLS-0$
			} else {
				console.log("I got incomplete issuedetails " + JSON.stringify(response)); //$NON-NLS-0$
			}
		});
	}
}

document.addEventListener('readystatechange', function(event) {
	if (event.target.readyState !== 'complete') {
		return;
	}
	init();
}, false);

// global replacer
function globalReplacer(value) {
	var m = settings.map;
	// check all keys
	for (var j = 0; j++ < m.size; m.next()) {
		value = value.replace(new RegExp("\\b" + m.key() + "\\b", "g"), m.value()); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
		value = replaceAllDates(value);
	}
	return value;
}
