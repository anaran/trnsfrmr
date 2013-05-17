/*jslint browser: true, devel: true, todo: true */
/*global GSpreadsheet*/
"use strict"; //$NON-NLS-0$
// includes all necessary java script files for the extension
function include(file) {
	var script = document.createElement('script'); //$NON-NLS-0$
	script.src = file;
	script.type = 'text/javascript'; //$NON-NLS-0$
	script.defer = true;
	document.getElementsByTagName('head').item(0).appendChild(script); //$NON-NLS-0$
}

// include java script files
include('./hashmap.js'); //$NON-NLS-0$

function displayGoogleSpreadsheetContent() {

	GSpreadsheet.load("pSYwzniwpzSFnt8Ix3ohQQA", { //$NON-NLS-0$
		index: 'firstname' //$NON-NLS-0$
	}, function(gs) {
		// display all
		document.getElementById("displayall").innerHTML = gs.displayAll('style="border: solid 1px black; margin: 10px;"');  //$NON-NLS-1$ //$NON-NLS-0$

		// show one
		var row = gs.select('Bob'); //$NON-NLS-0$
		document.getElementById("onebyindex").innerHTML = row.email; //$NON-NLS-0$

		// show by row number
		row = gs.select(1);
		document.getElementById("onebyrownum").innerHTML = row.email; //$NON-NLS-0$

		// display one row
		document.getElementById("displayrow").innerHTML = gs.displayRow('Bob');  //$NON-NLS-1$ //$NON-NLS-0$
	});

	/*
    <div id="displayall"></div> 
    <div id="onebyindex"></div> 
    <div id="onebyrownum"></div> 
    <div id="displayrow"></div> 
	*/
}