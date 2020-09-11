from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import socket
import webbrowser
from threading import Timer
from pythonping import ping
from datetime import datetime as dt

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
CORS(app)

serversFile = 'servers.txt'
serverIPs = []
initialized = False
servernames = ["view.clearcube.com", 
               "cctaddc01.clearcube.local",
               "m1.clearcube.local",
               "m1-rds.clearcube.local",
               "cctfs02.clearcube.local",
               "cctstorage.clearcube.local",
               "Google DNS Server"]


server_ports = [80, 139, 443, 3389, 8080, 8443]


current_time = dt.now()
print(current_time.strftime("%b %d %Y %H:%M"))
webbrowser.open('http://127.0.0.1:5000')


@app.route('/')
def index():
    return render_template('index.html')


@app.before_first_request
def initialize_state():
    db.create_all()
    global initialized
    current_servers = Server.get_current_servers()
    if len(current_servers) > 0:
        initialized = True
    file_log = open("Status Log.txt", "a+")
    file_log.write("\n \n ************************************************************* \n Monitor Started at")
    file_log.write(current_time.strftime("%b %d %Y %H:%M"))
    servers_file = open(serversFile, 'r')
    ips = servers_file.readlines()
    servers_file.close()
    for ip in ips[:-1]:
        serverIPs.append(ip[:-1])
    serverIPs.append(ips[len(ips) - 1])
    # take base servers and add them to database
    if not initialized:
        initialized = True
        for server in serverIPs:
            new_server = Server(server)
            new_server.check_ping()
            new_server.save_to_db()


def update_log(servername, message):
    file_log = open("Status Log.txt", "a+")
    file_log.write("\n \n ************************************************************* \n "
                   "Server {} {} at ".format(servername, message))
    file_log.write(current_time.strftime("%b %d %Y %H:%M"))
    server_list = Server.get_current_servers()
    for server in server_list:
        server.check_ping()


def start_log():
    print("opening log")
    file_log = open("Status Log.txt", "a+") 
    file_log.write("\n \n ************************************************************* \n Monitor Started at ")
    file_log.write(current_time.strftime("%b %d %Y %H:%M"))
    file_log.write("\n")
    print("updated log")
    file_log.close()


@app.route('/servers', methods=['GET'])
def return_servers():
    server_list = Server.get_current_servers()
    server_ips = []
    for server in server_list:
        server_ips.append(server.get_ip())

    return jsonify({
        "servers": server_ips,
    }), 200


@app.route('/update', methods=['GET'])
def update_front_end():
    statuses = []
    port_stats = []
    server_list = Server.get_current_servers()
    for server in server_list:
        statuses.append(server.get_current_status())
        port_stats.append(server.get_port_stats())

    print(statuses)
    print(port_stats)
    return jsonify({
        "statuses": statuses,
        "ports": port_stats
    })


@app.route('/addServer', methods=['POST'])
def add_server():
    try:
        params = request.json
        ip = params['ip']
        servers_list = Server.get_current_servers()
        for server in servers_list:
            if server.get_ip() == ip:
                return 'Server already being checked', 201

        new_server = Server(ip)
        new_server.save_to_db()
        servers_file = open(serversFile, 'a')
        servers_file.write("\n")
        servers_file.write(ip)
        servers_file.close()
        update_log(ip, "added")
        return 'Server Added Successfully', 200

    except:
        return 'System Error', 500


@app.route('/removeServer', methods=['POST'])
def remove_server():
    try:
        params = request.json
        ip = params['ip']
        current_servers = Server.get_current_servers()
        for server in current_servers:
            if ip == server.get_ip():
                server.delete_from_db()
                update_log(ip, "removed")
                file = open(serversFile, 'w')
                for ip in current_servers[:-2]:
                    file.write(str(ip.get_ip()))
                    file.write('\n')
                file.write(current_servers[-2].get_ip())
                file.close()
                return "Server removed successfully", 200

        return "Server not being tracked", 201

    except RuntimeError:
        return 'System Error', 500


# ------------------------------------------------------------------- #
# ------------- Server Class and database integration --------------- #
# ------------------------------------------------------------------- #
class Server(db.Model):
    server_ports = [80, 139, 443, 3389, 8080, 8443]
    BUFFER_SIZE = 2
    # TCP_MSG = b'1'

    id = db.Column(db.Integer, primary_key=True)
    ip = db.Column(db.String(16), nullable=False)
    is_up = db.Column(db.Boolean)
    last_state_change = db.Column(db.DateTime)
    status_message = db.Column(db.String(40))
    port_stats = db.Column(db.String(10), default='')
    initial_state = db.Column(db.Boolean)

    def __init__(self, ip):
        self.is_up = True
        self.last_state_change = dt.now()
        self.ip = ip
        self.initial_state = False
        self.port_stats = ''

    def set_port_stats(self, val):
        self.port_stats += ',' + val

    def get_port_stats(self):
        int_list = []
        for x in self.port_stats[1:].split(','):
            int_list.append(int(x))
        return int_list

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def delete_from_db(self):
        db.session.delete(self)
        db.session.commit()

    def get_ip(self): 
        return str(self.ip)

    def get_current_status(self):
        return self.status_message

    def get_up(self):
        return self.is_up

    def get_initialized(self):
        return self.initial_state

    @classmethod
    def delete_by_ip(cls, ip):
        row = db.session.query(cls).filter(cls.ip == ip)
        row.delete_from_db()

    @classmethod
    def state_change_set(cls, __id, new_state):
        row = db.session.query(cls).filter(cls.id == __id)
        row.last_state_change = new_state
        db.session.commit()

    @classmethod
    def get_current_servers(cls):
        server_list = []
        row = db.session.query(cls)
        for row in row:
            server_list.append(row)

        return server_list

    def check_ping(self):
        file_log = open("Status Log.txt", "a+") 
        self.port_stats = ''
        port_open = False
        for port in server_ports:
            # print("trying port " + str(port) + " at " + self.ip)
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(0.1)
            try:
                s.connect((self.ip, port))
            except:
                self.set_port_stats('0')
                # print("port " + str(port) + " is closed")
            else:
                port_open = True
                self.set_port_stats('1')
                s.close()

        obj = ping(self.ip, verbose=False, count=1, timeout=1)
        if not self.initial_state:
            print("initializiing " + self.ip)
            self.last_state_change = dt.now()
            self.time = self.last_state_change.strftime("%b %d %Y %H:%M")
            self.initial_state = True
            self.is_up = True
            self.status_message = "Alive Since " + self.time

        for thing in obj:
            for_comparison = str(thing)
            print(thing)
            # print(for_comparison)
            if for_comparison == "Request timed out" and not port_open:
                if self.is_up:
                    print("server was up but now is down")
                    self.last_state_change = dt.now()
                    # print("updating log")
                    file_log.write("\n")
                    file_log.write(self.ip + " went down at " + self.last_state_change.strftime("%b %d %Y %H:%M"))
                self.is_up = False
                self.status_message = "Dead since " + self.last_state_change.strftime("%b %d %Y %H:%M")
                self.save_to_db()
            else:
                if not self.is_up:
                    self.last_state_change = dt.now()
                    file_log.write("\n")
                    file_log.write(self.ip + " came back at " + self.last_state_change.strftime("%b %d %Y %H:%M"))
                self.is_up = True
                self.status_message = "Alive since " + self.last_state_change.strftime("%b %d %Y %H:%M")
                self.save_to_db()
        # print(self.ip)
        # print(self.port_stats)
        # print(self.status_message)
        file_log.close()


def update_stored_pings():
    server_list = Server.get_current_servers()
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


rt = RepeatedTimer(60, update_stored_pings)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)
