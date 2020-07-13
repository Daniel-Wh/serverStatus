from flask import Flask
from pythonping import ping

app = Flask(__name__)

serverIPs = ["172.16.1.43",
             "172.16.1.10",
             "172.16.1.40",
             "172.16.1.41",
             "172.16.1.11",
             "172.16.1.12", ]

# serverIPs = ["8.8.8.8"]
pingResponses = []

@app.route('/')
def hello_world():

    return 'Hello World!'

@app.before_first_request
def update_pings():
    for server in serverIPs:
        obj = ping(server, verbose=True, count=2, timeout=5)
        pingResponses.append(obj)

    print(pingResponses)

if __name__ == '__main__':
    app.run()
