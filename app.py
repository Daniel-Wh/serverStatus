from flask import Flask, render_template
from pythonping import ping
from datetime import datetime as dt

app = Flask(__name__)

# serverIPs = ["172.16.1.43",
#              "172.16.1.10",
#              "172.16.1.40",
#              "172.16.1.41",
#              "172.16.1.11",
#              "172.16.1.12", ]

serverIPs = ["8.8.8.8", "172.16.1.43"]
pingResponses = []
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


class Server:
    time = 0
    isUp = True

    def __init__(self, ip):
        self.ip = ip

    def update_time(self, time):
        self.time = time

    def update_status(self, status):
        self.isUp = status

    def check_ping(self):
        obj = ping(self.ip, verbose=False, count=2, timeout=1)
        print(obj)




if __name__ == '__main__':
    app.run()
