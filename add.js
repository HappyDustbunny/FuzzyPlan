let defaultTaskDuration = 30;

let taskText = '';
let taskDuration = defaultTaskDuration;
let taskTime = new Date();

// TODO: change text of OK button depending of Input Time status.

// Makes pressing Enter add task
document.getElementById('inputTaskBox').addEventListener('keypress', function () { inputAtEnterText(event); });
document.getElementById('inputDurationBox').addEventListener('keypress', function () { inputAtEnterDuration(event); });
document.getElementById('inputTimeBox').addEventListener('keypress', function () { inputAtEnterTime(event); });

document.getElementById('clear').addEventListener('click', clearTimeBox);

document.getElementById('durationPlus1h').addEventListener('click', function() {changeDuration(60);});
document.getElementById('durationPlus30m').addEventListener('click', function() {changeDuration(30);});
document.getElementById('durationPlus15m').addEventListener('click', function() {changeDuration(15);});
document.getElementById('durationPlus5m').addEventListener('click', function() {changeDuration(5);});

document.getElementById('durationMinus1h').addEventListener('click', function() {changeDuration(-60);});
document.getElementById('durationMinus30m').addEventListener('click', function() {changeDuration(-30);});
document.getElementById('durationMinus15m').addEventListener('click', function() {changeDuration(-15);});
document.getElementById('durationMinus5m').addEventListener('click', function() {changeDuration(-5);});

document.getElementById('timePlus1h').addEventListener('click', function() {changeTime(60);});
document.getElementById('timePlus30m').addEventListener('click', function() {changeTime(30);});
document.getElementById('timePlus15m').addEventListener('click', function() {changeTime(15);});
document.getElementById('timePlus5m').addEventListener('click', function() {changeTime(5);});

document.getElementById('timeMinus1h').addEventListener('click', function() {changeTime(-60);});
document.getElementById('timeMinus30m').addEventListener('click', function() {changeTime(-30);});
document.getElementById('timeMinus15m').addEventListener('click', function() {changeTime(-15);});
document.getElementById('timeMinus5m').addEventListener('click', function() {changeTime(-5);});

document.getElementById('now').addEventListener('click', setTimeNow);

function setUpFunc() {

  retrieveLocallyStoredStuff();

  clearTaskBox();

  fillDurationBox(defaultTaskDuration);

  clearTimeBox();
}

function retrieveLocallyStoredStuff() {
  if (localStorage.getItem('defaultTaskDuration')) {
    defaultTaskDuration = localStorage.defaultTaskDuration;
  }
}

function changeDuration(minutes) {
  taskDuration += minutes;
  fillDurationBox(taskDuration);
}

function fillDurationBox(duration) {
  let hours = 0;
  let minutes = 0;

  hours = (duration - (duration % 60)) / 60;
  minutes = duration - hours * 60;

  let formattedDuration = hours + 'h' + minutes + 'm';

  let textBox = document.getElementById('inputDurationBox');
  textBox.value = formattedDuration;
}

function changeTime(minutes) {
  taskTime = new Date(taskTime.getTime() + minutes * 60000);
  fillTimeBox(taskTime);
}

function fillTimeBox(time) {
  taskTimeHours = time.getHours().toString();
  taskTimeMinutes = time.getMinutes().toString();
  // Check if leading zeroes are needed and add them
  let nils = ['', ''];
  if (taskTimeHours < 10) {
    nils[0] = '0';
  }
  if (taskTimeMinutes < 10) {
    nils[1] = '0';
  }
  prettyTaskTime = nils[0] + taskTimeHours + ':' + nils[1] + taskTimeMinutes;
  document.getElementById('inputTimeBox').value = prettyTaskTime;
}

function setTimeNow() {
  taskTime = new Date();
  fillTimeBox(taskTime);
}

function clearTimeBox() {
  document.getElementById('inputTimeBox').value = '';
  taskTimeHours = 0;
  taskTimeMinutes = 0;
}

function clearTaskBox() {
  document.getElementById('inputTaskBox').value = '';
}

function readTaskText() {
  let contentInputBox = document.getElementById('inputTaskBox').value.trim();
  let badCharacters = /[^a-zA-Z\.\,\?\!\(\)\"]+/.exec(contentInputBox);
  if (badCharacters) {
    displayMessage('Please dont use ' + badCharacters + ' for task description.', 3000);
  } else {
    taskText = contentInputBox;
    console.log(contentInputBox);
  }
}

function readDurationTime() {
  let contentInputBox = document.getElementById('inputDurationBox').value.trim(); // TODO: Sanitize input and add functionality
  let badCharacters = /[^0-9hm]/.exec(contentInputBox);
  if (badCharacters) {
    displayMessage('Please use the format 1h30m for 1 hour and 30 minutes', 3000);
  } else {
    let timeH = /[0-9]+h/.exec(contentInputBox).toString();
    contentInputBox = contentInputBox.replace(timeH, '');
    let timeM = /[0-9]+m/.exec(contentInputBox).toString();
    timeH = Number(timeH.replace('h', ''));
    timeM = Number(timeM.replace('m', ''));
    taskDuration = timeH * 60 + timeM;
    console.log(timeH, timeM, taskDuration);
  }
}

function readTaskStartTime() {
  let contentInputBox = document.getElementById('inputTimeBox').value.trim();
  let badCharacters = /[^0-9:]/.exec(contentInputBox);
  if (badCharacters) {
    displayMessage('Please use the format 12:00 or 1200', 3000);
  } else {
    let timeH = /[0-9][0-9]/.exec(contentInputBox);
    contentInputBox = contentInputBox.replace(timeH, '');
    let timeM = /[0-9][0-9]/.exec(contentInputBox);
    let now = new Date();
    taskTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), timeH, timeM);
  }
}

function inputAtEnterText(event) {
  if (event.key === 'Enter') { // TODO: Can't this be moved to the eventListener?
    readTaskText();
  }
}

function inputAtEnterDuration(event) {
  if (event.key === 'Enter') {
    readDurationTime();
  }
}

function inputAtEnterTime(event) {
  if (event.key === 'Enter') {
    readTaskStartTime();
  }
}


function displayMessage(text, displayTime) { // displayTime in milliseconds
  console.log(text);
  msg = document.getElementById('message');
  msg.style.display = 'inline-block';
  msg.style.color = 'red';
  msg.textContent = text;

  setTimeout(function() {msg.style.display = 'none';}, displayTime)
}
