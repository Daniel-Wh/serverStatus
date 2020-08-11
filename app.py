from flask import Flask, render_template, jsonify
from flask_cors import CORS
import json
import socket
import webbrowser
from threading import Timer
from pythonping import ping
from datetime import datetime as dt

app = Flask(__name__)
CORS(app)


serverIPs = ["172.16.1.43",
             "172.16.1.10",
             "172.16.1.40",
             "172.16.1.41",
             "172.16.1.11",
             "192.168.0.11",
             "8.8.8.8"]

servernames = ["view.clearcube.com", 
               "cctaddc01.clearcube.local",
               "m1.clearcube.local",
               "m1-rds.clearcube.local",
               "cctfs02.clearcube.local",
               "cctstorage.clearcube.local",
               "Google DNS Server"]



server_ports = [80, 139, 443, 3389, 8080, 8443]



# serverIPs = ["8.8.8.8", "172.16.1.43"]
servers = []
current_time = dt.now()
print(current_time.strftime("%b %d %Y %H:%M"))
#controller = webbrowser.get('chrome')
#controller.open('172.0.0.1:5000')
webbrowser.open('http://127.0.0.1:5000')


@app.route('/')
def index():
    return render_template('index.html')


@app.before_first_request
def update_pings():

    print("opening log")
    file_log = open("Status Log.txt", "a+") 
    file_log.write("\n \n ************************************************************* \n Monitor Started at")
    file_log.write(current_time.strftime("%b %d %Y %H:%M"))

    print("updated log")
    for server in serverIPs:
        new_server = Server(server)
        new_server.check_ping()
        servers.append(new_server)

def start_log():
    print("opening log")
    file_log = open("Status Log.txt", "a+") 
    file_log.write("\n \n ************************************************************* \n Monitor Started at")
    file_log.write(current_time.strftime("%b %d %Y %H:%M"))
    file_log.write("\n")
    print("updated log")
    file_log.close()



@app.route('/update', methods=['GET'])
def update_front_end():
    statuses = []
    port_stats = []
    for server in servers:
        statuses.append(server.get_current_status())
        port_stats.append(server.get_port_stats())
    #port_stats.clear()

    return jsonify({
        "statuses": statuses,
        "ports": port_stats
    })



class Server:
    server_ports = [80, 139, 443, 3389, 8080, 8443]
    time = 0
    is_up = True
    #port_open = False
    initialized = False
    status_message = ""
    port_stats = []

    BUFFER_SIZE = 2
    #TCP_MSG = b'1'


    def __init__(self, ip):
        self.ip = ip

    def get_ip(self): 
        return self.ip

    def get_current_status(self):
        return self.status_message
    
    def get_port_stats(self):
        return self.port_stats

    def check_ping(self):
        file_log = open("Status Log.txt", "a+") 
        self.port_stats.clear()
        port_open = False
        for port in server_ports:
            #print("trying port " + str(port) + " at " + self.ip)
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(0.1)
            try:
                s.connect((self.ip, port))
            except:
                self.port_stats.append(0)
                #print("port " + str(port) + " is closed")
            else:
                #if self.is_up:
                port_open = True
                self.port_stats.append(1)
                #s.send(self.TCP_MSG)
                #data = s.recv(self.BUFFER_SIZE)
                s.close()
                #print("connected successfully")


        obj = ping(self.ip, verbose=False, count=1, timeout=1)
        if not self.initialized:
            self.time = dt.now().strftime("%b %d %Y %H:%M")
            self.initialized = True
        for thing in obj:
            for_comparison = str(thing)
            #print(for_comparison)
            if for_comparison == "Request timed out" and not port_open:
                if self.is_up:
                    self.time = dt.now().strftime("%b %d %Y %H:%M")
                    print("updating log")
                    file_log.write(self.ip + " went down at " + self.time)
                self.is_up = False
                self.status_message = "Dead since " + self.time
                print(self.status_message)
            else:
                if not self.is_up:
                    self.time = dt.now().strftime("%b %d %Y %H:%M")
                    file_log.write(self.ip + " came back at " + self.time)
                self.is_up = True
                self.status_message = "Alive since " + self.time

        

        #s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        # self.port_stats.clear()
        # port_open = False
        # for port in server_ports:
        #     #print("trying port " + str(port) + " at " + self.ip)
        #     s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        #     s.settimeout(0.1)
        #     try:
        #         s.connect((self.ip, port))
        #     except:
        #         self.port_stats.append(0)
        #         #print("port " + str(port) + " is closed")
        #     else:
        #         #if self.is_up:
        #         port_open = True
        #         self.port_stats.append(1)
        #         #s.send(self.TCP_MSG)
        #         #data = s.recv(self.BUFFER_SIZE)
        #         s.close()
        #         #print("connected successfully")



            
        print(self.ip)
        print(self.status_message)
        print(str(self.port_stats))
        file_log.close()


def update_stored_pings(server_list):
    for server in server_list:
        server.check_ping()


class RepeatedTimer(object):
    def __init__(self, interval, function, *args, **kwargs):
        self._timer = None
        self.interval = interval
        self.function = function
        self.args = args
        self.kwargs = kwargs
        self.is_running = False
        self.start()

    def _run(self):
        self.is_running = False
        self.start()
        self.function(*self.args, **self.kwargs)

    def start(self):
        if not self.is_running:
            self._timer = Timer(self.interval, self._run)
            self._timer.start()
            self.is_running = True

    def stop(self):
        self._timer.cancel()
        self.is_running = False


rt = RepeatedTimer(60, update_stored_pings, servers)


if __name__ == '__main__':
    app.run()
