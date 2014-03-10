Magpie
======

A Github Project Management Extension for Google Apps

####Introduction
Magpie allows you to track your github projects using a Google Spreadsheet -- all you have to do is link a spreadsheet to a specific milestone on your Github project and it will be updated hourly.

![dashboard](https://raw.github.com/hliyan/magpie/master/images/magpie-dash.jpg)

####Components
If you prefer to start using Magpie straightaway, skip to the installation section below. If you want to learn some interesting bits about the Magpie code, read on.

Magpie is built on three layers.
- A jQuery-like Google App Script library that allows easy access to Google spreadsheets and their cells
- A convenient Javascript wrapper over the Github API that can be used from within Google App Script
- The actual Magpie application, which fetches Github data every hour and renders a dashboard and other reports for your Github project
