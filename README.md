Magpie
======

A Github Project Management Extension for Google Apps

####Introduction
Magpie allows you to track your github projects using a Google Spreadsheet -- all you have to do is link a spreadsheet to a specific milestone on your Github project and it will be updated hourly.

![dashboard](https://raw.github.com/hliyan/magpie/master/images/magpie-dash.jpg)

####Features
- A **dashboard** showing milestone progress by assignee and labels
- Issue **progress** derived from checklist items in body
- An **activity stream** that shows newly added/completed tasks (by detecting checklist item changes)
- Progress **graphs** for milestone, team members and labels (based on checklist items completed)
- Magpie comes with a development **methodology** and a philosophy to help you get the most out  of it (though you're free to use your own)
- A simple, open source **API**, if you want to extend Magpie's capabilities

####Components
If you prefer to start using Magpie straightaway, skip to the installation section below. If you want to learn some interesting bits about the Magpie code, read on.

Magpie is built on three layers.
- A jQuery-like Google App Script library that allows easy access to Google spreadsheets and their cells
- A convenient Javascript wrapper over the Github API that can be used from within Google App Script
- The actual Magpie application, which fetches Github data every hour and renders a dashboard and other reports for your Github project

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
