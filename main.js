var taskList = [];
var chosenTask = '';

for (var i = 0; i < 24; i += 1) {
  let node = document.createElement('span');
  node.setAttribute('id', i);  // Time in hours
  j = i + 1;
  document.getElementById('day').appendChild(node);
}

resetInputBox();

function resetInputBox() {
  document.getElementById('inputBox').value = '';
  document.getElementById('inputBox').focus();
}

let inputBox = document.getElementById('inputBox');  // Makes pressing Enter add task
inputBox.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      addTask('beforeend');
    }
});

function removeChosen() {
  let inputBox = document.getElementById('inputBox');
  inputBox.addEventListener('focus', function () {  // TODO: Does this work?? Hmm.
    if (chosenTask!='' && chosenTask.classList.contains('isClicked')) {
      chosenTask.classList.remove('isClicked');
    }
    chosenTask = '';
    document.getElementById('editButton').innerText = 'Clear';
  });
}

function Task(timeH, timeM, durationH, durationM, text, id, isFused, isClicked) {
  this.timeH = timeH;
  this.timeM = timeM;
  this.durationH = durationH;
  this.durationM = durationM;
  this.text = text;
  this.id = id;
  this.isFused = isFused;
  this.isClicked = isClicked;

  this.duration = function() {  // In milliseconds
    return this.durationH * 3600000 + this.durationM * 60000
  }


  this.startTime = function() {
    if (this.timeH > 0 || this.timeM > 0) {
      let today = new Date();
      let starttime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), timeH, timeM);
      return starttime
    }
  }

  this.endTime = function() {
    if (this.startTime() && this.duration()) {
      endTime = this.startTime + timeH * 3600000 + timeM * 60000;
      if (endTime.getHours() < 24) {
        return endTime
      } else {
        return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59)
      }
    }
  }

  this.fuzzyness = function() {
    if (this.duration() == '0' &&  (this.timeH < 0 || this.timeM < 0)) { // No starttime or duration
      return 'isFuzzy'
    } else if (this.duration() != '0' &&  (this.timeH < 0 || this.timeM < 0)) { // No starttime, but duration
      return 'isFuzzyish'
    } else {  // Starttime
      return 'isNotFuzzy'
    }
  }
}

function createTask() {
  let newText = document.getElementById('inputBox').value;  // Get the text from the inputBox
  if (newText.trim() == '') {  // If no input is found, don't add empty task
    resetInputBox();
    return
  }
  let pText = parseTask(newText);
  let clearText = generateText(pText);

  let taskId =  Math.floor(Math.random() * 1000000);  // Pick random id in order to be able to pick element later
  let task = new Task(pText[0], pText[1], pText[2], pText[3], clearText, taskId, false, false);
  taskList.push(task);

  let newNode = document.createElement('div');
  newNode.setAttribute('onClick', 'gotClicked(this.id)');  // TODO: addEventListener here?
  newNode.setAttribute('id', taskId);
  newNode.classList.add(task.fuzzyness());

  let textNode = document.createTextNode(clearText);
  newNode.appendChild(textNode);

  let node = newNode;
  return node
}


function clickedTop() {
  addTask('afterbegin');
}

function clickedBottom() {
  addTask('beforeend');
}

function addTask(here) {  // Create and add new task. Services the functions clickedTop and clickedBottom
  contentInputBox = document.getElementById('inputBox').value.trim();

  if (here && contentInputBox) {
    newNode = createTask();
    document.getElementById('day').insertAdjacentElement(here, newNode);
  }

  editButton = document.getElementById('editButton');
  if (editButton.dataset.clonemode === 'false') {
    resetInputBox();
  }
}

function gotClicked(myId) { // If a task is clicked 'myId' is its id

  contentInputBox = document.getElementById('inputBox').value.trim();
  editButton = document.getElementById('editButton');

  if (contentInputBox !== '' && !chosenTask) {
    // Text in inputBox and no chosenTask. Create new task and insert before clicked element
    newNode = createTask();
    document.getElementById(myId).insertAdjacentElement("beforebegin", newNode);
    resetInputBox();
    chosenTask = '';
    editButton.innerText = 'Clear'
  } else if (contentInputBox !== '' && chosenTask) {
    // Text in inputBox and a chosenTask. Should not happen.
    console.log('Text in inputBox and a chosenTask. Should not happen.')
    // newNode = createTask();
    // document.getElementById(myId).insertAdjacentElement("beforebegin", newNode);
  } else if (contentInputBox == '' && !chosenTask) {
    // No text in inputBox and no chosenTask: Getting ready to Edit, delete or clone
    chosenTask = document.getElementById(myId);
    chosenTask.classList.add('isClicked');

    editButton.innerText = 'Edit';
    editButton.dataset.clonemode = 'true' // If a task is chosen it can mean swap or edit/clone/delete
  } else if (contentInputBox == '' && chosenTask) {
    // No text in inputBox and a chosenTask: Insert element and be ready for edit or clone
    let secondTask = document.getElementById(myId);
    secondTask.insertAdjacentElement('beforebegin', chosenTask);

    // chosenTask.style['background-color'] = 'rgba(154, 219, 240, .25)';

    resetInputBox();
    chosenTask = '';
    editButton.innerText = 'Clear';
    editButton.dataset.clonemode = 'false'
  }

  if (!editButton.dataset.clonemode) {
    resetInputBox();
  }
}

function clearOrEdit() {  // Govern the Edit/Clear button
  editButton = document.getElementById('editButton');
  if (editButton.innerText == 'Clear') {
    resetInputBox();
    chosenTask = '';
    editButton.dataset.clonemode = 'false';
  } else if (editButton.innerText == 'Edit') {
    taskText = chosenTask.innerText;  //  Save the text from clickedElement
    document.getElementById('inputBox').value = taskText;  // Insert text in inputBox
    clickedElement = document.getElementById(chosenTask.id);  //  Identify clickedElement
    clickedElement.parentNode.removeChild(clickedElement);  //  Remove clickedElement
    document.getElementById('editButton').innerText = 'Clear';  // Prepare Edit/Clear button for cloning
    editButton.dataset.clonemode = 'true';
  }
}

// Functionality for +Time button
elTimeButton = document.getElementById('timeButton');
elTimeButton.addEventListener('click', addDuration, false);

// Functionality for +5 +10 +10 +30 buttons
elAddMinutes = document.getElementById('timeAdder');
elAddMinutes.addEventListener('click', function(e) {addMinutes(e);}, false);

function addDuration() {  // Add duration to a chosen task
  if (chosenTask == '') {  // ... but only if one is chosen. Duh.
    return
  }
  // TODO: If chosenTask has a fixed time, it should be edited instead. Refuse to process it.
  let text = chosenTask.innerText; // Strip the current duration from task text
  let minutes = /[0-9]+m/.exec(text);
  if (minutes) {
    minutes = /[0-9]+/.exec(minutes).toString();
    chosenTask.innerText = text.replace(minutes + 'm', '');
  }

  timeButton = document.getElementById('timeButton');
  text = timeButton.innerText;
  if (text == '+Time') { // If a task was chosen and the +Time button was clicked show +5 +10 +10 +30 buttons
    showTimeButtons();
  } else {  // If the +Time button (showing +0▼) is clicked, add duration to the chosen task
    oldText = chosenTask.innerText;
    if (timeButton.innerText !== '+0▼') {
      newText = /[0-9]+/.exec(timeButton.innerText) + 'm '+ oldText;
      chosenTask.innerText = newText;
      chosenTask.classList.remove('isFuzzy');
      chosenTask.classList.add('isFuzzyish');
    } else {
      chosenTask.classList.remove('isFuzzyish');
      chosenTask.classList.add('isFuzzy');
    }
    hideTimeButtons();
  }
}


function addMinutes(e) {
  let element = e.target;
  let timeButton = document.getElementById('timeButton');
  let minutes = parseInt(element.dataset.time);
  if (element.className == 'time') {  // Adds the time written on button to timeButton
    let value = parseInt(/[0-9]+/.exec(timeButton.innerText)) + minutes + '\u25BC';
    timeButton.innerText = '+' + value;
    element.className = 'usedTime';
    element.style.border = 'inset';
  } else {  // Subtract time written on button from timeButton
    let value = parseInt(/[0-9]+/.exec(timeButton.innerText)) - minutes + '\u25BC';
    timeButton.innerText = '+' + value;
    element.className = 'time';
    element.style.border = 'outset';
  }
}

function showTimeButtons() {
  timeButton = document.getElementById('timeButton');
  timeButton.innerText = '+0\u25BC';
  timeButton.style.width = '17%';
  document.getElementById('inputBox').style.width = '40px';
  document.getElementById('timeAdder').style.display = 'inline-block';
  for (var i = 0; i<4; i++) {
    document.getElementsByClassName('time')[i].style.display = 'inline-block';
  }
}

function hideTimeButtons() {
  document.getElementById('timeButton').innerText = '+Time';
  document.getElementById('inputBox').style.width = '168px';
  document.getElementById('timeAdder').style.display = 'none'; // Make buttons invisible
  min5 = document.getElementById('5min');
  min5.className = 'time';
  min5.style.border = 'outset';
  min5.style.display = 'none';
  min10a = document.getElementById('10min1');
  min10a.className = 'time';
  min10a.style.border = 'outset';
  min10a.style.display = 'none';
  min10b = document.getElementById('10min2');
  min10b.className = 'time';
  min10b.style.border = 'outset';
  min10b.style.display = 'none';
  min30 = document.getElementById('30min');
  min30.className = 'time';
  min30.style.border = 'outset';
  min30.style.display = 'none';

  chosenTask.classList.remove('isClicked');
  // chosenTask.style['background-color'] = 'rgba(240, 182, 154, 0.31)';
  // if (chosenTask.hasAttribute('class')) { // Remove class name 'clicked' in order to let CSS stop highlighting task
  //   chosenTask.removeAttribute('class');
  // }
  chosenTask = '';
  resetInputBox();
}

// TODO: Shoul generateText be part of the Task Object? Does 2200 9h Sleep --> 22:00-23:59 or 22:00-31:00?
function generateText(pList) {  // pList: parsedList = [timeH, timeM, hours, minutes, drain, text]
  let extraH = 0;
  let endH = 0;
  let endM = 0;
  if (pList[0] > -1 && (pList[2] > 0 || pList[3] > 0)) {  // Find end time from start time and duration
    if (pList[3] > -1) {
      endM = parseInt(pList[1]) + parseInt(pList[3]);
      if (endM > 59) {
        endM -= 60;
        extraH = 1;
      }
      if (endM < 10) {
        endM = '0' + endM;
      }
    }
    if (pList[2] > -1) {
      endH = parseInt(pList[0]) + parseInt(pList[2]) + extraH;
    }
    taskText = pList[0] + ':' + pList[1] + '-' + endH + ':' + endM + ' ' + pList[5]
  } else if (pList[0] > -1) {  // Writes HH:MM plus text
    taskText = pList[0] + ':' + pList[1] + ' ' + pList[5]
  } else {
    if (pList[2]>0 && pList[3]>0) {  // Writes h and m plus text - if there are any h and m
      taskText = pList[2] + 'h' + pList[3] + 'm ' + pList[5];
    } else if (pList[2]>0 && pList[3]<=0) {
      taskText = pList[2] + 'h' + pList[5];
    } else if (pList[2]<=0 && pList[3]>0) {
      taskText = pList[3] + 'm ' + pList[5];
    } else {
      taskText = pList[5];
    }
  }
  return taskText;
}

function parseTask(newItem) {
  let minutes = /[0-9]+m/.exec(newItem);
  if (minutes) {
    minutes = /[0-9]+/.exec(minutes).toString();
    newItem = newItem.replace(minutes + 'm', '')
  } else {
    minutes = '0';
  };

  let hours = /[0-9]+h/.exec(newItem);
  if (hours) {
    hours = /[0-9]+/.exec(hours).toString();
    newItem = newItem.replace(hours + 'h', '')
  } else {
    hours = '0';
  };

  let time = /[0-9]?[0-9][0-9][0-9]/.exec(newItem);
  if (time) {
    time = time[0].toString();
    if (time.length == 4) {
      timeH = /[0-9][0-9]/.exec(time).toString();
    } else if (time.length == 3) {
      timeH = /[0-9]/.exec(time).toString();
    }
    time = time.replace(timeH, '')
    timeM = /[0-9][0-9]/.exec(time).toString();
    newItem = newItem.replace(timeH + timeM, '')
  } else {
    timeM = '-1';
    timeH = '-1';
  };

  let drain = /d[1-5]./.exec(newItem);
  if (/d[1-5]./.exec(drain)) {
    drain = /[1-5]/.exec(drain).toString();
    newItem = newItem.replace('d' + drain, '');
  } else {
    drain = '-1';
    // newItem = newItem.replace('d', '');
  };

  let text = newItem.trim();
  text = text.slice(0, 1).toUpperCase() + text.slice(1, );

  parsedList = [timeH, timeM, hours, minutes, drain, text];
  return parsedList;
}

// document.getElementById("topButton").addEventListener("click", function() {addTask('afterbegin');});
// document.getElementById('bottomButton').addEventListener('click', function() {addTask('beforeend');});
// document.getElementById('editOrClearButton').addEventListener('click', resetInputBox());

// var n = 0;
// function addTask1() {
//   n += 2;
//   console.log(n);
//   let list = document.getElementById('day');
//   let node = document.createElement('div');
//   node.setAttribute('class', 'div2');
//   newItem = document.getElementById('newItem').value;
//   let textNode = document.createTextNode(newItem);
//   node.appendChild(textNode);
//   document.getElementById('day').insertBefore(node, list.childNodes[n]);
  // document.getElementById('day').insertBefore(node, document.getElementById('snack').nextSibling);
// }
// document.querySelector('button').onclick = function () {
//   newItem = document.getElementById('newItem').value
//   document.getElementById('thumb').innerHTML = newItem
// }


// function addTaskTop() {
  //   let list = document.getElementById('day');
  //   let node = document.createElement('div');
  //   node.setAttribute('class', 'unprocessed')
  //   node.setAttribute('onClick', 'addTaskBefore(this.id)');
  //   let newItem = document.getElementById('inputBox').value;
  //
  //   let parsedList = parseTask(newItem);
  //   console.log(parsedList);
  //   node.setAttribute('id', parsedList[0] + '1');
  //   if (parsedList[0] > 0) {
    //     node.setAttribute('data-hours', parseInt(parsedList[0]));
    //     node.setAttribute('data-minutes', parseInt(parsedList[1]));
    //   }
    //   let taskText = generateText(parsedList);
    //   let textNode = document.createTextNode(taskText);
    //   node.appendChild(textNode);
    //   document.getElementById('day').insertBefore(node, document.getElementById(Math.abs(parsedList[0])));
    //   document.getElementById('inputBox').value = '';
    //   document.getElementById('inputBox').focus();
    // }
    //
    // function addTaskBefore(thisId) {
      //   // let newItem = prompt('Add task just before this event: ');
      //   let list = document.getElementById('day');
      //   let node = document.createElement('div');
      //   node.setAttribute('onClick', 'addTaskBefore(this.id)');
      //   let newItem = document.getElementById('inputBox').value;
      //
      //   let parsedList = parseTask(newItem);
      //   console.log(parsedList);
      //   console.log(typeof thisId);
      //   node.setAttribute('id', thisId + '1');
      //   let taskText = generateText(parsedList);
      //   let textNode = document.createTextNode(taskText);
      //   node.appendChild(textNode);
      //   document.getElementById('day').insertBefore(node, document.getElementById(thisId));
      //   document.getElementById('inputBox').value = '';
      //   document.getElementById('inputBox').focus();
      // }
      //
      // function fiddleWithHeight() {
        //   document.getElementById('151').style.height='20px';
        // }



        // <!-- <div>&#x25B2; 8:00-8:10 Morgenmad &#x25BC;</div>
        // <div>10:30-10:40 Snack</div>
        // <div>13:00-13:30 Frokost</div>
        // <div>15:30-15:40 Snack</div>
        // <div id='dinner'>18:00-18:30 Aftensmad</div> -->
