let serverList = document.getElementById("serverList");

const servers = [
  "view.clearcube.com",
  "cctaddc01.clearcube.local",
  "m1.clearcube.local",
  "m1-rds.clearcube.local",
  "172.16.1.11",
  "172.16.1.12",
];

const serverIPs = [
  "172.16.1.43",
  "172.16.1.10",
  "172.16.1.40",
  "172.16.1.41",
  "172.16.1.11",
  "172.16.1.12",
];

// async function loadServers() {
//   servers.forEach((val) => {
//     const markup = `<li>${val}</li>`;
//     serverList.insertAdjacentHTML("beforeend", markup);
//   });
//   serverIPs.forEach((val) => {
//     fetch(`http://${val}`)
//       .then((res) => console.log(res))
//       .catch((error) => {
//         console.log(error);
//       });
//   });
// }

window.addEventListener("load", loadServers);
