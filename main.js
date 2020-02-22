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

inputBox = document.getElementById('inputBox');  // Makes pressing Enter add task
inputBox.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      addTask('beforeend');
    }
});

function removeChosen() {
inputBox.addEventListener('focus', function () {  // TODO: Does this work?? Hmm.
  if (chosenTask!='' && chosenTask.hasAttribute('class')) {
    chosenTask.removeAttribute('class');
  }
  chosenTask = '';
  document.getElementById('editButton').innerText = 'Clear';
});
}

function Task(timeH, timeM, duration, text, id, fuzzyness, isFused, isClicked) {
  let today = new Date();
  this.startTime = new Date(today.getFullYear(), today.getMonth(), today.getDay(), timeH, timeM);
  this.duration = duration;  // In seconds
  this.text = text;
  this.id = id;
  this.fuzzyness = fuzzyness;
  this.isFused = isFused;
  this.isClicked = isClicked;

  this.endTime = function() {
    if (this.startTime && this.duration) {
      return this.startTime + timeH * 3600000 + timeM * 60000;
    }
  }
}

function createTask() {

  let newText = document.getElementById('inputBox').value;  // Get the text from the inputBox
  if (newText.trim() == '') {  // If no input is found, don't add empty task
    resetInputBox();
    return
  }

  let parsedText = parseTask(newText);  // Pull out information and store in array: parsedList = [timeH, timeM, hours, minutes, drain, text]
  let clearText = generateText(parsedText);  // Generate human readable text

  let fuzzyness = 0;  // Check level of timewise fuzzyness 0: 1200-1230 1: 30m 2: ''
  let fuzzyClassName = '';
  if (parsedText[0] === '-1' && parsedText[1] === '-1' && parsedText[2] === '0' && parsedText[3] === '0') {
    fuzzyness = 2;
    fuzzyClassName = 'isFuzzy';
  } else if (parsedText[0] === '-1' && parsedText[1] === '-1') {
    fuzzyness = 1;
    fuzzyClassName = 'isFuzzyish';
  }

  let taskId =  Math.floor(Math.random() * 1000000);  // Pick random id in order to be able to pick element later
  let task = new Task(parsedText[0], parsedText[1], parsedText[2], clearText, taskId, fuzzyness, false, false);
  taskList.push(task);

  let newNode = document.createElement('div');
  newNode.setAttribute('onClick', 'gotClicked(this.id)');  // TODO: addEventListener here?
  newNode.setAttribute('id', taskId);
  newNode.setAttribute('class', fuzzyClassName);

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

function addTask(here) {
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
    // Text in inputBox and no chosenTask. Create new task and insert before clicked element
    newNode = createTask();
    document.getElementById(myId).insertAdjacentElement("beforebegin", newNode);
  } else if (contentInputBox == '' && !chosenTask) {
    // No text in inputBox and no chosenTask: Getting ready to Edit, delet or clone
    chosenTask = document.getElementById(myId);
    chosenTask.style['background-color'] = 'rgba(240, 182, 154, 0.31)';
    // chosenTask.style.border = '1px solid rgb(255, 50, 255)';  // Needed for CSS highlighting of clicked task
    // chosenTask.className = 'clicked';  // Needed for CSS highlighting of clicked task
    // console.log(chosenTask.getAttribute('class'));
    editButton.innerText = 'Edit';
    // editButton.dataset.clonemode = 'true'
  } else if (contentInputBox == '' && chosenTask) {
    // No text in inputBox and a chosenTask: Insert element and be ready for edit or clone
    let chosenTask = document.getElementById(myId);
    chosenTask.insertAdjacentElement('beforebegin', chosenTask);

    chosenTask.style['background-color'] = 'rgba(154, 219, 240, .25)';

    // if (curEl.class === 'isFuzzy') { // TODO: This is a mess...
    //   curEl.style.border = 'none';
    //   curEl.style['box-shadow'] = '0px 0px 3px 2px rgba(154, 219, 240, .25)';
    // } else if (curEl.class === 'isFuzzyish') {
    //   curEl.style.border = '1px solid rgba(154, 219, 240, 1.0)';
    //   curEl.style.background-color = 'rgba(154, 219, 240, .25)';
    //   curEl.style['box-shadow'] = '0px 0px 3px 2px rgba(154, 219, 240, .25)';
    // }
    // chosenTask.style.border = 'none'; // TODO: Better, but still no banana
    // if (chosenTask.hasAttribute('class')) {  // Remove class name 'clicked' in order to let CSS stop highlighting task
    //   chosenTask.removeAttribute('class');  // TODO: get task from list via id and set fuzzyness
    // }
    // if (!editButton.dataset.clonemode) {
    //   resetInputBox();
    // }
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

function addDuration() {  // Add duration to a chosen task
  if (chosenTask == '') {
    return
  }
  // TODO: If chosenTask has a fixed time, strip it and get ready for new time and duration
  let text = chosenTask.innerText;
  let minutes = /[0-9]+m/.exec(text);
  if (minutes) {
    minutes = /[0-9]+/.exec(minutes).toString();
    chosenTask.innerText = text.replace(minutes + 'm', '');
  }
  timeButton = document.getElementById('timeButton');
  text = timeButton.innerText;
  if (text == '+Time') {
    showTimeButtons();
  } else {
    oldText = chosenTask.innerText;
    if (timeButton.innerText !== '+0▼') {
      newText = /[0-9]+/.exec(timeButton.innerText) + 'm '+ oldText;
      chosenTask.innerText = newText;
    }
    hideTimeButtons();
  }
}

// Functionality for +Time button
elTimeButton = document.getElementById('timeButton');
elTimeButton.addEventListener('click', addDuration, false);

// Functionality for +5 +10 +10 +30 buttons
elAddMinutes = document.getElementById('timeAdder');
elAddMinutes.addEventListener('click', function(e) {addMinutes(e);}, false);

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
  document.getElementById('timeAdder').style.display = 'none';
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
  chosenTask.style['background-color'] = 'rgba(240, 182, 154, 0.31)';
  // if (chosenTask.hasAttribute('class')) { // Remove class name 'clicked' in order to let CSS stop highlighting task
  //   chosenTask.removeAttribute('class');
  // }
  chosenTask = '';
  resetInputBox();
}

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
