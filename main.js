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

inputBox = document.getElementById('inputBox');
inputBox.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      addTask('beforeend');
    }
});

function removeChosen() {
inputBox.addEventListener('focus', function () {
  if (chosenTask!='' && chosenTask.hasAttribute('class')) {
    chosenTask.removeAttribute('class');
  }
  chosenTask = '';
  document.getElementById('editButton').innerText = 'Clear';
});
}

function Task(timeH, timeM, duration, text, isProcessed, isFused, isClicked) {
  let today = new Date();
  this.startTime = new Date(today.getFullYear(), today.getMonth(), today.getDay(), timeH, timeM);
  this.duration = duration;  // In seconds
  this.text = text;
  this.isProcessed = isProcessed;
  this.isFused = isFused;
  this.isClicked = isClicked;

  this.endTime = function() {
    if (this.isProcessed && this.duration) {
      return this.startTime + timeH * 3600000 + timeM * 60000;
    }
  }
}

function createTask() {
  let task = new Task(0, 0, 30, '', false, false, false);

  let newNode = document.createElement('div');
  newNode.setAttribute('onClick', 'gotClicked(this.id)');
  newNode.setAttribute('id', Math.floor(Math.random() * 1000000));  // Set ra-ndom id in order to be able to pick element later

  let newText = document.getElementById('inputBox').value;  // Get the text
  if (newText.trim() == '') {  // If no input is found, don't add empty task
    resetInputBox();
    return
  }

  let parsedText = parseTask(newText);  // Pull out information and store in array
  let clearText = generateText(parsedText);  // Generate human readable text

  task.text = clearText;
  taskList.push(task);
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
  console.log(editButton.dataset.clonemode);
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
    chosenTask.className = 'clicked';  // Needed for CSS highlighting of clicked task
    // console.log(chosenTask.getAttribute('class'));
    editButton.innerText = 'Edit';
    // editButton.dataset.clonemode = 'true'
  } else if (contentInputBox == '' && chosenTask) {
    // No text in inputBox and a chosenTask: Insert element and be ready for edit or clone
    document.getElementById(myId).insertAdjacentElement('beforebegin', chosenTask);
    if (chosenTask.hasAttribute('class')) {
      chosenTask.removeAttribute('class');
    }
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

function clearOrEdit() {
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

function addTimeAndDuration() {
  if (chosenTask == '') {
    return
  }
  timeButton = document.getElementById('timeButton')
  text = timeButton.innerText;
  if (text == '+Time') {
    showTimeButtons();
  } else {
    oldText = chosenTask.innerText;
    newText = /[0-9]+/.exec(timeButton.innerText) + 'm '+ oldText;
    chosenTask.innerText = newText;
    hideTimeButtons();
  }
}

function addMinutes(minId, minutes) {
  let timeButton = document.getElementById('timeButton');
  let element = document.getElementById(minId);
  if (element.className == 'time') {
    let value = parseInt(/[0-9]+/.exec(timeButton.innerText)) + minutes + '\u25BC';
    timeButton.innerText = '+' + value;
    element.className = 'usedTime';
    element.style.border = 'inset';
  } else {
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
  document.getElementsByClassName('timeAdder')[0].style.display = 'inline-block';
  for (var i = 0; i<4; i++) {
    document.getElementsByClassName('time')[i].style.display = 'inline-block';
  }
}

function hideTimeButtons() {
  document.getElementById('timeButton').innerText = '+Time';
  document.getElementById('inputBox').style.width = '168px';
  document.getElementsByClassName('timeAdder')[0].style.display = 'none';
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
  if (chosenTask.hasAttribute('class')) {
    chosenTask.removeAttribute('class');
  }
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
