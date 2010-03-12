
function currentTime() {
	var d = new Date();
	var hours = d.getHours();    
	var minutes = d.getMinutes();   
	var seconds = d.getSeconds();   
	var milliseconds = d.getMilliseconds;
}

function replaceDates(value) {

	var pDay = /%DAY(\+\d+)?%/;
	var pMonth = /%MONTH(\+\d+)?%/;
	var pYear = /%YEAR(\+\d+)?%/;

	var pd = new RegExp(pDay);
	var pm = new RegExp(pMonth);
	var py = new RegExp(pYear);
	
	while ((md = pd.exec(value)) || (mm = pm.exec(value)) || (my = py.exec(value)))
	{
		d = getNewDate(getAddOn(pDay,value), getAddOn(pMonth,value), getAddOn(pYear,value));
		if (md)	{
			value = value.replace(pDay , (d.getDate()<10)?"0"+d.getDate():d.getDate());
		} if (mm) {
			month = d.getMonth()+1;
			value = value.replace(pMonth , (month<10)?"0"+month: month);
		} if (my) {
			value = value.replace(pYear , d.getFullYear());
		}
	}
	return value;
}

function getNewDate(days, month, years){
	var now = new Date();
	future = new Date();
	future.setDate(now.getDate() + days);
	future.setMonth(future.getMonth() + month);
	future.setYear(future.getFullYear() + years);
	return future;
}

function getAddOn(pattern, value) {
	pattern.exec(value);
	match = RegExp.$1;
	match = match.replace(/\+/,"");
	return match;
}