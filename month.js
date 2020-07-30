let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let monthTaskDict = {};  // JS object usable much like a Python dictionary
let displayDict = {};    // JS object usable much like a Python dictionary
let zoom = 0.5;  // The height of all elements will be multiplied with zoom. Values can be 1 or 0.5
let zoomSymbolModifyer = 0; // The last digit of the \u numbers \u2357 ⍐ and \u2350 ⍗


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

  resetInputBox();
}


document.addEventListener('touchmove', function() {twoFingerNavigation(event);});

document.getElementById('info').addEventListener('click', function() {goToPage('instructions.html');});

document.getElementById('day').addEventListener('click', function() {goToPage('main.html');});

document.getElementById('taskDiv').addEventListener('click', function () {taskHasBeenClicked(event); }, true);
document.getElementById('taskDiv').addEventListener('dblclick', function () {taskHasBeenDoubleClicked(event); }, true);


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
  let now = new Date();
  let nowPlus3Month =  new Date();
  nowPlus3Month = nowPlus3Month.setMonth(nowPlus3Month.getMonth() + 3);

  // Make a button with monthname
  let thisMonth = now.getMonth();
  monthNameNode = document.createElement('button');
  monthNameNode.classList.add('monthName');
  monthNameNode.textContent = months[now.getMonth()];
  document.getElementById('taskDiv').appendChild(monthNameNode);

  for (let i = now; i < nowPlus3Month; i.setDate(i.getDate() + 1)) {
    // Insert monthnames before each the 1th
    if (thisMonth < i.getMonth()) {
      thisMonth = i.getMonth();
      monthNameNode = document.createElement('button');
      monthNameNode.classList.add('monthName');
      monthNameNode.textContent = months[i.getMonth()];
      document.getElementById('taskDiv').appendChild(monthNameNode);
    }

    let newNode = document.createElement('button');

    let id = i.getDate().toString() + i.getMonth().toString();

    monthTaskDict[id] = '';

    newNode.setAttribute('id', id)
    newNode.classList.add('dateButton');
    if (i.getDay() > 4) { // Weekday 5 and 6 are Saturday and Sunday
      newNode.classList.add('weekend');
    }

    datePart = document.createElement('span');
    datePart.classList.add('datePart');
    if (i.getDate() < 10) {
      datePart.textContent = '\u00a0\u00a0' + i.getDate() + '/' + i.getMonth() +  '\u00a0\u00a0\u00a0';
    } else {
      datePart.textContent = i.getDate() + '/' + i.getMonth() +  '\u00a0\u00a0\u00a0';
    }
    newNode.appendChild(datePart);

    toolTipSpan = document.createElement('span');
    toolTipSpan.classList.add('toolTip');
    // toolTipSpan.innerHTML =  'Rap <br> Rappelap'; // newNode.textContent;
    newNode.appendChild(toolTipSpan);

    textPart = document.createElement('span');
    // textPart.textContent = 'Raap';
    newNode.appendChild(textPart);

    // newNode.setAttribute('class', 'halfHours' + zoom * 2);
    document.getElementById('taskDiv').appendChild(newNode);
    // document.getElementById(id).appendChild(toolTipSpan);
  }
}


function taskHasBeenClicked(event) {
  let myId = event.target.id;
  if (myId === '') {
    myId = event.target.closest('button').id;
  }

  let contentInputBox = document.getElementById('inputBox').value.trim();

  if (contentInputBox != '') {
    monthTaskDict[myId] += '\u00a0' + contentInputBox;
  }
  renderTasks();

  resetInputBox();
}


function taskHasBeenDoubleClicked() {
  let myId = event.target.id;
  if (myId === '') {
    myId = event.target.closest('button').id;
  }

  let day =  document.getElementById(myId).children;

  document.getElementById('inputBox').value = day[2].textContent.replace(/\u25CF /g, '').trim();
  monthTaskDict[myId] = '';
  day[2].textContent = '';
  day[1].innerHTML = '';
}


function renderTasks() {
  // Remove old text from buttons and tooltips
  const days = document.getElementById('taskDiv').children;
  const len = days.length;
  for (var i = 0; i < len; i++) {
    if (days[i].children.length > 0) {
      days[i].children[2].textContent = '';
      days[i].children[1].innerHTML = '';
    }
  }

  // Write new text into buttons and tooltips
  for (var myId in monthTaskDict) {
    let children = document.getElementById(myId).childNodes;

    // children[2].textContent += monthTaskDict[myId] + '\u00a0';
    // Write to tooltip
    let tasks = monthTaskDict[myId].trim().split("\u00a0");
    if (tasks != '') {
      for (var task of tasks) {
        children[1].innerHTML += task + '&nbsp;' + '<br>';
        children[2].textContent +=  ' \u25CF ' + task + '\u00a0';
      }
    }
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
