Magpie
======

A Github Project Management Extension for Google Apps

###Introduction
Magpie allows you to track your github projects using a Google Spreadsheet -- all you have to do is link a spreadsheet to a specific milestone on your Github project and it will be updated hourly.

![dashboard](https://raw.github.com/hliyan/magpie/master/images/magpie-dash.jpg)

###Features
- A **dashboard** showing milestone progress by assignee and labels
- Milestone **progress** derived from checklist items in body
- An **activity stream** that shows newly added/completed tasks (by detecting checklist item changes)
- Progress **graphs** for milestone, team members and labels (based on checklist items completed)
- Magpie comes with a development **methodology** and a philosophy to help you get the most out  of it (though you're free to use your own)
- A simple, open source **API**, if you want to extend Magpie's capabilities
- Here is a **[demo](https://docs.google.com/spreadsheets/d/1XBd3gJdYapLT2wsHRqqVDsrj1o-yFAfHxHSL3SO9wuc/edit#gid=484996571)** (note that due to current security limitations, you need to create your own if you want to see the graphs feature)

###Getting started!
1. Create a new Google Spreadsheet
2. Go to **Tools > Script Editor...**
3. Under **Create script for**, select **Spreadsheet**
4. Go to **Resources > Libraries...** in script editor
5. Enter the following **project key** to search for Magpie: **MdUOEJMGCt-W-kWU7C0gsZNZrzsJqypJa**
6. In the results, select the latest version of Magpie
7. Under identifier, enter *include* (you can enter any other identifier, but this is what I have used with the sample code below. So if you want to copy and paste the initialization code below, use *include*).
8. Replace the auto generated code from Google with the following:

```javascript
magpie = include.magpie; // use the library identifer instead of 'include' if it's different
include.$db.set(ScriptDb.getMyDb()); // Magpie will use the spreadsheet's database

// this will create the Magpie menubar items
function onOpen() {  
  magpie.onOpen();
};

// this will run when you select Magpie > Update
// and once every hour
// replace the token with your own Github token
function update() {
  magpie.update('43e200f4c7ec1a974182912a4cb7e3dc9ba95876');
}

// this will run when you select Magpie > Chart
function chart() {
  magpie.viewChartPanel();
}

// don't use Magpie > Reset unless you want to clear the 
// database and start over
function reset() {
  magpie.reset();
}
```
**After adding the above code**

1. Remember to **replace the sample token** above with **your actual Github token**. Magpie will not store this anywhere.
1. Reload the spreadhseet
1. You should see 'Magpie' on the menubar within a few seconds.
1. Click **Magpie > Update**
1. A new sheet called 'config' will appear and you'll be prompted to add data
1. Fill in the Github **repo owner** (org), **repo**, **milestone** and your **timezone** data
1. Click **Magpie > Update** again and wait for all the new sheets to be added
1. On some browsers, the sheet may freeze. If that happens, refresh the page.
1. Consider hiding gridlines (View > Gridlines) - dashboard looks nicer without them

###For the developer
If you want to learn some interesting bits about the Magpie code, read on.

Magpie is built on three layers:
- A **jQuery-like Google App Script library** that allows easy access to Google spreadsheets and their cells
- A convenient **Javascript wrapper** on top of the **Github API** that can be used from within Google App Script
- The actual **Magpie application**, which fetches Github data every hour and renders a dashboard and other reports for your Github project

**GASP!**

The lowest layer is an extension that is to Google App Script what jQuery is to Javascript. Tongue in cheek, it's called GASP - **Google App Script Plugin.**

```javascript
// how to use GASP
var sheet = $('sheet1');
var range1 = $('sheet1', 'A5');
var range2 = $('sheet1', 1, 2);
var range3 = $('sheet1', 1, 1, 5, 5); // a 5 x 5 grid
var range4 = $(sheet, 'A5'); // same as range1, but with sheet already known
$.sheet = sheet; // you can even set the sheet context
var range5 = $(1, 2); // same as range 2
var range6 = $(1, 1, 5, 5); // same as range 3
```

**GAGA**

The second layer, also named tongue in cheek, is called GAGA - **Github API for Google Apps**. The following example will illustrate what it does:

```javascript
// how to use GAGA
  var data = $git.token('14658cabab79664b4c8e92267da5561b600f422e')
    .org('hliyan')
    .project('enterprise')
    .milestone(1)
    .status('open+closed')
    .fetch('issues', true); // true: returns GitIssue objects, false: raw data
for (var i = 0; i < data.length; i++) {
    var issue = data[i];
    Logger.log(issue); // you can see the issue structure here
}
```
