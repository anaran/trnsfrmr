// includes all necessary java script files for the extension
function include(file) {
	 var script  = document.createElement('script');
	 script.src  = file;
	 script.type = 'text/javascript';
	 script.defer = true;
	 document.getElementsByTagName('head').item(0).appendChild(script);
}

// include java script files
include('./hashmap.js');