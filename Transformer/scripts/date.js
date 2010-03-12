
function currentTime() {
	var d = new Date();
	var hours = d.getHours();    
	var minutes = d.getMinutes();   
	var seconds = d.getSeconds();   
	var milliseconds = d.getMilliseconds;
}

function replaceDates(value) {
	var d = new Date();

	var pDay = /%DAY%(\(\d+\))?/;
	var pMonth = /%MONTH%/;
	var pYear = /%YEAR%/;
	
//    d.setDate(d.getDate() + getAddOn(pDay,value));

	day = d.getDate();
	month = d.getMonth()+1; //?
	year = d.getFullYear();
	
	value = value.replace(pDay , day);
	value = value.replace(pMonth, month);
	value = value.replace(pYear, year);
	
	return value;
}

function getAddOn(pattern, value) {
	pattern.exec(value);
	match = RegExp.$1;
	console.warn(match);
	match = match.replace(/[()]/g,"");
	console.warn(match);
	return match;
}
