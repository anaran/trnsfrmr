
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
	var pDate = /%DATE\+(\d*d)?(\d*m)?(\d*y)?%/;
	pDate.exec(value);
	
	var days = RegExp.$1;
	days = days.replace("d","");
	var months = RegExp.$2;
	months = months.replace("m","");
	var years = RegExp.$3;
	years = years.replace("y","");

	future = new Date();
	future.setDate(future.getDate() + parseInt(days));
	future.setMonth(future.getMonth() +  parseInt(month));
	future.setYear(future.getFullYear() +  parseInt(years));
	
	value = value.replace(pDate , future.getDate() + "." + future.getMonth() + "." + future.getFullYear());
	
	return value;
}

function getAddOn(pattern, value) {
	pattern.exec(value);
	match = RegExp.$1;
	match = match.replace(/\+/,"");
	return match;
}