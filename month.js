let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let monthTaskDict = {};  // JS object usable much like a Python dictionary
let displayDict = {};    // JS object usable much like a Python dictionary
// let zoom = 0.5;  // The height of all elements will be multiplied with zoom. Values can be 1 or 0.5
// let zoomSymbolModifyer = 0; // The last digit of the \u numbers \u2357 ⍐ and \u2350 ⍗


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

  fillDateBar();

  renderTasks();

  // resetInputBox();
  document.getElementById('inputBox').focus();
}


document.addEventListener('touchmove', function() {twoFingerNavigation(event);});

document.getElementById('day').addEventListener('click', function() {goToPage('main.html');});

document.getElementById('clearButton').addEventListener('click', resetInputBox);

// document.getElementById('info').addEventListener('click', function() {goToPage('instructions.html');});

document.getElementById('taskDiv').addEventListener('click', function () {taskHasBeenClicked(event); }, true);
document.getElementById('taskDiv').addEventListener('dblclick', function () {taskHasBeenDoubleClicked(event); }, true);

document.getElementById('inputBox').addEventListener('keypress', function () { inputAtEnter(event); });

function storeLocally() {
  localStorage.monthListAsText = JSON.stringify(monthTaskDict);
}


function retrieveLocallyStoredStuff() {
  if (localStorage.getItem('monthListAsText') != null) {
    monthTaskDict = JSON.parse(localStorage.monthListAsText);
  }

  if (localStorage.getItem('inputBoxContent') != '') {
    document.getElementById('inputBox').value = localStorage.getItem('inputBoxContent');
    localStorage.removeItem('inputBoxContent');
  }
}


function fillDateBar() {
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
    if (thisMonth < i.getMonth()) { // TODO: Oups! This doesn't handle dec --> jan
      thisMonth = i.getMonth();
      monthNameNode = document.createElement('button');
      monthNameNode.classList.add('monthName');
      monthNameNode.textContent = months[i.getMonth()];
      document.getElementById('taskDiv').appendChild(monthNameNode);
    }

    let newNode = document.createElement('button');

    let id = i.getDate().toString() + i.getMonth().toString();

    // monthTaskDict[id] = '';

    newNode.setAttribute('id', id)
    newNode.classList.add('dateButton');
    let dayNumber = i.getDay();
    if (dayNumber === 0 || dayNumber === 6) { // Weekday 6 and 0 are Saturday and Sunday
      newNode.classList.add('weekend');
    }

    datePart = document.createElement('span');
    datePart.classList.add('datePart');
    if (i.getDate() < 10) {
      datePart.textContent = '\u00a0\u00a0'; // Adjust all dates to align right
    }
    datePart.textContent += i.getDate() + '/' + (i.getMonth() + 1) +  '\u00a0\u00a0\u00a0';
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
    monthTaskDict[myId] += '|' + contentInputBox[0].toUpperCase() + contentInputBox.slice(1);
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


function inputAtEnter(event) { // TODO: Month is of by one month
  if (event.key === 'Enter') {
    let contentInputBox = document.getElementById('inputBox').value.trim();
    if (contentInputBox != '') {

      let dateArray = /\d+\/\d+/.exec(contentInputBox);

      if ( dateArray != null ) {
        if ( (/\d+\//.exec(dateArray[0])[0].replace('\/', '') <= 31 &&
          /\/\d+/.exec(dateArray[0])[0].replace('\/', '') <= 12)) {

            // let myId = dateArray[0].replace('\/', '');
            let myId = (/\d+\//.exec(dateArray[0])[0].replace('\/', '')).toString() +
              (Number(/\/\d+/.exec(dateArray[0])[0].replace('\/', '')) - 1).toString()

            let textInputBox = contentInputBox.replace(dateArray[0], '').trim();

            if (textInputBox === '') {
              gotoDate(myId); // TODO: Make gotoDate()
            }

            monthTaskDict[myId] += '|' + textInputBox[0].toUpperCase() + textInputBox.slice(1);

        } else {
          displayMessage('Not a date. Please fix date or remove the back-slash', 4000);
          return;
        }

      } else {
        let now = new Date();
        let nowPlusOneDay = new Date();
        nowPlusOneDay = new Date(nowPlusOneDay.setDate(nowPlusOneDay.getDate() + 1));
        let myId = nowPlusOneDay.getDate().toString() + nowPlusOneDay.getMonth().toString();

        monthTaskDict[myId] += '|' + contentInputBox[0].toUpperCase() + contentInputBox.slice(1);
      }

      renderTasks();

      resetInputBox();

    }
  }
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
    let button = document.getElementById(myId);

    if (button != null && button.class != 'weekend') {
      let children = button.childNodes;

      let tasks = monthTaskDict[myId].trim().split("|");
      tasks.shift();  // Remove empty "" stemming from first |

      if (tasks != '') {
        for (var task of tasks) {
          children[1].innerHTML += task + '&nbsp;' + '<br>';
          children[2].textContent +=  ' \u25CF ' + task + '\u00a0';
        }
      }
    }
  }
}

function resetInputBox() {
  document.getElementById('inputBox').value = '';
  document.getElementById('inputBox').focus();
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


function goToPage(page) { // TODO: What if you go to a page where inputBoxContent isn't needed?
  storeLocally();

  let inputBoxContent = document.getElementById('inputBox').value;
  if (inputBoxContent != '') {
    localStorage.inputBoxContent = inputBoxContent;
  }

  window.location.assign(page);
}


function gotoDate() {
  console.log('To do: make jumping to date possible');
}


function displayMessage(text, displayTime) {
  console.log(text);
  msg = document.getElementById('message');
  msg.style.display = 'inline-block';
  msg.style.color = 'red';
  msg.textContent = text;

  setTimeout(function() {msg.style.display = 'none';}, displayTime)
}
