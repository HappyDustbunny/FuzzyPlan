let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let monthTaskList = [];

let displayList = [];
let zoom = 0.5;  // The height of all elements will be multiplied with zoom. Values can be 1 or 0.5
let zoomSymbolModifyer = 0; // The last digit of the \u numbers \u2357 ⍐ and \u2350 ⍗

document.addEventListener('touchmove', function() {twoFingerNavigation(event);});

document.getElementById('info').addEventListener('click', function() {goToPage('instructions.html');});

document.getElementById('day').addEventListener('click', function() {goToPage('main.html');});

class Task {
  constructor(date, text) {
    this.date = date;
    this.text = text;
    this.dateId = this.dateToId();
  }
  dateToId() {
    return this.date.getDate() + this.date.getMonth();
  }
}

function setUpFunc() {
  retrieveLocallyStoredStuff();

  fillDateBar(zoom);

  // createTimeMarker();
  //
  // updateTimeMarker();

  renderTasks();

  resetInputBox();
}

function storeLocally() {
  localStorage.monthListAsText = JSON.stringify(taskListExtractor());

  // localStorage.wakeUpOrNowClickedOnce = wakeUpOrNowClickedOnce;
  // for (const [index, task] of taskList.entries()) {
    //   if (task.uniqueId === uniqueIdOfLastTouched) {
      //     localStorage.indexOfLastTouched = index;
      //     break;
      //   }
      // }

      localStorage.zoom = zoom;
    }

function retrieveLocallyStoredStuff() {
  taskList = [];
  makeFirstTasks();

  if (localStorage.getItem('monthListAsText')) {
    lastTaskList = taskList;
    taskListAsText = JSON.parse(localStorage.taskListAsText);
    textListToTaskList(taskListAsText);
  }

  if (localStorage.getItem('zoom')) {
    zoom = localStorage.zoom;
  }
}


function fillDateBar(zoom) {
  console.log('fillDateBar called');
  // let now = new Date();
  // let nowPlus3Month =  new Date();
  // nowPlus3Month = nowPlus3Month.setMonth(nowPlus3Month.getMonth() + 3);
  // console.log(nowPlus3Month);
  //
  // for (let i = now; i < nowPlus3Month; i.setDate(i.getDate() + 1)) {
  //   let dateDiv = document.createElement('div');
  //
  //   dateDiv.textContent = i.getDate() + '/' + i.getMonth();
  //
  //   dateDiv.setAttribute('class', 'halfHours' + zoom * 2);
  //   // dateDiv.setAttribute('id', i + '00');
  //   document.getElementById('dateDiv').appendChild(dateDiv);
  // }
}


function makeFirstTasks() {
  console.log('makeFirstTasks called'); // Is this necessary?
  // Make the first tasks. Necessary for adding new tasks
  // let startList = ['000 1m Day start', '2359 1m Day end'];
  // for (const [index, text] of startList.entries()) {
  //   parsedList = parseText(text.trim());
  //   let task = new Task(parsedList[0], parsedList[1], parsedList[2], parsedList[3]);
  //   task.fuzzyness = 'isNotFuzzy';
  //   taskList.push(task);
  // }
  // localStorage.indexOfLastTouched = 0;
}


function renderTasks() {
  let now = new Date();
  let nowPlus3Month =  new Date();
  nowPlus3Month = nowPlus3Month.setMonth(nowPlus3Month.getMonth() + 3);
  console.log(nowPlus3Month);

  let thisMonth = now.getMonth();
  monthNameNode = document.createElement('button');
  monthNameNode.classList.add('monthName');
  monthNameNode.textContent = months[now.getMonth()];
  document.getElementById('taskDiv').appendChild(monthNameNode);
  for (let i = now; i < nowPlus3Month; i.setDate(i.getDate() + 1)) {
    if (thisMonth < i.getMonth()) {
      thisMonth = i.getMonth();
      monthNameNode = document.createElement('button');
      monthNameNode.classList.add('monthName');
      monthNameNode.textContent = months[i.getMonth()];
      document.getElementById('taskDiv').appendChild(monthNameNode);
    }


    let newNode = document.createElement('button');
    // newNode.setAttribute('id', task.dateId)
    newNode.classList.add('dateButton');

    if (i.getDay() > 4) { // Weekday 5 and 6 are Saturday and Sunday
      newNode.classList.add('weekend');
    }

    newNode.textContent = i.getDate() + '/' + i.getMonth();
    newNode.textContent += ' Rap';

    // newNode.setAttribute('class', 'halfHours' + zoom * 2);
    // newNode.setAttribute('id', i + '00');
    document.getElementById('taskDiv').appendChild(newNode);
  }
}

// Clear input box and give it focus
function resetInputBox() {
  document.getElementById('inputBox').value = '';
  document.getElementById('inputBox').focus();
}


function goToPage(page) {
  storeLocally();
  window.location.assign(page);
}


function twoFingerNavigation(event) {
  if (sessionStorage.touchXmonth && event.touches.length === 1) {
    sessionStorage.touchXmonth = '';
  }
  if (event.touches.length > 1) {
    if (!sessionStorage.touchXmonth) {
      sessionStorage.touchXmonth = event.touches[0].screenX;
    } else if (event.touches[0].screenX - sessionStorage.touchXmonth < 50) { // Left swipe
      goToPage('main.html');
    // } else if (event.touches[0].screenX - sessionStorage.touchXmonth > 50) { // Right swipe
    //   goToPage('month.html');
    }
  }
}


function taskListExtractor() {
  console.log('taskListExtractor called');
}


function textListToTaskList() {
  console.log('textListToTaskList called');
}
