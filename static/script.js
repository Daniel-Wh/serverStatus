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
const logTextList = document.getElementById("log-text-list")
const tempSection = document.getElementById("tempSection")
const temperature = document.getElementById("temperature")
const humidity = document.getElementById("humidity")


const server_ports = ["80", "139", "443", "3389", "8080", "8443"];

let state = {
}



const getFullDate = ()=>{
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
  
  return fullDate = `${dayName} the ${day} of ${month} ${now.getFullYear()} ${time}`;
}

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
  dateHeader.innerText = getFullDate();
  servers = [];
  serverElements =[]
  serverList.innerHTML = "";
  await fetch("/servers", { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
      servers = data.servers;
      state.temp = data.temp
      updateServerUI();
      addServerElEvents();
      updateTemp();
    });
  
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
      console.log(data.text_logs)
      state.textLogs = data.text_logs
      updateTextLogs()
      port_stats = data.ports;
      state.temp = data.temp
      updateStatusList(data.statuses);
    });

    
  serverElements.forEach((server) => {
    const serverRemoveSpan = document.getElementById(`span-${server.id}`);
    
    server.addEventListener("mouseover", () => {
      document.getElementById(server.id).classList.toggle("server-focus");
      state.serverIndex = server.id
      serverWarningText.innerText = `Are you sure you want to remove: ${
        servers[state.serverIndex]
      }`;
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
    });
  });
}

const updateTextLogs = ()=>{
  logTextList.innerHTML = ''
  let markUp
  state.textLogs.forEach((log, index) =>{
    if(index < 8){
      status = log.split(' ')[2]
    switch(status){
      case 'added':
        markUp = `<li><span class="added">add</span><p>${log}</p></li>`
        break;
      case 'removed':
        markUp = `<li><span class="removed">remove</span><p>${log}</p></li>`
        break;
      case 'started':
        // markup for server started
        markUp = `<li><span class="monitor">start</span><p>${log}</p></li>`
        break;
      case 'came':
        // markup for serve online
        markUp = `<li><span class="up">up</span><p>${log}</p></li>`
        break
      case 'went':
        //markup for server went down
        markUp = `<li><span class="down">down</span><p>${log}</p></li>`
        break
    }
    logTextList.insertAdjacentHTML('beforeend', markUp)
    }
    
    
  })
}


yesRemoveServer.addEventListener("click", removeServer);
noRemoveServer.addEventListener("click", () => {
  removeWarningContainer.classList.toggle("show");
});

async function removeServer() {


  await fetch("/removeServer", {
    method: "POST",
    body: JSON.stringify({ ip: "" + servers[state.serverIndex] }),
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
      state.textLogs = data.text_logs
      state.temp = temp
      updateStatusList(data.statuses);
      updateTextLogs()
      updateTemp()
    });
}

const updateTemp = () => {
  temperature.innerText = state.temp.temp
  humidity.innerText = state.temp.hum
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

      if (response.status == 201) {
        alert(`We're already watching this server`);
      } else if (response.status == 200) {
        serverContainer.classList.toggle("show");
        serverInput.value = "";
        serverList.innerHTML = "";
        loadServers();
      } else if (response.status == 500) {
        alert("something went wrong, please reach out to the administrator");
      }
    })
    .then((data) => {

    });
}

addServerContainer.addEventListener("mouseover", () => {
  addServerContainer.classList.toggle("add-server-btn-focus");
});
addServerContainer.addEventListener("mouseout", () => {
  addServerContainer.classList.toggle("add-server-btn-focus");
});
