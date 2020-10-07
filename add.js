let defaultTaskDuration = 30;
let taskDuration = defaultTaskDuration;
let taskTime = new Date();

// TODO: change text of OK button depending of Input Time status.

// Makes pressing Enter add task
document.getElementById('inputTaskBox').addEventListener('keypress', function () { inputAtEnterText(event); });
document.getElementById('inputDurationBox').addEventListener('keypress', function () { inputAtEnterDuration(event); });
document.getElementById('inputTimeBox').addEventListener('keypress', function () { inputAtEnterTime(event); });

document.getElementById('clear').addEventListener('keypress', clearTimeBox);

document.getElementById('durationPlus1h').addEventListener('click', function() {changeDuration(60);});
document.getElementById('durationPlus30m').addEventListener('click', function() {changeDuration(30);});
document.getElementById('durationPlus15m').addEventListener('click', function() {changeDuration(15);});
document.getElementById('durationPlus5m').addEventListener('click', function() {changeDuration(5);});

// document.getElementById('durationPlus1hMiddle').addEventListener('click', function() {changeDuration(60);});
// document.getElementById('durationPlus30mMiddle').addEventListener('click', function() {changeDuration(30);});
// document.getElementById('durationPlus15mMiddle').addEventListener('click', function() {changeDuration(15);});
// document.getElementById('durationPlus5mMiddle').addEventListener('click', function() {changeDuration(5);});

document.getElementById('durationMinus1h').addEventListener('click', function() {changeDuration(-60);});
document.getElementById('durationMinus30m').addEventListener('click', function() {changeDuration(-30);});
document.getElementById('durationMinus15m').addEventListener('click', function() {changeDuration(-15);});
document.getElementById('durationMinus5m').addEventListener('click', function() {changeDuration(-5);});


// document.getElementById('timePlus1h').addEventListener('click', function() {changeTime(60);});
// document.getElementById('timePlus30m').addEventListener('click', function() {changeTime(30);});
// document.getElementById('timePlus15m').addEventListener('click', function() {changeTime(15);});
// document.getElementById('timePlus5m').addEventListener('click', function() {changeTime(5);});

document.getElementById('timePlus1hMiddle').addEventListener('click', function() {changeTime(60);});
document.getElementById('timePlus30mMiddle').addEventListener('click', function() {changeTime(30);});
document.getElementById('timePlus15mMiddle').addEventListener('click', function() {changeTime(15);});
document.getElementById('timePlus5mMiddle').addEventListener('click', function() {changeTime(5);});

document.getElementById('timeMinus1h').addEventListener('click', function() {changeTime(-60);});
document.getElementById('timeMinus30m').addEventListener('click', function() {changeTime(-30);});
document.getElementById('timeMinus15m').addEventListener('click', function() {changeTime(-15);});
document.getElementById('timeMinus5m').addEventListener('click', function() {changeTime(-5);});

document.getElementById('now').addEventListener('click', setTimeNow);

function setUpFunc() {
  retrieveLocallyStoredStuff();

  fillTimeBox(defaultTaskDuration); // suggest default task duration

}

function retrieveLocallyStoredStuff() {
  if (localStorage.getItem('defaultTaskDuration')) {
    defaultTaskDuration = localStorage.defaultTaskDuration;
  }
}

function fillTimeBox(duration) {
  let hours = 0;
  let minutes = 0;

  hours = (duration - (duration % 60)) / 60;
  minutes = duration - hours * 60;
  console.log(duration, hours, minutes);

  let formattedDuration = hours + 'h' + minutes + 'm';

  let textBox = document.getElementById('inputDurationBox');
  textBox.value = formattedDuration;
}

function changeDuration(minutes) {
  taskDuration += minutes;
  fillTimeBox(taskDuration);
}

function changeTime(minutes) {

}

function setTimeNow() {
  taskTime = new Date();
}

function inputAtEnterText(event) {
  if (event.key === 'Enter') {
    let contentInputBox = document.getElementById('inputTextBox').value.trim();
  }
}

function inputAtEnterDuration(event) {
  if (event.key === 'Enter') {
    let contentInputBox = document.getElementById('inputDurationBox').value.trim();
    console.log(contentInputBox);
  }
}

function inputAtEnterTime(event) {
  if (event.key === 'Enter') {
    let contentInputBox = document.getElementById('inputTimeBox').value.trim();
  }
}

function clearTimeBox() {
  document.getElementById('inputTimeBox').value = '';
  taskTime = 0;
}
