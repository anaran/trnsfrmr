/*jslint browser: true, devel: true, todo: true */
/*global Settings, PageAction, window: false, chrome: false*/
	"use strict";

function currentTime() {
	//    var d = new Date();
	//    var hours = d.getHours();
	//    var minutes = d.getMinutes();
	//    var seconds = d.getSeconds();
	//    var milliseconds = d.getMilliseconds;
}

function isNumeric(sText) {
	var validChars = "0123456789";
	var isNumber = true;
	var chr;

	for (var i = 0; i < sText.length && isNumber === true; i++) {
		chr = sText.charAt(i);
		if (validChars.indexOf(chr) === -1) {
			isNumber = false;
		}
	}

	if (sText.length === 0) {
		isNumber = false;
	}

	return isNumber;
}

function getOperator(value) {
	var operator = "+";
	var pattern = /-/;
	if (pattern.exec(value)) {
		operator = "-";
	}
	return operator;
}

function getAddOn(pattern, value) {
	pattern.exec(value);
	var match = RegExp.$1;
	match = match.replace(/\+/, "");
	return match;
}

function replaceDate(value) {
	var pDate = /%DATE([\+\-](\d*d)?(\d*m)?(\d*y)?)?%/,
		future, match, months, operator;
	pDate.exec(value);

	var days = "";
	//    var month = "";
	var years = "";

	var regexp = RegExp.$1;

	var pattern = /(\d*d)/;
	pattern.exec(regexp);
	match = RegExp.$1;
	days = match.replace("d", "");

	pattern = /(\d*m)/;
	pattern.exec(regexp);
	match = RegExp.$1;
	months = match.replace("m", "");

	pattern = /(\d*y)/;
	pattern.exec(regexp);
	match = RegExp.$1;
	years = match.replace("y", "");

	operator = getOperator(value);
	future = new Date();
	if (operator === "+") {
		if (isNumeric(days)) {
			future.setDate(future.getDate() + parseInt(days, 10));
		}
		if (isNumeric(months)) {
			future.setMonth(future.getMonth() + parseInt(months, 10));
		}
		if (isNumeric(years)) {
			future.setYear(future.getFullYear() + parseInt(years, 10));
		}
	} else if (operator === "-") {
		if (isNumeric(days)) {
			future.setDate(future.getDate() - parseInt(days, 10));
		}
		if (isNumeric(months)) {
			future.setMonth(future.getMonth() - parseInt(months, 10));
		}
		if (isNumeric(years)) {
			future.setYear(future.getFullYear() - parseInt(years, 10));
		}
	}

	value = value.replace(pDate, future.getDate() + "." + (future.getMonth() + 1) + "." + future.getFullYear());

	return value;
}

function replaceDates(value) {

	var d = new Date();
	value = value.replace(/%DAY%/, (d.getDate() < 10) ? "0" + d.getDate() : d.getDate());
	var month = d.getMonth() + 1;
	value = value.replace(/%MONTH%/, (month < 10) ? "0" + month : month);
	value = value.replace(/%YEAR%/, d.getFullYear());
	value = replaceDate(value);

	return value;
}