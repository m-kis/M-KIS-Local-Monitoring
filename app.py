from flask import Flask, render_template, jsonify
import psutil

app = Flask(__name__)

# Route principale
@app.route('/')
def index():
    return render_template('index.html')

# Fonction pour formater les octets en format lisible
def format_bytes(size, decimal_places=2):
    for unit in ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']:
        if size < 1024.0:
            break
        size /= 1024.0
    return f"{size:.{decimal_places}f} {unit}"

# Route pour récupérer les données de monitoring
@app.route('/data')
def get_data():
    cpu_percent = psutil.cpu_percent()
    memory_percent = psutil.virtual_memory().percent
    disk_percent = psutil.disk_usage('/').percent

    io_counters = psutil.net_io_counters(pernic=True)
    network_data = []
    for interface, counters in io_counters.items():
        network_data.append({
            'interface': interface,
            'bytes_sent': format_bytes(counters.bytes_sent),
            'bytes_received': format_bytes(counters.bytes_recv)
        })

    connections = psutil.net_connections()
    connection_data = []
    for connection in connections:
        local_address = f"{connection.laddr.ip}:{connection.laddr.port}" if connection.laddr else "N/A"
        remote_address = f"{connection.raddr[0]}:{connection.raddr[1]}" if connection.raddr else "N/A"
        status = connection.status

        try:
            process_name = psutil.Process(connection.pid).name()
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            process_name = "N/A"

        connection_data.append({
            'local_address': local_address,
            'remote_address': remote_address,
            'status': status,
            'process_name': process_name
        })

    data = {
        'cpu_percent': cpu_percent,
        'memory_percent': memory_percent,
        'disk_percent': disk_percent,
        'network_data': network_data,
        'connection_data': connection_data
    }

    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
