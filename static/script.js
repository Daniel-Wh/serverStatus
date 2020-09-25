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
let state = {
  servers: [],
  statuses: [],
  serverElements: [],
  port_stats: [],
  temp: '',
  hum: ''
}

async function loadServers() {
  dateHeader.innerText = getFullDate();
  state.servers = [];
  state.serverElements =[]
  serverList.innerHTML = "";
  await fetch("/servers", { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
      state.servers = data.servers;
      state.temp = data.temp
      updateServerUI();
      addServerElEvents();
      updateTemp();
    });
  
}

async function updateServerUI() {
  
  state.servers.forEach((val, index) => {
    const markup = `<div class="server-remove" id="server-${index}"><li id="${index}">${val}</li><span id="span-${index}">⨉</span></div>`;
    serverList.insertAdjacentHTML("beforeend", markup);
    const serverEl = document.getElementById(index);
    state.serverElements.push(serverEl);
  });
  await fetch("/update", { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
      state.textLogs = data.text_logs
      updateTextLogs()
      state.port_stats = data.ports;
      state.temp = data.temp
      updateStatusList(data.statuses);
    });

  state.serverElements.forEach((server) => {
    const serverRemoveSpan = document.getElementById(`span-${server.id}`);
    
    server.addEventListener("mouseover", () => {
      document.getElementById(server.id).classList.toggle("server-focus");
      state.serverIndex = server.id
      serverWarningText.innerText = `Are you sure you want to remove: ${
        state.servers[state.serverIndex]
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
    console.log(server)
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
    body: JSON.stringify({ ip: "" + state.servers[state.serverIndex] }),
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
  dateHeader.innerText = getFullDate();
  await fetch("/update", { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
      state.port_stats = data.ports;
      state.textLogs = data.text_logs
      state.temp = data.temp
      updateStatusList(data.statuses);
      updateTextLogs()
      updateTemp()
    });
}

const updateTemp = () => {
  temperature.innerText = state.temp.temp + `° F`
  humidity.innerText = state.temp.hum + ` %`
  console.log(parseFloat(state.temp.temp))
  if(parseFloat(state.temp.temp) > 80.0){
    temperature.classList.remove("good-temp")
    temperature.classList.add("bad-temp")
  }
  else {
    console.log("good temp class added")
    temperature.classList.remove("bad-temp")
    temperature.classList.add("good-temp")
  }
  if(parseFloat(state.temp.hum) > 60){
    humidity.classList.add('bad-temp')
    humidity.classList.remove('good-temp')
  }
  else{
    humidity.classList.add('good-temp')
    humidity.classList.remove('bad-temp')
  }
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
  state.serverElements.forEach((val) => {
    val.addEventListener("click", () => {
      console.log(val.id)
      createModal(val.id);
    });
  });
};

const createModal = (index) => {
  let markUp = `<div class="port-list">
                  <ul>
                  <li>Ports</li>
                    `;
  console.log(state.port_stats[index])
  state.port_stats[index].forEach((val, index) => {
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
    state.servers.push(input);
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
