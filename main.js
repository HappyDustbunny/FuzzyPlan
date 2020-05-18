var taskList = [];  // List to keep track of the order of the tasks
let chosenTask = '';
let chosenTaskId = '';  // When a task is clicked information about that task is stored here
let uniqueIdOfLastTouched = 0;
let uniqueIdList = [];
let nullTimeClicked = false;
let zoom = 0.5;  // The height of all elements will be multiplied with zoom. Values can be 1 or 0.5
let zoomSymbolModifyer = 7; // The last digit of the \u numbers \u2357 ⍐ and \u2350 ⍗
let wakeUpH = 7;  // The hour your day start according to settings // TODO: Settings
let wakeUpM = 0;  // The minutes your day start according to settings
// A list of unique numbers to use as task-ids
// randomList = [117, 9030, 2979, 7649, 700, 3099, 1582, 4392, 3880, 5674, 8862, 5220, 9349, 6299, 1367, 4317, 9225, 1798, 7571, 4609, 6907, 1194, 9487, 9221, 2763, 1553, 128, 1318, 8762, 4974, 6508, 5277, 8256, 3863, 2860, 1904, 1218, 3932, 3615, 7110, 6770, 9075, 5270, 9184, 2702, 1039, 3420, 8488, 5522, 6071, 7870, 740, 2866, 8387, 3628, 5684, 9356, 6843, 9239, 9137, 9114, 5203, 8243, 9374, 9505, 9351, 7053, 4414, 8847, 5835, 9669, 9216, 7724, 5834, 9295, 1948, 8617, 9822, 5452, 2651, 5616, 4355, 1910, 2591, 8171, 7415, 7456, 2431, 4051, 4552, 9965, 7528, 911, 734, 6896, 249, 7375, 1035, 8613, 8836];


// console.table(taskList);  // Remember! Shows a table in the console.
// debugger;  // Remember! Stops execution in order to glean the current value of variable

// Daylight saving time shenanigans
let today = new Date();
let january = new Date(today.getFullYear(), 0, 1);
let july = new Date(today.getFullYear(), 6, 1);
const dstOffset = (july.getTimezoneOffset() - january.getTimezoneOffset()) * 60000; // Daylight saving time offset in ms

// Task-object. Each task will be an object of this type
class Task {
  constructor(date, duration, text) {
    this.date = date; // Start time as Javascript date
    this.duration = duration; // Duration in milliseconds
    this.text = text;
    this.uniqueId = this.giveAUniqueId();
    this.end();
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
          console.log('giveAUniqueId', uniqueId);
          tryAgain = true;
          break;
        }
      }
    }
    while (tryAgain);

    uniqueIdList.push(uniqueId);
    // uniqueIdOfLastTouched = uniqueId;
    return uniqueId;
  }

  end() { // End time as Javascript date
    if (this.date != '') {
      return new Date(this.date.getTime() + this.duration)
    }
  }

  height() { // Pixelheight is 1 minute = 1 px
    return this.duration / 60000
  }
}


// Runs when the page is loaded:
function setUpFunc() {
  // nullTimeClicked = false;
  // Fill the timeBar div
  fillTimeBar(zoom);

  // Create time marker to show current time on timebar
  let nowSpan = document.createElement('span');
  nowSpan.setAttribute('id', 'nowSpan');
  document.getElementById('container').appendChild(nowSpan);
  updateTimeMarker();

  // Make the first tasks. Necessary for adding new tasks
  let startList = ['000 1m Day start', '2359 1m Day end'];
  for (const [index, text] of startList.entries()) {
    parsedText = parseText(text.trim());
    let task = new Task(parsedText[0], parsedText[1], parsedText[2]);
    task.fuzzyness = 'isNotFuzzy';
    taskList.push(task);
  }

  // Make debug example tasks
  debugExamples();

  renderTasks();  // Draws task based on the content of the taskList
  resetInputBox();
  zoomFunc();
}


function debugExamples() {
  exList = [
    '700 debugging example',
    '1h long1',
    '30m short1',
    '30m short2',
    '45m medium1',
    '1200 1h lunch',
    // '1530 1h tea',
    '1h long2' ,
    '45m medium2',
    '30m short3'
  ];

  let succes = false;
  uniqueIdOfLastTouched = taskList[0].uniqueId;
  for (const [index, text] of exList.entries()) {
    let parsedList = parseText(text.trim());
    let id = uniqueIdOfLastTouched;
    let task = new Task(parsedList[0], parsedList[1], parsedList[2]);
    // console.log(task.text, [].concat(taskList));
    succes = addTask(id, task);
  }
  if (!succes) {console.log('Fix your example');}
}


// Clear input box and give it focus
function resetInputBox() {
  document.getElementById('inputBox').value = '';
  document.getElementById('inputBox').focus();
}


// Fill the half hour time slots of the timebar
function fillTimeBar(zoom) {
  for (let i = 0; i < 24; i += 1) {
    let halfHourA = document.createElement('div');  // This IS the most readable and efficient way to make the required text
    let halfHourB = document.createElement('div');

    if (i < 10) {
      halfHourA.innerText = '0' + i + ':00';
      halfHourB.innerText = '0' + i + ':30';
    } else {
      halfHourA.innerText = i + ':00';
      halfHourB.innerText = i + ':30';
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
  // The height of the nowSpan is set to the percentage the passed time represents of the number of minutes in a day
  let nowHeight = zoom * ((now.getHours() * 60 + now.getMinutes()) * 100 ) / (24*60) + '%';
  nowSpanElement = document.getElementById('nowSpan');
  nowSpanElement.style.height = nowHeight;
}

////// Eventlisteners  //////                      // Remember removeEventListener() for anoter time

// Unfold settings
document.getElementById('settings').addEventListener('click', settings);

// Insert a 15 min planning task at start-your-day time according to settings // TODO: Settings
document.getElementById('upButton').addEventListener('click', wakeUpButton, {once:true});
document.getElementById('upButton').addEventListener('click', function() {jumpToTime(700);}); // // TODO: connect to wakeup time

// Insert a 15 min planning task at the current time
document.getElementById('nowButton').addEventListener('click', nowButton, {once:true});
document.getElementById('nowButton').addEventListener('click', jumpToNow);

// Makes pressing Enter add task
document.getElementById('inputBox').addEventListener('keypress', function () { inputAtEnter(event); });

// Tie event to Clear or Edit button
document.getElementById('editButton').addEventListener('click', clearOrEdit);

// Tie event to zoom button (⍐ / ⍗). Toggles zoom
document.getElementById('zoom').addEventListener('click', zoomFunc);

// Makes clicking anything inside the taskDiv container run taskHasBeenClicked()
document.getElementById('taskDiv').addEventListener('click', function () { taskHasBeenClicked(event); }, true);


// TODO: Make addPause buttons 15m, 30m + ?  Make pauses melt together like nullTime. Remove < 1 min nullTime
// Used by an eventListener. Display settings.
function settings() {
  displayMessage('To do: make settings', 5000)
}


// Used by an eventListener. Inserts a 15 min planning task at the start of your day
function wakeUpButton() {
  let succes = false;
  let now = new Date();
  let taskStartMinusDst = new Date(now.getFullYear(), now.getMonth(), now.getDate(), wakeUpH, wakeUpM);
  let taskStart = new Date(taskStartMinusDst.getTime() + 0 * dstOffset); // TODO: Remove dstOffset?
  let task = new Task(taskStart, 15 * 60000, 'Planning');
  succes = addFixedTask(task);
  if (!succes) {
    console.log('wakeUpButton failed to insert a task');
  }
  document.getElementById('upButton').innerText = '\u25B8' + wakeUpH + ':' + wakeUpM;
  document.getElementById('nowButton').removeEventListener('click', nowButton, {once:true});
  document.getElementById('nowButton').innerText = '\u25B8' + 'Now';
  document.getElementById('upButton').title = 'Jump to 7:00';
  document.getElementById('nowButton').title = 'Jump to now';
  renderTasks();
  document.getElementById('inputBox').focus();
}


// Used by an eventListener. Inserts a 15 min planning task at the current time
function nowButton() {
  let task = new Task(new Date(), 15 * 60000, 'Planning');
  addFixedTask(task);
  document.getElementById('nowButton').innerText = '\u25B8' + 'Now';
  document.getElementById('upButton').removeEventListener('click', wakeUpButton, {once:true});
  document.getElementById('upButton').innerText = '\u25B8' + wakeUpH + ':' + wakeUpM;
  document.getElementById('upButton').title = 'Jump to 7:00';
  document.getElementById('nowButton').title = 'Jump to now';
  renderTasks();
  document.getElementById('inputBox').focus();
}


// Used by an eventListener. Makes pressing Enter add task
function inputAtEnter(event) {
  if (event.key === 'Enter') {
    let contentInputBox = document.getElementById('inputBox').value.trim();
    if (/[a-c, e-g, i-l, n-z]/.exec(contentInputBox) != null) {
      let parsedList = parseText(contentInputBox);
      let task = new Task(parsedList[0], parsedList[1], parsedList[2]);
      if (taskList.length == 1 && parsedList[0] == '') {
        displayMessage('\nPlease start planning with a fixed time \n\nEither press "Now" or add a task at\n6:00 by typing "600 15m planning"\n', 5000);
      } else {
        let succes = addTask(uniqueIdOfLastTouched, task);  // The two first in uniqueIdList is start and end

        if (!succes) {
          displayMessage('Not enough room. \nPlease clear some space', 3000);
        }
        renderTasks();
        jumpTo(uniqueIdOfLastTouched)
      }
    } else {
      resetInputBox();
      chosenTaskId = '';
      jumpToTime(contentInputBox);
      // displayMessage('A task needs text ', 3000);
    }
  }
}


function addTask(myId, task) {
  let succes = false;
  if (task.date == '') {  // No fixed time ...
    succes = addWhereverAfter(myId, task);
  } else {
    succes = addFixedTask(task);
  }
  resetInputBox();
  return succes;
}


function addWhereverAfter(uniqueId, task) {
  // let task = new Task(parsedList[0], parsedList[1], parsedList[2]);
  // debugger;
  let succes = false;
  let myId = getIndexFromUniqueId(uniqueId);
  for (var id=myId; id<taskList.length - 1; id++) {
    succes = addTaskAfter(taskList[id].uniqueId, task);
    resetInputBox();
    if (succes) {
      break;
    }
  }
  return succes;
}


function addTaskAfter(uniqueId, task) {
  let id = getIndexFromUniqueId(uniqueId);
  task.date = taskList[id].end();
  task.end();
  task.fuzzyness = 'isFuzzy';
  if (task.end() <= taskList[id + 1].date) {
    taskList.splice(id + 1, 0, task);
    uniqueIdOfLastTouched = task.uniqueId;
    resetInputBox();
    return true;
  } else {
    return false;
  }
}


function addTaskBefore(myId, task) {
  let id = getIndexFromUniqueId(myId);
  task.date = new Date(taskList[id].date.getTime() - task.duration);
  if (taskList[id - 1].end() >= task.date) {
    displayMessage('Not enough rooom here', 3000);
    return false;
  } else {
    taskList.splice(id, 0, task);
    uniqueIdOfLastTouched = task.uniqueId;
    resetInputBox();
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
    displayMessage('There is an overlap with another fixed time', 3000);
    return false;
  } else if (overlap === 'softOverlap') {
    overlappingTasks = removeFuzzyOverlap(task);
    let id = getIndexFromUniqueId(overlappingTasks[0][0]);
    taskList.splice(id + 1, 0, task);
    task.fuzzyness = 'isNotFuzzy';
    uniqueIdOfLastTouched = task.uniqueId;
    succes = true;
    // succes = addTaskAfter(overlappingTasks[0][0], task);
    if (overlappingTasks.length > 0) {
      for (const [index, task] of overlappingTasks.entries()) {
        succes = addWhereverAfter(task[0], task[1]);
      }
    }
  } else if (overlap === 'noOverlap') {
    for (var n=0; n<len; n++) {
      if (task.end() < taskList[n].date) {
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
    if ((taskList[n].date < task.date && task.date < taskList[n].end())
      || (taskList[n].date < task.end() && task.end() < taskList[n].end())) {
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
    if ((taskList[n].date < task.date && task.date < taskList[n].end())
    || (taskList[n].date < task.end() && task.end() < taskList[n].end())) {
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

// function insertBetweenFixedTasks(myTask) {
//   let fixedTaskList = [];
//
//   for (const [index, task] of taskList.entries()) {
//     if (task.fuzzyness === 'isNotFuzzy') {
//       fixedTaskList.push(task);
//     }
//   }
//
//   let len = fixedTaskList.length;
//   for (var n=0; n<len; n++) {
//     if ((fixedTaskList[n].end() <= myTask.date)
//       && (myTask.end() <= fixedTaskList[n + 1].date)) {
//         let k = 0
//         let id = fixedTaskList[n].uniqueId;
//         for (const [index, task] of taskList.entries()) {
//           if (task.uniqueId === id) {
//             k = index;
//             break
//           }
//         }
//         taskList.splice(k + 1, 0, myTask);
//         myTask.fuzzyness = 'isNotFuzzy';
//         uniqueIdOfLastTouched = myTask.uniqueId;
//         return true;
//       }
//   }
//
//   return false;
// }



// Used by an eventListener. Govern the Edit/Clear button
function clearOrEdit() {
  editButton = document.getElementById('editButton');
  if (editButton.innerText == 'Clear') {
    resetInputBox();
    id = '';
  } else if (editButton.innerText == 'Edit') {
    editTask();
  }
}


function editTask() {
  let id = getIndexFromUniqueId(chosenTaskId);
  taskText = taskList[id].text + ' ' + taskList[id].duration / 60000 + 'm';  //  Save the text from clickedElement
  document.getElementById('inputBox').value = taskText;  // Insert text in inputBox
  taskList.splice(id, 1);
  uniqueIdOfLastTouched = taskList[id - 1].uniqueId;

  document.getElementById('editButton').innerText = 'Clear';  // Prepare Edit/Clear button for cloning
  chosenTaskId = '';
  renderTasks();
}

// Used by an eventListener. Toggles zoom.
function zoomFunc() {
  let zoomButton = document.getElementById('zoom');

  zoom = (1 + 0.5) - zoom;
  zoomSymbolModifyer = 7 - zoomSymbolModifyer;

  zoomButton.innerText = String.fromCharCode(9040 + zoomSymbolModifyer); // Toggles between \u2357 ⍐ and \u2350 ⍗

  renderTasks();
  jumpToNow();
}


function createNullTimes() {
  let jumpToId = uniqueIdOfLastTouched;

  displayList = [];
  let duration = 0;
  displayList.push(taskList[0]);
  let len = taskList.length;
  for (var n=1; n<len; n++) {
    duration = taskList[n].date.getTime() - taskList[n-1].end().getTime();
    if (duration > 0) {
      let nullTime = new Task(taskList[n-1].end(), duration, '');
      nullTime.uniqueId = taskList[n-1].uniqueId + 'n';
      nullTime.fuzzyness = 'isNullTime';
      displayList.push(nullTime);
      duration = 0;
      // taskList.splice(n, 0, nullTime);
    }
    displayList.push(taskList[n]);
  }
  // displayList.push(taskList[len - 1]);
  // console.log([].concat(displayList));


  uniqueIdOfLastTouched = jumpToId;
  return displayList
}


function displayMessage(text, displayTime) {
  console.log(text);
  msg = document.getElementById('message');
  msg.style.display = 'inline-block';
  msg.style.color = 'red';
  msg.innerText = text;

  setTimeout(function() {msg.style.display = 'none';}, displayTime)
}


function taskHasBeenClicked(event) {
  let myUniqueId = event.target.id;
  let chosenId = '';
  let id = getIndexFromUniqueId(myUniqueId); // Mostly to check for nulltimes being clicked
  if (chosenTaskId != '') {
    chosenId = getIndexFromUniqueId(chosenTaskId);
  }

  // The eventListener is tied to the parent, so the event given is the parent event
  let contentInputBox = document.getElementById('inputBox').value.trim();
  let editButton = document.getElementById('editButton');

  if (contentInputBox !== '' && !chosenTaskId) {
    // Text in inputBox and no chosenTaskId. Create new task and insert before clicked element
    let contentInputBox = document.getElementById('inputBox').value.trim();
    if (/[a-c, e-g, i-l, n-z]/.exec(contentInputBox) != null) {
      let parsedList = parseText(contentInputBox);
      let task = new Task(parsedList[0], parsedList[1], parsedList[2]);
      if (nullTimeClicked) {
        nullTimeClicked = false;
        addTaskAfter(myUniqueId, task);  // Nulltimes shares id with the task before the nulltime
      } else {
        addTaskBefore(myUniqueId, task);
      }

    } else {
      displayMessage('A task needs text ', 3000);
    }

  } else if (contentInputBox !== '' && chosenTaskId){
    // Text in inputbox and a chosenTaskId. Should not happen.
    console.log('Text in inputbox and a chosenTaskId. Should not happen.');

  }  else if (contentInputBox == '' && !chosenTaskId) {
    // No text in inputBox and no chosenTaskId: Getting ready to Edit, delete or clone
    chosenTask = document.getElementById(myUniqueId);
    // chosenTask.classList.add('isClicked'); // TODO: Affects only DOM. Make it a part of Task
    let myId = getIndexFromUniqueId(myUniqueId);
    taskList[myId].isClicked = 'isClicked'; // TODO: Unclick later
    editButton.innerText = 'Edit';
    chosenTaskId = chosenTask.id;
    uniqueIdOfLastTouched = chosenTaskId;

    // jumpTo(chosenTaskId);

  } else if (contentInputBox == '' && chosenTaskId) {
    // No text in inputBox and a chosenTaskId: Swap elements - or edit if the same task is clicked twice
    if (/[n]/.exec(myUniqueId) != null) {  // If nulltime ...
      displayMessage('Unasigned time can not be edited', 3000);
    } else if (chosenTaskId === myUniqueId) {
      editTask(); // TODO: Edit eats task
    } else if (taskList[chosenId].fuzzyness === 'isNotFuzzy' || taskList[id].fuzzyness === 'isNotFuzzy') {
      displayMessage('A fixed task can not be swapped. \nPlease edit before swap.', 3000)
    } else if (taskList[chosenId].fuzzyness === 'isFuzzy' && taskList[id].fuzzyness === 'isFuzzy') {
      swapTasks(myUniqueId);
    }
    chosenTaskId = '';
    editButton.innerText = 'Clear';
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
      console.log(index);
      return index
    }
  }
}


function swapTasks(myId) {
    let id1 = getIndexFromUniqueId(chosenTaskId);
    let id2 = getIndexFromUniqueId(myId);
    let task1 = taskList.splice(Math.min(id1, id2), 1);
    let task2 = taskList.splice(Math.max(id1, id2) - 1, 1);
    addTaskAfter(taskList[Math.min(id1, id2) - 1].uniqueId, task2[0]); // TODO: Is checking for room a good idea here?
    addTaskAfter(taskList[Math.max(id1, id2) - 1].uniqueId, task1[0]);
    uniqueIdOfLastTouched = taskList[id1].uniqueId;
    taskList[id1].isClicked = 'isNotClicked';
    taskList[id2].isClicked = 'isNotClicked';
    console.log(chosenTaskId, myId, id1, id2, uniqueIdOfLastTouched);
}


function renderTasks() {
  // Remove old task from taskDiv
  const taskNode = document.getElementById('taskDiv');
  while (taskNode.firstChild) {
    taskNode.removeChild(taskNode.lastChild);
  }

  // Remove old time markings from timeBar
  const timeNode = document.getElementById('timeDiv');
  while (timeNode.firstChild) { // Remove old task from view
    timeNode.removeChild(timeNode.lastChild);
  }

  // Make new time markings in timeBar
  fillTimeBar(zoom);

  let displayList = createNullTimes();

  // Refresh view from taskList
  for (const [index, task] of displayList.entries()) {
    // let newNode = document.createElement('div');
    let newNode = document.createElement('button');
    newNode.setAttribute('id', task.uniqueId);
    newNode.classList.add(task.fuzzyness);  // Fuzzyness is used for styling tasks
    newNode.classList.add(task.isClicked);
    newNode.classList.add('task');

    // Set the task height
    if (zoom * task.height < 20) {  // Adjust text size for short tasks
      newNode.style['font-size'] = '12px';
    } else {
      newNode.style['font-size'] = null;
    }
    newNode.style['line-height'] = zoom * task.height + 'px';
    newNode.style.height = (zoom * task.height * 100) / (24 * 60) + '%';

    let nodeText = textExtractor(task);
    let textNode = document.createTextNode(nodeText);
    newNode.appendChild(textNode);
    document.getElementById('taskDiv').insertAdjacentElement('beforeend', newNode);

  }
  // resetInputBox(); // NO reset input box needs to be elsewhere

}


function jumpTo(index) {
  if (document.getElementById('container') !== null  && taskList.length > 0) {
    container = document.getElementById('container');
    container.scrollTop = document.getElementById(index).offsetTop - 180 * zoom;
    document.getElementById('inputBox').focus();
  }
}


function jumpToNow() {
  if (document.getElementById('container') !== null  && taskList.length > 0) {
    container = document.getElementById('container');
    container.scrollTop = document.getElementById('nowSpan').offsetTop + 600 * zoom;
    document.getElementById('inputBox').focus();
  }
}


function jumpToTime(time) {
  if (document.getElementById('container') !== null  && taskList.length > 0) {
    container = document.getElementById('container');
    timeDiv = document.getElementById(time);  // time in the format of a string ex: '700'
    container.scrollTop = timeDiv.offsetTop - 180 * zoom;
    document.getElementById('inputBox').focus();
    let min = /[0-9][0-9]$/.exec(time);
    let hours = time.toString().replace(min, '')
    displayMessage('Jumped to ' + hours + ':' + min, 700);
  }
}


function textExtractor(task) {
  let text = task.text;

  if (task.duration != '') {
    let hours = Math.floor(task.duration / 3600000);
    let minutes = Math.floor((task.duration - hours * 3600000) / 60000);
    if (hours > 0 && minutes > 0) {
      text = '(' + hours + 'h' + minutes + 'm) ' + task.text;
    } else if (hours > 0) {
      text = '(' + hours + 'h' + ') ' + task.text;
    } else {
      text = '(' + minutes + 'm) ' + task.text;
    }
  }

  if (task.date != '') {
    let timeH = task.date.getHours();
    let timeM = task.date.getMinutes();
    let endTime = new Date(task.date.getTime() + task.duration);
    let endH = endTime.getHours();
    let endM = endTime.getMinutes();
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


function parseText(rawText) {
  let taskStart = '';

  let minutes = /[0-9]+m/.exec(rawText);
  if (minutes) { // If 30m is in rawText store number in minutes and remove 30m from rawText
    minutes = /[0-9]+/.exec(minutes).toString();
    rawText = rawText.replace(minutes + 'm', '')
  } else {
    minutes = '0';
  };

  let hours = /[0-9]+h/.exec(rawText);
  if (hours) { // If 2h is in rawText store number in minutes and remove 2h from rawText
    hours = /[0-9]+/.exec(hours).toString();
    rawText = rawText.replace(hours + 'h', '')
  } else {
    hours = '0';
  };

  // Make duration in milliseconds form hours and minutes
  let duration = hours * 3600000 + minutes * 60000;
  if (duration == 0) {
    duration = 30 * 60000; // If no duration is provided the task is assigned 30 minutes as default
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
    time = time.replace(timeH, '')
    timeM = /[0-9][0-9]/.exec(time).toString();
    rawText = rawText.replace(timeH + timeM, '')
    // Make new datetime from timeM and timeH
    let now = new Date();
    taskStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), timeH, timeM);  // NO need for DST shenanigans here!
  } else {
    timeM = '-1';
    timeH = '-1';
    taskStart = '';
  };


  // let drain = /d[1-5]./.exec(rawText);
  // if (/d[1-5]./.exec(drain)) {
  //   drain = /[1-5]/.exec(drain).toString();
  //   rawText = rawText.replace('d' + drain, '');
  // } else {
  //   drain = '-1';
  //   // rawText = rawText.replace('d', '');
  // };

  let text = rawText.trim();
  text = text.slice(0, 1).toUpperCase() + text.slice(1, );

  parsedList = [taskStart, duration, text];
  return parsedList;
}


// TODO: Make swapping with nullTimes possible for fuzzy tasks? Replace with nullTime and move to start of clicked nullTime
// TODO: Inserting overlapping fixed times should not be possible
// TODO: Inserting fixed time tasks ought to move fuzzy tasks out of the way

// function adjustNullTimeForSwap(myId, deltaDuration, biggest) {   // Biggest is true when the id is for the longest lasting task
//   // console.log('adjustNullTimeForSwap', myId, deltaDuration, biggest);
//   let succes = false;
//
//   if (biggest) {  // The biggest task should leave the difference in duration as a nullTime
//     for (const [index, task] of taskList.entries()) {
//       let nullStart = '';
//
//       if (task.fuzzyness == 'isNullTime' && task.blockId === taskList[myId].blockId) {
//         if (myId < index) {
//           // nullStart = taskList[index].date;
//           nullStart = new Date(taskList[index].date.getTime() - taskList[myId].duration);
//           // console.log('bop1', index, myId, taskList[index], taskList[myId], taskList);
//         } else {
//           let n = myId;
//           for (var i=0; i<100; i++) {
//             if (taskList[n].date !== '') {
//               nullStart = new Date(taskList[n].date.getTime() + taskList[n].duration);
//               break
//             }
//             n -= 1;
//           }
//         }
//         let replacementNullTime = new Task(nullStart, deltaDuration, '');
//         taskList.splice(myId, 0, replacementNullTime);  // Insert replacementNullTime before task
//         succes = true;
//         myId = Number(myId) + 1; // TODO: This needs fixing with an if.   Edit: Or does it?
//         break;
//       }
//     }
//   } else {  // The smallest task should shrink the nearest nullTime by deltaDuration
//     for (const [index, task] of taskList.entries()) {
//       if (task.fuzzyness == 'isNullTime' && task.blockId === taskList[myId].blockId) {
//         if (index < myId && taskList[index].duration > deltaDuration) {
//           taskList[index].duration -= deltaDuration;
//           succes = true;
//           break;
//         } else if (index > myId && taskList[index].duration > deltaDuration) {
//           // console.log('task.date', taskList[index].date, taskList[index].duration, taskList);
//           let newNullStart = new Date(task.date.getTime() + Math.abs(deltaDuration));
//           taskList[index].date = newNullStart;
//           taskList[index].duration -= Math.abs(deltaDuration);
//           // console.log('task.date',taskList[index].date, taskList[index].duration, taskList);
//           succes = true;
//           myId = Number(myId) + 1;
//           break;
//         }
//       }
//     }
//   }
//   if (!succes) {
//     displayMessage('Not enough room for a swap ', 3000)
//   }
//   return myId;
// }


//   if (task1.fuzzyness === 'isFuzzy' && task2.fuzzyness === 'isFuzzy') {  // Swap if fuzzy tasks
//     if (task1.duration === task2.duration || task1.blockId === task2.blockId) {  // If tasks are same duration or in same block, just swap
//       [taskList[myId], taskList[chosenTaskId]] = [taskList[chosenTaskId], taskList[myId]];  // [task1, task2] = [task2, task1] only swaps the copies... Argh.
//     } else {
//       let deltaDuration = Math.abs(task1.duration - task2.duration);
//       chosenTaskId = adjustNullTimeForSwap(chosenTaskId, deltaDuration, task1.duration > task2.duration);
//       myId = adjustNullTimeForSwap(myId, deltaDuration, task1.duration < task2.duration);
//       [taskList[myId], taskList[chosenTaskId]] = [taskList[chosenTaskId], taskList[myId]];  // [task1, task2] = [task2, task1] only swaps the copies... Argh.
//     }
// } else if (task1.fuzzyness === 'isNotFuzzy' || task2.fuzzyness === 'isNotFuzzy') {
//     displayMessage('Fixed tasks can not participate in a swap', 3000);
//   }


// function replaceTaskWithNullTime(myId) {
//   let cumulatedDuaration = 0;
//   for (const [index, task] of taskList.entries()) {  // Find the total time before the clicked task
//     if (index < myId) {
//       cumulatedDuaration += task.duration;
//     }
//   }
//   let hours = Math.floor(cumulatedDuaration / 3600000);
//   let minutes = Math.floor((cumulatedDuaration - hours * 3600000) / 60000);
//   // Create new nullTime to replace task
//   let now = new Date();
//   let nullStartMinusDst = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
//   let nullStart = new Date(nullStartMinusDst.getTime() + 0 * dstOffset);
//   let replacementNullTime = new Task(nullStart, taskList[myId].duration, '');
//
//   taskList.splice(myId, 1, replacementNullTime);  // Insert replacementNullTime before task and remove task
//   assignBlock();
// }
//
// function collapseAllNullTimes() {
//   let nullTimeAvailable = 0;
//   let nullTimeIds = [];
//   let currentBlockId = 0;
//   for (const [index, task] of taskList.entries()) {
//     if (index > 0 && task.fuzzyness === 'isNullTime' && task.blockId === currentBlockId) {
//       nullTimeIds.push(index);
//       nullTimeAvailable += task.duration;
//     }
//     if (index > 0 && taskList[index].blockId === -1 || index === taskList.length - 1) {  // If a fixedTimeTask is reached..
//       // collect the nullTimes in the block if there is more than one
//       if (nullTimeIds.length > 1) {
//         let lastId = nullTimeIds.pop();  // Get the id of the last nullTime in the block ...
//         taskList[lastId].date = new Date(taskList[lastId].date.getTime() + taskList[lastId].duration - nullTimeAvailable);
//         taskList[lastId].duration = nullTimeAvailable;  // ... and set its duration equal to the available nullTime
//
//         removeId = nullTimeIds[0];  // The ids will change, so fix the lower one ...
//         for (const [foo, bar] of nullTimeIds.entries()) {
//           taskList.splice(removeId, 1);  // ... and delete the collected nullTimes
//         }
//       }
//       nullTimeAvailable = 0;  // ... restart available nullTime count
//       nullTimeIds = [];  // And restart nullTimeIds goddammit
//       // currentBlockId += 1; // ... and focus on the next block
//       if (index + 1 < taskList.length){
//         currentBlockId = taskList[index + 1].blockId;  // and focus on next block
//       }
//     }
//   }
//
//   for (const [index, task] of taskList.entries()) {
//     if (task.duration < 59999) {  // Remove all tasks with duration less than a minute
//       taskList.splice(index, 1);
//     }
//   }
// }

// function addTask(myId, parsedList) {
//   let task = '';
//   let notRoomEnough = true;
//   let blockId = -1;  // -1 --> insert first available slot
//   if (myId !== '') {
//     blockId = taskList[myId].blockId;
//   }
//   notRoomEnough = checkFreeTime(blockId, parsedList[1]);
//   if (notRoomEnough) {
//     displayMessage('Not room enough. \n Please clear some space ', 3000);
//     return
//   }
//   if (parsedList[0] === '') {
//     task = new Task(taskList[taskList.length - 1].end(), parsedList[1], parsedList[2]);
//     task.fuzzyness = 'isFuzzy';
//   } else {
//     task = new Task(parsedList[0], parsedList[1], parsedList[2]);
//     task.fuzzyness = 'isNotFuzzy';
//   }
//   taskList.push(task);
//   console.log(task.text);
// }

// function checkFreeTime(blockId, duration) {
//   for (const [index, task] of nullTimeList.entries()) {
//     if (blockId = -1 || task.blockId === blockId) {
//       if (task.duration >= duration) {
//         return false
//       }
//     }
//   }
// }

// function stripNullTimes() {
  //   let copyList = taskList;
  //   for (const [index, task] of taskList.entries()) {
    //     console.log(index);
    //     if (task.fuzzyness === 'isNullTime') {
      //       copyList.splice(index, 1)
      //     }
      //   }
      //   taskList = copyList;
      // }

      // Add a new task


      // function insertTask(parsedList, myId) {  // If myId = '' add task at first available nullTime
        //   let newTaskDuration = parsedList[1];
        //
        //   let succes = false;
        //   nullTimeAvailable = 0;
        //   if (myId === '') {
          //     for (const [index, task] of taskList.entries()) {
            //       if (task.fuzzyness === 'isNullTime' && newTaskDuration <= task.duration && index > 0) {
              //         taskList[index].date = new Date(task.date.getTime() + newTaskDuration);  // Change starting time for nullTime
              //         task.duration -= newTaskDuration;  // Shrink the nullTime
              //         // Make the new task ...
              //         let newTask = new Task(parsedList[0], parsedList[1], parsedList[2]);
              //
              //         //  Id provided: insert the new task before clicked task
              //         taskList.splice(index, 0, newTask);  // Insert the new task before chosen nullTime
              //         succes = true;
              //         jumpTo(index);
              //         break
              //       }
              //     }
              //   } else {    // If placement is important (myId is provided) check if there is room enough in block
                //
                //     // Add up available nullTime in same block or block before
                //     let myBlockId = taskList[myId].blockId;
                //     let id = myId;
                //     while (myBlockId === -1) {
                  //       id -= 1;
                  //       myBlockId = taskList[id].blockId;
                  //     }
                  //     for (const [index, task] of taskList.entries()) {  // Add up available nullTime
                    //       if (task.fuzzyness === 'isNullTime' && task.blockId === myBlockId) {
                      //         nullTimeAvailable += task.duration;
                      //       }
                      //     }
                      //
                      //     if (nullTimeAvailable >= newTaskDuration) {
                        //       for (const [index, task] of taskList.entries()) {
                          //         // Find the first nullTime slot
                          //         if (task.fuzzyness === 'isNullTime' && newTaskDuration > task.duration && task.blockId === myBlockId) { // If task duration is bigger than the found nullTime...
                            //           taskList.splice(index, 1); // ... remove nullTime
                            //           newTaskDuration -= task.duration;  // ... and shrink the chunk to be taken out of the next nullTime
                            //         } else if (task.fuzzyness === 'isNullTime' && newTaskDuration <= task.duration && task.blockId === myBlockId) {
                              //           if (myId <= index) {  // If new task is to be inserted before the clicked nullTime
                                //             taskList[index].date = new Date(task.date.getTime() + newTaskDuration);  // Change starting time for nullTime
                                //           }
                                //           task.duration -= newTaskDuration;  // Shrink the nullTime
                                //           // Make the new task ...
                                //           let newTask = new Task(parsedList[0], parsedList[1], parsedList[2]);
                                //
                                //           //  Id provided: insert the new task before clicked task
                                //           taskList.splice(myId || index, 0, newTask);  // No id provided: insert the new task before chosen nullTime
                                //           succes = true;
                                //           jumpTo(index);
                                //           break
                                //         }
                                //       }
                                //     }
                                //   }
                                //
                                //   if (!succes) {  // If there isn't enough room for a fixTimeTask flash a waring
                                  //     // editButton.dataset.keep_text = 'true';
                                  //     displayMessage('Not enough room here\n Please clear some space ', 3000);
                                  //     return succes;
                                  //   }
                                  //
                                  //   renderTasks();
                                  //   resetInputBox();
                                  // }
                                  //
                                  // function insertFixTimeTask(parsedList) {
                                    //   let succes = false;
                                    //   let id = 1;
                                    //   for (const [index, task] of taskList.entries()) {
                                      //     if (task.fuzzyness == 'isNullTime') { // Find first nullTime slot
                                        //       let newFixedTimeTask = new Task(parsedList[0], parsedList[1], parsedList[2]);
                                        //       let nullTimeEnd = new Date(task.date.getTime() + task.duration);
                                        //       if ((task.date <= newFixedTimeTask.date) && (newFixedTimeTask.duration <= task.duration) && (newFixedTimeTask.date < nullTimeEnd)) {
                                          //         null1Duration = newFixedTimeTask.date - task.date;
                                          //         let null1 = new Task(task.date, null1Duration, '');  //, task.blockId)
                                          //
                                          //         null2Duration = task.date.getTime() + task.duration - newFixedTimeTask.date.getTime() - newFixedTimeTask.duration;
                                          //         let endTime = new Date(newFixedTimeTask.date.getTime() + newFixedTimeTask.duration);
                                          //         let null2 = new Task(endTime, null2Duration, '');
                                          //
                                          //         taskList.splice(index, 1, null1, newFixedTimeTask, null2);
                                          //         id = index + 1;
                                          //         succes = true;
                                          //       }
                                          //     }
                                          //   }
                                          //   if (!succes) {  // If there isn't enough room for a fixTimeTask flash a waring
                                            //     // editButton.dataset.keep_text = 'true';
                                            //     displayMessage('\nNot enough room\n Please clear some space\n', 3000);
                                            //   }
                                            //   resetInputBox();
                                            //   renderTasks();
                                            //   jumpTo(id);
                                            // }
