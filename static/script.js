const serverList = document.getElementById("serverList");
const statusList = document.getElementById("statusList");
const dateHeader = document.getElementById("date");
const portStatus = document.getElementById("port-status");

const now = new Date();

const server_ports = ["80", "139", "443", "3389", "8080", "8443"];

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

let serverElements = [];

let statuses = [];
let port_stats;

async function loadServers() {
  dateHeader.innerText = fullDate;
  servers.forEach((val, index) => {
    const markup = `<li id="${index}">${val}</li>`;
    serverList.insertAdjacentHTML("beforeend", markup);
    const serverEl = document.getElementById(index);
    serverElements.push(serverEl);
  });
  await fetch("/update", { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
      port_stats = data.ports;
      updateStatusList(data.statuses);
    });
  addServerElEvents();
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
// set up event listeners for server list

const addServerElEvents = () => {
  serverElements.forEach((val) => {
    val.addEventListener("click", () => {
      createModal(val.id);
    });
  });
};

const createModal = (index) => {
  let markUp = `<div class="port-list">
                  <ul>
                  <li>Ports</li>
                    `;
  port_stats[index].forEach((val, index) => {
    markUp +=
      `<li ` +
      (val === 0 ? `class="dead-port"` : `class="active-port"`) +
      `>${server_ports[index]}</li>`;
  });
  markUp += `</ul>
  </div>`;
  portStatus.classList.add("port-status");
  portStatus.insertAdjacentHTML("beforeend", markUp);
  setTimeout(() => {
    while (portStatus.firstChild) {
      portStatus.removeChild(portStatus.firstChild);
    }
    portStatus.classList.remove("port-status");
  }, 3500);
};
