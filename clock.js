/**
  * Problem 1: The Race around the World
  * Author: Jason Lee
  *
  * Summary: Must build a stopwatch web application consisting of a
  * start/stop button and a history table.
  * The behavior of the start button is that it will make an entry to
  * the history table with the start time, timezone, latitude, and longitude.
  * The behavior of the stop button is that it will make an entry to the history
  * table with the end time, timezone, latitude, longitude, and time elapsed.
  * The extra task is to build a reset button for the table to remove
  * previous entries to the history table.
  *
  * Since the specifications did not specify the format of the stopwatch's time,
  * it was set to the show hours, minutes and seconds since those are the
  * typical values shown by clocks.
  */
var timeValue = 0;
var timeId;
var historyTableSizeKey = "historyTableSize";
var historyTableEntryKey = "historyTableEntry";
var permissionToLocate = false;

function initStopwatch() {
  timeValue = 0;

  if (window['localStorage']) {
    if (localStorage.getItem(historyTableSizeKey)) {
      var timesLogged = parseInt(localStorage.getItem(historyTableSizeKey));
      for (i = 0; i < timesLogged; i++) {
        setEntryInHistory(localStorage.getItem(historyTableEntryKey + i));
      }
    } else {
      localStorage.setItem(historyTableSizeKey, "0");
    }
  } else {
    console.log("No local storage available");
  }
}

function handleTime(state) {
  if (state.value === "Start") {
    state.value = "Stop";
    startTime();
  } else {
    state.value = "Start";
    stopTime();
  }
}

function startTime() {
  function updateTime() {
    var timeDisplay = document.getElementById('time');
    timeValue = timeValue + 1;
    timeDisplay.innerHTML = secondsToTime(timeValue);
    timeId = setTimeout(updateTime, 1000);
  }

  if (timeId) { clearTimeout(timeId); }
  timeId = setTimeout(updateTime, 1000);
  generateEntry(false);
}

function stopTime() {
  clearTimeout(timeId);
  generateEntry(true);
}

/**
  * This function must be aware of race conditions due to the asynchronous request
  * executed by navigator.geolocation.getCurrentPosition. This implies not holding
  * onto memory through old, cleaned-up DOM objects, or entries in the storage.
  */
function generateEntry(onStop) {
  var timeClicked = timeValue;
  var timezone = "GMT+" + ((new Date()).getTimezoneOffset()) / 60;
  var timeElapsed;
  var localStorageEntryIndex;

  if (onStop) {
    var table = document.getElementById('historyTable');
    if (table.rows.length > 1) {
      var previousTime = table.rows[table.rows.length - 1]
                        .cells[0].innerHTML.split(",")[0];
      timeElapsed = secondsToTime(timeClicked - timeToSeconds(previousTime));
    } else {
      timeElapsed = secondsToTime(timeClicked);
    }
  } else {
    timeElapsed = "NULL";
  }

  var entry = secondsToTime(timeClicked) + ","
  + timezone + ",NULL,NULL," + timeElapsed;

  if (window['localStorage']) {
    // Increment known local entries
    localStorageEntryIndex = parseInt(localStorage.getItem(historyTableSizeKey));
    localStorage.setItem(historyTableSizeKey, localStorageEntryIndex + 1);
    // Add entry in local history
    localStorage.setItem(historyTableEntryKey + localStorageEntryIndex, entry);
  }

  var rowEntry = setEntryInHistory(entry);

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var latitude = position.coords.latitude.toFixed(3);
      var longitude = position.coords.longitude.toFixed(3);
      rowEntry.cells[2].innerHTML = latitude;
      rowEntry.cells[3].innerHTML = longitude;

      if (localStorage.getItem(historyTableEntryKey + localStorageEntryIndex)) {
        var temp = localStorage.getItem(historyTableEntryKey + localStorageEntryIndex).split(",");
        temp[2] = latitude;
        temp[3] = longitude;
        localStorage.setItem(historyTableEntryKey + localStorageEntryIndex, temp.join());
      }
    }, function() {
      console.log("No geolocation allowed.");
    });
  }
}

function setEntryInHistory(entry) {
  // Display entry on doc
  var table = document.getElementById('historyTable');
  var row = table.insertRow(-1);
  var timeEntry = row.insertCell(0);
  var timezoneEntry = row.insertCell(1);
  var latitudeEntry = row.insertCell(2);
  var longitudeEntry = row.insertCell(3);
  var timeElapsed = row.insertCell(4);
  var entryValues = entry.split(",")

  timeEntry.innerHTML = entryValues[0];
  timezoneEntry.innerHTML = entryValues[1];
  latitudeEntry.innerHTML = entryValues[2];
  longitudeEntry.innerHTML = entryValues[3];
  timeElapsed.innerHTML = entryValues[4];

  return row;
}

function resetTable() {
  if (window['localStorage']) {
    // Increment known local entries
    localStorage.clear();
    localStorage.setItem(historyTableSizeKey, "0");
  }

  var table = document.getElementById("historyTable");
  while (table.rows.length > 1) {
    table.deleteRow(1);
  }
}

function secondsToTime(seconds) {
  return Math.floor(seconds / 3600) + " h "
  + (Math.floor(seconds / 60) % 60) + " m "
  + (seconds % 60) + " s";
}

function timeToSeconds(seconds) {
  var tokens = seconds.split(" ");
  return parseInt(tokens[0]) * 3600 + parseInt(tokens[2]) * 60
  + parseInt(tokens[4]);
}
