
function currentTime() {
	var d = new Date();
	var hours = d.getHours();    
	var minutes = d.getMinutes();   
	var seconds = d.getSeconds();   
	var milliseconds = d.getMilliseconds;
}

function replaceDates(value) {
	
	d = new Date();
	value = value.replace(/%DAY%/ , (d.getDate()<10)?"0"+d.getDate():d.getDate());
	month = d.getMonth()+1;
	value = value.replace(/%MONTH%/ , (month<10)?"0"+month: month);
	value = value.replace(/%YEAR%/ , d.getFullYear());
	value = replaceDate(value);
	
	return value;
}


function replaceDate(value){
	var pDate = /%DATE(\+(\d*d)?(\d*m)?(\d*y)?)?%/;
	pDate.exec(value);

	var days = "";
	var month = "";
	var years = "";
	
	var regexp = RegExp.$1;
	
	var pattern = /(\d*d)/;
	pattern.exec(regexp);
	match = RegExp.$1;
	days = match.replace("d","");

	pattern = /(\d*m)/;
	pattern.exec(regexp);
	match = RegExp.$1;
	months = match.replace("m","");
	
	pattern = /(\d*y)/;
	pattern.exec(regexp);
	match = RegExp.$1;
	years = match.replace("y","");
	
	future = new Date();
	if (isNumeric(days)) {
		future.setDate(future.getDate() + parseInt(days));
	}
	if (isNumeric(months)) {
		future.setMonth(future.getMonth() +  parseInt(months));
	}
	if (isNumeric(years)) {
		future.setYear(future.getFullYear() +  parseInt(years));
	}
	
	value = value.replace(pDate , future.getDate() + "." + (future.getMonth()+1) + "." + future.getFullYear());
	
	return value;
}

function getAddOn(pattern, value) {
	pattern.exec(value);
	match = RegExp.$1;
	match = match.replace(/\+/,"");
	return match;
}

function isNumeric(sText)
{
   var validChars = "0123456789";
   var isNumber=true;
   var char;
 
   for (i = 0; i < sText.length && isNumber == true; i++) 
   { 
      char = sText.charAt(i); 
      if (validChars.indexOf(char) == -1) 
      {
         isNumber = false;
      }
   }
   
   if (sText.length == 0) 
	   isNumber = false;
   
   return isNumber;
}