from flask import Flask, render_template, jsonify
import psutil

app = Flask(__name__)

# Liste pour stocker les seuils de performances
performance_thresholds = {
    'cpu': 90,  # Seuil d'utilisation du CPU (en pourcentage)
    'memory': 80  # Seuil d'utilisation de la mémoire (en pourcentage)
}

# Route principale
@app.route('/')
def index():
    interfaces = get_available_interfaces()
    return render_template('index.html', interfaces=interfaces)

# Fonction pour formater les octets en format lisible
def format_bytes(size, decimal_places=2):
    for unit in ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']:
        if size < 1024.0:
            break
        size /= 1024.0
    return f"{size:.{decimal_places}f} {unit}"

# Fonction pour obtenir les interfaces disponibles
def get_available_interfaces():
    io_counters = psutil.net_io_counters(pernic=True)
    interfaces = list(io_counters.keys())
    return interfaces

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

    # Vérifier les seuils de performances et déclencher des notifications si nécessaire
    check_performance_thresholds(cpu_percent, memory_percent)

    return jsonify(data)

def check_performance_thresholds(cpu_percent, memory_percent):
    if cpu_percent > performance_thresholds['cpu']:
        # Dépassement du seuil d'utilisation du CPU
        print('High CPU Usage')

    if memory_percent > performance_thresholds['memory']:
        # Dépassement du seuil d'utilisation de la mémoire
        print('High Memory Usage')

if __name__ == '__main__':
    app.run(debug=True)