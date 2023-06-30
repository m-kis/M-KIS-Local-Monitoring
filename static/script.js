document.addEventListener('DOMContentLoaded', function() {
    fetchData(); // Appel initial pour récupérer les données

    // Récupère les données de monitoring toutes les 5 secondes
    setInterval(fetchData, 5000);
});

function fetchData() {
    fetch('/data')
        .then(response => response.json())
        .then(data => {
            updateCPUChart(data.cpu_percent);
            updateMemoryChart(data.memory_percent);
            updateDiskChart(data.disk_percent);
            updateNetworkTable(data.network_data);
            updateConnectionsTable(data.connection_data);
        })
        .catch(error => console.error('Erreur lors de la récupération des données:', error));
}

function updateCPUChart(cpuPercent) {
    var cpuChartElement = document.getElementById('cpu-chart');

    var cpuChart = new Chart(cpuChartElement, {
        type: 'doughnut',
        data: {
            labels: ['CPU Usage', 'Idle'],
            datasets: [{
                data: [cpuPercent, 100 - cpuPercent],
                backgroundColor: ['#35C0ED', '#9AEBA6']
            }]
        },
        options: {
            responsive: true
        }
    });
}

function updateMemoryChart(memoryPercent) {
    var memoryChartElement = document.getElementById('memory-chart');

    var memoryChart = new Chart(memoryChartElement, {
        type: 'doughnut',
        data: {
            labels: ['Memory Usage', 'Available'],
            datasets: [{
                data: [memoryPercent, 100 - memoryPercent],
                backgroundColor: ['#35C0ED', '#9AEBA6']
            }]
        },
        options: {
            responsive: true
        }
    });
}

function updateDiskChart(diskPercent) {
    var diskChartElement = document.getElementById('disk-chart');

    var diskChart = new Chart(diskChartElement, {
        type: 'doughnut',
        data: {
            labels: ['Disk Usage', 'Free'],
            datasets: [{
                data: [diskPercent, 100 - diskPercent],
                backgroundColor: ['#35C0ED', '#9AEBA6']
            }]
        },
        options: {
            responsive: true
        }
    });
}

function updateNetworkTable(networkData) {
    var networkTable = document.getElementById('network-table');
    networkTable.innerHTML = ''; // Réinitialise le contenu de la table

    // Ajoute les lignes de données à la table
    networkData.forEach(function(data) {
        var row = networkTable.insertRow();
        var interfaceCell = row.insertCell();
        var sentCell = row.insertCell();
        var receivedCell = row.insertCell();

        interfaceCell.textContent = data.interface;
        sentCell.textContent = data.bytes_sent;
        receivedCell.textContent = data.bytes_received;
    });
}

function updateConnectionsTable(connectionData) {
    var connectionsTable = document.getElementById('connections-table');
    connectionsTable.innerHTML = ''; // Réinitialise le contenu de la table

    // Ajoute les lignes de données à la table
    connectionData.forEach(function(data) {
        var row = connectionsTable.insertRow();
        var localAddressCell = row.insertCell();
        var remoteAddressCell = row.insertCell();
        var statusCell = row.insertCell();
        var processNameCell = row.insertCell();

        localAddressCell.textContent = data.local_address;
        remoteAddressCell.textContent = data.remote_address;
        statusCell.textContent = data.status;
        processNameCell.textContent = data.process_name;
    });
}
