/*jslint browser: true, devel: true, todo: true */
/*global Settings, PageAction, replaceAllDates, window: false, chrome: false, $: false, KeyInfo: false */
	"use strict";
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

	//	expansionNode.normalize();
	var range = doc.createRange();
	range.selectNodeContents(expansionNode);
	if (!settings.selectPhrase) {
		// Collapse range to end, i.e. toStart argument is false.
		range.collapse(false);
	}
	// Always add the range to restore focus.
	selection.addRange(range);
	//	selection.anchorNode.parentNode.normalize();
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
		if ((type === "text") || (type === "password") || (type === "textarea")) {
			return true;
		}
	}
	return false;
}

// FIXME Eliminate this global variable.
var unExpandedValue;

function extractKeyWord(str, s, e) {
	//  "use strict";
	var result = {};
	result.before = "";
	result.after = "";
	result.key = "";

	//  var s = element.selectionStart;
	//  var e = element.selectionEnd;
	//    var word;

	// if nothing is selected find word boundaries
	if (s === e) {
		// string b(efore) and a(fter) cursor
		var b = str.substring(0, s);
		var a = str.substring(e);
		// take care of U+00A0 NO-BREAK SPACE as well
		// Fixes issue 70.
		var rb = b.match(/[^ \t\n\u00A0]*$/);
		var ra = a.match(/^[^ \t\n\u00A0]*/);

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
			alert(chrome.i18n.getMessage("extname") + ": " + "Advanced abbreviations have exactly two string elements:" + "\ne.g.\n[\"(\\d+)\\s+(\\w+)\",\n \"$1: $2\"]" + "\nPlease fix definition of abbreviation \"" + r.key + "\"\n" + value);
		}
		try {
			fromRegExp = new RegExp("^" + x[0], "");
		} catch (e) {
			//              NOTE The initial array element is not a string (can be used in a RegExp constructor).
			alert(chrome.i18n.getMessage("extname") + ": " + e.toString());
		}
		var toReplacement = x[1];
		//          NOTE Is replacement argument really a string?
		if (typeof(toReplacement) !== "string") {
			alert(chrome.i18n.getMessage("extname") + ": " + toReplacement + " is not a double-quoted string, as expected for an advanced abbreviation!\nPlease fix abbreviation \"" + r.key + "\"\n" + value);
		}
		try {
			m = r.after.match(fromRegExp);
			if (m === null) {
				alert(chrome.i18n.getMessage("extname") + ": \"" + fromRegExp + "\" does not match arguments\nfor \"" + r.key + "\" \"" + r.after.substring(0, Math.min(r.after.length, 15)) + (r.after.length > 15 ? "..." : "") + "\"\nPlease fix arguments or definition of abbreviation \"" + r.key + "\"\n" + value);
				return;
			}
			unExpandedValue = r.key + m[0];
			offsetFromEnd = r.after.length - m[0].length;
			// x = r.after.replace(fromRegExp, toReplacement);
			//              alert("m="+JSON.stringify(m));
		} catch (e1) {
			alert(chrome.i18n.getMessage("extname") + ": " + e1.toString());
		}
		value = m[0].replace(fromRegExp, toReplacement);
		r.after = r.after.substring(m[0].length);
	} catch (e2) {
		// NOTE Reporting all exceptions here would be annoying.
		// It would come up for every simple abbreviation expansion which is not a valid
		// JSON text.
		// It might still be useful to report other errors to point out likely
		// syntactical errors of advanced abbrevations.
		if (e2 && e2.toString() !== "SyntaxError: Unexpected token " + typeof value === "string" ? value.substring(0, 1) : "") {
			alert(chrome.i18n.getMessage("extname") + ": " + e2.toString() + "\nPlease fix definition of Abbreviation \"" + r.key + "\"\n" + value);
		} else {
			unExpandedValue = r.key;
		}
	}
	return value;
}

//replaces the keys with the assigned values in the element.
function checkElements(elem) {
	//  "use strict";
	var substituted = false,
		element = elem,
		s, r, value, expandedElementType;
	if ((element.tagName === "INPUT" && ((element.type === "text") || (element.type === "password"))) || element.tagName === "TEXTAREA") {

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

		//        var offsetFromEnd;
		//        unExpandedValue = r.key;
		value = handleArguments(value, r);
		if (value) {
			substituted = true;
			updateMostRecentlyUsedList(r.key);
			// date substitution
			value = replaceAllDates(value);
			if (element.tagName === "TEXTAREA") {} else {
				value = value.replace(/[\n\r]+/g, " ");
			}
			var tmp = r.before + value;

			//            var cursor = tmp.length;
			element.value = tmp + r.after;
			element.selectionStart = r.before.length;
			element.selectionEnd = element.selectionStart;
			var clipParam = "%CLIPBOARD%";
			if (window.find(clipParam, "aCaseSensitive", !"aBackwards", !"aWrapAround",
				"aWholeWord", !"aSearchInFrames", !"aShowDialog")) {
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
		var doc = element.ownerDocument;
		var selection = doc.getSelection();
		//        NOTE undefined!
		//        alert("element.selectionStart(HTML|BODY) " + element.selectionStart)
		//      console.log( selection );

		if (selection.isCollapsed) {
			element = selection.anchorNode;
			s = selection.anchorOffset;

			r = extractKeyWord(element.textContent, s, s);

			value = settings.map.get(r.key);
			//            unExpandedValue = r.key;
			value = handleArguments(value, r);
			if (value) {
				substituted = true;
				updateMostRecentlyUsedList(r.key);
				value = replaceAllDates(value);

				var beforepos = r.before.length;

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
				if (window.find("%CLIPBOARD%", "aCaseSensitive", !"aBackwards", !"aWrapAround",
					"aWholeWord", !"aSearchInFrames", !"aShowDialog")) {
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
		} else {
			var ancestor = selection.anchorNode.parentNode.parentNode;
			var unexpandedNode = doc.createTextNode(unExpandedValue);
			//			document.getSelection().getRangeAt(0).deleteContents();
			//			document.getSelection().getRangeAt(0).insertNode(unexpandedNode);
			//			ancestor.parentNode.replaceChild(unexpandedNode, ancestor);
			// Emulate insertAfter, see https://developer.mozilla.org/en-US/docs/DOM/Node.insertBefore
			ancestor.parentNode.insertBefore(unexpandedNode, ancestor.nextSibling);
			ancestor.parentNode.removeChild(ancestor);
			document.getSelection().removeAllRanges();
			// Normalization also deactivated a selection.
			var x = unexpandedNode.parentNode;
			x.normalize();
			var range = doc.createRange();
			range.selectNode(x);
			document.getSelection().addRange(range);
			document.getSelection().collapseToStart();
			//			if (doc.getSelection().toString().length) {
			//				doc.getSelection().collapseToStart();
			//			}
			//
			//			if (false) {
			//				// Collapse range to end, i.e. toStart argument is false.
			//				range.collapse(false);
			//			}
			// Always add the range to restore focus.
			//			doc.getSelection().addRange(range);

			substituted = true;
		}
	}
	return substituted;
}

function pageHasEditableElements() {
	var elemInput = document.getElementsByTagName("input");
	var elemTextarea = document.getElementsByTagName("textarea");

	return (elemTextarea.length > 0 || findInputElements(elemInput));
}

// trigger replaceKeysWithValues method on key event space or enter
function onKeyEvent(e) {
	if (settings.replaceKey.equals(e)) {
		var element = e.srcElement;

		if (checkElements(element)) {
			pageaction.notify();
		} else {
			if (document.activeElement.isContentEditable || (document.activeElement.hasOwnProperty("readOnly") && !document.activeElement.readOnly)) {
				var notification = webkitNotifications.createNotification(
				//NOTE Don't try to use a smaller icon since it will be streched and become low-resolution.
				//chrome.extension.getURL("icons/icon-16x16.png"), // icon url - can be relative
				//TODO See issue chromium:134315 for possible trouble with this.
				chrome.extension.getURL("icons/icon-48x48.png"), // icon url - can be relative, NOT!
				chrome.i18n.getMessage("extname") + ' - Recent Expansions', // notification title
				//			HMTL content seems to be only supported by a possible future createHTMLNotification
				//			See http://www.chromium.org/developers/design-documents/desktop-notifications/api-specification
				getMostRecentlyUsedList().filter(function(value, index, object) {
					return true;
				}).map(function(value, index, object) {
					return value;
				}).join(" ") // notification body text
				);
				notification.show();
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
	var iframes = document.getElementsByTagName("iframe");

	for (var i = 0; i < iframes.length; i++) {
		var iframe = iframes[i];
		if (iframe.src.match("^https?://") === null && iframe.contentDocument) {
			iframe.contentDocument.addEventListener("keydown", onKeyEvent, false);
		} else if (iframe.src.match("^https?://") === null && iframe.contentWindow) {
			iframe.contentWindow.addEventListener("keydown", onKeyEvent, false);
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
		var mySpans = document.body.querySelectorAll('span[class="goog-inline-block kix-lineview-text-block"]');
		if (mySpans) {
			for (var i = 2; i < mySpans.length; i++) {
				mySpans[i].addEventListener("keydown", onKeyEvent, false);
			}
		}
	}
	addEventListenerToIframes();

	document.addEventListener("keydown", onKeyEvent, false);
	var cb = function(request, sender, sendResponse) {
		if (request.greeting === "hollow") {
			try {
				//	console.log(JSON.stringify([request, sender, sendResponse]));
				//			console.log(sender.tab ?
				//				"from a content script:" + sender.tab.url :
				//				"from the extension");
				var sel = document.getSelection();
				var additionalInformation = "document.URL = " + document.URL; //$NON-NLS-0$
				var rng;
				var childNodeCount;
				var rngValue;
				if (sel.type !== "None") { //$NON-NLS-0$
					rng = sel.getRangeAt(0);
				}
				var actElem = document.activeElement;
				additionalInformation += "\n(actElem = document.activeElement).nodeName = " + actElem.nodeName;
				if (actElem.hasOwnProperty("selectionStart")) {
					additionalInformation += "\nactElem.selectionStart = " + actElem.selectionStart;
					additionalInformation += "\nactElem.selectionEnd = " + actElem.selectionEnd;
					additionalInformation += "\nactElem.value = " + JSON.stringify(actElem.value);
					additionalInformation += "\nactElem.value.substring(actElem.selectionStart, actElem.selectionEnd) = " + JSON.stringify(actElem.value.substring(actElem.selectionStart, actElem.selectionEnd));
				} else if (sel) {
					if (rng) {
						additionalInformation += "\nrng.commonAncestorContainer.parentNode.outerHTML = " + JSON.stringify(rng.commonAncestorContainer.parentNode.outerHTML);
					}
					additionalInformation += "\nsel.toString() = " + JSON.stringify(sel.toString());
				}
				additionalInformation += "\ndocument.getSelection() = sel = " + JSON.stringify(sel, function(key, value) {
					if (key.length > 0 && value instanceof Object) {
						return typeof value;
					} else {
						return value;
					}
				}).replace(/([{,])("\w+":)/g, "$1\n$2") + "\ndocument.getSelection().getRangeAt(0) = rng = " + JSON.stringify(rng, function(key, value) {
					if (key.length > 0 && value instanceof Object) {
						return typeof value;
					} else {
						return value;
					}
				}).replace(/([{,])("\w+":)/g, "$1\n$2");
				var appDetails = JSON.parse(request.appDetails);
				var newIssueUrl = "https://code.google.com/p/trnsfrmr/issues/entry";
				var queryString = "comment=" + window.encodeURIComponent("What steps will reproduce the problem?\n1. Use testcase below in a" + (actElem.nodeName.match(/^[aeio]/i) ? "n" : "") + " " + actElem.nodeName + ".\n2. What do do now?\n3. What to do next?\n\n" + "What is the expected output? What do you see instead?\n\n\n" + "What version of the product are you using? On what operating system?" + "\n\nPopchrom Version " + appDetails.version + "\nPopchrom ID " + appDetails.id + "\nPopchrom Locale " + appDetails.current_locale + "\nBrowser " + navigator.appVersion + "\n\nPlease review information about your minimal testcase below.\n\n" + additionalInformation) + "&summary=What is the problem?";
				var newIssueQueryUrl = newIssueUrl + "?" + queryString;
				console.log("newIssueQueryUrl.length = " + newIssueQueryUrl.length);
				if (newIssueQueryUrl.length <= 2060) {
					if (sendResponse) {
						sendResponse({
							newIssueQueryUrl: newIssueQueryUrl
						});
					}
				} else {
					window.alert("Please shorten your testcase (text content, text selection) by ca. " + (newIssueQueryUrl.length - 2060) + " characters");
				}
			} catch (e) {
				console.log("onMessage callback reports:\n" + e.stack);
			}
		}
	};
	chrome.extension.onMessage.addListener(cb);

}

setTimeout(function() {
	init();
}, 0);

// global replacer
function globalReplacer(value) {
	var m = settings.map;
	// check all keys
	for (var j = 0; j++ < m.size; m.next()) {
		value = value.replace(new RegExp("\\b" + m.key() + "\\b", "g"), m.value());
		value = replaceAllDates(value);
	}
	return value;
}