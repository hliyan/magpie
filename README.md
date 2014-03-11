Magpie
======

A Github Project Management Extension for Google Apps

- [Introduction](#introduction)
- [Features](#features)
- [Getting started!](#getting-started)
- [For developers](#for-the-developer)
- [Philosophy](#philosophy)
- **[DEMO](https://docs.google.com/spreadsheets/d/1XBd3gJdYapLT2wsHRqqVDsrj1o-yFAfHxHSL3SO9wuc/edit#gid=484996571)**
- [Live Source](https://script.google.com/macros/d/15apHEJpYXAyLqsoumyPAj0rfXrTvLRU_1pR4ULb-HomCZGlhHuT_-ffx/edit?template=default&folder=0B8tashgCVLs9X0pUMzFucEcySHc&usp=drive_web)

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

####Graph sample

![graphs](https://raw.github.com/hliyan/magpie/master/images/magpie-chart.jpg)

####Activity stream sample

![activity](https://raw.github.com/hliyan/magpie/master/images/magpie-activity.jpg)

###Getting started!
1. Create a new Google Spreadsheet
2. Go to **Tools > Script Editor...**
3. Under **Create script for**, select **Spreadsheet**
4. Go to **Resources > Libraries...** in script editor
5. Enter the following **project key** to search for Magpie: **MdUOEJMGCt-W-kWU7C0gsZNZrzsJqypJa**
6. In the results, **select the latest version** of Magpie
7. **Under identifier**, enter *include* (you can enter any other identifier, but this is what I have used with the sample code below. So if you want to copy and paste the initialization code below, use *include*).
8. Replace the auto generated code from Google with the **following code**:

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
  magpie.update('43e200f4c7ec1a974182912a4cb7e3dc9ba95876'); // NOTE: replace!
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
1. Select **Run > onOpen** from the script editor menu.
1. Click **Accept** to allow Magpie to run on your spreadsheet. This is a one-time step.
1. You should now see 'Magpie' on the menubar within a few seconds.
1. Click **Magpie > Update**
1. A new sheet called 'config' will appear and you'll be prompted to add data.
1. On some browsers, the sheet may freeze for the very first time. **Close and reopen the sheet** if this happens.
1. Fill in the Github **repo owner** (e.g. *hliyan*), **repo** (e.g. *enterprise*), **milestone** (e.g. *1*) and your **timezone** data (e.g. *0*, *GMT*).
1. Enter **milestone start and end dates** in 'yyyy-MM-dd' format (if Google Spreadsheet messes with the format, set the cell format to 'Plain Text')
1. Click **Magpie > Update** again and wait for all the new sheets to be added
1. Consider hiding gridlines (View > Gridlines) - dashboard looks nicer without them

##Philosophy

Magpie has been tested in small to medium sized real world projects. Those projects relied on a certain methodology. Here is that methodology and the philosophy behind it:

I've seen developers forced to enter the same information multiple times -- once when they **provide task breakdowns and effort estimates**, once when they're **updating the issue/ticket tracking system** and once again when they're **filling out their timesheets**. And sometimes, when they have a lot of work, they also have their own **to-do lists**. I searched years for a system -- preferably free and open source -- that could collapse all this into one system. Obviously I didn't find it. So I built my own.

This is the process that I use with Magpie. It is what I recommend, but if you find better (and simpler) alternatives, do let me know. Remember: simplicity is the most important thing.

####Milestones

- **Milestones are two weeks long**, unless there is a specific reason to make it longer or shorter.
- Milestones are internally named according to **alphabetical themes** (e.g. Aardvark, Barracuda, Coyote, Dragonfly, or Almond, Butterscotch, Cinnamon, etc.). This gives us 2 x 26 = 52 weeks or exactly a year's worth of milestones.

####Priorities

- There are **four issue priorities**, assigned to issues as Github labels:
 - 1 - "Show stopper" - critical bugs, things that are holding back the entire team etc.
 - 2 - "Must have" - required deliverable for this milestone
 - 3 - "Good to have" - make best effort to deliver, but can be deferred to next milestone if necessary
 -  4 - "When free" - Attempt only when free or when all 1-3 priority issues for the current release have been completed
- **Criticality and priority are one and the same**. I have previously used systems where these attributes were represented separately - e.g. a UI fix the client wants right now is high priority but low criticality and a crash that is being deferred for some reason is low priority but high criticality. This only added to the paperwork and did not really contribute anything. The reasoning in Magpie: measure impact of an issue in terms of impact to the project and the client, rather than the system. If the system is in beta, a crash is lower priority than when it's in full production. A missing form label in production is higher priority than a crash in beta.

####Timeboxing

- We **timebox** - deadlines cannot be extended; only deliverables can be reduced. Every milestone must contain a percentage of **"Good to have" and "When free" issues that can act as a buffer** if there is a risk of schedule overrun. When you start running out of time, you start by moving "When free" issues to the next milestone. When those are gone, you start moving "Good to have" issues. If you still suffer a schedule overrun, something is wrong with your planning.
- **Checklists in Github issues are central to the process**. Once an issue has been attached a priority, a milestone and an assignee, a checklist of tasks must be added to the issue description. This represent both a task breakdown and a rough design which the architect / program manager can review.
- The general guideline for tasks is that **no task represented by a checklist can be longer than two hours**, although more fine grained breakdowns are perfectly fine. If an issue has four checklist items attached, it's a full day task (assuming an 8 hour work day, which is another thing recommended in the philosophy behind Magpie).
- By trial and error I discovered that for teams like mine, **2 hours is the optimal minor time unit and 2 weeks is the optimal major time unit**. 2-hour tasks mean that a person only has to enter and update only 4 tasks a day on average -- a very minor load.

####Checklist items

- Checklist items are not set in stone. If you run into a debugging issue that takes 2 hours, you may append a checklist item to the issue to reflect that. If you have to change the design, you can add new checklist items to reflect that as well. The only requirement here is that your architect / program manager should have, at any given moment, a rough idea of your workload and what you're currently working on.
- Checklist items are to be updated at commit time, not pull request time, so that the architect / program manager sees gradual progress even for potentially large pull requests.

####Metrics are evil

- **Measuring people based on metrics (beyond checklist items) is heavily discouraged**. Management based on summaries and reports is considered lazy and discouraged. **Summarization is lossy compression and metrics are the worst form of summarization**. This philosophy rejects the idea that "a good manager can manage anything" -- you cannot manage what you don't understand. A team should be small enough for the person in charge to review all tasks in detail. If not, the team needs to be split to smaller units and more people with review and oversight skills need to be developed within the team. For the type of work I manage, I find that I start losing details if the team is larger than 12.

####Don't over-plan

- **Do not overplan**. A day is too fine grained a unit for managing task dependencies. It is the root cause of Gantt Chart Hell. I use the major time unit, which is 2 weeks. If issue B depends on issue A, they are usually dropped in consecutive milestones. Minor dependencies within a milestone are not tracked in the plan. They are specified as issue references in Github issue body and the developers are expected to communicate with each other and manage them on their own.

####Other

- **Naming conventions**: for consistency, everything is lowercase. Issues are named in the following manner: "module - feature - failure [when condition]". This makes quick scans of the issue list easier. It also helps teams for whom English is not the native language. The module is duplicated in both labels and titles for the benefit of email notifications.
- Github labels are used in two other ways - to mark bugs ("bug") and to specify the module or subsystem to which an issue belongs. These are automatically picked up by Magpie for the dashboard and graphs.
- The dashboard is shared with the entire team -- everyone should know where everyone else is at so that he/she can coordinate work accordingly.

##For the developer
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
