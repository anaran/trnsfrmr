
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

var days = "";
var month = "";
var years = "";

function replaceDate(value){
	var pDate = /%DATE(\+(\d*d)?(\d*m)?(\d*y)?)?%/;
	pDate.exec(value);

	findDMY(RegExp.$1);
	findDMY(RegExp.$2);
	findDMY(RegExp.$3);
	
	future = new Date();
	if (days.length > 0)
		future.setDate(future.getDate() + parseInt(days));
	if (month.length > 0)
		future.setMonth(future.getMonth() +  parseInt(month));
	if (years.length > 0)
		future.setYear(future.getFullYear() +  parseInt(years));
	
	value = value.replace(pDate , future.getDate() + "." + (future.getMonth()+1) + "." + future.getFullYear());
	
	return value;
}


function findDMY(regexp) {
	if (regexp.search("d") != -1) {
		days = days.replace("d","");
	} else if (regexp.search("m") != -1) {
		months = months.replace("m","");
	} else if (regexp.search("y") != -1) {
		years = years.replace("y","");
	}
}

function getAddOn(pattern, value) {
	pattern.exec(value);
	match = RegExp.$1;
	match = match.replace(/\+/,"");
	return match;
}