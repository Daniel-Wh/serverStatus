## Server Status

Simple flask app with front end that provides ping updates for various servers.
<br />
To use, fork repo, replace ips in text file, open a terminal in the directory and run pip install -r requirements.txt, you will also need to run NPM install to get the packages for the temperature reading.
<br /> 
The application can run without temperature input if you're just interested in getting internal ip connection logs
<br />
Run the flask 
<br />
When the front end is loaded through a browser it will refresh the page's content each minute
<br />

## Recent Updates

Added a text file logging system <br/>
Updated UI to reflect which ports are up <br/>
Added sqlite database for server info <br/>
Added endpoints to remove and add server <br/>
Added temperature and humidity logging system from node.js for pi 4, application will ultimately be placed in server room and will monitor temps <br/>
Dynamically adjust which servers are being monitored at UI
<br />

## Client requests


Visual log of uptime and recent changes on page (clickable to expand, not necessarily on page all the time)
<br />
database to maintain historical downtime information on servers
<br />
Update UI with temp history, current temp of server room, and humidity. Create endpoints to serve Bokeh interactive visualization (potentially paired with external weather data to compare temps)
<br />
Look for hooks into freeNAS
