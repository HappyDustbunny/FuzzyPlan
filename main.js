var taskList = [];  // List to keep track of the order of the tasks
let chosenTaskId = '';  // When a task is clicked information about that task is stored here
let zoom = 1;  // The height of all elements will be multiplied with zoom. Values can be 1 or 0.5
// A list of unique numbers to use as task-ids
blockIdList = [117, 9030, 2979, 7649, 700, 3099, 1582, 4392, 3880, 5674, 8862, 5220, 9349, 6299, 1367, 4317, 9225, 1798, 7571, 4609, 6907, 1194, 9487, 9221, 2763, 1553, 128, 1318, 8762, 4974, 6508, 5277, 8256, 3863, 2860, 1904, 1218, 3932, 3615, 7110, 6770, 9075, 5270, 9184, 2702, 1039, 3420, 8488, 5522, 6071, 7870, 740, 2866, 8387, 3628, 5684, 9356, 6843, 9239, 9137, 9114, 5203, 8243, 9374, 9505, 9351, 7053, 4414, 8847, 5835, 9669, 9216, 7724, 5834, 9295, 1948, 8617, 9822, 5452, 2651, 5616, 4355, 1910, 2591, 8171, 7415, 7456, 2431, 4051, 4552, 9965, 7528, 911, 734, 6896, 249, 7375, 1035, 8613, 8836];

// Task-object. Each task will be an object of this type
function Task(date, duration, text, blockId) {
  this.date = date; // Start time as Javascript date
  this.duration = duration; // Duration in milliseconds
  this.text = text;
  this.blockId = blockId;

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
  // Makes task area on most of the right side of the screen

  let taskDiv = document.createElement('div');
  taskDiv.setAttribute('id', 'taskDiv');
  document.getElementById('container').appendChild(taskDiv);

  // Makes time bar in the left side
  // First the container...
  let timeDiv = document.createElement('div');
  timeDiv.setAttribute('id', 'timeDiv');
  document.getElementById('container').appendChild(timeDiv);

  // ... and then fill the container
  fillTimeBar(zoom);

  // Create time marker to show current time on timebar
  let nowSpan = document.createElement('span');
  nowSpan.setAttribute('class', 'nowSpan');
  document.getElementById('container').appendChild(nowSpan);
  updateTimeMarker();

  // Create 24h nullTime
  let now = new Date();
  let fullNullStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 1);
  let day24h = 24 * 3600 * 1000 - 120000;  // Milliseconds in a day minus two minutes
  let startNullTime = new Task(fullNullStart, day24h, '', blockIdList.pop());
  taskList.push(startNullTime);

  renderTasks();  // Draws task based on the content of the taskList
  resetInputBox();
  zoomFunc();
}


function fillTimeBar(zoom) {
  // Fill the half hour time slots of the timebar
  for (let i = 0; i < 24; i += 1) {
    let halfHourA = document.createElement('div');
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
let timer = setInterval(updateTimeMarker, 600);

function updateTimeMarker() {
  let now = new Date();
  // The height of the nowSpan is set to the percentage the passed time reprecents of the number of minutes in a day
  let nowHeight = zoom * ((now.getHours() * 60 + now.getMinutes()) * 100 ) / (24*60) + '%';
  nowSpanElement = document.getElementsByClassName('nowSpan');
  nowSpanElement[0].style.height = nowHeight;
  console.log(nowHeight);
}

// Clear input box and give it focus
function resetInputBox() {
  document.getElementById('inputBox').value = '';
  document.getElementById('inputBox').focus();
}

// Toggles zoom
let zoomButton = document.getElementById('zoom');
zoomButton.addEventListener('click', zoomFunc);

function zoomFunc() {
  if (zoom == 1) {
    zoom = 0.5;
    zoomButton.innerText = '⍐'; //'&#x2357;';
  } else {
    zoom = 1;
    zoomButton.innerText = '⍗'; // &#x2350;';
  }
  renderTasks();
}

// Makes pressing Enter add task
let inputBox = document.getElementById('inputBox');
inputBox.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    let myId = '';  // By leaving myId empty the task will be added at the beginning of first available nullTime
    addTask(myId);
    renderTasks();
  }
});

// let container = document.getElementById('container');  // Testing purposes. Remove when forgotten.
// container.addEventListener('scroll', function (e) {console.log(container.scrollTop);})

// Govern the Edit/Clear button
function clearOrEdit() {
  editButton = document.getElementById('editButton');
  if (editButton.innerText == 'Clear') {
    resetInputBox();
    chosenTaskId = '';
    editButton.dataset.clonemode = 'false';
  } else if (editButton.innerText == 'Edit') {
    taskText = taskList[chosenTaskId].text;  //  Save the text from clickedElement // TODO: Change to Task.displayText
    document.getElementById('inputBox').value = taskText;  // Insert text in inputBox
    clickedElement = document.getElementById(chosenTaskId);  //  Identify clickedElement
    clickedElement.parentNode.removeChild(clickedElement);  //  Remove clickedElement
    document.getElementById('editButton').innerText = 'Clear';  // Prepare Edit/Clear button for cloning
    editButton.dataset.clonemode = 'true';
  }
}

// Insert a 15 min planning task at the current time
let nowButton = document.getElementById('nowButton');
nowButton.addEventListener('click', addNow);

function addNow() {
  let now = new Date();
  insertFixTimeTask([now, 15 * 60000, 'Planning']);
  renderTasks();
  resetInputBox();
}

// Add a new task
function addTask(myId) { // TODO: Make more like insertFixTimeTask
  let contentInputBox = document.getElementById('inputBox').value.trim();
  let parsedList = parseText(contentInputBox);
  if (parsedList[0] == '') {  // No fixed time ...
    insertTask(parsedList, myId);
  } else {
    insertFixTimeTask(parsedList);
  }

  if (editButton.dataset.clonemode === 'false') {
    resetInputBox();
  }
}
// TODO: Add task duration to start time for nullTime
function insertTask(parsedList, myId) {
  let newTaskDuration = parsedList[1];

  for (const [index, task] of taskList.entries()) {
      // Find the first nullTime slot
      if (task.fuzzyness() == 'isNullTime' && newTaskDuration < task.duration && index > 0) {
        taskList[index].date = new Date(task.date.getTime() + newTaskDuration);  // ..then shrink the nullTime
        task.duration -= newTaskDuration;
        // Make the new task ...
        let newTask = new Task(parsedList[0], parsedList[1], parsedList[2], task.blockId);
        if (myId > 0) { //  No id provided: insert the new task before chosen nullTime
          taskList.splice(myId, 0, newTask);
        } else {
          taskList.splice(index, 0, newTask);
        }

        break
      }
  }

  // taskList.forEach((task, index) => {  // Find the first nullTime slot
  //   if (task.fuzzyness() == 'isNullTime' && newTask.duration < task.duration && index > 0) {
  //     newTime = new Date(task.date.getTime() + newTaskDuration);  // ..then shrink the nullTime
  //     nullTimeDuration = task.duration - newTaskDuration;
  //     let nullTimeTask = new Task(newTime, nullTimeDuration, '');
  //
  //     taskList.splice(index, 1, newTask, nullTimeTask);  //  Delete old nullTime and insert new task and new nullTime
  //   }
  // });
}

function insertFixTimeTask(parsedList) {
  let succes = false;
  for (const [index, task] of taskList.entries()) {
    if (task.fuzzyness() == 'isNullTime') { // Find first nullTime slot
      let newFixedTimeTask = new Task(parsedList[0], parsedList[1], parsedList[2], task.blockId);
      let nullTimeEnd = new Date(task.date.getTime() + task.duration);
      if ((task.date <= newFixedTimeTask.date) && (newFixedTimeTask.duration < task.duration) && (newFixedTimeTask.date < nullTimeEnd)) {
        null1Duration = newFixedTimeTask.date - task.date;
        let null1 = new Task(task.date, null1Duration, '', task.blockId)


        null2Duration = task.date.getTime() + task.duration - newFixedTimeTask.date.getTime() - newFixedTimeTask.duration;
        let endTime = new Date(newFixedTimeTask.date.getTime() + newFixedTimeTask.duration);
        let null2 = new Task(endTime, null2Duration, '', blockIdList.pop());

        taskList.splice(index, 1, null1, newFixedTimeTask, null2);
        succes = true;
      }
    }
  }
  if (!succes) {
    editButton.dataset.clonemode = 'true' // If there isn't enough room for a fixTimeTask flash a waring
    msg = document.getElementById('message');
    msg.style.display = 'inline-block';
    msg.innerText = 'Not enough room\n Please clear some space ';

    setTimeout(function() {msg.style.display = 'none';}, 3000)
  }
}

function renderTasks() {  // TODO: Remove 0m nullTime and combine nullTimes next to each other
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

  for (const [index, task] of taskList.entries()) {  // Refresh view from taskList
    let newNode = document.createElement('div');
    newNode.setAttribute('id', index);
    newNode.classList.add(task.fuzzyness());
    newNode.classList.add('task');

    // Set the task height
    if (zoom * task.height() < 20) {  // Adjust text size for short tasks
      newNode.style['font-size'] = '12px';
    } else {
      newNode.style['font-size'] = null;
    }
    newNode.style['line-height'] = zoom * task.height() + 'px';
    newNode.style.height = (zoom * task.height() * 100) / (24 * 60) + '%';
    newNode.setAttribute('onClick', 'taskHasBeenClicked(this.id)');  // TODO: addEventListener here?

    let nodeText = textExtractor(task);
    let textNode = document.createTextNode(nodeText);
    newNode.appendChild(textNode);
    document.getElementById('taskDiv').insertAdjacentElement('beforeend', newNode);
    // document.getElementById('day').insertAdjacentElement('beforeend', newNode);
    container = document.getElementById('container');
    container.scrollTop = document.getElementById(index).offsetTop - 250;
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

function taskHasBeenClicked(myId) { // myId is the id of the clicked task. (Duh)
  console.log(myId);
  let contentInputBox = document.getElementById('inputBox').value.trim();
  let editButton = document.getElementById('editButton');

  if (contentInputBox !== '' && !chosenTaskId) {
    // Text in inputBox and no chosenTaskId. Create new task and insert before clicked element
    addTask(myId);
    renderTasks(); // Draws task based on the content of the taskList
  } else if (contentInputBox !== '' && chosenTaskId){
    // Text in inputbox and a chosenTaskId. Should not happen.
    console.log('Text in inputbox and a chosenTaskId. Should not happen.');
  }  else if (contentInputBox == '' && !chosenTaskId) {
    // No text in inputBox and no chosenTaskId: Getting ready to Edit, delete or clone
    chosenTask = document.getElementById(myId);
    chosenTask.classList.add('isClicked');
    // console.log(myId, chosenTask.classList);
    chosenTaskId = chosenTask.id;

    editButton.innerText = 'Edit';
    editButton.dataset.clonemode = 'true' // If a task is chosen it can mean swap or edit/clone/delete
  } else if (contentInputBox == '' && chosenTaskId) {
    // No text in inputBox and a chosenTaskId: Swap elements
     [taskList[myId], taskList[chosenTaskId]] = [taskList[chosenTaskId], taskList[myId]]

    resetInputBox();
    chosenTaskId = '';
    editButton.innerText = 'Clear';
    editButton.dataset.clonemode = 'false';
    renderTasks(); // Draws task based on the content of the taskList
  }

  if (!editButton.dataset.clonemode) {
    resetInputBox();
  }
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
  if (time) { // If 1230 or 12:30 is in rawText store numbers in hours and minutes and remove 1230 from rawText
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
    taskStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), timeH, timeM);
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
