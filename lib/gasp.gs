/**
 * GASP: Google App Script Plugin (for Google Sheets)
 * Copyright (c) 2014 Hasitha Liyanage
 * License Yada Yada Yada. 
 * DEPENDS ON: Google AppScript
 */

/**
 * Returns a sheet if only one parameter is specified else a range
 *
 * USAGES
 * $('sheet1')
 * $('sheet1', 'A1')
 * $('sheet1', 1, 2)
 * $('sheet1', 1, 2, 10, 10);
 * $.sheet = $('sheet');
 * $(1, 2)
 * $(1, 2, 10, 10)
 */
function $(a, r, s, t, u) {  
  var sheet;
  switch (typeof a) {
    case 'string':
      sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(a);
      if ((typeof r) == 'undefined') 
        return sheet;
      if ((typeof r) == 'number') {
        if ((typeof t) == 'undefined')
          return sheet.getRange(r, s);
        return sheet.getRange(r, s, t, u);
      } else
        return sheet.getRange(r);
      break;
    case 'number':
      sheet = $.sheet;
      if ((typeof s) == 'undefined')
        return sheet.getRange(a, r);
      return sheet.getRange(a, r, s, t);
      break;
    default:
      sheet = a;
      if ((typeof r) == 'undefined') 
        return sheet;
      if ((typeof r) == 'number') {
        if ((typeof t) == 'undefined')
          return sheet.getRange(r, s);
        return sheet.getRange(r, s, t, u);
      } else
        return sheet.getRange(r);
  }
}

/**
 * Loads data from the database based on a user defined key, which is 
 * analogous to a table name and a value (if provided) which is analogous
 * to a simple where clause.
 * USAGE:
 * var allUsers = $db('users');
 * var aUser = $db('users', 'bob');
 */
$db = function(key, val) {
  if ((typeof val) == 'undefined') {
    var result = $db.db.query({'_key': key});
    return result.hasNext() ? result.next().data : null;
  } else { // load batch
    var data = [], query = {};
    query[key] = (val == null) ? $db.db.anyValue() : val;
    var result = $db.db.query(query);
    while (result.hasNext())
      data.push(result.next());
    return data;
  }
}

/**
 * Call from host app first
 */
$db.set = function(externalDB) {
  $db.db = externalDB;
}

/**
 * Saves provided data (single key-value pair or 'row' of a 'table') to the database
 * Replaces if already exists
 * USAGE:
 * $db.save('lastUser', user);
 * $db.save('type', 'users', users);
 */
$db.save = function(key, value, data) {
  var db = $db.db;
  if ((typeof data) == 'undefined') { // save object
    var result = db.query({'_key': key});
    var current = result.hasNext() ? result.next() : {'_key': key, 'data': null};
    current['data'] = value;
    return db.save(current);
  } else { // save batch
    var old = $db(key, value);
    var result = db.removeBatch(old, false);
    if (db.allOk(result) == false)
      return false;
    return (data == null) ? old : $db.insert(key, value, data);
  }
}

/**
 * Removes data from script database
 * USAGE:
 * $db.remove('currentUser'); // remove key-value
 * $db.remove('type', 'users'); // remove dataset
 */
$db.remove = function(key, value) {
  if ((typeof value) == 'undefined') {
    var result = $db.db.query({'_key': key});
    var item = result.hasNext() ? result.next() : null; 
    if (item == null)
      return false;
    $db.db.remove(item);
    return item;
  } else { // remove batch
    var old = $db(key, value);
    var result = $db.db.removeBatch(old, false);  
    return $db.db.allOk(result) ? old : false;
  }
}

/**
 * Inserts data to script database 'table' without replacing existing data
 * USAGE:
 * $db.insert('users', 'bob', user);
 */
$db.insert = function(key, value, data) {
  var save = [], db = $db.db;
  if (data.length == 0)
    return true;
  
  for (var i = 0; i < data.length; i++) {
    var o = $copy(data[i]);
    o[key] = value;
    o['stored'] = true;
    save.push(o);
  }

  result = db.saveBatch(save, false);
  return db.allOk(result) ? result : false;
}

/**
 * Returns formatted date time
 * USAGE:
 * $time()
 * $time('HH:mm'), $time('yyyy-MM-dd')
 * $time('yyyy-MM-dd HH:mm', 'GMT', date)
 */
$time = function(fmt, zone, date) {
  if ((typeof fmt) == 'undefined')
    fmt = 'yyyy-MM-dd HH:mm';
  if ((typeof zone) == 'undefined')
    zone = 'GMT';
  if ((typeof date) == 'undefined')
    date = new Date;
  return Utilities.formatDate(date, zone, fmt);
}

/**
 * Parses an ISO timestamp
 * USAGE: $time.iso('2014-01-01T23:30Z', -0.5);
 */
$time.iso = function(str, offset) {
  var a = str.split(/[-T:Z ]/);
  var HH = a.length > 3 ? a[3] : 0;
  var mm = a.length > 4 ? a[4] : 0;
  var date = new Date(a[0],a[1] - 1,a[2],HH,mm);
  if ((typeof offset) != 'undefined')
    date.setTime(date.getTime() + (offset * 3600 * 1000));
  return date;
}

/**
 * Parse string to date (yyyy-MM-dd)
 * TODO: validateions etc.
 */
$time.parse = function(str) {
  var a = str.split(/[-: ]/);
  return new Date(a[0], a[1] - 1, a[2]);
}

/**
 * Returns a fuzzy time string
 * Usage: $time.ago(date);
 */
$time.ago = function(date) {
  var m = Math.round((new Date).valueOf() / 60000) - Math.round(date.valueOf() / 60000);
  var h = Math.round(m / 60);
  var d = Math.round(h / 24);
  var w = Math.round(d / 7);
  var M = Math.round(d / 30); // approx
  
  if (m < 1) return 'just now';
  if (m > 0 && d < 1) return m + ' minute(s) ago';
  if (d > 0 && w < 1) return d + ' day(s) ago';
  if (w > 0 && M < 1) return w + ' week(s) ago';
  return M + ' month(s) ago';
}

/**
 * Sets date to next calendar date
 */
$time.next = function(date) {
  date.setDate(date.getDate() + 1);
  return date;
}

/**
 * Returns true if date is a work day or if days is specified,
 * advances date by that many work days.
 * USAGE: $time.work(date, 5);
 */
$time.work = function(date, days) {
  if ((typeof days) == 'undefined')
    return (date.getDay() > 0 && date.getDay() < 6); // TODO: holidays

  for (var i = 0; i < days; i++)
    do
      $time.next(date);  
    while (!$time.work(date))
  return date;
}

/**
 * Issues an HTTP GET request with given auth token. BETA.
 * USAGE: $http('www.something.com', <yourtoken>);
 */
$http = function(url, headers) {
  var hthead = {
    'method' : 'get',
    'contentType' : 'application/xml; charset=utf-8'
  };
  
  if ((typeof headers) != 'undefined') {
    if ('auth' in headers)
      hthead['Authorization'] = 'token ' + headers['auth'];
    if ('modhash' in headers)
      hthead['X-Modhash'] = headers['modhash'];
    if ('user-agent' in headers)
      hthead['user-agent'] = headers['user-agent'];
  }
  
  $http.response = UrlFetchApp.fetch(url, {
    'headers' : hthead,
    'muteHttpExceptions' : true
  });
  return $http;
}

/**
 * Get last response data in specified format or as raw text.
 * USAGE:
 * $http.data(), $http.data('json')
 */
$http.data = function(fmt) {
  var data = $http.response.getContentText();
  if ((typeof fmt) == 'undefined')
    return data;
  if (fmt == 'json') {
    $http.jsonData = JSON.parse(data);
    return $http.jsonData;
  }
  return data;
}

/**
 * Returns the next page URL from the last request (requires specific format)
 * USAGE: $http.next();
 */
$http.next = function() {
  
  // common pagination scheme #1
  var headers = $http.response.getAllHeaders();
  if ('Link' in headers) {
    var links = headers['Link'].split(/,/);
    var next = links[0].split(/[<>; ]/);
    return ((next[4] == "rel=\"last\"") || (next[1].indexOf("https://") != 0)) ? null : next[1];
  }
  
  // common pagination scheme #2
  if (('kind' in $http.jsonData) && ($http.jsonData['kind'] == 'Listing'))
    return $http.jsonData['data']['after'];
  
  return false;
}

/**
 * Formats a range
 * USAGE:
 * $format($(1, 2), {'font-weight': 'bold', 'color': 'red'});
 */
$format = function(range, fmt) {
  if ((typeof fmt) == 'string')
    fmt = $format[fmt];
  
  if (fmt == null) {
    range.clearFormat();
    return;
  }
  
  if ('background' in fmt)        range.setBackground(fmt['background']);
  if ('font-weight' in fmt)       range.setFontWeight(fmt['font-weight']);
  if ('color' in fmt)             range.setFontColor(fmt['color']);
  if ('number-format' in fmt)     range.setNumberFormat(fmt['number-format']);
  if ('text-align' in fmt)        range.setHorizontalAlignment(fmt['text-align']);
  if ('vertical-align' in fmt)    range.setVerticalAlignment(fmt['vertical-align']);
  if ('border-top' in fmt)        range.setBorder(fmt['border-top'], null, null, null, null, null);
  if ('border-left' in fmt)       range.setBorder(null, fmt['border-top'], null, null, null, null);
  if ('border-bottom' in fmt)     range.setBorder(null, null, fmt['border-top'], null, null, null);
  if ('border-right' in fmt)      range.setBorder(null, null, null, fmt['border-top'], null, null);
  if ('border-vertical' in fmt)   range.setBorder(null, null, null, null, fmt['border-top'], null);
  if ('border-horizontal' in fmt) range.setBorder(null, null, null, null, null, fmt['border-top']);
  if ('formula' in fmt)           range.setFormula(fmt['formula']);
  
  if ('height' in fmt) {
    for (var i = range.getRow(); i <= (range.getRow() + range.getHeight()); i++)
      range.getSheet().setRowHeight(i, 25);
  }
}

/**
 * Formats a column
 * USAGE:
 * $format.column($('sheet'), 1, {'width': 150, 'color': 'red'});
 */
$format.column = function(sheet, column, fmt) {
  if ((typeof sheet) == 'string')
    sheet = $(sheet);
  if ((typeof fmt) == 'string')
    fmt = $format[fmt];
  
  $format($(sheet, 1, column, sheet.getMaxRows(), 1), fmt);

  if ('width' in fmt)
    sheet.setColumnWidth(column, fmt['width']);
}


/**
 * Formats a row
 * USAGE:
 * $format.row($('sheet'), 1, {'height': 50, 'color': 'red'});
 */
$format.row = function(sheet, row, fmt) {
  if ((typeof sheet) == 'string')
    sheet = $(sheet);
  if ((typeof fmt) == 'string')
    fmt = $format[fmt];
  $format($(sheet, row, 1, 1, sheet.getMaxColumns()), fmt);
  
  if ('height' in fmt)
    sheet.setRowHeight(row, fmt['height']);
}

/**
 * Formats a sheet
 * USAGE:
 * $format.sheet($('sheet'), {'background': '#efefef'});
 */
$format.sheet = function(sheet, fmt) {
  if ((typeof sheet) == 'string')
    sheet = $(sheet);
  if ((typeof fmt) == 'string')
    fmt = $format[fmt];
  $format($(sheet, 1, 1, sheet.getMaxRows(), sheet.getMaxColumns()), fmt);
}

/**
 * Shallow copy object sans functions
 */
$copy = function(to, from) {
  if ((typeof from) == 'undefined') {
    from = to;
    to = {};
  }
  
  for (var a in from)
    if (typeof from[a] != 'function')
      to[a] = from[a];
  return to;
}

$app = function() {
}

/**
 * Returns the column number for the given column heading
 * USAGE:
 * var column = $app.column($('sheet'), 'First Name');
 */
$app.column = function(sheet, name) {
  var last = sheet.getLastColumn(), max = sheet.getMaxColumns(), match = 0;
  for (var i = 1; i <= last; i++)
    if ($(1, i).getValue() == name)
      return i;
  
  match = last + 1;
  if (last == max)
    sheet.insertColumnAfter(max);
  
  $(1, match).setValue(name);
  return match;
}

/**
 * USAGE:
 * var sb = new SheetBuilder();
 * sb.name('sheet1')
 *   .column(1, 'Date', {'number-format': 'yyyy-MM-dd', 'width': 120})
 *   .column(2, 'Name')
 *   .row(1, 'Header', {'font-weight': 'bold'})
 *   .rowData('Header', ['Date', 'Name'])
 *   .freeze(1)
 *   .create();
 */
function SheetBuilder() {
  this.columnCount = 0;
  this.rowCount = 50;
  this.columns = {};
  this.rows = {};
  this.data = {};
  this.data.row = {};
  this.data.col = {};
}

SheetBuilder.prototype.name = function(name) { 
  this.name = name;
  return this;
}

SheetBuilder.prototype.column = function(number, name, format) {
  this.columns[name] = {};
  this.columns[name].number = number;
  if ((typeof format) != 'undefined')
    this.columns[name].format = format;
  this.columnCount++;
  return this;
}

SheetBuilder.prototype.row = function(number, name, format) {
  this.rows[name] = {};
  this.rows[name].number = number;
  if ((typeof format) != 'undefined')
    this.rows[name].format = format;
  return this;
}

SheetBuilder.prototype.rowData = function(name, data) {
  this.data.row[name] = data;
  return this;
}

SheetBuilder.prototype.freeze = function(rows, cols) {
  this.frozenRows = rows;
  if ((typeof cols) != 'undefined')
    this.frozenColumns = cols;
  return this;
}

SheetBuilder.prototype.rowLimit = function(limit) {
  this.rowCount = limit;
  return this;
}

SheetBuilder.prototype.create = function(reformat) {
  var sheet = $(this.name);
  if (sheet) {
    if (reformat)
      this.rowCount = sheet.getMaxRows(); // don't truncate rows
  } else {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    ss.insertSheet(this.name, ss.getSheets().length);
    sheet = $(this.name);
    reformat = true;
  }
  
  for (var name in this.data.row)
    $(sheet, this.rows[name].number, 1, 1, this.data.row[name].length).setValues([this.data.row[name]]);  
  
  if (((typeof reformat) == 'undefined') || (reformat == false))
    return sheet;
  
  if ((this.columnCount > 0) &&  (sheet.getMaxColumns() > this.columnCount))
    sheet.deleteColumns(this.columnCount + 1, sheet.getMaxColumns() - this.columnCount);
  
  if ((this.rowCount > 0) && (sheet.getMaxRows() > this.rowCount))
    sheet.deleteRows(this.rowCount + 1, sheet.getMaxRows() - this.rowCount);
  
  for (var name in this.rows) 
    $format.row(sheet, this.rows[name].number, this.rows[name].format); 
  
  for (var name in this.columns) 
    $format.column(sheet, this.columns[name].number, this.columns[name].format);  
  
  if ((typeof this.frozenRows) != 'undefined')
    sheet.setFrozenRows(this.frozenRows);
  
  if ((typeof this.frozenColumns) != 'undefined')
    sheet.setFrozenColumns(this.frozenColumns);
  
  return sheet;
}



