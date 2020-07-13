let serverList = document.getElementById("serverList");

const servers = [
  "view.clearcube.com",
  "cctaddc01.clearcube.local",
  "m1.clearcube.local",
  "m1-rds.clearcube.local",
  "172.16.1.11",
  "172.16.1.12",
];
const serverIPs = [];

const loadServers = () => {
  servers.forEach((val) => {
    const markup = `<li>${val}</li>`;
    serverList.insertAdjacentHTML("beforeend", markup);
  });
};

window.addEventListener("load", loadServers);
