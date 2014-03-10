/**
 * MAGPIE: Google Apps Integration for Managing Github Projects
 * Copyright (c) 2014 Hasitha Liyanage
 * License Yada Yada Yada. 
 * DEPENDS ON: Google AppScript, hliyan/GASP, hliyan/GAGA
 * Project Key: MkAKgftxvg2TEFXUGomqj19ZrzsJqypJa
 */

function magpie() {
}

magpie.format = {};
magpie.test = false;

magpie.format.dash = new SheetBuilder();
magpie.format.dash.name('dash')
  .column(1, 'dev',      {'text-align': 'right', 'font-weight': 'bold', 'vertical-align': 'middle', 'width': 175})
  .column(2, 'id',       {'font-weight': 'bold', 'text-align': 'right', 'vertical-align': 'middle', 'width': 35})
  .column(3, 'title',    {'vertical-align': 'middle', 'width': 650})
  .column(4, 'progress', {'text-align': 'center', 'vertical-align': 'middle', 'width': 70})
  .column(5, 'status',   {'text-align': 'center', 'vertical-align': 'middle', 'width': 70})
  .column(6, 'todo',     {'text-align': 'center', 'vertical-align': 'middle', 'width': 70})
  .column(7, 'due',      {'color': '#9c9999', 'vertical-align': 'middle', 'width': 130})
  .row(1, 'header',      {'background': '#222222', 'color': '#ffffff', 'font-weight': 'bold', 'vertical-align': 'middle', 'height': 25})
  .row(2, 'subheader',   {'background': '#D0DBF5', 'font-weight': 'bold', 'vertical-align': 'middle'})
  .freeze(2);

magpie.format.priority = {
  '1': {'background': '#F7AB9C', 'color': 'black'},
  '2': {'background': '#FCE5CD', 'color': 'black'},
  '3': {'background': '#F1FFA8', 'color': 'black'},
  '4': {'background': '#BFE5BF', 'color': 'black'}
};

magpie.format.state = {
  'open': {'background': '#FCE5CD'},
  'closed': {'background': '#D9EAD3'}
};

magpie.format.activity = new SheetBuilder();
magpie.format.activity.name('activity')
  .column(1, 'time', {'width': 120, 'number-format': 'yyyy-MM-dd HH:mm'})
  .column(2, 'user', {'width': 100})
  .column(3, 'issue', {'width': 25, 'text-align': 'center'})
  .column(4, 'title', {'width': 650})
  .row(1, 'header', {'background': '#222222', 'color': '#ffffff', 'font-weight': 'bold', 'vertical-align': 'middle', 'height': 25})
  .rowData('header', ['time', 'user', '#', 'action'])
  .freeze(1);

magpie.format.plot = new SheetBuilder();
magpie.format.plot.name('plot')
  .column(1, 'time', {'width': 150, 'number-format':'yyyy-MM-dd'})
  .column(2, 'what', {'width': 60})
  .column(3, 'done', {'number-format':'0', 'width': 30})
  .column(4, 'tasks',{'number-format':'0', 'width': 30})
  .column(5, 'bug_done', {'number-format':'0', 'width': 30})
  .column(6, 'bug_tasks',{'number-format':'0', 'width': 30})
  .row(1, 'header',  {'background': '#222222', 'color': '#ffffff', 'font-weight': 'bold', 'vertical-align': 'middle', 'height': 25})
  .rowData('header', ['time', 'what', 'done', 'tasks', 'bug done', 'bug tasks'])
  .freeze(1);

magpie.format.conf = new SheetBuilder();
magpie.format.conf.name('conf')
  .row(1, 'header', {'background': '#222222', 'color': '#ffffff', 'font-weight': 'bold', 'vertical-align': 'middle', 'height': 25})
  .freeze(1)
  .column(1, 'config', {'width': 150, 'font-weight': 'bold'})
  .column(2, 'value', {'width': 150})
  .column(3, 'desc', {'width': 150})
  .rowData('header', ['config', 'value', 'display value'])
  .row(2, 'org', {}).rowData('org', ['org'])
  .row(3, 'repo', {}).rowData('repo', ['repo'])
  .row(4, 'milestone', {}).rowData('milestone', ['milestone'])
  .row(5, 'start', {}).rowData('start', ['start date'])
  .row(6, 'end', {}).rowData('end', ['end date'])
  .row(7, 'offset', {}).rowData('offset', ['timezone offset (optional)'])
  .row(8, 'timezone', {}).rowData('timezone', ['timezone'])
  .rowLimit(10);

magpie.format.hline = Array(150).join("-");

/**
 * Mutators
 */
magpie.token =      function(a) {magpie._token = a; return magpie;}
magpie.org =        function(a) {magpie._org = a; return magpie;}
magpie.project =    function(a) {magpie._project = a; return magpie;}
magpie.milestone =  function(a) {magpie._milestone = a; return magpie;}
magpie.milestoneName =  function(a) {if ((typeof a) == 'undefined') return magpie._milestoneName; magpie._milestoneName = a; return magpie;}
magpie.timeOffset = function(a) {magpie._timeOffset = a; return magpie;} // use if offset is wrong for your timezone
magpie.timezone =   function(a) {magpie._timezone = a; return magpie;}

/**
 * Call this from sheet onOpen to setup menu items.
 */
magpie.onOpen = function() {
  // create menu
  SpreadsheetApp.getUi()
      .createMenu('Magpie')
      .addItem('Update', 'update')
      .addSeparator()
      .addItem('Chart...', 'chart')
      .addItem('Reset', 'reset')
      .addToUi();
}

/**
 * Add an update() function to your sheet and call this from there
 */
magpie.update = function(token) {
  // create configuration sheet
  if ((typeof SpreadsheetApp) != 'undefined') {
    if (!$('conf')) {
      magpie.format.conf.create();
      SpreadsheetApp.getUi().alert('Please update the config sheet and reload this spreadsheet');
      return;
    }
    
    magpie.init();
  } 
  
  if ((typeof token) != 'undefined')
    magpie.token(token);
  
  var data = $git.token(magpie._token)
    .org(magpie._org)
    .project(magpie._project)
    .milestone(magpie._milestone)
    .status('open+closed')
    .fetch('issues', true);

  if ('message' in data) {
    SpreadsheetApp.getUi().alert('Github says: ' + data['message']);
    return data;
  }
  
  var old = $db('type', 'issue');
  for (var i = 0; i < old.length; i++)
    old[i] = new GitIssue(old[i]);
  var info = {org: magpie._org, project: magpie._project, milestone: magpie._milestone};
  var dash = magpie.dash(data);
  var olddash = magpie.dash(old);
  var activity = GitIssue.diffList(('milestone' in olddash.milestone) ? olddash.milestone.milestone.issues : null, 
                                   dash.milestone.milestone.issues);
  
  magpie.viewDash(dash);
  magpie.viewActivity(activity, dash);
  magpie.savePlot(dash);

  $db.save('type', 'issue', data);
  return data;
}

magpie.reset = function() {  
  $db.remove('type', 'issue');
}

/**
 * Called internally
 */
magpie.init = function() {
  // read configuration data
  var conf = magpie.format.conf.rows;
  $.sheet = $(magpie.format.conf.name);
  magpie.org($(conf.org.number, 2).getValue())
        .project($(conf.repo.number, 2).getValue())
        .milestone($(conf.milestone.number, 2).getValue())
        .milestoneName($(conf.milestone.number, 3).getValue());
  
  // start or stop triggers
  var triggers = ScriptApp.getProjectTriggers();
  var start = $time.parse($(conf.start.number, 2).getValue());
  var end = $time.parse($(conf.end.number, 2).getValue());
  var today = new Date();
  
  if ((today.getTime() >= start.getTime()) && (today.getTime() <= end.getTime())) {
    if (triggers.length == 0) {
      ScriptApp.newTrigger("update")
        .timeBased()
        .everyHours(1)
        .create();
      SpreadsheetApp.getUi().alert('Hourly updates will start from today.');
    }
  } else if (triggers.length > 0) {
    for (var i = 0; i < triggers.length; i++)
      ScriptApp.deleteTrigger(triggers[i]);
    SpreadsheetApp.getUi().alert('Hourly updates stopped.');
  }
}

/**
 * Given milestone info and issue data, returns a 'dashboard'
 * object with issues placed in buckets by assignees and labels,
 * with task task totals computed.
 */
magpie.dash = function(data) {
  var buckets = {}, team = {}, milestone = {}, labels = {};
  
  var drop = function(bucket, name, issue) {
    if (name in bucket == false) {
      bucket[name] = {};
      bucket[name]['issues'] = {};
      bucket[name]['tasks'] = 0;
      bucket[name]['done'] = 0;
      bucket[name]['bug_tasks'] = 0;
      bucket[name]['bug_done'] = 0;
    }
    bucket[name]['issues'][issue.number] = issue;
    bucket[name]['tasks'] += issue.tasks;
    bucket[name]['done'] += issue.done;
    
    if ('bug' in issue.labels) {
      bucket[name]['bug_tasks'] += issue.tasks;
      bucket[name]['bug_done'] += issue.done;
    }
  }
  
  for (var i = 0; i < data.length; i++) {
    var issue = data[i];
    drop(team, issue.assignee, issue);
    drop(milestone, 'milestone', issue);
    for (var j in issue.labels)
      drop(labels, j, issue);
  }
  
  buckets['team'] = team;
  buckets['milestone'] = milestone;
  buckets['labels'] = labels;
  
  buckets['milestoneNumber'] = magpie._milestone;
  buckets['milestoneName'] = magpie._milestoneName;
  buckets['org'] = magpie._org;
  buckets['project'] = magpie._project;
  return buckets;
}

/**
 * Renders a dashboard sheet using the dashboard object provided
 */
magpie.viewDash = function(dash) {
  if (magpie.test)
    return;
  
  var ms = dash.milestone.milestone;
  
  var progress = (ms.done + ' / ' + ms.tasks),
      pct = (Math.round( (ms.done / ms.tasks) * 100 ) + '%'),
      todo = (ms.tasks - ms.done),
      due = $time('E, MMM d yyyy', magpie._timezone, $time.work(new Date, Math.round(todo / 4))),
      now = $time('yyyy-MM-dd HH:mm', magpie._timezone, new Date);
  
  var builder = magpie.format.dash;
  builder.rowData('header', [magpie._project, '', 'last update: ' + now, 'progress', 'status', 'todo', 'due (approx)']);
  builder.rowData('subheader', [magpie._milestoneName, '', '', progress, pct, todo, due]);
  
  var sheet = builder.create();
  $.sheet = sheet;
  if (sheet.getLastRow() > 2) {
    var grid = $(3, 1, sheet.getLastRow() - 2, sheet.getMaxColumns());
    grid.setBackground("white");
    $(sheet, 'C3:G' + sheet.getLastRow()).setFontWeight('normal');
    grid.clearContent();
  }
  
  var row = 2, maxRow = sheet.getMaxRows();
  
  var drawBlock = function(data) {
    var progress = (data.done + ' / ' + data.tasks);
    var pct = Math.round( (data.done / data.tasks) * 100 ) + '%';
    var todo = (data.tasks - data.done);
    var due = $time('E, MMM d yyyy', 'GMT', $time.work(new Date, Math.round(todo / 4)));
  
    $(++row, 1, 1, builder.columnCount).setValues([[i, '', magpie.format.hline, progress, pct, todo, due]]);
    
    for (var j in data['issues']) {
      var issue = data['issues'][j];
      progress = (issue.done + ' / ' + issue.tasks);
      $(++row, 1, 1, builder.columnCount).setValues([['', issue.number, issue.title, progress, issue.state, '', '']]);
      $(row, builder.columns.id.number).setFormula('=hyperlink("' + issue.html_url + '";"' + issue.number + '")');
      $format($(row, builder.columns.id.number), magpie.format.priority['' + issue.priority]);
      $format($(row, builder.columns.status.number), magpie.format.state[''+issue.state]);
    }
    row += 2;
  }
  
  for (var i in dash.team)
    drawBlock(dash.team[i]);

  $format.row(sheet, ++row, {'background': '#eeeeee', 'font-weight': 'bold', 'vertical-align': 'middle'});
  $(row, 3).setValue('labels');
  
  for (var i in dash.labels)
    drawBlock(dash.labels[i]);
  
  if (row > maxRow)
    builder.create(true); // reformat newly added rows
}

/**
 * Render a given array of events on a new sheet.
 */
magpie.viewActivity = function(activities, dash) {
  if (magpie.test)
    return;
  
  var builder = magpie.format.activity;
  var sheet = builder.create();
  $.sheet = sheet;
  var row = sheet.getLastRow(), maxRow = sheet.getMaxRows();
  var clearUnread = function() {
    var i = row;
    for (; i > 1; i--)
      if ($(i, 1).getFontWeight() != 'bold')
        break;
    $(i, 1, row, builder.columnCount).setFontWeight('normal');
  };
  
  if (row > 1)
    clearUnread();
  
  for (var i = 0; i < activities.length; i++) {
    row++;
    var activity = activities[i];
    var at = $time('yyyy-MM-dd HH:mm', magpie._timezone, $time.iso(activity.at, magpie._timeOffset));
    var range = $(row, 1, 1, builder.columnCount);
    range.setValues([[at, activity.user, activity.issue, activity.title]]);
    $format(range, {'font-weight': 'bold'});
    if (activity.issue in dash.milestone.milestone.issues) {
      var issue = dash.milestone.milestone.issues[activity.issue];
      $(row, builder.columns.issue.number).setFormula('=hyperlink("' + issue.html_url + '";"' + issue.number + '")');
      $(row, builder.columns.issue.number).setNote(issue.title);
    }
  }
  
  if (row > maxRow)
    builder.create(true); // reformat newly added rows 
}

/**
 * Open a chart window
 */
magpie.viewChartPanel = function() {
  if (magpie.test)
    return;
  
  $.sheet = $('plot');
  
  var table = $(1, 1, $.sheet.getLastRow(), $.sheet.getLastColumn()).getDataTable(true);
  var whatFilter = Charts.newCategoryFilter()
      .setFilterColumnLabel("what")
      .setAllowMultiple(false)
      .setAllowNone(false)
      .setAllowTyping(false)
      .setLabel('Select: ')
      .setSortValues(true)
      .build();
  var chart = Charts.newLineChart()
      .setDataViewDefinition(Charts.newDataViewDefinition().setColumns([0, 2, 3, 4, 5]))
      .setColors(['green', 'blue', 'orange', 'red'])
      .build();
  var dashboard = Charts.newDashboardPanel()
      .setDataTable(table)
      .bind([whatFilter], [chart])
      .build();
  var uiApp = UiApp.createApplication();
  dashboard.add(uiApp.createVerticalPanel()
                .add(uiApp.createHorizontalPanel().add(whatFilter).setSpacing(1))
                .add(uiApp.createHorizontalPanel().add(chart)));
  uiApp.add(dashboard);
  SpreadsheetApp.getActiveSpreadsheet().show(uiApp);
  return true;
}

/**
 * Save a plot point for the progress graph data (once a day)
 */
magpie.savePlot = function(dash) {
  if (magpie.test)
    return;
  
  var builder = magpie.format.plot;
  var sheet = builder.create();
  $.sheet = sheet;

  var date = new Date;
  var lastDate = new Date($(sheet.getLastRow(), builder.columns.time.number).getValue());  
  if (date.getDate() == lastDate.getDate())
    return false;

  var row = sheet.getLastRow() + 1;
  var time = $time('yyyy-MM-dd', magpie._timezone, date);
  for (var c in {'milestone': 1, 'team': 1, 'labels': 1})
    for (var i in dash[c])
      $(row++, builder.columns.time.number, 1, builder.columnCount).setValues(
        [[time, i, dash[c][i]['done'], dash[c][i]['tasks'], dash[c][i]['bug_done'], dash[c][i]['bug_tasks']]]);
  return true;
}


