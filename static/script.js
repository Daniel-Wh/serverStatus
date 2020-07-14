const serverList = document.getElementById("serverList");
const statusList = document.getElementById("statusList");

const servers = [
  "view.clearcube.com",
  "cctaddc01.clearcube.local",
  "m1.clearcube.local",
  "m1-rds.clearcube.local",
  "172.16.1.11",
  "172.16.1.12",
];

let statuses = [];

async function loadServers() {
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
