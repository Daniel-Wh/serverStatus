const serverList = document.getElementById("serverList");
const statusList = document.getElementById("statusList");
const dateHeader = document.getElementById("date");
const portStatus = document.getElementById("port-status");
const closeAddServerModal = document.getElementById("modal-cls-btn");
const serverContainer = document.getElementById("server-container");
const addServerContainer = document.getElementById("add-server-btn");
const serverForm = document.getElementById("server-form");
const serverInput = document.getElementById("server-input");
const serverSubmit = document.getElementById("server-submit");
const serverWarningText = document.getElementById("server-warning-text");
const removeWarningContainer = document.getElementById("remove-container");
const yesRemoveServer = document.getElementById("yes-remove-server");
const noRemoveServer = document.getElementById("no-remove-server");
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

let servers = [
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
  servers = [];
  serverList.innerHTML = "";
  await fetch("/servers", { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
      servers = data.servers;
      updateServerUI();
    });
  addServerElEvents();
}

async function updateServerUI() {
  servers.forEach((val, index) => {
    const markup = `<div class="server-remove" id="server-${index}"><li id="${index}">${val}</li><span id="span-${index}">⨉</span></div>`;
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

  serverElements.forEach((server) => {
    const serverRemoveSpan = document.getElementById(`span-${server.id}`);

    server.addEventListener("mouseover", () => {
      document.getElementById(server.id).classList.toggle("server-focus");
      document.getElementById(`span-${server.id}`).style.display = "block";
    });

    server.addEventListener("mouseout", () => {
      document.getElementById(server.id).classList.toggle("server-focus");
      setTimeout(() => {
        document.getElementById(`span-${server.id}`).style.display = "none";
      }, 2000);
    });
    serverRemoveSpan.addEventListener("click", () => {
      removeWarningContainer.classList.toggle("show");
      serverWarningText.innerText = `Are you sure you want to remove: ${
        servers[server.id]
      }`;
      yesRemoveServer.addEventListener("click", removeServer(server.id));
      noRemoveServer.addEventListener("click", () => {
        removeWarningContainer.classList.toggle("show");
      });
    });
  });
}

async function removeServer(serverIndex) {
  console.log("remove server: " + servers[serverIndex]);

  await fetch("/removeServer", {
    method: "POST",
    body: JSON.stringify({ ip: "" + servers[serverIndex] }),
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then((response) => {
    if (response.status == 200) {
      removeWarningContainer.classList.toggle("show");
      loadServers();
    }
  });
}

async function getUpdate() {
  statusList.innerHTML = "";
  dateHeader.innerText = fullDate;
  await fetch("/update", { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
      port_stats = data.ports;
      updateStatusList(data.statuses);
    });
}

const updateStatusList = (serverStatus) => {
  statusList.innerHTML = "";
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

addServerContainer.addEventListener("click", () => {
  serverContainer.classList.toggle("show");
});

closeAddServerModal.addEventListener("click", () => {
  serverContainer.classList.toggle("show");
});

serverSubmit.addEventListener("click", () => {
  const input = serverInput.value;
  if (input) {
    servers.push(input);
    addServerReq(input);
  }
  console.log(input);
});

setInterval(() => {
  getUpdate();
}, 60000);

function addServerReq(server) {
  // const response = postServer("/addServer", { ip: `${server}` });
  addServer({ ip: `${"" + server}` });
  // console.log(response);
  // serverContainer.classList.toggle("show");
  // serverInput.value = "";
}

async function addServer(server) {
  await fetch("/addServer", {
    method: "POST",
    body: JSON.stringify(server),
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
    .then((response) => {
      console.log(response);
      if (response.status == 201) {
        alert(`We're already watching this server`);
      } else if (response.status == 200) {
        serverContainer.classList.toggle("show");
        serverInput.value = "";
        servers.push(server.ip);
        serverList.innerHTML = "";
        loadServers();
      } else if (response.status == 500) {
        alert("something went wrong, please reach out to the administrator");
      }
    })
    .then((data) => {
      console.log(data);
    });
}

addServerContainer.addEventListener("mouseover", () => {
  addServerContainer.classList.toggle("add-server-btn-focus");
});
addServerContainer.addEventListener("mouseout", () => {
  addServerContainer.classList.toggle("add-server-btn-focus");
});
