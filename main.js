var taskList = [];  // List to keep track of the order of the tasks
let chosenTaskId = '';  // When a task is clicked information about that task is stored here
let zoom = 0.5;  // The height of all elements will be multiplied with zoom. Values can be 1 or 0.5
let zoomSymbolModifyer = 7; // The last digit of the \u numbers \u2357 ⍐ and \u2350 ⍗
let wakeUpH = 7;  // The hour your day start according to settings (todo)
let wakeUpM = 0;  // The minutes your day start according to settings

// Daylight saving time shenanigans
let today = new Date();
let january = new Date(today.getFullYear(), 0, 1);
let july = new Date(today.getFullYear(), 6, 1);
const dstOffset = (july.getTimezoneOffset() - january.getTimezoneOffset()) * 60000; // Daylight saving time offset in ms
// A list of unique numbers to use as task-ids
// blockIdList = [117, 9030, 2979, 7649, 700, 3099, 1582, 4392, 3880, 5674, 8862, 5220, 9349, 6299, 1367, 4317, 9225, 1798, 7571, 4609, 6907, 1194, 9487, 9221, 2763, 1553, 128, 1318, 8762, 4974, 6508, 5277, 8256, 3863, 2860, 1904, 1218, 3932, 3615, 7110, 6770, 9075, 5270, 9184, 2702, 1039, 3420, 8488, 5522, 6071, 7870, 740, 2866, 8387, 3628, 5684, 9356, 6843, 9239, 9137, 9114, 5203, 8243, 9374, 9505, 9351, 7053, 4414, 8847, 5835, 9669, 9216, 7724, 5834, 9295, 1948, 8617, 9822, 5452, 2651, 5616, 4355, 1910, 2591, 8171, 7415, 7456, 2431, 4051, 4552, 9965, 7528, 911, 734, 6896, 249, 7375, 1035, 8613, 8836];

// Task-object. Each task will be an object of this type
function Task(date, duration, text) {
  this.date = date; // Start time as Javascript date
  this.duration = duration; // Duration in milliseconds
  this.text = text;
  // this.blockId = blockId;

  this.height = function() { // Pixelheight is 1 minute = 1 px
    return this.duration / 60000
  }

  this.fuzzyness = function() {
    if (this.text == '') {  // No text
      return 'isNullTime'  // Tasks without text and start time is used as available time. NullTime sounds funny, hench the name
    } else if (this.date == '') { // No starttime, but text
      return 'isFuzzy'
    } else {  // Start time and text, i.e. a fixed appointment
      return 'isNotFuzzy'
    }
  }
}

// Runs when the page is loaded:
function setUpFunc() {
  // Fill the timeBar div
  fillTimeBar(zoom);

  // Create time marker to show current time on timebar
  let nowSpan = document.createElement('span');
  nowSpan.setAttribute('id', 'nowSpan');
  document.getElementById('container').appendChild(nowSpan);
  updateTimeMarker();

  // Create 24h nullTime
  let now = new Date();
  let fullNullStartMinusDst = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 1);
  let fullNullStart = new Date(fullNullStartMinusDst.getTime() + 0 * dstOffset)
  let day24h = 24 * 3600 * 1000 - 120000;  // Milliseconds in a day minus two minutes
  let startNullTime = new Task(fullNullStart, day24h, '');
  taskList.push(startNullTime);

  // Make debug example tasks
  debugExamples();

  renderTasks();  // Draws task based on the content of the taskList
  resetInputBox();
  zoomFunc();
}

function debugExamples() {
  exList = [
    '1130 debugging example',
    '1200 1h lunch',
    // '1h long1',
    // '45m medium1',
    '30m short1',
    '1530 1h tea',
    // '1h long2' ,
    // '45m medium2',
    // '30m short2'
  ]

  for (const [index, text] of exList.entries()) {
    addTask('', parseText(text.trim()));
  }
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
    halfHourB.setAttribute('class', 'halfHours' + zoom * 2);
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

// Insert a 15 min planning task at start-your-day time according to settings (todo)
document.getElementById('upButton').addEventListener('click', wakeUpButton, {once:true});
document.getElementById('upButton').addEventListener('click', function() {jumpTo(1);});

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
  let now = new Date();
  taskStartMinusDst = new Date(now.getFullYear(), now.getMonth(), now.getDate(), wakeUpH, wakeUpM);
  taskStart = new Date(taskStartMinusDst.getTime() + 0 * dstOffset); // TODO: Remove dstOffset?
  insertFixTimeTask([taskStart, 15 * 60000, 'Planning']);
  document.getElementById('upButton').innerText = '\u25B8' + wakeUpH + ':' + wakeUpM;
  document.getElementById('nowButton').removeEventListener('click', nowButton, {once:true});
  document.getElementById('nowButton').innerText = '\u25B8' + 'Now';
  resetInputBox();
}

// Used by an eventListener. Inserts a 15 min planning task at the current time
function nowButton() {
  let now = new Date();
  insertFixTimeTask([now, 15 * 60000, 'Planning']);
  document.getElementById('nowButton').innerText = '\u25B8' + 'Now';
  document.getElementById('upButton').removeEventListener('click', wakeUpButton, {once:true});
  document.getElementById('upButton').innerText = '\u25B8' + wakeUpH + ':' + wakeUpM;
}

// Used by an eventListener. Makes pressing Enter add task
function inputAtEnter(event) {
  if (event.key === 'Enter') {
    let contentInputBox = document.getElementById('inputBox').value.trim();
    if (/[a-c, e-g, i-l, n-z]/.exec(contentInputBox) != null) {  // TODO: Bug if '1200 40m' is entered without text
      let parsedList = parseText(contentInputBox);
      if (taskList.length == 1 && parsedList[0] == '') {
        displayMessage('\nPlease start planning with a fixed time \n\nEither press "Now" or add a task at\n6:00 by typing "600 15m planning"\n', 5000);
      } else {
        let myId = '';  // By leaving myId empty the task will be added at the beginning of first available nullTime
        addTask(myId, parsedList);
        renderTasks();
      }
    } else {
      displayMessage('A task needs text ', 3000);
    }
  }
}

// Used by an eventListener. Govern the Edit/Clear button
function clearOrEdit() {
  editButton = document.getElementById('editButton');
  if (editButton.innerText == 'Clear') {
    resetInputBox();
    chosenTaskId = '';
    // editButton.dataset.keep_text = 'false';
  } else if (editButton.innerText == 'Edit') {
    taskText = taskList[chosenTaskId].text + ' ' + taskList[chosenTaskId].duration / 60000 + 'm';  //  Save the text from clickedElement
    document.getElementById('inputBox').value = taskText;  // Insert text in inputBox

    // Give task back the time as nullTime  // TODO: Could replaceTaskWithNullTime(myId) be used here?
    taskList[chosenTaskId].text = '';  // ... by removing the text
    let now = new Date();
    let startTimeMinusDst = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 1);
    let startTime = new Date(startTimeMinusDst.getTime() + dstOffset);
    for (const [index, task] of taskList.entries()) {
      if (index < chosenTaskId) {
        startTime = new Date(startTime.getTime() + task.duration);
      }
    }
    taskList[chosenTaskId].date = startTime;

    document.getElementById('editButton').innerText = 'Clear';  // Prepare Edit/Clear button for cloning
    chosenTaskId = '';
    // editButton.dataset.keep_text = 'true';
    renderTasks();
  }
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

// Add a new task
function addTask(myId, parsedList) {
  if (parsedList[0] == '') {  // No fixed time ...
    insertTask(parsedList, myId);
  } else {
    insertFixTimeTask(parsedList);
  }
}

// TODO: Fixate fixTimeTask so it can't be swapped and check if there is nullTime enough to insert at myId
function insertTask(parsedList, myId) {  // If myId = '' add task at first available nullTime
  let newTaskDuration = parsedList[1];

  let succes = false;
  nullTimeAvailable = 0;
  if (myId === '') {
    for (const [index, task] of taskList.entries()) {
      if (task.fuzzyness() === 'isNullTime' && newTaskDuration < task.duration && index > 0) {
        taskList[index].date = new Date(task.date.getTime() + newTaskDuration);  // Change starting time for nullTime
        task.duration -= newTaskDuration;  // Shrink the nullTime
        // Make the new task ...
        let newTask = new Task(parsedList[0], parsedList[1], parsedList[2]);

        //  Id provided: insert the new task before clicked task
        taskList.splice(index, 0, newTask);  // Insert the new task before chosen nullTime
        succes = true;
        jumpTo(index);
        break
      }
    }
  } else {    // If placement is important (myId is provided) check if there is room enough in block
    for (const [index, task] of taskList.entries()) {
      if (task.fuzzyness() === 'isNullTime' && task.blockId === taskList[myId].blockId) {
        nullTimeAvailable += task.duration;
      }
    }
    if (nullTimeAvailable > newTaskDuration) {
      for (const [index, task] of taskList.entries()) {
        // Find the first nullTime slot
        if (task.fuzzyness() === 'isNullTime' && newTaskDuration > task.duration && index > 0) { // If task duration is bigger than the found nullTime...
          taskList.splice(index, 1); // ... remove nullTime
          newTaskDuration -= task.duration;  // ... and shrink the chunk to be taken out of the next nullTime
        } else if (task.fuzzyness() === 'isNullTime' && newTaskDuration < task.duration && index > 0) {
          if (myId <= index) {  // If new task is to be inserted before the clicked nullTime
            taskList[index].date = new Date(task.date.getTime() + newTaskDuration);  // Change starting time for nullTime
          }
          task.duration -= newTaskDuration;  // Shrink the nullTime
          // Make the new task ...
          let newTask = new Task(parsedList[0], parsedList[1], parsedList[2]);

          //  Id provided: insert the new task before clicked task
          taskList.splice(myId || index, 0, newTask);  // No id provided: insert the new task before chosen nullTime
          succes = true;
          jumpTo(index);
          break
        }
      }
    }
  }

  if (!succes) {  // If there isn't enough room for a fixTimeTask flash a waring
    // editButton.dataset.keep_text = 'true';
    displayMessage('Not enough room here\n Please clear some space ', 3000);
    return succes;
  }

  renderTasks();
  resetInputBox();
}

function insertFixTimeTask(parsedList) {
  let succes = false;
  let id = 1;
  for (const [index, task] of taskList.entries()) {
    if (task.fuzzyness() == 'isNullTime') { // Find first nullTime slot
      let newFixedTimeTask = new Task(parsedList[0], parsedList[1], parsedList[2]);
      let nullTimeEnd = new Date(task.date.getTime() + task.duration);
      if ((task.date <= newFixedTimeTask.date) && (newFixedTimeTask.duration < task.duration) && (newFixedTimeTask.date < nullTimeEnd)) {
        null1Duration = newFixedTimeTask.date - task.date;
        let null1 = new Task(task.date, null1Duration, '');  //, task.blockId)

        null2Duration = task.date.getTime() + task.duration - newFixedTimeTask.date.getTime() - newFixedTimeTask.duration;
        let endTime = new Date(newFixedTimeTask.date.getTime() + newFixedTimeTask.duration);
        let null2 = new Task(endTime, null2Duration, '');

        taskList.splice(index, 1, null1, newFixedTimeTask, null2);
        id = index + 1;
        succes = true;
      }
    }
  }
  if (!succes) {  // If there isn't enough room for a fixTimeTask flash a waring
    // editButton.dataset.keep_text = 'true';
    displayMessage('\nNot enough room\n Please clear some space\n', 3000);
  }
  resetInputBox();
  renderTasks();
  jumpTo(id);
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
  let myId = event.target.id;  // myId is the id of the clicked task. (Duh)
  // The eventListener is tied to the parent, so the event given is the parent event
  let contentInputBox = document.getElementById('inputBox').value.trim();
  let editButton = document.getElementById('editButton');

  if (contentInputBox !== '' && !chosenTaskId) {
    // Text in inputBox and no chosenTaskId. Create new task and insert before clicked element
    let contentInputBox = document.getElementById('inputBox').value.trim();
    if (/[a-c, e-g, i-l, n-z]/.exec(contentInputBox) != null) {
      let parsedList = parseText(contentInputBox);
      addTask(myId, parsedList);
    } else {
      displayMessage('A task needs text ', 3000);
    }
  } else if (contentInputBox !== '' && chosenTaskId){
    // Text in inputbox and a chosenTaskId. Should not happen.
    console.log('Text in inputbox and a chosenTaskId. Should not happen.');
  }  else if (contentInputBox == '' && !chosenTaskId) {
    // No text in inputBox and no chosenTaskId: Getting ready to Edit, delete or clone
    chosenTask = document.getElementById(myId);
    chosenTask.classList.add('isClicked');
    chosenTaskId = chosenTask.id;

    editButton.innerText = 'Edit';
    // editButton.dataset.keep_text = 'true' // If a task is chosen it can mean swap or edit/clone/delete
  } else if (contentInputBox == '' && chosenTaskId) {
    // No text in inputBox and a chosenTaskId: Swap elements - or edit if the same task is clicked twice
    if (chosenTaskId === myId) {
      console.log('rap');
      taskText = taskList[chosenTaskId].text + ' ' + taskList[chosenTaskId].duration / 60000 + 'm';  //  Save the text from clickedElement
      document.getElementById('inputBox').value = taskText;  // Insert text in inputBox
      document.getElementById('inputBox').focus();
      replaceTaskWithNullTime(myId);
    } else {
      swapTasks(myId);
    }

    // TODO: Make swapping with nullTimes possible for fuzzy tasks? Replace with nullTime and move to start of clicked nullTime

    chosenTaskId = '';
    editButton.innerText = 'Clear';
    // resetInputBox();  // TODO: Still nescessary?
    renderTasks();  // TODO: Still nescessary?
  }

  // if (!editButton.dataset.keep_text) {
  //   resetInputBox();
  // }
  // resetInputBox();
}

// TODO: Inserting overlapping fixed times should not be possible

function adjustNullTimeForSwap(myId, deltaDuration, biggest) {   // Biggest is true when the id is for the longest lasting task
  // console.log('adjustNullTimeForSwap', myId, deltaDuration, biggest);
  let succes = false;

  if (biggest) {  // The biggest task should leave the difference in duration as a nullTime
    for (const [index, task] of taskList.entries()) {
      let nullStart = '';

      if (task.fuzzyness() == 'isNullTime' && task.blockId === taskList[myId].blockId) {
        if (myId < index) {
          // nullStart = taskList[index].date;
          nullStart = new Date(taskList[index].date.getTime() - taskList[myId].duration);
          // console.log('bop1', index, myId, taskList[index], taskList[myId], taskList);
        } else {
          let n = myId;
          for (var i=0; i<100; i++) {
            if (taskList[n].date !== '') {
              nullStart = new Date(taskList[n].date.getTime() + taskList[n].duration);
              break
            }
            n -= 1;
          }
        }
        let replacementNullTime = new Task(nullStart, deltaDuration, '');
        taskList.splice(myId, 0, replacementNullTime);  // Insert replacementNullTime before task
        succes = true;
        myId = Number(myId) + 1; // TODO: This needs fixing with an if
        break;
      }
    }
  } else {  // The smallest task should shrink the nearest nullTime by deltaDuration
    for (const [index, task] of taskList.entries()) {
      if (task.fuzzyness() == 'isNullTime' && task.blockId === taskList[myId].blockId) {
        if (index < myId && taskList[index].duration > deltaDuration) {
          taskList[index].duration -= deltaDuration;
          succes = true;
          break;
        } else if (index > myId && taskList[index].duration > deltaDuration) {
          // console.log('task.date', taskList[index].date, taskList[index].duration, taskList);
          let newNullStart = new Date(task.date.getTime() + Math.abs(deltaDuration));
          taskList[index].date = newNullStart;
          taskList[index].duration -= Math.abs(deltaDuration);
          // console.log('task.date',taskList[index].date, taskList[index].duration, taskList);
          succes = true;
          myId = Number(myId) + 1;
          break;
        }
      }
    }
  }
  if (!succes) {
    displayMessage('Not enough room for a swap ', 3000)
  }
  return myId;
}

function swapTasks(myId) {   // TODO: Bug when small task is swapped with big task, but not the other way around
  let task1 = taskList[chosenTaskId];
  let task2 = taskList[myId];
  if (task1.fuzzyness() === 'isFuzzy' && task2.fuzzyness() === 'isFuzzy') {  // Swap if fuzzy tasks
    if (task1.duration === task2.duration || task1.blockId === task2.blockId) {  // If tasks are same duration or in same block, just swap
      [taskList[myId], taskList[chosenTaskId]] = [taskList[chosenTaskId], taskList[myId]];  // [task1, task2] = [task2, task1] only swaps the copies... Argh.
    } else {
      let deltaDuration = Math.abs(task1.duration - task2.duration);
      chosenTaskId = adjustNullTimeForSwap(chosenTaskId, deltaDuration, task1.duration > task2.duration);
      myId = adjustNullTimeForSwap(myId, deltaDuration, task1.duration < task2.duration);
      [taskList[myId], taskList[chosenTaskId]] = [taskList[chosenTaskId], taskList[myId]];  // [task1, task2] = [task2, task1] only swaps the copies... Argh.
    }

  //   // Don't swap if one task is a fixed task. Instead move fuzzy task after fixed task if fixed task is clicked first...
  // } else if (task1.fuzzyness() === 'isNotFuzzy' && task2.fuzzyness() === 'isFuzzy') {
  //   parsedList = [task2.date, task2.duration, task2.text];
  //   let succes = insertTask(parsedList, (Number(chosenTaskId) + 1).toString());
  //   if (succes) {
  //     replaceTaskWithNullTime(myId);
  //   }
  //
  //   //  ...and before the fixed task if the fixed task is clicked last
  // } else if (task1.fuzzyness() === 'isFuzzy' && task2.fuzzyness() === 'isNotFuzzy') {
  //   parsedList = [task1.date, task1.duration, task1.text];
  //   let succes = insertTask(parsedList, myId);
  //   if (succes) {
  //     replaceTaskWithNullTime(chosenTaskId);
  //   }

} else if (task1.fuzzyness() === 'isNotFuzzy' || task2.fuzzyness() === 'isNotFuzzy') {
    displayMessage('Fixed tasks can not participate in a swap', 3000);
  }
}

function replaceTaskWithNullTime(myId) {
  let cumDuration = 0;
  for (const [index, task] of taskList.entries()) {
    if (index < myId) {
      cumDuration += task.duration;
    }
  }
  let hours = Math.floor(cumDuration / 3600000);
  let minutes = Math.floor((cumDuration - hours * 3600000) / 60000);
  // Create new nullTime to replace task
  let now = new Date();
  let nullStartMinusDst = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  let nullStart = new Date(nullStartMinusDst.getTime() + dstOffset);
  let replacementNullTime = new Task(nullStart, taskList[myId].duration, '');

  taskList.splice(myId, 1, replacementNullTime);  // Insert replacementNullTime before task and remove task
}

function collapseAllNullTimes() {
  let nullTimeAvailable = 0;
  let nullTimeIds = [];
  let currentBlockId = 0;
  for (const [index, task] of taskList.entries()) {
    if (index > 0 && task.fuzzyness() === 'isNullTime' && task.blockId === currentBlockId) {
      nullTimeIds.push(index);
      nullTimeAvailable += task.duration;
    }
    if (index > 0 && taskList[index].blockId === -1 || index === taskList.length - 1) {  // If a fixedTimeTask is reached..
      // collect the nullTimes in the block if there is more than one
      if (nullTimeIds.length > 1) {
        let lastId = nullTimeIds.pop();  // Get the id of the last nullTime in the block ...
        taskList[lastId].date = new Date(taskList[lastId].date.getTime() + taskList[lastId].duration - nullTimeAvailable);
        taskList[lastId].duration = nullTimeAvailable;  // ... and set its duration equal to the available nullTime
        for (const [index, id] of nullTimeIds.entries()) {
          taskList.splice(id, 1);  // Delete the collected nullTimes
        }
      }
      nullTimeAvailable = 0;  // ... restart available nullTime count
      nullTimeIds = [];  // And restart nullTimeIds goddammit
      // currentBlockId += 1; // ... and focus on the next block
      if (index + 1 < taskList.length){
        currentBlockId = taskList[index + 1].blockId;  // and focus on next block
      }
    }
  }

  for (const [index, task] of taskList.entries()) {
    if (task.duration < 59999) {  // Remove all tasks with duration less than a minute
      taskList.splice(index, 1);
    }
  }
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

  // Assing block number to each task
  assignBlock();

  // Collapse nullTimes in same block
  collapseAllNullTimes();

  // Refresh view from taskList
  for (const [index, task] of taskList.entries()) {
    // let newNode = document.createElement('div');
    let newNode = document.createElement('button');
    newNode.setAttribute('id', index);
    newNode.classList.add(task.fuzzyness());  // Fuzzyness is used for styling tasks
    if (task.fuzzyness() === 'isNullTime') {
      newNode.classList.add('dontTouch');  // TODO: Check how cursor: not-allowed and pointer-events: none works
    }
    newNode.classList.add('task');

    // Set the task height
    if (zoom * task.height() < 20) {  // Adjust text size for short tasks
      newNode.style['font-size'] = '12px';
    } else {
      newNode.style['font-size'] = null;
    }
    newNode.style['line-height'] = zoom * task.height() + 'px';
    newNode.style.height = (zoom * task.height() * 100) / (24 * 60) + '%';

    let nodeText = textExtractor(task);
    let textNode = document.createTextNode(nodeText);
    newNode.appendChild(textNode);
    document.getElementById('taskDiv').insertAdjacentElement('beforeend', newNode);

  // }
  // jumpTo(index);
  }
}

function assignBlock() {
  let blockId = 0;
  for (const [index, task] of taskList.entries()) {
    if (task.fuzzyness() === 'isNotFuzzy') {
      task.blockId = -1;
      blockId += 1;
    } else {
      task.blockId = blockId;
    }
  }
}

function jumpTo(index) {
  if (document.getElementById('container') !== null  && taskList.length > 0) {
    container = document.getElementById('container');
    container.scrollTop = document.getElementById(index).offsetTop - 180 * zoom;
    resetInputBox();
  }
}

function jumpToNow() {
  if (document.getElementById('container') !== null  && taskList.length > 0) {
    container = document.getElementById('container');
    container.scrollTop = document.getElementById('nowSpan').offsetTop + 500 * zoom;
    resetInputBox();
  }
}

// TODO: textExtractor and renderTasks should add time to not-fixTimeTasks
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
