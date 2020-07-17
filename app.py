from flask import Flask, render_template, jsonify
import json
import socket
from threading import Timer
from pythonping import ping
from datetime import datetime as dt

app = Flask(__name__)

serverIPs = ["172.16.1.43",
             "172.16.1.10",
             "172.16.1.40",
             "172.16.1.41",
             "172.16.1.11",
             "172.16.1.12",
             "8.8.8.8"]



server_ports = [80, 139, 443, 3389, 8080, 8443]



# serverIPs = ["8.8.8.8", "172.16.1.43"]
servers = []
current_time = dt.now()
print(current_time.strftime("%b %d %Y %H:%M"))


@app.route('/')
def hello_world():
    return render_template('index.html')


@app.before_first_request
def update_pings():
    for server in serverIPs:
        new_server = Server(server)
        new_server.check_ping()
        servers.append(new_server)


@app.route('/update', methods=['GET'])
def update_front_end():
    statuses = []
    port_stats = []
    for server in servers:
        statuses.append(server.get_current_status())
        port_stats.append(server.get_port_stats())

    return jsonify({
        "statuses": statuses,
        "ports": port_stats
    })


class Server:
    time = 0
    is_up = True
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
        obj = ping(self.ip, verbose=False, count=1, timeout=1)
        if not self.initialized:
            self.time = dt.now().strftime("%b %d %Y %H:%M")
            self.initialized = True
        for thing in obj:
            for_comparison = str(thing)
            if for_comparison == "Request timed out":
                if self.is_up:
                    self.time = dt.now().strftime("%b %d %Y %H:%M")
                self.is_up = False
                self.status_message = "Dead since " + self.time
                print(self.status_message)
            else:
                if not self.is_up:
                    self.time = dt.now().strftime("%b %d %Y %H:%M")
                self.is_up = True


                self.port_stats.clear()

                #s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
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
                        self.port_stats.append(1)
                        #s.send(self.TCP_MSG)
                        #data = s.recv(self.BUFFER_SIZE)
                        s.close()
   
                        #print("connected successfully")



                self.status_message = "Alive since " + self.time
                print(self.ip)
                print(self.status_message)
                print(str(self.port_stats))


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
