let taskList = [];  // List of all tasks
let displayList = [];  // All tasks to be displayed, inclusive nullTime tasks
let startAndEndTimes = [];
let chosenTask = '';
let chosenTaskId = '';
let idOfLastTouched = 0;
let uniqueIdOfLastTouched = 0;
let uniqueIdList = []; // Used by the class Task only
let nullTimeClicked = false;
let zoom = 1.0;  // The height of all elements will be multiplied with zoom. Values can be 1 or 0.5
let zoomSymbolModifyer = 0; // The last digit of the \u numbers \u2357 ⍐ and \u2350 ⍗
let defaultTaskDuration = 30;
let wakeUpH = 7;  // The hour your day start according to settings. This is default first time the page is loaded
let wakeUpM = 0;  // The minutes your day start according to settings
let wakeUpOrNowClickedOnce = false;
let wakeUpStress = 2;  // Stress level is a integer between 1 and 10 denoting percieved stress level with 1 as totally relaxed and 10 stress meltdown
// let stressLevel = wakeUpStress;
let tDouble = 240;  // Doubling time for stress level in minutes
let msgTimeOutID = null; // Used in stopTimeout() for removing a timeout for messages
let taskAlarms = 'off'; // Turn alarms off by defalult
let reminder = 'off'; // Turn reminders off by default
let tasksFromClickedDayInMonth = null;
let tasksSentBetween = [];

///////// Add-view /////////
let taskText_add = '';
let taskDuration_add = defaultTaskDuration;
let taskTime_add = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 12, 00);
let drainGainLevel_add = 'd1';

///////// Month-view ////////
let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let monthTaskList = {};  // Dict with all tasks storede in month-view. Technically a JS object usable much like a Python dictionary
let pastDayList = {};   // Old taskList is stored here on their relevant date {"4-1-21": [task, task,...]}
let trackTaskList = {}; // Each tracked task have a text-key and a colour and an opacity  Ex: {'morgenprogram': ['#00FF00', '1']}
// let trackTaskList = {'morgenprogram': ['#00FF00', '1'], 'frokost': ['#DD0000', '1'], 'programmere': ['#0000FF', '1']}; // Each tracked task have a text-key and a colour and an opacity  Ex: {'morgenprogram': ['#00FF00', '1']}
let putBackId = '';

///////// Track-view ////////
let colours = [
'Aquamarine','LightBlue', 'SkyBlue', 'SteelBlue', 'Turquoise', 'DarkTurquoise', 'DarkCyan',
'Cyan','DeepSkyBlue','RoyalBlue','DarkBlue','Blue','Indigo','BlueViolet','Purple','Magenta',
'Violet','DeepPink','Crimson','Red','Tomato','Salmon','Sienna','Chocolate','Brown','Khaki',
'Gold','Yellow','GreenYellow' ,'LawnGreen','LightGreen','SpringGreen','Lime','LimeGreen',
'ForestGreen','Green','DarkGreen','Lightgrey','Darkgrey','grey'
]

///////// Storage-view ///////
let weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
'Sunday', 'Extra Store 1', 'Extra Store 2', 'Extra Store 3'];
let storageList = {};  // taskList and their names are stored in memory1-17  {'memory1': [[task, task, ...], 'name']}

// Daylight saving time shenanigans
let today = new Date();
let january = new Date(today.getFullYear(), 0, 1);
let july = new Date(today.getFullYear(), 6, 1);
const dstOffset = (july.getTimezoneOffset() - january.getTimezoneOffset()) * 60000; // Daylight saving time offset in ms

// Task-object. Each task will be an object of this type
class Task {
  constructor(date, duration, text, drain) {
    this.date = date; // Start time as Javascript date
    this.duration = duration; // Duration in milliseconds
    this.text = text;
    this.drain = Number(drain);  // drain is a number between -5 and 5. Gain is negative drain.
    this.uniqueId = this.giveAUniqueId();
    this.end = this.end();
    this.height = this.height();
    this.isClicked = 'isNotClicked'
  }

  giveAUniqueId() {
    let tryAgain = false;
    let uniqueId = 0;
    do {
      tryAgain = false;
      uniqueId = Math.floor(Math.random() * 10000);
      for (const [index, id] of uniqueIdList.entries()) {
        if (uniqueId.toString() === id.toString()) {
          tryAgain = true;
          break;
        }
      }
    }
    while (tryAgain);

    uniqueIdList.push(uniqueId);
    return uniqueId;
  }

  end() { // End time as Javascript date
    if (this.date != '') {
      return new Date(this.date.getTime() + this.duration);
    }
  }

  height() { // Pixelheight is 1 minute = 1 px
    return this.duration / 60000;
  }
}


// Runs when the page is loaded:
function setUpFunc() {
  taskList = [];

  makeFirstTasks();

  retrieveLocallyStoredStuff();

  // adjustNowAndWakeUpButtons();

  // Set uniqueIdOfLastTouche to the last task before 'Day end'
  uniqueIdOfLastTouched = taskList[taskList.length - 2].uniqueId;

  fillTimeBar(zoom);

  createTimeMarker();

  updateTimeMarker();

  // debugExamples(); // Make debug example tasks. Run from commandline if needed. DO NOT UNCOMMENT

  adjustNowAndWakeUpButtons();  // Needs to be after the first tasks is pushed to taskList because of renderTasks()
  // renderTasks();  // Is in adjustNowAndWakeUpButtons

  getDueRemindersFromLast3Months();

  jumpToNow();

  updateHearts(); // Update hearts to current time

  document.getElementById('dayInputBox').focus();
}


function createTimeMarker() {
  // Create time marker to show current time on timebar
  let nowSpan = document.createElement('span');
  nowSpan.setAttribute('id', 'nowSpan');
  document.getElementById('container').appendChild(nowSpan);
}


function makeFirstTasks() {
  // Make the first tasks. Necessary for adding new tasks
  let startList = ['000 1m Day start', '2359 1m Day end'];
  for (const [index, text] of startList.entries()) {
    parsedList = parseText(text.trim());
    let task = new Task(parsedList[0], parsedList[1], parsedList[2], parsedList[3]);
    task.fuzzyness = 'isNotFuzzy';
    taskList.push(task);
  }
}


function storeLocally() {
  localStorage.taskList = JSON.stringify(taskList);

  localStorage.wakeUpOrNowClickedOnce = wakeUpOrNowClickedOnce;

  localStorage.zoom = zoom;

  localStorage.defaultTaskDuration = defaultTaskDuration;

  localStorage.wakeUpStress = wakeUpStress;

  localStorage.tDouble = tDouble;

  localStorage.idOflastTouched = idOfLastTouched;

  // if (tasksSentBetween) { // TODO: Is this used?
  //   localStorage.tasksSentBetween = JSON.stringify(tasksSentBetween);
  // }

  if (monthTaskList) {
    localStorage.monthTaskList = JSON.stringify(monthTaskList);
  }

  if (trackTaskList) {
    localStorage.trackTaskList = JSON.stringify(trackTaskList);
  }

  // Store today in pastDayList
  let now = new Date();
  let id = now.getDate().toString() + '-' + now.getMonth().toString() + '-' + now.getFullYear();
  pastDayList[id] = deepCopyFunc(taskList);  //  Func is used to make a deep copy

  // Store pastDayList
  if (pastDayList) {
    localStorage.pastDayList = JSON.stringify(pastDayList);
  }

  // Store storageList
  if (storageList) {
    localStorage.storageList = JSON.stringify(storageList);
  }
}


function deepCopyFunc(original) {
  if (typeof original != 'object' || original === null || // typeof null is 'object', hence the latter check
    Object.prototype.toString.call(original) === '[object Date]') { // Dates have to be returned as-is
    return original
  }

  let deepCopy = {};  // Assume deepCopy is an object
  if (Array.isArray(original)) { // Change it if it turns out to be an array
    deepCopy = [];
  }

  for (var key in original) {
    let value = original[key];

    deepCopy[key] = deepCopyFunc(value);  // Recursively travel the object for objects
  }

  return deepCopy
}


function retrieveLocallyStoredStuff() {

  if (localStorage.getItem('taskList')) {
    taskList = JSON.parse(localStorage.taskList);
    // Fix dates messed up by JSON.stringify - and bring them up to current date
    let now = new Date();
    for (const [index, task] of taskList.entries()) {
      task.date = new Date(task.date);
      task.date.setDate(now.getDate());
      task.end = new Date(task.end);
      task.end.setDate(now.getDate());
    }

  }
  if (localStorage.getItem('wakeUpOrNowClickedOnce') == 'true') {
    wakeUpOrNowClickedOnce = true;
  } else {
    wakeUpOrNowClickedOnce = false;
  }

  if (localStorage.getItem('zoom')) {
    zoom = localStorage.zoom;
  }

  if (localStorage.getItem('defaultTaskDuration')) {
    defaultTaskDuration = localStorage.defaultTaskDuration;
  }

  if (localStorage.getItem('wakeUpStress')) {
    wakeUpStress = localStorage.wakeUpStress;
  }

  if (localStorage.getItem('tDouble')) {
    tDouble = localStorage.tDouble;
  }

  if (!localStorage.getItem('idOfLastTouched')) { // If NOT present...
    localStorage.idOfLastTouched = 0;
  }

  if (localStorage.getItem('monthTaskList')) {
    monthTaskList = JSON.parse(localStorage.getItem('monthTaskList'));
  }

  if (localStorage.getItem('trackTaskList')) {
    trackTaskList = JSON.parse(localStorage.getItem('trackTaskList'));
  }

  if (localStorage.getItem('pastDayList')) {
    pastDayList = JSON.parse(localStorage.getItem('pastDayList'));
    // Fix dates messed up by JSON.stringify
    for (const key in pastDayList) {
      for (const index in pastDayList[key]) {
        pastDayList[key][index].date = new Date(pastDayList[key][index].date);
        pastDayList[key][index].end = new Date(pastDayList[key][index].end);
      }
    }
  }

  if (localStorage.getItem('storageList')) {
    storageList = JSON.parse(localStorage.getItem('storageList'));
    // Fix dates messed up by JSON.stringify
    for (const key in storageList) {
      for (const index in storageList[key][0]) {
        storageList[key][0][index].date = new Date(storageList[key][0][index].date);
        storageList[key][0][index].end = new Date(storageList[key][0][index].end);
      }
    }
  }
}

function getDueRemindersFromLast3Months() {  // If the day in the list lies in the past kick tasks to chooseBox
  let now = new Date();
  now = new Date(now.setDate(now.getDate() + 1)); // To include today in the next for-loop
  let nowMinus3Month = new Date();
  nowMinus3Month = new Date(nowMinus3Month.setMonth(nowMinus3Month.getMonth() - 3));

  for (let i = nowMinus3Month; i < now; i.setDate(i.getDate() + 1)) {
    let myId = i.getDate().toString() + '-' + i.getMonth().toString()  + '-' + i.getFullYear().toString();

    if (monthTaskList[myId]) {
      thisDay = monthTaskList[myId];
      if (tasksSentBetween) {
        Object.assign(tasksSentBetween, thisDay); // Joins two objects by modifying the first with the added values https://attacomsian.com/blog/javascript-merge-objects
      } else {
        tasksSentBetween = thisDay;
      }

      delete monthTaskList[myId];
    }
  }

  if (0<tasksSentBetween.length) {
    fillChooseBox('day');
  }
}


function fillChooseBox(whichView) {  // whichView can be 'month' or 'day'
  let chooseBox = document.getElementById(whichView + 'ChooseBox');
  chooseBox.classList.add('active');
  let tasks = [];

  if (whichView != 'day') { // whichView is 'month'
    document.getElementById('putBack').classList.add('active');
    document.getElementById('moveToDay').classList.add('active');

    if (0 < tasksSentBetween.length) {
      tasks = tasksSentBetween;
    } else if (0 < tasksFromClickedDayInMonth.length) {
      tasks = tasksFromClickedDayInMonth ;
    } else {
      console.log('Nothing to show in ChooseBox');
    }

  } else {  // whichView is 'day'
    document.getElementById('postpone').classList.add('active'); // TODO: Is the class 'active' used? Nope. Should it be?

    tasks = tasksSentBetween;

    if (tasks.length === 0) {
      document.getElementById('sortTask').setAttribute('class', 'noTasksToSort');
    } else {
      document.getElementById('sortTask').setAttribute('class', 'tasksToSort');
    }

  }

  if (tasks.length > 0) {
    let counter = 0;
    for (var task of tasks) {
      if (counter === 0) {
        document.getElementById(whichView + 'InputBox').value = task.text;
      } else {
        newButton = document.createElement('button'); // TODO: The buttons appear in Day view, but the CSS fucks up. The grid-area is not set correctly
        newButton.classList.add('floatingTask');
        newButton.textContent = task.text;
        newButton.setAttribute('id', 'task' + counter);

        document.getElementById(whichView + 'ChooseBox').appendChild(newButton);
      }

      counter += 1;
    }
  }

  tasksSentBetween = [];
  // tasksFromClickedDayInMonth = [];  // If this is emptied here putBack will have nothing to put back. It should be emptied elsewhere. Or after a test here
  // TODO: Postpone can leave tasks with an end that doesn't match duration and start time

}


function postponeTask() {
  let contentInputBox = document.getElementById('dayInputBox').value.trim();
  let parsedList = parseText(contentInputBox);
  let task = new Task(parsedList[0], parsedList[1], parsedList[2], parsedList[3]);
  tasksSentBetween.push(task);

  if (!document.getElementById('dayChooseBox').classList.contains('active')) {
    document.getElementById('sortTask').setAttribute('class', 'noTasksToSort');
  }
  anneal();
  renderTasks();
  resetInputBox('day');
}

function moveToDay() {
  let contentInputBox = document.getElementById('monthInputBox').value.trim();
  let parsedList = parseText(contentInputBox);
  let task = new Task(parsedList[0], parsedList[1], parsedList[2], parsedList[3]);
  tasksSentBetween.push(task);
  resetInputBox('month');
}

// Clear input box and give it focus
function resetInputBox(whichView) { // whichView can be 'day' or 'month'
  document.getElementById(whichView + 'InputBox').value = '';
  document.getElementById(whichView + 'InputBox').focus();
  handleChoosebox(whichView);
}


function handleChoosebox(whichView) {  // TODO: If task is edited and inserted while choosebox is active it forget all about chooseBox
  let chooseBox = document.getElementById(whichView + 'ChooseBox');

  if (chooseBox.classList.contains('active')) {
    if (chooseBox.hasChildNodes()) {
      document.getElementById(whichView + 'InputBox').value = chooseBox.firstChild.innerText;
      chooseBox.firstChild.remove();
    } else {
      chooseBox.classList.remove('active');

      document.getElementById('putBack').classList.remove('active');
      document.getElementById('moveToDay').classList.remove('active');
    }
  }
}


// Clear input box and let it loose focus
function looseInputBoxFocus(whichView) {
  document.getElementById(whichView + 'InputBox').value = '';
  document.getElementById(whichView + 'InputBox').blur();
}

// Fill the half hour time slots of the timebar
function fillTimeBar(zoom) {
  for (let i = 0; i < 24; i += 1) {
    let halfHourA = document.createElement('div');  // This IS the most readable and efficient way to make the required text
    let halfHourB = document.createElement('div');

    if (i < 10) {
      halfHourA.textContent = '0' + i + ':00';
      halfHourB.textContent = '0' + i + ':30';
    } else {
      halfHourA.textContent = i + ':00';
      halfHourB.textContent = i + ':30';
    }

    halfHourA.setAttribute('class', 'halfHours' + zoom * 2);
    halfHourA.setAttribute('id', i + '00');
    // halfHourA.classList.add(i + '00');
    halfHourB.setAttribute('class', 'halfHours' + zoom * 2);
    halfHourB.setAttribute('id', i + '30');
    // halfHourB.classList.add(i + '30');
    document.getElementById('timeDiv').appendChild(halfHourA);
    document.getElementById('timeDiv').appendChild(halfHourB);
  }
}


// Update time marker
let timer = setInterval(updateTimeMarker, 1000);

function updateTimeMarker() {
  let now = new Date();
  let hours = now.getHours();
  let min = now.getMinutes();
  let sec = now.getSeconds();
  // The height of the nowSpan is set to the percentage the passed time represents of the number of minutes in a day
  let nowHeight = zoom * ((hours * 60 + min) * 100 ) / (24*60) + '%';
  if (document.getElementById('nowSpan')) {
    nowSpanElement = document.getElementById('nowSpan');
    nowSpanElement.style.height = nowHeight;
  }

  // if (taskList.length === 2) {
  //   document.getElementById("info").style.animationPlayState = "running";
  // } else {
  //   document.getElementById("info").style.animationPlayState = "paused";
  //   // TODO: Fix hanging border if animation is paused mid cycle
  // }

  updateHearts();

  // Update alarm Toc sound
  let taskAlarms = localStorage.radioButtonResultAlarm;
  if (taskAlarms != 'off') {
    let nowTime = hours.toString() + min.toString() + sec.toString();
    let nowMinusFiveTime = hours.toString() + (min - 5).toString() + sec.toString();
    if (taskAlarms === 'beginning' || taskAlarms === 'both') {
      if (startAndEndTimes.includes('beginning' + nowTime)) {
        sayToc();
      }
    }
    if (taskAlarms === 'end' || taskAlarms === 'both') {
      if (startAndEndTimes.includes('end' + nowMinusFiveTime)) {
        sayTic();
        setTimeout(sayToc, 300);
      }
    }
  }

  // Update reminder Tic sound
  let reminder = localStorage.radioButtonResultReminder;
  if (reminder != 'off') {
    if (reminder === 'regularly') {
      if (min % localStorage.ticInterval === 0 && sec === 0) {
        sayTic();
      }
    }
    if (reminder === 'rand') {
      let randTime = Math.floor(Math.random() * (localStorage.ticInterval - 1) + 1);
      if (min % randTime === 0 && sec === 0) {
        sayTic();
      }
    }
  }
}

function updateHearts() {
  let now = new Date;
  let currentTask = taskList[0];

  // Find the current task and remove old hearts from the display
  for (const [index,  task] of displayList.entries()) {
    if (task.date < now && now < task.end) {
      // Remove old hearts from heart span
      const heartNode = document.getElementById('heart');
      while (heartNode.firstChild) {
        heartNode.removeChild(heartNode.lastChild);
      }

      currentTask = task;
      break;
    }
  }

  let time = (now - currentTask.date) / 60000;
  let result = currentTask.startStressLevel * Math.pow(2, time/(tDouble/currentTask.drain));

  fillHearths(Math.round(10 - result));
}

function sayToc() {
  let sound = new Audio('429721__fellur__tic-alt.wav');
  sound.play();
}

function sayTic() {
  let sound = new Audio('448081__breviceps__tic-toc-click.wav');
  sound.play();
}

////// Eventlisteners  //////                      // Remember removeEventListener() for anoter time

// document.getElementById('storage').addEventListener('click', function() {goToPage('storage.html');});
document.getElementById('info').addEventListener('click', function() {goToPage('instructions.html');});
document.getElementById('month').addEventListener('click', monthButtonClicked);

// Unfold settings
document.getElementById('settings').addEventListener('click', settings);

document.getElementById('postpone').addEventListener('click', postponeTask);

// Insert a 15 min planning task at start-your-day time according to settings
// document.getElementById('upButton').addEventListener('click', wakeUpButton, {once:true});
document.getElementById('upButton').addEventListener('click', function() {jumpToTime(700, false);});

// Insert a 15 min planning task at the current time
// document.getElementById('nowButton').addEventListener('click', nowButton, {once:true});
document.getElementById('nowButton').addEventListener('click', jumpToNow);

// Makes pressing Enter add task
document.getElementById('dayInputBox').addEventListener('keypress', function () { inputAtEnter(event); });

// Tie event to Clear or Edit button
document.getElementById('clearButton').addEventListener('click', clearTextboxOrDay);

// Tie event to zoom button (⍐ / ⍗). Toggles zoom
document.getElementById('zoom').addEventListener('click', zoomFunc);

// Makes clicking anything inside the taskDiv container run taskHasBeenClicked()
document.getElementById('taskDiv').addEventListener('click', function () { taskHasBeenClicked(event); }, true);

////////// Eventlisteners for Add-view   /////////////////////

document.getElementById('addTaskButton').addEventListener('click', addTaskButtonClicked);

document.getElementById('inputBox_add').addEventListener('keypress',
        function () { if (event.key === 'Enter') { readTaskText(); } });
document.getElementById('inputDurationBox').addEventListener('keypress',
        function () { if (event.key === 'Enter') { readDurationTime(); } });
document.getElementById('inputTimeBox').addEventListener('keypress',
        function () { if (event.key === 'Enter') { readTaskStartTime(); } });

document.addEventListener('touchmove', function() {twoFingerNavigation(event);});

document.getElementById('duration').addEventListener('click', function () { addDuration(event);});

document.getElementById('time').addEventListener('click', function () { time_add(event);});

document.getElementById('clear').addEventListener('click', clearTimeBox);

document.getElementById('now').addEventListener('click', setTimeNow);

document.getElementById('info').addEventListener('click', function() {goToPage('instructions.html#stressModel');});

document.getElementById('cancel').addEventListener('click', returnToDay);

document.getElementById('apply').addEventListener('click', apply);

////////////////// Eventlisteners for Month-view ///////////////////////

document.getElementById('track').addEventListener('click', trackButtonClicked);

document.getElementById('monthInputBox').addEventListener('keypress', function () { monthInputAtEnter(event); });

document.getElementById('monthTaskDiv').addEventListener('click', function () { monthTaskHasBeenClicked(event); }, true);

document.getElementById('day').addEventListener('click', gotoDay);

document.getElementById('monthClearButton').addEventListener('click', monthClearBehavior);

document.getElementById('moveToDay').addEventListener('click', moveToDay);

document.getElementById('putBack').addEventListener('click', putBack);

////////////////// Eventlisteners for Month-view ///////////////////////

document.getElementById('month1').addEventListener('click', returnToMonth);

////////////////// Eventlisteners for track-view ///////////////////////

document.getElementById('colourButtons').addEventListener('click', function () { colourButtonClicked(event);});

document.getElementById('colourPickerInputBox').addEventListener('focus', function () {
  document.getElementById('colourButtons').hidden = false;
});

document.getElementById('taskPickerInputBox').addEventListener('keypress', function () { taskPickerEvent(event); });

document.getElementById('colourPickerInputBox').addEventListener('keypress', function () { colourPickerEvent(event); });

document.getElementById('deleteTrackedButton').addEventListener('click', removeTracking);

////////////////// Eventlisteners for storage-view ///////////////////////

document.getElementById('storage').addEventListener('click', storageButtonClicked);

document.getElementById('day1').addEventListener('click', returnToDay);

document.getElementById('storeList').addEventListener('click', storeList);

document.getElementById('stores').addEventListener('click', function () { storeHasBeenClicked(event); }, true);

//////////////////// Add-view code below ///////////////////////////

function addTaskButtonClicked() {
  storeLocally();

  // TODO: Hmmm. Using .hidden removes transition. Get rid of transition CSS or .hidden?
  // Trigger animation via CSS
  // document.getElementById('addView').classList.add('active');
  // document.getElementById('dayView').classList.remove('active');
  document.getElementById('addView').hidden = false;
  document.getElementById('dayView').hidden = true;

  fillDurationBox(defaultTaskDuration);

  clearTimeBox();

  document.getElementById('d1').checked = 'checked';
  // document.getElementById('apply').textContent = 'Ok (then tap where this task should be)';

  let inputBox = document.getElementById('dayInputBox');         // Day-inputBox
  let inputBox_add = document.getElementById('inputBox_add'); // Add-inputBox

  if (inputBox.value != '') {  // Parse the value and fill relevant boxes
    parsedList = parseText(inputBox.value); // parsedList = [taskStart, duration, text, drain];
    inputBox_add.value = parsedList[2];
    inputBox_add.blur();
    fillDurationBox(parsedList[1] / 60000);
    if (parsedList[0] != '') {  // This will never trigger because fixed times are currently stripped when double clicking a task to edit
      fillTimeBox(parsedList[0]);
    }
    let drain = Number(parsedList[3]);
      document.getElementsByClassName('drain')[5 - drain].checked = true;
      if (0 < drain) {
    } else {
      document.getElementsByClassName('drain')[4 - drain].checked = true;
    }

  } else {
    inputBox_add.value = '';
    inputBox_add.focus();
  }
}

function addDuration(event) {
  let btnId = event.target.id;  // btnId is in the form 'durationPlus30m'

  if (btnId === 'inputDurationBox') {
    // Do fuckall
  } else {

    let deltaTime = 0;

    if (btnId.includes('Minus')) {
      btnId = btnId.replace('durationMinus', '');
      btnId = btnId.replace('m', '');
      deltaTime = -Number(btnId);
    } else {
      btnId = btnId.replace('durationPlus', '');
      btnId = btnId.replace('m', '');
      deltaTime = Number(btnId);
    }

    taskDuration_add = Number(taskDuration_add) + deltaTime;
    if (taskDuration_add < 0) {
      taskDuration_add = 0;
    }
    fillDurationBox(taskDuration_add);
  }
}


function fillDurationBox(duration) {
  let hours = 0;
  let minutes = 0;

  hours = (duration - (duration % 60)) / 60;
  minutes = duration - hours * 60;

  let formattedDuration = hours + 'h' + minutes + 'm';
  taskDuration_add = duration;

  document.getElementById('inputDurationBox').value = formattedDuration;
}


function time_add(event) {
  let btnId = event.target.id;  // btnId is in the form 'timePlus30m'

  if (btnId === 'now') {
    taskTime_add = new Date();
    fillTimeBox(taskTime_add);
  } else if (btnId === 'clear') {
    document.getElementById('inputTimeBox').value = '';
    document.getElementById('apply').textContent = 'Ok (then tap where this task should be)';
  } else if (btnId === 'inputTimeBox') {
    // Do fuckall
  } else {
    let deltaTime = 0;

    if (btnId.includes('Minus')) {
      btnId = btnId.replace('timeMinus', '');
      btnId = btnId.replace('m', '');
      deltaTime = -Number(btnId);
    } else {
      btnId = btnId.replace('timePlus', '');
      btnId = btnId.replace('m', '');
      deltaTime = Number(btnId);
    }

    taskTime_add = new Date(taskTime_add.getTime() + deltaTime * 60000);
    // Ensure that the time is between 00:00 and 23:59
    if (taskTime_add.getDate() < (new Date).getDate()) {
      taskTime_add = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 00, 01);
    } else if ((new Date()).getDate() < taskTime_add.getDate()) {
      taskTime_add = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59);
    }

    fillTimeBox(taskTime_add);
  }

}


function fillTimeBox(time) {  // time in Date-format
  let prettyTaskTime = prettifyTime(time);

  document.getElementById('inputTimeBox').value = prettyTaskTime;

  document.getElementById('apply').textContent = 'Ok'; // Remove instruction from return-button as the task will be added the right place automatically
}


function setTimeNow() {
  taskTime_add = new Date();
  fillTimeBox(taskTime_add);
}


function clearTimeBox() {
  document.getElementById('inputTimeBox').value = '';
  document.getElementById('apply').textContent = 'Ok (then tap where this task should be)';
  taskTime_add = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 12, 00);
}


function prettifyTime(time) {
  let taskTimeHours = time.getHours().toString();
  let taskTimeMinutes = time.getMinutes().toString();

  // Check if leading zeroes are needed and add them
  let nils = ['', ''];
  if (taskTimeHours < 10) {
    nils[0] = '0';
  }
  if (taskTimeMinutes < 10) {
    nils[1] = '0';
  }
  let prettyTaskTime = nils[0] + taskTimeHours + ':' + nils[1] + taskTimeMinutes;

  return prettyTaskTime
}


function readTaskText() {
  let contentInputBox = document.getElementById('inputBox_add').value.trim();
  let badCharacters = /[^a-zA-ZæøåÆØÅ\s\.\,\?\!\(\)\"]+/.exec(contentInputBox);
  if (badCharacters) {
    displayMessage('Please don\'t use ' + badCharacters + ' for task description.', 3000, 'add');
  } else {
    taskText_add = contentInputBox;
  }
}


function readDurationTime() {
  let contentInputBox = document.getElementById('inputDurationBox').value.trim();
  let badCharacters = /[^0-9hm]/.exec(contentInputBox);
  if (badCharacters) {
    displayMessage('Please use the format 1h30m for 1 hour and 30 minutes', 3000, 'add');
  } else {
    let timeH = 0;
    let timeM = /\d{1,4}m?$/.exec(contentInputBox).toString(); // TODO: Check if numbers are too big
    timeM = Number(timeM.replace('m', ''));
    if (/h/.exec(contentInputBox)) {
      timeH = /[0-9]+h/.exec(contentInputBox).toString();
      contentInputBox = contentInputBox.replace(timeH, '');
      timeH = Number(timeH.replace('h', ''));
    }
    taskDuration_add = timeH * 60 + timeM;
  }
}


function readTaskStartTime() {
  let contentInputBox = document.getElementById('inputTimeBox').value.trim();
  let badCharacters = /[^0-9:]/.exec(contentInputBox);
  if (badCharacters) {
    displayMessage('Please use the format 12:00 or 1200', 3000, 'day');
  } else {
    let timeH = /[0-9][0-9]/.exec(contentInputBox);
    contentInputBox = contentInputBox.replace(timeH, '');
    let timeM = /[0-9][0-9]/.exec(contentInputBox);
    let now = new Date();
    taskTime_add = new Date(now.getFullYear(), now.getMonth(), now.getDate(), timeH, timeM);
    if (0 < timeH || 0 < timeM) {
      fillTimeBox(taskTime_add);
      return taskTime_add
    }
  }
}


function readDrainGainRadioButtons() {
  let radioButtonResult = document.getElementsByClassName('drain');
  for (var i = 0; i < 10; i++) {
    if (radioButtonResult[i].type === 'radio' && radioButtonResult[i].checked) {
      drainGainLevel_add = radioButtonResult[i].value;
    }
  }
}


function formatTask() {
  let returnText = '';
  if (document.getElementById('inputTimeBox').value.trim() === '') {
    returnText =  taskText_add + ' '
                + taskDuration_add + 'm '
                + drainGainLevel_add;
  } else {
    let prettyTaskTime = prettifyTime(taskTime_add);
    returnText =  taskText_add + ' '
                + prettyTaskTime.replace(':', '') + ' '
                + taskDuration_add + 'm '
                + drainGainLevel_add;
  }
  return returnText;
}


function apply() {
  let taskText = document.getElementById('inputBox_add');
  if (taskText === '') {
    displayMessage('Please write a task text', 3000, 'day');
  } else {
    readTaskText()
    readDurationTime();
    let startTime = readTaskStartTime();
    readDrainGainRadioButtons();
    returnText = formatTask();
    if (startTime) {
      inputFixedTask(returnText);
    } else {
      document.getElementById('dayInputBox').value = returnText;
    }

    // Close add-view
    document.getElementById('addView').hidden = true;
    document.getElementById('dayView').hidden = false;
  }
}

function returnToDay() {
  document.getElementById('addView').hidden = true;
  document.getElementById('dayView').hidden = false;
}

//////////////////// Add-view button code above ///////////////////////////


//////////////////// Month-view code below ///////////////////////////

function monthButtonClicked() {
  storeLocally();

  // Trigger animation via CSS
  // document.getElementById('monthView').classList.add('active');
  // document.getElementById('dayView').classList.remove('active');
  document.getElementById('monthView').hidden = false;
  document.getElementById('dayView').hidden = true;

  fillMonthDateBar();

  monthRenderTasks();

  if (0 < tasksSentBetween.length) {
    fillChooseBox('month');
  }

  // resetInputBox('day');
  document.getElementById('monthInputBox').focus();
}


function gotoDay() {
  // Trigger animation via CSS
  // document.getElementById('monthView').classList.remove('active');
  // document.getElementById('dayView').classList.add('active');
  document.getElementById('monthView').hidden = true;
  document.getElementById('dayView').hidden = false;

  fillChooseBox('day');
}


function fillMonthDateBar() {
  let now = new Date();
  let nowMinus3Month = new Date();
  nowMinus3Month = new Date(nowMinus3Month.setMonth(nowMinus3Month.getMonth() - 1));
  let nowPlus3Month = new Date();
  nowPlus3Month = new Date(nowPlus3Month.setMonth(nowPlus3Month.getMonth() + 3));

  let thisMonth = now.getMonth();

  for (let i = nowMinus3Month; i < nowPlus3Month; i.setDate(i.getDate() + 1)) {
    // Insert monthnames before each the 1th
    if (thisMonth < i.getMonth() || (thisMonth === 11 && i.getMonth() === 0)) {  // Month 0 is january
      thisMonth = i.getMonth();
      monthNameNode = document.createElement('button');
      monthNameNode.classList.add('monthName');
      monthNameNode.textContent = months[i.getMonth()];
      document.getElementById('monthTaskDiv').appendChild(monthNameNode);
    }

    let newNode = document.createElement('button');

    let id = i.getDate().toString() + '-' + i.getMonth().toString()  + '-' + i.getFullYear().toString();

    newNode.setAttribute('id', id);
    newNode.setAttribute('class', 'isNotClicked');

    newNode.classList.add('dateButton'); // Add to all dateButtons

    if (i < now) {  // For styling purposes. // TODO: Make styling
      newNode.classList.add('pastDateButton');
    } else if (i.getMonth() == now.getMonth() && i.getDate() == now.getDate()) {
      newNode.classList.add('todayButton');
    }


    let dayNumber = i.getDay();
    if (dayNumber === 0 || dayNumber === 6) { // Weekday 6 and 0 are Saturday and Sunday
      newNode.classList.add('weekend');
    }

    datePart = document.createElement('span');
    datePart.classList.add('datePart');
    if (i.getDate() < 10) {
      datePart.textContent = '\u00a0\u00a0'; // Adjust all dates to align right
    }
    datePart.textContent += i.getDate() + '/' + (i.getMonth() + 1) +  '\u00a0\u00a0\u00a0';
    newNode.appendChild(datePart);

    toolTipSpan = document.createElement('span');
    toolTipSpan.classList.add('toolTip');
    newNode.appendChild(toolTipSpan);

    textPart = document.createElement('span');
    newNode.appendChild(textPart);

    document.getElementById('monthTaskDiv').appendChild(newNode);
  }
}


function monthTaskHasBeenClicked(event) {
  let myId = event.target.id;
  if (myId === '') {
    myId = event.target.closest('button').id;
  }

  let day =  document.getElementById(myId);

  if (day.classList.contains('pastDateButton')) {
    displayMessage('Past dates can not be assigned tasks until a time machine has been invented', 3000, 'month');
    return
  } else if (day.classList.contains('todayButton')) {
    displayMessage("Use Day-view for today's tasks", 3000, 'month');
    return
  }

  let contentInputBox = document.getElementById('monthInputBox').value.trim();

  if (contentInputBox != '' && day.classList.contains('isNotClicked')) {
    // Text in inputBox and no previous clicked date
    if (contentInputBox != '') {
      let now = new Date();
      let clickedDate = new Date(now.getFullYear(), /\d+$/.exec(myId), /\d+/.exec(myId) , 12, 00)

      let task = new Task(clickedDate, 15 * 60000, contentInputBox[0].toUpperCase() + contentInputBox.slice(1), 1);

      if (monthTaskList[myId]) {
        monthTaskList[myId].push(task);
      } else {
        monthTaskList[myId] = [task];
      }

      if (document.getElementById('monthChooseBox').classList.contains('active')) {
        if (tasksFromClickedDayInMonth) {
          tasksFromClickedDayInMonth.shift();  // Removes task from list of tasks being handled in chooseBox in order to make putBack() function as expected
        } // tasksSentBetween does not need this shift. I think. As it behaves as expected for now.
      }

      resetInputBox('month');

      // handleChoosebox('month'); // Now in resetInputBox
    }

    monthRenderTasks();

  } else if (contentInputBox != '' && day.classList.contains('isClicked')) {
    // Text in inputBox and a clicked date. Should not happen.
    console.log('Text in inputBox and a clicked date. Should not happen.');
    day.setAttribute('class', 'isNotClicked');

    // No text in inputBox and a clicked date. Effectively a doubleclick
  } else if (contentInputBox === '' && day.classList.contains('isClicked')) {
    if (document.getElementById('monthChooseBox').classList.contains('active')) {
      displayMessage('Please finish the current edit \nbefore starting a new', 3000, 'month');
    } else {
      putBackId = myId;

      let dayChildren = day.children;

      if (monthTaskList[myId]) {
        tasksFromClickedDayInMonth = monthTaskList[myId];
        delete monthTaskList[myId];
        dayChildren[2].textContent = '';
        dayChildren[1].innerHTML = '';

        fillChooseBox('month');
      }
    }
    day.classList.add('isNotClicked');
    day.classList.remove('isClicked');

  } else {
    // No text in inputBox and no clicked date
    day.classList.remove('isNotClicked');
    day.classList.add('isClicked');
  }
}


function monthInputAtEnter(event) {
  if (event.key === 'Enter') {
    let contentInputBox = document.getElementById('monthInputBox').value.trim();
    if (contentInputBox != '') {

      // Check if date is provided in the form 7/11
      let dateArray = /\d+\/\d+/.exec(contentInputBox);

      if ( dateArray != null ) {
        // Is it a legit date?
        if ( (/\d+\//.exec(dateArray[0])[0].replace('\/', '') <= 31 &&
          /\/\d+/.exec(dateArray[0])[0].replace('\/', '') <= 12)) {

            // Make myId from date
            let month = (/\d+\//.exec(dateArray[0])[0].replace('\/', '')).toString();
            let day = (Number(/\/\d+/.exec(dateArray[0])[0].replace('\/', '')) - 1).toString();
            let now = new Date();
            let myId = day + month + now.getFullYear();

            let textInputBox = contentInputBox.replace(dateArray[0], '').trim();

            if (textInputBox === '') {
              gotoDate(myId); // TODO: Make gotoDate() (yank it from month.js?) and sanitize input
            } else {
              // Insert a new task at the provided date
              let now = new Date();
              let taskStart = new Date(now.getFullYear(), month, day, 12, 0);
              let task = new Task(taskStart, 15 * 60000, textInputBox[0].toUpperCase() + textInputBox.slice(1), 1);

              if (monthTaskList[myId]) {
                monthTaskList[myId].push(task);
              } else {
                monthTaskList[myId] = [task];
              }
            }

        } else {
          displayMessage('Not a date. Please fix date or remove the back-slash', 4000, 'month');
          return;
        }

      // If no date is included make a new task tomorrow
      } else {
        let now = new Date();
        let nowPlusOneDay = new Date();
        nowPlusOneDay = new Date(nowPlusOneDay.setDate(nowPlusOneDay.getDate() + 1));

        let myId = nowPlusOneDay.getDate().toString() + '-' + nowPlusOneDay.getMonth().toString() + '-' + nowPlusOneDay.getFullYear();

        let task = new Task(nowPlusOneDay, 15 * 60000, contentInputBox[0].toUpperCase() + contentInputBox.slice(1), 1);

        if (monthTaskList[myId]) {
          monthTaskList[myId].push(task);
        } else {
          monthTaskList[myId] = [task];
        }
      }

      monthRenderTasks();

      resetInputBox('month');

    }
  }
}


function monthRenderTasks() {

  storeLocally();

  // Remove old text from buttons and tooltips
  const days = document.getElementById('monthTaskDiv').children;
  const len = days.length;
  for (var i = 0; i < len; i++) {
    if (days[i].children.length > 0) {
      days[i].children[2].textContent = '';
      days[i].children[1].innerHTML = '';
    }
  }

  // Fill in and colour days in the past according to taskList for each day
  for (var myId in pastDayList) {
    let tasks = createDisplayList(pastDayList[myId]);

    let gradient = '';
    let taskColour = 'white';

    // Make gradient for the day currently being processed
    for (var n in tasks) {
      // Find the percent needed to be coloured (from startPercent to endPercent)
      startPercent = parseInt((tasks[n].date.getHours() * 60 + tasks[n].date.getMinutes()) / (24 * 60) * 100);
      endPercent = parseInt(startPercent + (tasks[n].duration / 60000) / (24 * 60) * 100);

      if (n == 0) {  // Avoid dayStart, but add white at start of the day
        gradient += 'white ' + parseInt((tasks[1].date.getHours() * 60
        + tasks[1].date.getMinutes()) / (24 * 60) * 100) + '%';
        continue;
      }


      // Find colour value if text is in trackTaskList
      let string = tasks[n].text.toLowerCase();
      string = string.replace(/ /g, '_');

      for (var trackedTaskText in trackTaskList) {
        taskColour = '#DED';  // Default task colour if not watched
        if (string == '') {
          taskColour = 'white'; // nullTime is made white
          break;
        } else if (string == trackedTaskText) {
          if (Number(trackTaskList[trackedTaskText][1]) === 1) {
            taskColour = trackTaskList[trackedTaskText][0];
          }
          break;
        }
      }

      gradient += ', ' + taskColour + ' ' + startPercent
      + '%, ' + taskColour + ' ' + Number(endPercent - 0.3)  + '%, '
      + 'black ' + Number(endPercent - 0.3) + '%, black ' + endPercent + '%';

      taskColour = 'white';
    }

    // Find button, set gradient and write to tooltip
    let button = document.getElementById(myId);
    if (button != null) {
      let buttonText = document.getElementById(myId).lastChild;
      button.setAttribute('style', 'background-image: linear-gradient(to right, ' + gradient + ')');
      // Set tool-tip to show the tasks of the day
      let children = button.childNodes;
      let rawTasks = pastDayList[myId];
      if (rawTasks != '') {
        for (var task of rawTasks) {
          if (task.text == 'Day start' || task.text == 'Day end') {
            continue;
          }

          children[1].innerHTML += ' \u25CF ' + task.text + '&nbsp;' + '<br>'; // Write to tooltip
        }
      }
    }
  }

  // Write new text into buttons and tooltips
  for (var myId in monthTaskList) {
    let button = document.getElementById(myId);

    if (button != null) {
      let children = button.childNodes;  // datePart, toolTip and text

      let tasks = monthTaskList[myId];

      if (tasks != '') {
        for (var task of tasks) {
          children[1].innerHTML += ' \u25CF ' + task.text + '&nbsp;' + '<br>'; // Write to tooltip
          children[2].textContent +=  ' \u25CF ' + task.text + '\u00a0'; // Write task to date
        }
      }
    }
  }
}


function putBack() { // TODO: Fix putBack.
  monthTaskList[putBackId] = tasksFromClickedDayInMonth;

  let chooseBox = document.getElementById('monthChooseBox');

  while (chooseBox.firstChild) {
    chooseBox.removeChild(chooseBox.lastChild);
  }

  chooseBox.classList.remove('active');
  document.getElementById('putBack').classList.remove('active');

  monthRenderTasks();

  resetInputBox('month');
}


function monthClearBehavior() {
  if (document.getElementById('monthInputBox').value === '') {
    alert('To clear all information in this calendar, clear your browser data (Site data).\n\n' +
    'Go to your browsers Settings or Options and look for Delete cookies and site data.\n\n' +
    'This option may be under Privacy or Security.');
  } else {
    resetInputBox('month');
  }
}


// Remenber nested functions to limit scope and new debugging tools

//////////////////// Month-view code above ///////////////////////////

//////////////////// Track-view code below ///////////////////////////

function trackButtonClicked() {
  storeLocally();

  document.getElementById('trackView').hidden = false;
  document.getElementById('monthView').hidden = true;

  renderTracking();
}


function renderTracking() {

  storeLocally();

  // Remove old content
  const trackedItemsDiv = document.getElementById('trackedItemsDiv');
  removeContentFrom(trackedItemsDiv);

  const colourButtons = document.getElementById('colourButtons');
  removeContentFrom(colourButtons);

  // Add new content
  // ... to list of tracked tasks
  for (const item in trackTaskList) {
    showTrackedTask(item);
  }
  // ... and to colourButtons (still hidden)
  for (const colour in colours) {
    addColour(colour);
  }
}


function removeContentFrom(div) {  // Used by renderTracking
  while (div.firstChild) {
    div.removeChild(div.lastChild);
  }
}


function addColour(colour) {  // Used by renderTracking
  let colourButtons = document.getElementById('colourButtons');
  let colourButton = document.createElement('button');

  colourButton.style.backgroundColor = colours[colour];
  colourButton.style.fontSize = '0.6em';
  colourButton.textContent = colours[colour];
  colourButton.id = colours[colour];
  colourButton.classList.add('colourButton');

  document.getElementById('colourButtons');
  colourButtons.appendChild(colourButton);
}


function taskPickerEvent(event) {
  if (event.key === 'Enter') {
    addTrackedTask(null);
  }
}


function colourPickerEvent(event) {
  if (event.key === 'Enter') {
    addTrackedTask(null);
  }

}


function colourButtonClicked(event) {
  let chosenColour = event.target.id;
  addTrackedTask(chosenColour);
}

// TODO: Make clear data in Settings work with nowButton and upButton

function addTrackedTask(buttonColour) {
  // TODO: Sanitize inputs
  let taskPickerInputBox = document.getElementById('taskPickerInputBox');
  let text = taskPickerInputBox.value.trim();
  if (/^[^'!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']+$/.exec(text)) {
    taskPickerInputBox.value = '';

    let colourPickerInputBox = document.getElementById('colourPickerInputBox');

    if (colourPickerInputBox.value.trim() != '') {  // If there is text in the coulorPicker input box...
      chosenColour = colourPickerInputBox.value.trim();
    } else if (buttonColour === null) { // If no button has been clicked and no text: assign random colour not already used...
      let tryAgain = false;
      do {
        tryAgain = false;
        chosenColour = colours[Math.floor(Math.random()*40)];
        for (var key in trackTaskList) {
          if (trackTaskList[key][0] === chosenColour) {
            tryAgain = true;
            break;
          }
        }
      }
      while (tryAgain)

    } else { // If a colourButton has been clicked...
      chosenColour = buttonColour;
    }

    colourPickerInputBox.value = '';

    // document.getElementById('chosenColour').style.backgroundColor = chosenColour;
    document.getElementById('colourButtons').hidden = true;

    text = text.replace(/ /g, '_');  // The DOM can't handle spaces
    trackTaskList[text] = [chosenColour, '1'];
    renderTracking();
  } else if (text != '') {
    alert('Limit your charcters to letters and numbers, please.');
    return;
  } else {
    displayMessage('Please add a task', 3000, 'track');
  }
}

function removeTracking() {
  let answer = confirm('Do you want to remove all UNcheked tasks from this list?\n (The same tasks elsewhere is not affected)');
  if (answer) {
    for (const key in trackTaskList) {
      if (trackTaskList[key][1] === '0.25') {
        delete trackTaskList[key];
      }
    }
    renderTracking();
  } else {
    displayMessage('Nothing was changed', 3000, 'track');
  }
}


function trackCheckboxClicked(event) {
  let trackedTask = event.target.id;
  let element = document.getElementsByClassName(trackedTask);
  // TODO: Add functionality aside greying out line

  // Set opacity according to checked status
  if (event.target.checked) {
    trackTaskList[trackedTask][1] = "1";
    element[0].style.opacity = 1;
    element[1].style.opacity = 1;
  } else {
    trackTaskList[trackedTask][1] = "0.25";
    element[0].style.opacity = 0.25;
    element[1].style.opacity = 0.25;
  }
}


function showTrackedTask(item) {  // Opacity is 1 for tracked items and 0.25 for suspended items
  let trackedItem = document.createElement('span');

  // Create checkbox
  let trackedItemCheckBox = document.createElement('input');
  trackedItemCheckBox.type = 'checkbox';
  trackedItemCheckBox.name = item;
  trackedItemCheckBox.id = item;

  if (Number(trackTaskList[item][1]) === 1) {  // trackTaskList opacity determine if line is shown or greyed out
    trackedItemCheckBox.checked = true;
  } else {
    trackedItemCheckBox.checked = false;
  }
  // trackedItemCheckBox.style.gridArea = '1 / 0';

  trackedItem.appendChild(trackedItemCheckBox);

  // Create spacer
  trackedItemSpacer = document.createElement('span');
  trackedItemSpacer.textContent = '\u00a0\u00a0';

  trackedItem.appendChild(trackedItemSpacer);

  // Create colour
  trackedItemColour = document.createElement('span');
  trackedItemColour.classList.add(item);
  trackedItemColour.style.backgroundColor = trackTaskList[item][0];
  trackedItemColour.textContent = '\u00a0\u00a0\u00a0\u00a0';
  trackedItemColour.style.opacity = trackTaskList[item][1];
  // trackedItemColour.style.gridArea = '1 / 0';

  trackedItem.appendChild(trackedItemColour);

  // Create text
  trackedItemButton = document.createElement('span');
  trackedItemButton.classList.add(item);
  let text = item.replace(/_/g, ' ');
  trackedItemButton.textContent = '\u00a0\u00a0\u00a0' + text.charAt(0).toUpperCase() + text.slice(1);
  trackedItemButton.style.opacity = trackTaskList[item][1];
  // trackedItemButton.style.gridArea = '1 / 0';

  trackedItem.appendChild(trackedItemButton);

  // TODO: Make colours match up with text - by moving Create Colour up to the top?
  document.getElementById('trackedItemsDiv').appendChild(trackedItem);
  // document.getElementById('trackedItemsColourDiv').appendChild(trackedItemColour);

  document.getElementById(item).addEventListener('click', function () { trackCheckboxClicked(event); });
}


function returnToMonth() {
  document.getElementById('trackView').hidden = true;
  document.getElementById('monthView').hidden = false;
  monthRenderTasks();
}


//////////////////// Track-view code above ^^^ ///////////////////////////

//////////////////// Storage-view code below ///////////////////////////


function storageButtonClicked() {
  storeLocally();

  storageList['memory1'] = [taskList, 'nytNavn'];

  document.getElementById('dayView').hidden = true;
  document.getElementById('storageView').hidden = false;

  for (var memoryCell in storageList) {
    let node = document.getElementById(memoryCell);
    node.classList.remove('notInUse');
    node.textContent = storageList[memoryCell][1];
  }
}

// function returnToDay() is under Add-view code

function storeList() {
  let storeButtons = document.getElementsByClassName('store');
  for (const button of storeButtons) {
    if (/\d/.exec(button.id)) { // Only buttons with a number in their id gets highlighted
      button.classList.add('highLighted');
    }
  }
}


function storeHasBeenClicked(event) {
  let id = event.target.id;
  let text = '';
  let clickedButton = document.getElementById(id);
// TODO: Fix notInUse for the trashBin and make functionality for other buttons work. Currently they are a copy-paste from old storage.js
  if (id === 'trashBin') {
    // Restore stuff from trashBin
    if (storageList['trashBin']) {
      let trash = storageList['trashBin'][0];  // Retrieve content of trashBin
      storageList['trashBin'] = [taskList, 'Restore last discarded task list'];   // Put current taskList into the trashBin
      taskList = trash;  // Restore trash as taskList
      gotoDayFromStorage();
    } else {
      displayMessage('No task has been discarded yet.\nNothing was changed.', 3000, 'storage');
    }
  }

  // Ask for new label and tidy button up
  if (clickedButton.classList.contains('highLighted')) {
    if (clickedButton.classList.contains('notInUse')) {
      clickedButton.classList.remove('notInUse');
      clickedButton.classList.add('inUse');
    }

    text = prompt('Change label of the stored list?', clickedButton.innerText);

    if (text === '' || text === null) {
      storageList[id] = [taskList, clickedButton.innerText];
    }
    else if (/^[^'!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']+$/.exec(text)) { // Sanitize input: only alpha numericals
      text = text.slice(0, 1).toUpperCase() + text.slice(1, );
      clickedButton.innerText = text;
      storageList[id] = [taskList, text];
    } else if (text != '') {
      alert('Limit your charcters to letters and numbers, please.');
      return;
    }
    // Store stuff
    if (taskList.length === 2) {  // If taskList is empty except for dayStart and dayEnd...
      clickedButton.classList.remove('inUse');
      clickedButton.classList.add('notInUse');
      clickedButton.innerText = weekDays[/\d+/.exec(clickedButton.id) - 1]
      delete storageList[clickedButton.id];
      displayMessage('Stored list is cleared', 3000, 'storage')
    } else {
      displayMessage('Current task list stored in ' + clickedButton.innerText, 3000, 'storage');
    }
    setTimeout(function() {gotoDayFromStorage();}, 3500);

  // Get stuff
  } else if (clickedButton.classList.contains('inUse')) {
    storageList['trashBin'] = taskList; // Move current tasklist to trash bin
    taskList = storageList[clickedButton.innerText][0]; // Let current tasklist be chosen stored tasklist
  } else {
    displayMessage('This store is empty', 3000, 'storage');
  }

  // Remove highlights
  let storeButtons = document.getElementsByClassName('store');
  for (const button of storeButtons) {
    if (/\d/.exec(button.id)) { // Only buttons with a number in their id gets highlighted
      button.classList.remove('highLighted');
    }
  }

}

function gotoDayFromStorage() {
  storeLocally();
  document.getElementById('storageView').hidden = true;
  document.getElementById('dayView').hidden = false;
  renderTasks();
}

//////////////////// Storage-view code above ^^^ ///////////////////////////


function twoFingerNavigation(event) {
  if (sessionStorage.touchX && event.touches.length === 1) {
    sessionStorage.touchX = '';
  }
  if (event.touches.length > 1) {
    if (!sessionStorage.touchX) {
      sessionStorage.touchX = event.touches[0].screenX; // SESSIONstorage, not localStorage. Doh.
    } else if (event.touches[0].screenX - sessionStorage.touchX < 50) { // Left swipe
      goToPage('storage.html');
    } else if (event.touches[0].screenX - sessionStorage.touchX > 50) { // Right swipe
      goToPage('month.html'); // TODO: Fix twofingerNavigation
    }
  }
}

function  fillHearths(currentStressLevel) {
  const heartSpan = document.getElementById('heart');

  let max = currentStressLevel;
  if (max < 0) {
    max = 0;
  }
  if (10 < max) {
    max = 10;
  }

  for (var i = 0; i < max; i++) {
    let newHeart = document.createElement('img');
    newHeart.src="200px-A_SVG_semicircle_heart.svg.png";
    newHeart.style.width = '14px';
    newHeart.style.height = '14px';
    newHeart.style.alt="heart symbol";

    heartSpan.appendChild(newHeart);
  }

  for (var i = 0; i < 10 - max; i++) {
    let newHalfHeart = document.createElement('img');
    newHalfHeart.src="200px-A_SVG_semicircle_heart_empty.svg.png";
    newHalfHeart.style.width = '14px';
    newHalfHeart.style.height = '14px';
    newHalfHeart.style.alt="empty heart symbol";

    heartSpan.appendChild(newHalfHeart);
  }
}

function goToPage(page) {
  storeLocally();

  window.location.assign(page);
}

// function info() {
//   goToPage('instructions.html')
// }
// TODO: Make addPause buttons 15m, 30m + ?
// TODO: Move alert-box instructions to html pages.

// Used by an eventListener. Display settings.
function settings() {
  goToPage('settings.html')
  // Store a day from one session to another
  // Store multiple days? One pr. calender day?
  // Store wake up time (wakeUpH and wakeUpM)
  // Ligth/Dark theme?
  // Store variables descriping stress sensitivity (tHalf stressStart, ...)
}

// Used by an eventListener. Inserts a 15 min planning task at the start of your day
function wakeUpButton() {
  let succes = false;
  let now = new Date();
  let taskStartMinusDst = new Date(now.getFullYear(), now.getMonth(), now.getDate(), wakeUpH, wakeUpM);
  let taskStart = new Date(taskStartMinusDst.getTime() + 0 * dstOffset); // TODO: Remove dstOffset?
  let task = new Task(taskStart, 15 * 60000, 'Planning', 1);
  succes = addFixedTask(task);
  if (!succes) {
    console.log('wakeUpButton failed to insert a task');
  }
  document.getElementById('nowButton').removeEventListener('click', nowButton, {once:true});
  wakeUpOrNowClickedOnce = true;
  adjustNowAndWakeUpButtons();
}


// Used by an eventListener. Inserts a 15 min planning task at the current time
function nowButton() {
  let task = new Task(new Date(), 15 * 60000, 'Planning', 1);
  addFixedTask(task);
  document.getElementById('upButton').removeEventListener('click', wakeUpButton, {once:true});
  wakeUpOrNowClickedOnce = true;
  adjustNowAndWakeUpButtons();
}


function adjustNowAndWakeUpButtons() {
  let min = '';
  let upBtn = document.getElementById('upButton');
  let nowBtn = document.getElementById('nowButton');

  if (parseInt(wakeUpM) <= 9) { // Adjust minutes to two digits always
    min = '0' + parseInt(wakeUpM);
  } else {
    min = parseInt(wakeUpM);
  }

  if (!wakeUpOrNowClickedOnce) {
    upBtn.title='Press to insert a 15 min planning period at ' + wakeUpH + ':' + min;
    upBtn.textContent = wakeUpH + ':' + min + ' \u25BE';  // Black down-pointing small triangle
    nowBtn.title = 'Press to insert a 15 min planning period now';
    nowBtn.textContent = 'Now' + ' \u25BE';  // Black down-pointing small triangle
    document.getElementById('upButton').addEventListener('click', wakeUpButton, {once:true});
    document.getElementById('nowButton').addEventListener('click', nowButton, {once:true});
    document.getElementById('sortTask').setAttribute('class', 'noTasksToSort');
  } else {
    upBtn.title = 'Jump to ' + wakeUpH + ':' + min;
    upBtn.textContent = '\u25B8' + wakeUpH + ':' + min;  // Black right-pointing small triangle
    nowBtn.title = 'Jump to now';
    nowBtn.textContent = '\u25B8' + 'Now';  // Black right-pointing small triangle
  }
  renderTasks();
  document.getElementById('dayInputBox').focus();
}


// Used by an eventListener. Makes pressing Enter add task
function inputAtEnter(event) {
  if (event.key === 'Enter') {
    let contentInputBox = document.getElementById('dayInputBox').value.trim();
    if (/[a-c, e-g, i-l, n-z]/.exec(contentInputBox) != null && chosenTaskId === '') {
      inputFixedTask(contentInputBox);
    } else {
      if (/[^0-9]/.exec(contentInputBox) != null && chosenTask != '') { // If there is a chosen task AND text it must be an error
        nullifyClick();
      } else if (/\d[0-5][0-9]/.exec(contentInputBox) != null || /[1-2]\d[0-5][0-9]/.exec(contentInputBox) != null) {
        // If there is 3-4 numbers, jump to the time indicated
        resetInputBox('day');
        jumpToTime(contentInputBox, true);
      } else { // Give up. Something stupid happened.
        displayMessage('The format should be \n1200 1h30m text OR\n1200 text OR\n text OR \n1200 or 1230', 6000, 'day')
        resetInputBox('day');
      }
    }
    document.getElementById('clearButton').textContent = '\u25BEClear'; // Black down-pointing small triangle
    document.getElementById('addTaskButton').textContent = '+';
    document.getElementById('sortTask').setAttribute('class', 'noTasksToSort');
  } else {
    document.getElementById('clearButton').textContent = '\u25C2Clear'; // Black left-pointing small triangle
    document.getElementById('addTaskButton').textContent = '\u270D';  // Writing hand
    document.getElementById('sortTask').setAttribute('class', 'tasksToSort');
  }
}

function inputFixedTask(contentInputBox) {
  let parsedList = parseText(contentInputBox);
  let task = new Task(parsedList[0], parsedList[1], parsedList[2], parsedList[3]);
  if (taskList.length == 1 && parsedList[0] == '') {
    displayMessage('\nPlease start planning with a fixed time \n\nEither press "Now" or add a task at\n6:00 by typing "600 15m planning"\n', 5000, 'day');
  } else {
    let succes = addTask(uniqueIdOfLastTouched, task); // TODO: The unique id changes when jumping between pages...

    if (!succes) {
      displayMessage('Not enough room. \nPlease clear some space', 3000, 'day');  // TODO: This just drop a new task if there is not room. Oups.
      document.getElementById('dayInputBox').value = contentInputBox;
    }
    renderTasks();
    jumpTo(uniqueIdOfLastTouched)
  }
}

function nullifyClick() {
  let myId = getIndexFromUniqueId(chosenTaskId);
  taskList[myId].isClicked = 'isNotClicked';
  chosenTaskId = '';
}

function addTask(myId, task) {
  let succes = false;
  if (task.date == '') {  // No fixed time ...
    succes = addWhereverAfter(myId, task);
  } else {
    succes = addFixedTask(task);
  }
  resetInputBox('day');
  return succes;
}


function addWhereverAfter(uniqueId, task) {
  let succes = false;
  let myId = getIndexFromUniqueId(uniqueId);
  for (var id=myId; id<taskList.length - 1; id++) {
    succes = addTaskAfter(taskList[id].uniqueId, task);
    looseInputBoxFocus('day');
    if (succes) {
      break;
    }
  }
  return succes;
}


function addTaskAfter(uniqueId, task) {
  let id = getIndexFromUniqueId(uniqueId);
  task.date = taskList[id].end;
  task.end = new Date(task.date.getTime() + task.duration);
  task.fuzzyness = 'isFuzzy';
  if (taskList[id + 1].fuzzyness === 'isFuzzy' || task.end <= taskList[id + 1].date) {
    taskList.splice(id + 1, 0, task);
    uniqueIdOfLastTouched = task.uniqueId;
    looseInputBoxFocus('day');
    anneal();
    return true;
  } else {
    return false;
  }
}


function addTaskBefore(myId, task) {
  let id = getIndexFromUniqueId(myId);
  task.date = new Date(taskList[id].date.getTime() - task.duration);
  task.end = taskList[id].date;
  if (taskList[id].fuzzyness != 'isFuzzy' && taskList[id - 1].end > task.date) {
    displayMessage('Not enough rooom here', 3000, 'day');
    return false;
  } else {
    if (taskList[id].fuzzyness === 'isNotFuzzy') {
      task.fuzzyness = 'isNotFuzzy';
    } else {
      task.date = new Date(taskList[id - 1].end);
      task.end = new Date(task.date.getTime() + task.duration);
      task.fuzzyness = 'isFuzzy';
    }
    taskList.splice(id, 0, task);
    uniqueIdOfLastTouched = task.uniqueId;
    looseInputBoxFocus('day');
    anneal();
    return true;
  }
}


function addFixedTask(task) {
  let succes = false;
  let overlap = '';
  let backUpTaskList = [].concat(taskList); // Make a deep copy
  let len = taskList.length;

  overlap = isThereASoftOverlap(task);
  if (overlap === 'hardOverlap') {
    displayMessage('There is an overlap with another fixed time', 3000, 'day');
    return false;
  } else if (overlap === 'softOverlap') {
    overlappingTasks = removeFuzzyOverlap(task);
    let id = getIndexFromUniqueId(overlappingTasks[0][0]);
    taskList.splice(id + 1, 0, task);
    task.fuzzyness = 'isNotFuzzy';
    uniqueIdOfLastTouched = task.uniqueId;
    succes = true;
    if (overlappingTasks.length > 0) {
      for (const [index, task] of overlappingTasks.entries()) {
        succes = addWhereverAfter(task[0], task[1]);
      }
    }
  } else if (overlap === 'noOverlap') {
    for (var n=0; n<len; n++) {
      if (task.end < taskList[n].date) {
        taskList.splice(n, 0, task);
        task.fuzzyness = 'isNotFuzzy';
        uniqueIdOfLastTouched = task.uniqueId;
        succes = true;
        break;
        }
      }
  }

  if (!succes) {
    taskList = [].concat(backUpTaskList);
  }
  return succes;
}


function isThereASoftOverlap(task) {
  let overlap = '';
  let len = taskList.length;

  for (var n=0; n<len; n++) {
    if ((taskList[n].date < task.date && task.date < taskList[n].end)
      || (taskList[n].date < task.end && task.end < taskList[n].end)) {
        if (taskList[n].fuzzyness === 'isNotFuzzy') {
          overlap = 'hardOverlap';
          return overlap;
        } else {
          overlap = 'softOverlap';
        }
      }
      if (n === len - 1 && overlap === 'softOverlap') {
        return overlap
      }
  }

  overlap = 'noOverlap';
  return overlap;
}


function removeFuzzyOverlap(task) {
  let overlappingTasks = [];
  let len = taskList.length;
  // debugger;
  for (var n=1; n<len - 1; n++) {
    if ((taskList[n].date < task.date && task.date < taskList[n].end)
    || (taskList[n].date < task.end && task.end < taskList[n].end)) {
      if (taskList[n].fuzzyness === 'isNotFuzzy') {
        console.log('Bugger. Logic broke.', taskList[n]);
      };
      overlappingTasks.push([taskList[n - 1].uniqueId, taskList[n]]);
    }
  }
  for (const [index, overlappingTask] of overlappingTasks.entries()) {
    let uniqueId = overlappingTask[1].uniqueId;
    for (const [index, task] of taskList.entries()) {
      if (uniqueId === task.uniqueId) {
        taskList.splice(index, 1);
      }
    }
  }
  return overlappingTasks
}

// Used by an eventListener. Govern the Edit/Clear button
function clearTextboxOrDay() {
  let clearButton = document.getElementById('clearButton');
  if (document.getElementById('dayInputBox').value != '' ) {
    clearButton.textContent = '\u25BEClear'; // Black down-pointing small triangle
    document.getElementById('addTaskButton').textContent = '+';
    document.getElementById('sortTask').setAttribute('class', 'noTasksToSort');
    id = '';
  } else {
    clearDay();
  }
  resetInputBox('day');
}


function clearDay() {
  let answer = confirm('Do you want to remove all tasks and start planning a new day?');
  if (answer == true) {
    storageList['trashBin'] = [taskList, 'trashBin'];
    taskList = [];
    makeFirstTasks();
    resetInputBox('day');
    wakeUpOrNowClickedOnce = false;
    localStorage.indexOfLastTouched = 0;
    document.getElementById('upButton').addEventListener('click', wakeUpButton, {once:true});
    document.getElementById('nowButton').addEventListener('click', nowButton, {once:true});
    storeLocally();
    adjustNowAndWakeUpButtons();
    setUpFunc();
    document.getElementById('dayInputBox').value = '';
    document.getElementById('addTaskButton').textContent = '+';
    document.getElementById('sortTask').setAttribute('class', 'noTasksToSort');
  } else {
    displayMessage('Nothing was changed', 3000, 'day');
  }
}


function editTask() {
  let id = getIndexFromUniqueId(chosenTaskId);
  let drain = '';

  if (1 < taskList[id].drain) {
    drain = ' d' + taskList[id].drain + ' ';
  } else if (taskList[id].drain < 0) {
    drain = ' g' + (-taskList[id].drain) + ' ';
  }

  taskText = taskList[id].text + ' ' + drain + taskList[id].duration / 60000 + 'm';  //  Save the text from clickedElement

  let dayInputBox = document.getElementById('dayInputBox');
  dayInputBox.value = taskText;  // Insert text in inputBox

  taskList.splice(id, 1);  // Remove clicked task from taskList
  uniqueIdOfLastTouched = taskList[id - 1].uniqueId;

  document.getElementById('clearButton').textContent = '\u25C2Clear';  // Black left-pointing small triangle
  chosenTaskId = '';

  renderTasks();

  dayInputBox.focus();

  let nextLast = taskText.length - 1;
  dayInputBox.setSelectionRange(nextLast - 2, nextLast); // Makes changing task time easier by focusing just before m in 45m
}

// Used by an eventListener. Toggles zoom.
function zoomFunc() {
  let zoomButton = document.getElementById('zoom');

  zoom = (1 + 0.5) - zoom;
  zoomSymbolModifyer = 7 - zoomSymbolModifyer;

  zoomButton.textContent = String.fromCharCode(9040 + zoomSymbolModifyer); // Toggles between \u2357 ⍐ and \u2350 ⍗

  renderTasks();
  jumpToNow();
}


function createDisplayList(sourceList) {
  let jumpToId = uniqueIdOfLastTouched;
  let currentStressLevel = wakeUpStress;

  displayList = [];
  let duration = 0;

  displayList.push(sourceList[0]);
  sourceList[0].stressGradient = currentStressLevel;

  let len = sourceList.length;
  for (var n=1; n<len; n++) {  // TODO: Fix Add-button position again again. Fix duration in add-view
    // if (sourceList[n - 1].end) { // This condition makes dayStart and dayEnd collapse // TODO: Fix this and insert before a fixed task. Maybe run task.end() somewhere appropriate
      // let duration = sourceList[n].date.getTime() - sourceList[n-1].end.getTime();
    let duration = sourceList[n].date.getTime() - (sourceList[n - 1].date.getTime() + sourceList[n - 1].duration);
    // }
    if (duration > 0) { // Create a nullTime task if there is a timegab between tasks
      let nullTime = new Task(sourceList[n-1].end, duration, '', -1);
      nullTime.uniqueId = sourceList[n-1].uniqueId + 'n';
      nullTime.fuzzyness = 'isNullTime';
      nullTime.startStressLevel = currentStressLevel;
      // nullTime.drain = -1;
      if (n === 1) {
        let colour = 'hsl(255, 100%, ' + (100 - Math.floor(currentStressLevel*10)).toString() + '%)';
        nullTime.stressGradient = [colour, colour];
      } else {
        let result = getStress(nullTime);
        nullTime.stressGradient = result[0];
        currentStressLevel = result[1];
      }
      displayList.push(nullTime);
      duration = 0;
    }
    sourceList[n].startStressLevel = currentStressLevel;
    let result = getStress(sourceList[n]);
    sourceList[n].stressGradient = result[0];
    currentStressLevel = result[1];
    displayList.push(sourceList[n]);
  }

  uniqueIdOfLastTouched = jumpToId;
  return displayList
}


function getStress(task) {
  let currentStressLevel = task.startStressLevel;
  let gradient = ['hsl(255, 100%, ' + (100 - Math.floor(currentStressLevel * 10)).toString() + '%)'];

  let durationM = Math.floor(task.duration / 60000);
  let stress = 0;
  for (var i = 0; i < durationM; i += 5) {
    stress = currentStressLevel * Math.pow(2, i/(tDouble/(task.drain * 2))); // The stress doubles after the time tDouble (in minutes) - or fall if drain is negative
    colourBit = 'hsl(255, 100%, ' + (100 - Math.floor(stress * 10)).toString() + '%)';
    gradient.push(colourBit);
  }

  return [gradient, stress];
}


function displayMessage(text, displayTime, view) {  // displayTime in milliseconds
  console.log(text, view);
  msg = document.getElementById(view + 'Message');
  msg.style.display = 'inline-block';
  msg.style.color = 'red';
  msg.textContent = text;

  // Add an eventListener to stop annoying messages by clicking anywhere
  setTimeout(function() {document.addEventListener('click', stopTimeout);}, 500);  // A short timeout is necessary in order to not fire immediately

  msgTimeOutID = setTimeout(function() {
    msg.style.display = 'none';
      document.removeEventListener('click', stopTimeout);
    }, displayTime)
}

function stopTimeout() {  // To remove an eventListener anonymous functions can't be used
  clearTimeout(msgTimeOutID);
  msg.style.display = 'none';
  document.removeEventListener('click', stopTimeout);
}

function taskHasBeenClicked(event) {
  let myUniqueId = event.target.id;
  let chosenId = '';
  let id = getIndexFromUniqueId(myUniqueId); // Mostly to check for nulltimes being clicked
  if (chosenTaskId != '') {
    chosenId = getIndexFromUniqueId(chosenTaskId);
  }

  // The eventListener is tied to the parent, so the event given is the parent event
  let contentInputBox = document.getElementById('dayInputBox').value.trim();
  let clearButton = document.getElementById('clearButton');

  if (contentInputBox !== '' && !chosenTaskId) {
    // Text in inputBox and no chosenTaskId. Create new task and insert before clicked element
    if (/[a-c, e-g, i-l, n-z]/.exec(contentInputBox) != null) {
      let parsedList = parseText(contentInputBox);
      let task = new Task(parsedList[0], parsedList[1], parsedList[2], parsedList[3]);
      if (nullTimeClicked) {
        nullTimeClicked = false;
        addWhereverAfter(myUniqueId, task);  // Nulltimes shares id with the task before the nulltime
      } else {
        addTaskBefore(myUniqueId, task);
      }
      clearButton.textContent = '\u25BEClear'; // Black down-pointing small triangle
      handleChoosebox('day');

    } else {
      displayMessage('The format should be \n1200 1h30m text OR\n1200 text OR\n text OR \n1200', 6000, 'day')
    }
    document.getElementById('addTaskButton').textContent = '+';
    if (!document.getElementById('dayChooseBox').classList.contains('active')) {
      document.getElementById('sortTask').setAttribute('class', 'noTasksToSort');
    }

  } else if (contentInputBox !== '' && chosenTaskId){
    // Text in inputbox and a chosenTaskId. Should not happen.
    nullifyClick();
    console.log('Text in inputbox and a chosenTaskId. Should not happen.');

  }  else if (contentInputBox == '' && !chosenTaskId) {
    // No text in inputBox and no chosenTaskId: Getting ready to edit or delete
    chosenTask = document.getElementById(myUniqueId);
    let myId = getIndexFromUniqueId(myUniqueId);
    taskList[myId].isClicked = 'isClicked'; // TODO: Unclick later
    chosenTaskId = chosenTask.id;
    uniqueIdOfLastTouched = chosenTaskId;

  } else if (contentInputBox == '' && chosenTaskId) {
    // No text in inputBox and a chosenTaskId: Swap elements - or edit if the same task is clicked twice
    if (/[n]/.exec(myUniqueId) != null) {  // If nulltime ...
      // displayMessage('Unasigned time can not be edited', 3000);  // More confusing than helpful(?) Yep. Need clean up.
    } else if (chosenTaskId === myUniqueId) {
      editTask();
      document.getElementById('addTaskButton').textContent = '\u270D';  // Writing hand
      document.getElementById('sortTask').setAttribute('class', 'tasksToSort');
    } else if (taskList[chosenId].fuzzyness === 'isNotFuzzy' || taskList[id].fuzzyness === 'isNotFuzzy') {
      displayMessage('One of the clicked tasks is fixed. \nFixed task can not be swapped. \nPlease edit before swap.', 3000, 'day');
      taskList[chosenId].isClicked = 'isNotClicked';
      taskList[id].isClicked = 'isNotClicked';
    } else if (taskList[chosenId].fuzzyness === 'isFuzzy' && taskList[id].fuzzyness === 'isFuzzy') {
      swapTasks(myUniqueId);
    }
    chosenTaskId = '';
    // clearButton.textContent = 'Clear\u25B8';  // Black right-pointing small triangle
  }
  renderTasks();

}


function getIndexFromUniqueId(uniqueId) {
  if (/[n]/.exec(uniqueId) != null) {  // Nulltimes have the same unique id as the task before them, but with an 'n' attached
    nullTimeClicked = true;
    uniqueId = /[0-9]*/.exec(uniqueId)[0];
  } else {
    nullTimeClicked = false;
  }
  for (const [index, task] of taskList.entries()) {
    // console.log('get', index, task, task.uniqueId, uniqueId);
    if (task.uniqueId.toString() === uniqueId.toString()) {
      return index
    }
  }
}


function swapTasks(myId) { // TODO: Fix swap by allowing inserting task by moving fuzzy tasks
    let id1 = getIndexFromUniqueId(chosenTaskId);
    let id2 = getIndexFromUniqueId(myId);
    taskList[id1].isClicked = 'isNotClicked';
    taskList[id2].isClicked = 'isNotClicked';
    taskList[id1].date = '';
    taskList[id2].date = '';
    [taskList[id2], taskList[id1]] = [taskList[id1], taskList[id2]];
    anneal();
    uniqueIdOfLastTouched = taskList[id1].uniqueId;
}


function anneal() { // TODO: Tasks can end up after 23:59. At least a warning is needed(?)
  fixTimes();
  let len = taskList.length;
  for (var n=1; n<len - 1; n++) {
    if (taskList[n + 1].date < taskList[n].end) {
      [taskList[n], taskList[n + 1]] = [taskList[n + 1], taskList[n]];
      fixTimes();
    }
    if (taskList[n + 1].date - taskList[n].end > 0 && taskList[n + 1].fuzzyness === 'isFuzzy') {
      taskList[n + 1].date = taskList[n].end;
      taskList[n + 1].end = new Date(taskList[n + 1].date.getTime() + taskList[n + 1].duration);
    }
  }
  fixTimes();
}


function fixTimes() {
  let len = taskList.length;
  for (var n=1; n<len - 1; n++) {
    if (taskList[n].end <= taskList[n + 1].date) {
      continue;
    } else if (taskList[n + 1].fuzzyness === 'isFuzzy') {
      taskList[n + 1].date = taskList[n].end;
      taskList[n + 1].end = new Date(taskList[n + 1].date.getTime() + taskList[n + 1].duration);
    } else {
      // console.log(n, 'Overlapping a fixed task');
    }
  }
}


function renderTasks() {
  displayList = createDisplayList(taskList);

  // // Store a backup of taskList
  // let taskListAsText = JSON.stringify(taskListExtractor());
  // if (taskListAsText) {
  //   localStorage.taskListAsText = taskListAsText;
  // }
  storeLocally();

  clearOldTasksEtc();

  // fillStressBar(zoom);
  // fillHearths(10);

  // Make new time markings in timeBar
  fillTimeBar(zoom);

  // Refresh view from taskList
  for (const [index, task] of displayList.entries()) {
    // Create tasks as buttons
    let newNode = document.createElement('button');
    newNode.setAttribute('id', task.uniqueId);
    newNode.classList.add(task.fuzzyness);  // Fuzzyness is used for styling tasks
    newNode.classList.add(task.isClicked);
    newNode.classList.add('task');
    if (Number(task.drain) < 0 && task.fuzzyness != 'isNullTime') {
      newNode.classList.add('isGain');
    }

    // Create stress indicators as divs
    let stressMarker = document.createElement('div');
    stressMarker.textContent = '-';

    stressMarker.classList.add('stressDiv');
    stressMarker.setAttribute('style', 'background-image: linear-gradient(' + task.stressGradient + ')');

    // Set the task height
    if (zoom * task.height < 12) {  // Adjust text size for short tasks
      newNode.style['font-size'] = 4 + 4 * zoom + 'px';
      stressMarker.style['font-size'] = 4 + 4 * zoom + 'px';
    } else if (zoom * task.height < 22) {
      newNode.style['font-size'] = 6 + 6 * zoom + 'px';
      stressMarker.style['font-size'] = 6 + 6 * zoom + 'px';
    } else {
      newNode.style['font-size'] = null;
      stressMarker.style['font-size'] = null;
    }
    // newNode.style['line-height'] = zoom * task.height + 'px';
    // stressMarker.style['line-height'] = zoom * task.height + 'px';
    newNode.style.height = (zoom * task.height * 100) / (24 * 60) + '%';
    stressMarker.style.height = (zoom * task.height * 100) / (24 * 60) + '%';

    // Write text in task
    let nodeText = textExtractor(task);
    let textNode = document.createTextNode(nodeText);
    newNode.appendChild(textNode);

    // Create the elements
    document.getElementById('stressDiv').appendChild(stressMarker);
    document.getElementById('taskDiv').insertAdjacentElement('beforeend', newNode);
  }
}


function clearOldTasksEtc() {
  // // Remove old hearts from heartSpan
  // const heartNode = document.getElementById('heart');
  // while (heartNode.firstChild) {
  //   heartNode.removeChild(heartNode.lastChild);
  // }

  // Remove old task from stressDiv
  const stressNode = document.getElementById('stressDiv');
  while (stressNode.firstChild) {
    stressNode.removeChild(stressNode.lastChild);
  }

  // Remove old time markings from timeBar
  const timeNode = document.getElementById('timeDiv');
  while (timeNode.firstChild) { // Remove old task from view
    timeNode.removeChild(timeNode.lastChild);
  }

  // Remove old task from taskDiv
  const taskNode = document.getElementById('taskDiv');
  while (taskNode.firstChild) {
    taskNode.removeChild(taskNode.lastChild);
  }
}


function jumpTo(index) {
  if (document.getElementById('container') !== null  && taskList.length > 0) {
    container = document.getElementById('container');
    container.scrollTop = document.getElementById(index).offsetTop - 180 * zoom;
    // document.getElementById('dayInputBox').focus();
  }
}


function jumpToNow() {
  let now = new Date()
  let nowMinusOneHour = (now.getHours() - 1).toString() + now.getMinutes().toString();
  jumpToTime(nowMinusOneHour, false);
  // if (document.getElementById('container') !== null  && taskList.length > 0) {
  //   container = document.getElementById('container');
  //   container.scrollTop = document.getElementById('nowSpan').offsetTop + 800 * zoom;
  //   // document.getElementById('dayInputBox').focus();
  // }
}


function jumpToTime(time, showMessage) {
  let min = /[0-9][0-9]$/.exec(time);
  let hours = time.toString().replace(min, '');
  if (Number(min) < 30) { // The time-divs are at half hour intervals and we can only jump to time-divs
    min = '00';
    time = hours + min;
  } else {
    min = '30';
    time = hours + min;
  }
  if (document.getElementById('container') !== null  && taskList.length > 0) {
    container = document.getElementById('container');
    timeDiv = document.getElementById(time);  // time in the format of a string ex: '700'
    if (timeDiv) {
      container.scrollTop = timeDiv.offsetTop - 180 * zoom;
      if (showMessage) {
        displayMessage('Jumped to ' + hours + ':' + min, 700, 'day');
      }
    } else {
      displayMessage('Number not recognised as a time', 1000, 'day')
    }
  }
}


function textExtractor(task) {  // Extract the text to be written on screen
  let text = task.text;
  let drain = '';

  if (task.drain != '') {
    if (task.drain > 1) {
      drain = ' d' + task.drain;
    } else if (task.drain < -1) {
      drain = ' g' + (-task.drain);
    }

  }

  if (task.duration != '') {
    let hours = Math.floor(task.duration / 3600000);
    let minutes = Math.floor((task.duration - hours * 3600000) / 60000);
    if (hours > 0 && minutes > 0) {
      text = '(' + hours + 'h' + minutes + 'm' + drain + ') ' + task.text;
    } else if (hours > 0) {
      text = '(' + hours + 'h' + drain + ') ' + task.text;
    } else {
      text = '(' + minutes + 'm' + drain + ') ' + task.text;
    }
  }

  if (task.date != '') {
    let timeH = task.date.getHours();
    let timeM = task.date.getMinutes();
    let endTime = new Date(task.date.getTime() + task.duration);
    let endH = endTime.getHours();
    let endM = endTime.getMinutes();
    // Check if leading zeroes are needed and add them
    let nils = ['', '', '', ''];
    if (timeH < 10) {
      nils[0] = '0';
    }
    if (timeM < 10) {
      nils[1] = '0';
    }
    if (endH < 10) {
      nils[2] = '0';
    }
    if (endM < 10) {
      nils[3] = '0';
    }
    text1 = nils[0] + timeH + ':' + nils[1] + timeM + '-';
    text = text1 + nils[2] + endH + ':' + nils[3] + endM + ' ' + text;
  }

  return text
}


function taskListExtractor() {  // Make a list of strings that can generate the current taskList
  startAndEndTimes = [];
  let taskListAsText = [];
  for (const [index, task] of taskList.entries()) {
    let timeH = task.date.getHours();
    let timeM = task.date.getMinutes();
    if ((timeH === 0 && timeM === 0) || (timeH === 23 && timeM === 59)) {
      continue;
    }
    let text = task.text;

    if (task.duration != '') {
      let hours = Math.floor(task.duration / 3600000);
      let minutes = Math.floor((task.duration - hours * 3600000) / 60000);
      if (hours > 0 && minutes > 0) {
        text = hours + 'h' + minutes + 'm ' + task.text;
      } else if (hours > 0) {
        text = hours + 'h '  + task.text;
      } else {
        text = minutes + 'm ' + task.text;
      }
      updateStartAndEndTimes(timeH, timeM, hours, minutes); // Makes alarm list for toc
    } else {
      updateStartAndEndTimes(timeH, timeM, 0, 30);
    }

    if (task.fuzzyness === 'isNotFuzzy' && task.date != '') {
      let nils = '';
      if (timeM < 10) {
        nils = '0';
      }
      text = timeH + nils + timeM + ' ' + text;
    }

    text += ' d' + task.drain;

    taskListAsText.push(text);

  }
  return taskListAsText;
}


function updateStartAndEndTimes(timeH, timeM, hours, minutes) { // Makes a list of start and end times for sayToc
  var time = '';
  time = 'beginning' + timeH.toString() + timeM.toString() + '0';
  startAndEndTimes.push(time);
  let endH = timeH + hours;
  let endM = timeM + minutes;
  if (59 < endM) {
    endM -= 60;
    endH += 1;
  }
  time = 'end' + endH.toString() + endM.toString() + '0';
  startAndEndTimes.push(time);
}


function parseText(rawText) {
  let taskStart = '';

  let minutes = /[0-9]+m/.exec(rawText);
  if (minutes) { // If 30m is in rawText store number in minutes and remove 30m from rawText
    minutes = /[0-9]+/.exec(minutes).toString();
    rawText = rawText.replace(minutes + 'm', '');
  } else {
    minutes = '0';
  };

  let hours = /[0-9]+h/.exec(rawText);
  if (hours) { // If 2h is in rawText store number in minutes and remove 2h from rawText
    hours = /[0-9]+/.exec(hours).toString();
    rawText = rawText.replace(hours + 'h', '');
  } else {
    hours = '0';
  };

  // Make duration in milliseconds form hours and minutes
  let duration = hours * 3600000 + minutes * 60000;
  if (duration == 0) {
    duration = defaultTaskDuration * 60000; // If no duration is provided use the default task duration
  }

  let time = /[0-9]?[0-9]:?[0-9][0-9]/.exec(rawText);
  if (time) { // If 1230 or 12:30 is found in rawText store numbers in hours and minutes and remove 1230 from rawText
    time.toString().replace(':', '');
    time = time[0].toString();
    if (time.length == 4) {
      timeH = /[0-9][0-9]/.exec(time).toString();
    } else if (time.length == 3) {
      timeH = /[0-9]/.exec(time).toString();
    }
    time = time.replace(timeH, '');
    timeM = /[0-9][0-9]/.exec(time).toString();
    rawText = rawText.replace(timeH + timeM, '');
    // Make new datetime from timeM and timeH
    let now = new Date();
    taskStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), timeH, timeM);  // NO need for DST shenanigans here!
  } else {
    timeM = '-1';
    timeH = '-1';
    taskStart = '';
  };


  let drain = /d+[-]*[1-5]+/.exec(rawText);
  if (/d+[-]*[1-5]+/.exec(drain)) {
    drain = /[-]*[1-5]/.exec(drain).toString();
    rawText = rawText.replace('d' + drain, '');
  } else {
    drain = '1';
    // rawText = rawText.replace('d', '');
  };

  let gain = /g+[-]*[1-5]+/.exec(rawText); // Gain counts double as the assumption is consious relaxation
  if (/g+[-]*[1-5]+/.exec(gain)) {
    gain = /[-]*[1-5]/.exec(gain).toString();
    drain = '-' + gain;
    rawText = rawText.replace('g' + gain, '');
  };

  let text = rawText.trim();
  text = text.slice(0, 1).toUpperCase() + text.slice(1, );

  parsedList = [taskStart, duration, text, drain];
  return parsedList;
}


////////////////////////////////// Maintenence code //////////////////////////

// console.table(taskList);  // Remember! Shows a table in the console.
// debugger;  // Remember! Stops execution in order to glean the current value of variable

function debugExamples() {
  let exList = [
    '700 debugging example',
    '1h longOne',
    '30m shortOne',
    '30m shortTwo',
    '45m mediumOne',
    '1200 1h lunch',
    // '1530 1h tea',
    '1h longTwo' ,
    '45m mediumTwo',
    '30m shortThree'
  ];

  console.log('Debugging example list ', exList);

  uniqueIdOfLastTouched = taskList[0].uniqueId;
  textListToTaskList(exList);
  renderTasks();
}


function textListToTaskList(taskListAsText) {  // Used by debugExamples()
  let succes = false;
  if (taskListAsText.length === 0 && taskList.length === 0) {
    makeFirstTasks();
  } else {
    for (const [index, text] of taskListAsText.entries()) {
      let parsedList = parseText(text.trim());
      let id = uniqueIdOfLastTouched;
      let task = new Task(parsedList[0], parsedList[1], parsedList[2], parsedList[3]);
      // console.log(task.text, [].concat(taskList));
      succes = addTask(id, task);
      if (!succes) {console.log('Retrieval got wrong at index ', index);}
    }
  }
  // TODO: Fix uniqueIdOfLastTouched. It can't be stored as stuff is redrawn
  uniqueIdOfLastTouched = taskList[localStorage.indexOfLastTouched].uniqueId;
}

// For debugging only:
function showTaskListTimes() {
  let len = taskList.length;
  for (var n=0; n<len; n++) {
    console.log(n, 'Start:', taskList[n].date.getHours(), taskList[n].date.getMinutes(), 'End: ', taskList[n].end.getHours(), taskList[n].end.getMinutes(), taskList[n].text);
  }
}
