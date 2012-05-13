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

function displayGoogleSpreadsheetContent() 
{ 
	 
    GSpreadsheet.load("pSYwzniwpzSFnt8Ix3ohQQA", { index: 'firstname' }, function(gs) {
      // display all
      document.getElementById("displayall").innerHTML = gs.displayAll('style="border: solid 1px black; margin: 10px;"');
      
      // show one
      var row = gs.select('Bob');
      document.getElementById("onebyindex").innerHTML = row.email;
 
      // show by row number
      row = gs.select(1);
      document.getElementById("onebyrownum").innerHTML = row.email;
      
      // display one row
      document.getElementById("displayrow").innerHTML = gs.displayRow('Bob');
    });
    
    /*
    <div id="displayall"></div> 
    <div id="onebyindex"></div> 
    <div id="onebyrownum"></div> 
    <div id="displayrow"></div> 
	*/
}