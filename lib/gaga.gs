/**
 * GAGA: Google Apps Github API
 * DEPENDS ON: Google AppScript, hliyan/GASP
 *
 * Copyright (c) 2014, Hasitha N. Liyanage
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 * 
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 * 
 * * Neither the name of the {organization} nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Fetches data via github API
 * USAGE: var data = $git('https://api.github.com/repo/org/project/issues', <your token>);
 */
$git = function(url, token) {
  var data = [], next = url, pages = 0, limit = 10;
  $git._token = ((typeof token) == 'string') ? token : $git._token;
  do {
    data = data.concat($http(next, {'auth': $git._token}).data('json'));
  } while ((next = $http.next()) && (pages++ < limit));
  return data;
}

$git.token = function(token) {
  $git._token = token;
  return $git;
}

$git.org = function(org) {
  if ((typeof org) == 'undefined')
    return ('_org' in $git) ? $git._org: false;
  $git._org = org;
  return $git;
}

$git.project = function(project) {
  if ((typeof project) == 'undefined')
    return ('_project' in $git) ? $git._project : false;
  $git._project = project;
  return $git;
}

$git.milestone = function(milestone) {
  if ((typeof milestone) == 'undefined')
    return ('_milestone' in $git) ? $git._milestone : false;
  $git._milestone = milestone;
  return $git;
}

$git.status = function(status) {
  if ((typeof status) == 'undefined')
    return ('_status' in $git) ? $git._status : false;
  $git._status = status;
  return $git;
}

/**
 * Fetch issues
 * USAGE:
 * $git.token = <yourtoken>;
 * $git.org('acme')
 *   .project('ROADRUNNER')
 *   .milestone(18)
 *   .status('open+closed')
 *   .fetch();
 * or: $git.fetch('issues', true);
 */
$git.fetch = function(what, asObjects) {
  var data = [], url = 'https://api.github.com/repos/' + $git.org() + '/' + $git.project() + '/issues';
  if ($git.milestone())
    url += ('?milestone=' + $git.milestone());
  
  var response = $git(url);
  if ((response.length > 0) && ('message' in response[0]))
    return response[0];
  
  data = data.concat(response);
  
  if ($git.status() && ($git.status().indexOf('closed') >= 0))
    data = data.concat($git(url + '&state=closed'));
  
  if ((typeof asObjects) != 'undefined' && asObjects == true)
    for (var i = 0; i < data.length; i++)
      data[i] = new GitIssue(data[i]);
  return data;
}

/**
 * Constructs an issue object from data return from either the github API or
 * ScriptDB.
 * USAGE:
 * var data = $git.fetch('issues');
 * var issue = GitIssue(data[0]);
 */
GitIssue = function (data) {
  if ('stored' in data) {
    $copy(this, data);
    return;
  }
  
  var f = ['number', 'title', 'body', 'state', 
           'created_at', 'updated_at', 
           'url', 'html_url', 'events_url'];
  for (var i in f)
    this[f[i]] = data[f[i]]; 
  
  this.assignee = data['assignee'] == null ? 'unassigned' : data['assignee']['login'];
  this.milestone = data['milestone']['number'];
  this.isOpen = (this.state == 'open');
  this.priority = 4; // default
  this.labels = {};
  for (var i = 0; i < data['labels'].length; i++) {
    var l = data['labels'][i]['name'];
    if (l in GitIssue.priorities)
      this.priority = parseInt(l);
    else
      this.labels[l] = true;
  }

  this.checked = [];
  this.unchecked = [];
  
  var lines = this.body.split("\n");
  for (var i = 0; i < lines.length; i++) {
    var split = lines[i].split(/](.+)/);
    if (lines[i].match(/- \[ \]/) !== null)
      this.unchecked.push(split[1]);
    else if (lines[i].match(/- \[x\]/) !== null)
      this.checked.push(split[1]);
  }
  
  this.hasChecklist = (this.checked.length > 0 || this.unchecked.length > 0);
  this.tasks = this.hasChecklist ? this.checked.length + this.unchecked.length : 1;
  this.done = this.hasChecklist ? this.checked.length : (this.isOpen ? 0 : 1);
}

GitIssue.priorities = {
  '1': 'Show Stopper',
  '2': 'Must Have',
  '3': 'Good To Have',
  '4': 'Optional'
};

/**
 * Diff an issue with an older version of itself and return the differences as an
 * array of activities performed on it.
 */
GitIssue.prototype.diff = function(old) {
  var activity = [], oldChecked = [], oldUnchecked = [], oldAssignee = '';
  
  if (old) {
    oldChecked = old.checked;
    oldUnchecked = old.unchecked;
    oldAssignee = old.assignee;
  } else
    activity.push(this.action('issue added'));
  
  if (this.assignee != oldAssignee)
    activity.push(this.action('issue assigned'));
  
  if (this.checked.length != oldChecked.length) {
    for (var j = 0; j < this.checked.length; j++) {
      var task = this.checked[j];
      if (oldChecked.indexOf(task) < 0)
        activity.push(this.action('completed task - ' + task));
    }
  }
  
  if (this.unchecked.length != oldUnchecked.length) {
    for (var j = 0; j < this.unchecked.length; j++) {
      var task = this.unchecked[j];
      if (oldUnchecked.indexOf(task) < 0)
        activity.push(this.action('new task - ' + task));
    }
  }
  
  if (old && (this.state != old.state))
    activity.push(this.action((this.state == 'closed') ? 'closed' : 'reopened'));
  return activity;
}

GitIssue.prototype.action = function(text) {
  return {title: text, 
          at: this.updated_at, 
          issue: this.number, 
          user: this.assignee};
}

/**
 * Returns the difference between two sets of issues as a list of activities
 */
GitIssue.diffList = function(a, b) {
  var activity = [];
  
  if ((a == null) || (a.length == 0)) { // no previous picture
    activity.push({title: 'dashboard initialized', 
          at: $time(), 
          issue: 0, 
          user: ''});
    return activity;
  }
  
  for (var i in b) {    
    var diff = b[i].diff(((i in a) ? a[i] : null));
    activity = activity.concat(diff);
  }
  
  for (var i in a)
    if ((i in b) == false)
      activity.push(a[i].action('issue removed'));
  return activity;
}

