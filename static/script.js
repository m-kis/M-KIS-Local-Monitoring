function applyFilters() {
    var interfaceSelect = document.getElementById('interface-select');
    var selectedInterface = interfaceSelect.value;

    var networkTable = document.getElementById('network-table');
    var rows = networkTable.getElementsByTagName('tr');

    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var interfaceCell = row.getElementsByTagName('td')[0];
        if (interfaceCell) {
            var interfaceValue = interfaceCell.textContent || interfaceCell.innerText;
            if (selectedInterface === 'all' || selectedInterface === interfaceValue) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    }
}

function fetchData() {
    fetch('/data')
        .then(response => response.json())
        .then(data => {
            updateCPUChart(data.cpu_percent);
            updateMemoryChart(data.memory_percent);
            updateDiskChart(data.disk_percent);
            updateNetworkTable(data.network_data);
            updateConnectionsTable(data.connection_data);
            checkPerformanceThresholds(data.cpu_percent, data.memory_percent);
        })
        .catch(error => console.error('Error fetching data:', error));
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
    networkTable.innerHTML = '';

    networkData.forEach(function (data) {
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
    connectionsTable.innerHTML = '';

    connectionData.forEach(function (data) {
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

function searchConnections() {
    var input = document.getElementById('search-input');
    var filter = input.value.toUpperCase();

    var connectionsTable = document.getElementById('connections-table');
    var rows = connectionsTable.getElementsByTagName('tr');

    for (var i = 0; i < rows.length; i++) {
        var processNameCell = rows[i].getElementsByTagName('td')[3];
        if (processNameCell) {
            var processName = processNameCell.textContent || processNameCell.innerText;
            if (processName.toUpperCase().indexOf(filter) > -1) {
                rows[i].style.display = '';
            } else {
                rows[i].style.display = 'none';
            }
        }
    }
}

function checkPerformanceThresholds(cpuPercent, memoryPercent) {
    if (cpuPercent > 90) {
        sendNotification('High CPU Usage', `CPU usage is ${cpuPercent}%`);
        playNotificationSound();
    }

    if (memoryPercent > 80) {
        sendNotification('High Memory Usage', `Memory usage is ${memoryPercent}%`);
        playNotificationSound();
    }
}

function playNotificationSound() {
    var audio = new Audio('{{ url_for("static", filename="notification_sound.wav") }}');
    audio.play();
}

function sendNotification(title, message) {
    var notificationsContainer = document.getElementById('notifications-container');
    var notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `<h3>${title}</h3><p>${message}</p>`;
    notificationsContainer.appendChild(notification);
    setTimeout(function () {
        notification.remove();
    }, 5000);
}

function refreshData() {
    var cpuChartElement = document.getElementById('cpu-chart');
    var memoryChartElement = document.getElementById('memory-chart');
    var diskChartElement = document.getElementById('disk-chart');
    var networkTable = document.getElementById('network-table');
    var connectionsTable = document.getElementById('connections-table');

    // Supprimer les anciens graphiques et tables
    if (cpuChartElement) {
        cpuChartElement.parentNode.removeChild(cpuChartElement);
    }
    if (memoryChartElement) {
        memoryChartElement.parentNode.removeChild(memoryChartElement);
    }
    if (diskChartElement) {
        diskChartElement.parentNode.removeChild(diskChartElement);
    }
    if (networkTable) {
        networkTable.parentNode.removeChild(networkTable);
    }
    if (connectionsTable) {
        connectionsTable.parentNode.removeChild(connectionsTable);
    }

    // Appeler la fonction fetchData pour récupérer les nouvelles données
    fetchData();
}