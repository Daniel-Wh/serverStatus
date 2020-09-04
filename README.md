## Server Status

Simple flask app with front end that provides ping updates for various servers.
<br />
To use, fork repo, replace ip address in flask app and Javascript list.
<br />
Run the flask app in development mode and every minute the online status will be updated in the flask app.
<br />
When the front end is loaded through a browser it will refresh every minute as well.
<br />

## Recent Updates

Added a text file logging system <br/>
Updated UI to reflect which ports are up <br/>
Added sqlite database for server info <br/>
Added endpoints to remove and add server <br/>

## Client requests

Dynamically adjust which servers are being monitored at UI
<br />
Visual log of uptime and recent changes on page (clickable to expand, not necessarily on page all the time)
<br />
database to maintain historical downtime information on servers
<br />
Using a different pi to gather temp/humidity info of server and display using graph (Likely going to use Bokeh)
