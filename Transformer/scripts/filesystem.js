/*jslint browser: true, devel: true, todo: false */
/*global window: false, chrome: false, localStorage: false, $: false */
"use strict"; //$NON-NLS-0$

function reportDragDrop(e) {
	// this / e.target is current target element.
	//   if (e.preventDefault) {
	//     e.preventDefault(); // stops the browser from redirecting.
	//   }
	//   if (e.stopPropagation) {
	//     e.stopPropagation(); // stops the browser from redirecting.
	//   }
	console.log(e.type + ": e = " + JSON.stringify(e, function(key, value) {
		if (key.length > 0 && value instanceof Object) {
			return typeof value;
		} else {
			return value;
		}
	}).replace(/([{,])("\w+":)/g, "$1\n$2"));
	console.log(e.type + ": e.target = " + JSON.stringify(e.target, function(key, value) {
		if (key.length > 0 && value instanceof Object) {
			return typeof value;
		} else {
			return value;
		}
	}).replace(/([{,])("\w+":)/g, "$1\n$2"));
	console.log(e.type + ": e.currentTarget = " + JSON.stringify(e.currentTarget, function(key, value) {
		if (key.length > 0 && value instanceof Object) {
			return typeof value;
		} else {
			return value;
		}
	}).replace(/([{,])("\w+":)/g, "$1\n$2"));
	console.log(e.type + ": e.dataTransfer = " + JSON.stringify(e.dataTransfer));
	console.log(e.type + ": e.dataTransfer.getData('DownloadURL') = " + e.dataTransfer.getData("DownloadURL"));
	console.log(e.type + ": e.dataTransfer.getData('downloadurl') = " + e.dataTransfer.getData("downloadurl"));
	var length = event.dataTransfer.items.length;
	for (var i = 0; i < length; i++) {
		console.log(e.type + ": event.dataTransfer.items[i].webkitGetAsEntry() = " + event.dataTransfer.items[i].webkitGetAsEntry());
		console.log(e.type + ": event.dataTransfer.getData(\"URL\") = " + event.dataTransfer.getData("URL"));
		console.log(e.type + ": e.dataTransfer.items[" + i + "].type = " + e.dataTransfer.items[i].type);
		if (e.dataTransfer.items[i].type === "downloadurl") {
			// console.log(e.type + ": e.dataTransfer.items[i].getData(e.dataTransfer.items[i].type) = " + e.dataTransfer.items[i].getData(e.dataTransfer.items[i].type));
		}
	}
	// See the section on the DataTransfer object.

	return false;
}

function onDragEnd(e) {
	var el = e.srcElement;
	//   var name = el.innerText.replace(":", "");
	//   var download_url_data = "application/octet-stream:" + name + ":" + el.href;
	//   e.dataTransfer.setData("DownloadURL", download_url_data);
	//   //  e.dataTransfer.effectAllowed = "copyMove";
	//   e.dataTransfer.effectAllowed = "move";
	console.log("onDragEnd: e.dataTransfer.dropEffect = " + e.dataTransfer.dropEffect);
	console.log("onDragEnd: e.dataTransfer = " + JSON.stringify(e.dataTransfer));
}

function onDragStart(e) {
	var el = e.srcElement;
	var name = el.innerText.replace(":", "");
	var download_url_data = "application/octet-stream:" + name + ":" + el.href;
	//   if (e.preventDefault) {
	//     e.preventDefault(); // stops the browser from redirecting.
	//   }
	//   if (e.stopPropagation) {
	//     e.stopPropagation(); // stops the browser from redirecting.
	//   }
	// e.dataTransfer.setData("DownloadURL", download_url_data);
	e.dataTransfer.setData("downloadurl", download_url_data);
	e.dataTransfer.effectAllowed = "copyMove";
	e.dataTransfer.dropEffect = undefined;
	reportDragDrop(e);
	// e.dataTransfer.effectAllowed = "move";
}


function createCell(text) {
	var cell = document.createElement("td");
	cell.setAttribute("class", "detailsColumn");
	cell.innerText = text;
	return cell;
}

function addRow(name, url, isdir, size, date_modified) {
	if (name === ".") return;

	var root = "" + document.location;
	if (root.substr(-1) !== "/") root += "/";

	var table = document.getElementById("table");
	var row = document.createElement("tr");
	var file_cell = document.createElement("td");
	var link = document.createElement("a");

	link.className = isdir ? "icon dir" : "icon file";

	if (name === "..") {
		link.href = root + "..";
		link.innerText = document.getElementById("parentDirText").innerText;
		link.className = "icon up";
		size = "";
		date_modified = "";
	} else {
		if (isdir) {
			name = name + "/";
			url = url + "/";
			size = "";
		} else {
			link.draggable = "true";
			link.addEventListener("dragstart", onDragStart, false);
			link.addEventListener("dragenter", reportDragDrop, false);
			link.addEventListener("dragend", reportDragDrop, false);
			link.addEventListener("dragover", reportDragDrop, false);
			link.addEventListener("dragexit", reportDragDrop, false);
			link.addEventListener("dragleave", reportDragDrop, false);
			link.addEventListener("drop", reportDragDrop, false);
		}
		link.innerText = name;
		link.href = url;
	}
	file_cell.appendChild(link);

	row.appendChild(file_cell);
	row.appendChild(createCell(size));
	row.appendChild(createCell(date_modified));

	table.appendChild(row);
}

function start(location) {
	var header = document.getElementById("header");
	header.innerText = header.innerText.replace("LOCATION", location);

	document.getElementById("title").innerText = header.innerText;
}

function onListingParsingError() {
	var box = document.getElementById("listingParsingErrorBox");
	box.innerHTML = box.innerHTML.replace("LOCATION", encodeURI(document.location) + "?raw");
	box.style.display = "block";
}

var templateData = {
	"header": "Popchrom Export",
		"headerDateModified": "\u00C4nderungsdatum",
		"headerName": "Name",
		"headerSize": "Gr\u00F6\u00DFe",
		"listingParsingErrorBoxText": "Google Chrome versteht die von diesem Server gesendeten Daten nicht. Bitte \u003Ca href=\"http://code.google.com/p/chromium/issues/entry\"\u003Emelden Sie einen Programmfehler\u003C/a\u003E und geben Sie die \u003Ca href=\"LOCATION\"\u003ERohdaten\u003C/a\u003E an.",
		"parentDirText": "[\u00FCbergeordnetes Verzeichnis]"
};

// Copyright (c) 2010 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * NOTE: The use of this file is deprecated. Use i18n_template2.js instead.
 *
 * @fileoverview This is a simple template engine inspired by JsTemplates
 * optimized for i18n.
 *
 * It currently supports two handlers:
 *
 *   * i18n-content which sets the textContent of the element
 *
 *     <span i18n-content="myContent"></span>
 *     i18nTemplate.process(element, {'myContent': 'Content'});
 *
 *   * i18n-values is a list of attribute-value or property-value pairs.
 *     Properties are prefixed with a '.' and can contain nested properties.
 *
 *     <span i18n-values="title:myTitle;.style.fontSize:fontSize"></span>
 *     i18nTemplate.process(element, {
 *       'myTitle': 'Title',
 *       'fontSize': '13px'
 *     });
 */

var i18nTemplate = (function() {
	/**
	 * This provides the handlers for the templating engine. The key is used as
	 * the attribute name and the value is the function that gets called for every
	 * single node that has this attribute.
	 * @type {Object}
	 */
	var handlers = {
		/**
		 * This handler sets the textContent of the element.
		 */
			'i18n-content': function(element, attributeValue, obj) {
			element.textContent = obj[attributeValue];
		},

		/**
		 * This handler adds options to a select element.
		 */
			'i18n-options': function(element, attributeValue, obj) {
			var options = obj[attributeValue];
			options.forEach(function(values) {
				var option = typeof values === 'string' ? new Option(values) : new Option(values[1], values[0]);
				element.appendChild(option);
			});
		},

		/**
		 * This is used to set HTML attributes and DOM properties,. The syntax is:
		 *   attributename:key;
		 *   .domProperty:key;
		 *   .nested.dom.property:key
		 */
			'i18n-values': function(element, attributeValue, obj) {
			var parts = attributeValue.replace(/\s/g, '').split(/;/);
			for (var j = 0; j < parts.length; j++) {
				var a = parts[j].match(/^([^:]+):(.+)$/);
				if (a) {
					var propName = a[1];
					var propExpr = a[2];

					// Ignore missing properties
					if (propExpr in obj) {
						var value = obj[propExpr];
						if (propName.charAt(0) === '.') {
							var path = propName.slice(1).split('.');
							var object = element;
							while (object && path.length > 1) {
								object = object[path.shift()];
							}
							if (object) {
								object[path] = value;
								// In case we set innerHTML (ignoring others) we need to
								// recursively check the content
								if (path === 'innerHTML') {
									process(element, obj);
								}
							}
						} else {
							element.setAttribute(propName, value);
						}
					} else {
						console.warn('i18n-values: Missing value for "' + propExpr + '"');
					}
				}
			}
		}
	};

	var attributeNames = [];
	for (var key in handlers) {
		attributeNames.push(key);
	}
	var selector = '[' + attributeNames.join('],[') + ']';

	/**
	 * Processes a DOM tree with the {@code obj} map.
	 */
	function process(node, obj) {
		var elements = node.querySelectorAll(selector);
		// TODO: See also https://code.google.com/p/switchy/source/browse/trunk/assets/scripts/i18n.js?r=90
		// for this same JSLint error.
		// See also http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml?showone=Tips_and_Tricks#Tips_and_Tricks
		for (var element, i = 0; element = elements[i]; i++) {
			for (var j = 0; j < attributeNames.length; j++) {
				var name = attributeNames[j];
				var att = element.getAttribute(name);
				if (att !== null) {
					handlers[name](element, att, obj);
				}
			}
		}
	}

	return {
		process: process
	};
})();

document.addEventListener('DOMContentLoaded', function() { //$NON-NLS-0$
	try {
		// Copyright (c) 2010 The Chromium Authors. All rights reserved.
		// Use of this source code is governed by a BSD-style license that can be
		// found in the LICENSE file.

		// Invoke the template engine previously loaded from i18n_template.js
		i18nTemplate.process(document, templateData);

		start("");
		addRow("popchrom.txt", "filesystem:chrome-extension://" + chrome.app.getDetails().id + "/temporary/popchrom.txt", 0, "TBD", "TBD");
	} catch (e) {
		console.log(Date() + ":\n" + "document.readyState:" + document.readyState + "\ndocument.URL:" + document.URL + "\ne.stack:" + e.stack);
	}
});