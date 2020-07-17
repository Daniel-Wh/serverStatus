const serverList = document.getElementById("serverList");
const statusList = document.getElementById("statusList");
const dateHeader = document.getElementById("date");

const now = new Date();

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const dayName = days[now.getDay()];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const month = months[now.getMonth()];
let day = now.getDate();
switch (now.getDate()) {
  case 1:
    day += "st";
    break;
  case 2:
    day += "nd";
    break;
  case 3:
    day += "rd";
    break;
  default:
    day += "th";
    break;
}
let minutes;
if (now.getMinutes() < 10) {
  minutes = "0" + now.getMinutes();
} else {
  minutes = now.getMinutes();
}
const time = now.getHours() + ":" + minutes;

const fullDate = `${dayName} the ${day} of ${month} ${now.getFullYear()} ${time}`;

const servers = [
  "view.clearcube.com",
  "cctaddc01.clearcube.local",
  "m1.clearcube.local",
  "m1-rds.clearcube.local",
  "172.16.1.11",
  "172.16.1.12",
  "8.8.8.8",
];

let statuses = [];

async function loadServers() {
  dateHeader.innerText = fullDate;
  servers.forEach((val) => {
    const markup = `<li>${val}</li>`;
    serverList.insertAdjacentHTML("beforeend", markup);
  });
  await fetch("http://127.0.0.1:5000/update", { method: "GET" })
    .then((response) => response.json())
    .then((data) => updateStatusList(data.statuses));
}

const updateStatusList = (serverStatus) => {
  serverStatus.forEach((val) => {
    const deadOrAlive = val[0];
    let markup = "";
    if (deadOrAlive == "A") {
      markup = `<li class="alive">${val}</li>`;
    } else {
      markup = `<li class="dead">${val}</li>`;
    }

    statusList.insertAdjacentHTML("beforeend", markup);
  });
};
window.addEventListener("load", loadServers);
