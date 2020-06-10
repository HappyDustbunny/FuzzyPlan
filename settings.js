
document.getElementById('apply').addEventListener('click', apply);
document.getElementById('cancel').addEventListener('click', cancel);
document.getElementById('clearDay').addEventListener('click', clearDay);
document.getElementById('goBack').addEventListener('click', goBack);


function setUpFunc() {
  let inputBox = document.getElementById('inputBoxH');
  inputBox.select();
}


function apply() {
  let hours = document.getElementById('inputBoxH').value.trim();
  let min = document.getElementById('inputBoxM').value.trim();

  if (isNaN(hours) || hours < 0 || 23 < hours) {
    displayMessage('Please use only numbers between 0 and 23', 3000);
    document.getElementById('inputBoxH').select();
    return;
  }

  if (isNaN(min) || min < 0 || 60 < min) {
   displayMessage('Please use only numbers between 0 and 60', 3000);
   document.getElementById('inputBoxM').select();
   return;
 }

 let radioButtonResult = document.getElementsByClassName('alarm');
 for (var i = 0; i < 4; i++) {
   if (radioButtonResult[i].type === 'radio' && radioButtonResult[i].checked) {
     localStorage.radioButtonResult = radioButtonResult[i].value;
   }
 }


  localStorage.wakeUpH = hours;
  localStorage.wakeUpM = min;
  window.location.assign('main.html');
}


function cancel() {
  window.location.assign('main.html');
}


function clearDay() {
  let answer = confirm('Do you want to remove all tasks and start planning a new day?');
  if (answer == true) {
    localStorage.taskListAsText = [];
    localStorage.wakeUpOrNowClickedOnce = false;
    window.location.assign('main.html');
  } else {
    displayMessage('Nothing was changed', 3000);
  }
}


function goBack() {
  window.location.assign('main.html');
}

function displayMessage(text, displayTime) {
  console.log(text);
  msg = document.getElementById('message');
  msg.style.display = 'inline-block';
  msg.style.color = 'red';
  msg.innerText = text;

  setTimeout(function() {msg.style.display = 'none';}, displayTime)
}
