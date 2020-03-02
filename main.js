var taskList = [];

function Task(date, duration, text) {
  this.date = date; // Time as Javascript date
  this.duration = duration; // Duration in milliseconds
  this.text = text;

  this.height = function() { // Pixelheight is 1 minute = 1 px
    return this.duration / 60000
  }

  this.fuzzyness = function() {
    if (this.text == '') {
      return 'isNullTime'
    } else if (this.duration == '0' &&  (typeof(this.date) == 'number')) { // No starttime or duration
      return 'isFuzzy'
    } else if (this.duration != '0' &&  (typeof(this.date) == 'number')) { // No starttime, but duration
      return 'isFuzzyish'
    } else {
      return 'isNotFuzzy'
    }
  }
}

function setUpFunc() {
  // Create 24h nullTime
  let now = new Date();
  let fullNullStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 1);
  let day24h = 24 * 3600 * 1000;
  let startNullTime = new Task(fullNullStart, day24h, '');
  taskList.push(startNullTime);

  // Create a 15 minute planning time as a starting point
  let planningTask = new Task(now, 15 * 60000, 'Planning');
  insertFixTimeTask(planningTask);

  taskList.forEach(renderTasks) // Draws task based on the content of the taskList
  resetInputBox();
}

function resetInputBox() {
  document.getElementById('inputBox').value = '';
  document.getElementById('inputBox').focus();
}

function insertFixTimeTask(fixTimeTask) {
  taskList.forEach((item, i) => {
    if (item.fuzzyness() == 'isNullTime') { // Find first nullTime slot
      if ((item.date <= fixTimeTask.date) && (fixTimeTask.duration < item.duration)) {

        null1Duration = fixTimeTask.date - item.date;
        let null1 = new Task(item.date, null1Duration, '')

        null2Duration = item.date.getTime() + item.duration - fixTimeTask.date.getTime() - fixTimeTask.duration;
        let null2 = new Task(fixTimeTask.date + fixTimeTask.duration, null2Duration, '');

        taskList.splice(i, 1, null1, fixTimeTask, null2);
      }
    }
  });
}


function renderTasks(task, index) {
  // let taskId =  Math.floor(Math.random() * 1000000);  // Pick random id in order to be able to pick element later

  let newNode = document.createElement('div');
  newNode.setAttribute('id', index);
  newNode.classList.add(task.fuzzyness());
  if (task.fuzzyness() == 'isFuzzy' || index == 0) {
    newNode.style['line-height'] = '30px';
    newNode.style.height = '30px'; // TODO: incorporate these two lines whereever a task is modified
  } else {
    newNode.setAttribute('onClick', 'gotClicked(this.id)');  // TODO: addEventListener here?
    newNode.style.height = task.height() + 'px'; // TODO: incorporate these two lines whereever a task is modified
    newNode.style['line-height'] = task.height() + 'px';  // TODO: incorporate these two lines whereever a task is modified
  }
  let textNode = document.createTextNode(task.text); // TODO: change .text to displayText
  newNode.appendChild(textNode);
  document.getElementById('day').insertAdjacentElement('beforeend', newNode);
}
