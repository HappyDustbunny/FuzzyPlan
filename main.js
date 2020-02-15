var taskList = [];
var chosenTask = '';

for (var i = 0; i < 24; i += 1) {
  let node = document.createElement('span');
  node.setAttribute('id', i);  // Time in hours
  j = i + 1;
  // let textNode = document.createTextNode('\u25B2 ' + i + ':00-' + j + ':00' + ' \u25BC');
  // node.appendChild(textNode);
  document.getElementById('day').appendChild(node);
}

resetInputBox();

function resetInputBox() {
  document.getElementById('inputBox').value = '';
  document.getElementById('inputBox').focus();
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
  newNode.setAttribute('id', Math.floor(Math.random() * 1000000));  // Set random id in order to be able to pick element later

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

document.getElementById("topButton").addEventListener("click", function() {addTask('afterbegin');});
document.getElementById('bottomButton').addEventListener('click', function() {addTask('beforeend');});
// document.getElementById('editOrClearButton').addEventListener('click', resetInputBox());

function addTask(here) {
  contentInputBox = document.getElementById('inputBox').value.trim();
  if (here && contentInputBox) {
    newNode = createTask();
    document.getElementById('day').insertAdjacentElement(here, newNode);
  }
  resetInputBox();
}

function gotClicked(myId) {
  contentInputBox = document.getElementById('inputBox').value.trim();

  if (contentInputBox !== '') {  // If a task is clicked 'myId' is its id
    newNode = createTask();
    document.getElementById(myId).insertAdjacentElement("beforebegin", newNode);
    chosenTask = '';
  } else if (contentInputBox == '' && !chosenTask) {
    chosenTask = document.getElementById(myId);
  } else if (contentInputBox == '' && chosenTask) {
    document.getElementById(myId).insertAdjacentElement('beforebegin', chosenTask);
    chosenTask = '';
  }

  resetInputBox();
}

function clearOrEdit() {
  if (document.getElementById('editButton').innerText == 'Clear') {
    resetInputBox();
  } else if (document.getElementById('editButton').innerText == 'Edit') {
    taskText = document.getElementById(chosenTask).innerText
    document.getElementById('inputBox').value = taskText;
  }

}

function generateText(pList) {  // pList: parsedList
  let extraH = 0;
  let endH = 0;
  let endM = 0;
  if (pList[0] > -1 && (pList[2] > 0 || pList[3] > 0)) {
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
  } else if (pList[0] > -1) {
    taskText = pList[0] + ':' + pList[1] + ' ' + pList[5]
  } else {
    taskText = pList[2] + 'h' + pList[3] + 'm ' + pList[5];
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

  let time = /[0-9][0-9][0-9][0-9]/.exec(newItem);
  if (time) {
    time = time[0].toString();
    timeH = /[0-9][0-9]/.exec(time).toString();
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
