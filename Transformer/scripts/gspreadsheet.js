/* Copyright (c) 2008 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * You wouldn't want to create these yourself, unless you can get the json yourself. Chances are you will use GSpreadsheet.load()
 */
var GSpreadsheet = function(key, json, options) {
  this.key = key;
  this.options = options || {};
  this.data = [];
  this.headers = [];
  this.index = [];

  // initialize the data
  for (var x = 0; x < json.feed.entry.length; x++) {
    var entry = json.feed.entry[x];
    var row = {};
    for (var i in entry) {
      if (i.indexOf('gsx$') == 0) {
        var key = i.substring(4);

        if (x == 0) { // add to the headers on the first time around
          this.headers.push(key);
        }
        
        if (key == this.options['index']) { // save the index'd ite
          this.index[entry[i].$t] = x;
        }
        row[key] = entry[i].$t;
      }
    }
    this.data.push(row);
  }
  
  this.each = function(callback) {
    for (var x = 0; x < this.data.length; x++) {
      callback(this.data[x]);
    }
  };
  
  /*
   * Take either a key (e.g. 'firstname') or the row id that you want
   */
  this.select = function(id) {
    if (typeof id == 'string') {
      return this.data[this.index[id]];
    } else {
      return this.data[id];
    }
  };
  
  // -- Debugging Helpers
  this.displayAll = function(inlineCSS) {
    if (!inlineCSS) inlineCSS = '';
    var table = "<table cellpadding='5' cellspacing='0' " + inlineCSS + "><tr>";
    for (var x = 0; x < this.headers.length; x++) {
      table += "<th style='background-color: black; color: white;'>" + this.headers[x] + "</th>";
    }
    table += "</tr>";

    var self = this;
    this.each(function(row) {
      var tr = "<tr>";
      for (var x = 0; x < self.headers.length; x++) {
        tr += "<td style='border: 1px solid grey;'>" + row[self.headers[x]] + "</td>";
      }
      tr += "</tr>";
      table += tr;
    });

    table += "</table>";
    return table;
  };
  
  this.displayRow = function(id) {
    var row = this.select(id);
    var keyvalues = [];
    for (var x in row) {
      keyvalues.push(x + ' = ' + row[x]);
    }
    return keyvalues.join(', ');
  }
}

/*
 * This is a static method that loads in spreadsheets and returns GSpreadsheets, passing them into their callback
 */
GSpreadsheet.load = function(key, options, callback) {
  if (!options['worksheet']) options['worksheet'] = 'od6';
  var worksheet = options['worksheet'];
  
  var callbackName = "GSpreadsheet.loader_" + key + "_" + worksheet;
  eval(callbackName + " = function(json) { var gs = new GSpreadsheet(key, json, options); callback(gs); }");
  
  var script = document.createElement('script');

  script.setAttribute('src', 'http://spreadsheets.google.com/feeds/list/' + key + '/' + worksheet + '/public/values' +
                        '?alt=json-in-script&callback=' + callbackName);
  script.setAttribute('id', 'jsonScript');
  script.setAttribute('type', 'text/javascript');
  document.documentElement.firstChild.appendChild(script);
}