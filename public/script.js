// --- Configurações do Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyBAw9gOmb5U4uwN-by9EYdurN7Hz4FNtSU",
  authDomain: "esp32-a559f.firebaseapp.com",
  databaseURL: "https://esp32-a559f-default-rtdb.firebaseio.com",
  projectId: "esp32-a559f",
  storageBucket: "esp32-a559f.firebasestorage.app",
  messagingSenderId: "519295750289",
  appId: "1:519295750289:web:1b63aae1c50e43b6266f30",
  measurementId: "G-JSRCQXX90Z"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const leiturasRef = database.ref('leituras');

// --- Elementos HTML ---
const temperaturaElement = document.getElementById('temperatura');
const umidadeElement = document.getElementById('umidade');
const luminosidadeElement = document.getElementById('luminosidade');

// =======================
// Gráfico de Umidade
// =======================
const ctxUmidade = document.getElementById('dhtChart').getContext('2d');
const dhtChartUmidade = new Chart(ctxUmidade, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Umidade (%)',
            data: [],
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderWidth: 2,
            fill: true,
            tension: 0.3
        }]
    },
    options: {
        scales: { y: { beginAtZero: true } },
        responsive: true,
        maintainAspectRatio: false
    }
});

// =======================
// Gráfico de Temperatura
// =======================
const ctxTemp = document.getElementById('dhtChartTemperatura').getContext('2d');
const dhtChartTemperatura = new Chart(ctxTemp, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Temperatura (°C)',
            data: [],
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderWidth: 2,
            fill: true,
            tension: 0.3
        }]
    },
    options: {
        scales: { y: { beginAtZero: true } },
        responsive: true,
        maintainAspectRatio: false
    }
});

// =======================
// Gráfico de Luminosidade
// =======================
const ctxLuz = document.getElementById('luzChart').getContext('2d');
const luzChart = new Chart(ctxLuz, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Luminosidade (nível ADC)',
            data: [],
            borderColor: 'rgba(255, 193, 7, 1)',
            backgroundColor: 'rgba(255, 193, 7, 0.2)',
            borderWidth: 3,
            pointRadius: 3,
            pointBackgroundColor: 'rgba(255, 193, 7, 0.9)',
            fill: true,
            tension: 0.35
        }]
    },
    options: {
        plugins: {
            legend: { labels: { color: '#333' } }
        },
        scales: {
            x: { ticks: { color: '#555' } },
            y: {
                beginAtZero: true,
                max: 4095,
                ticks: { color: '#555' }
            }
        },
        responsive: true,
        maintainAspectRatio: false
    }
});

// =======================
// Função auxiliar para adicionar dados ao gráfico
// =======================
function addData(chart, label, value, limit = 20) {
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(value);
    if (chart.data.labels.length > limit) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    chart.update();
}

// =======================
// Escuta novas leituras no Firebase
// =======================
leiturasRef.limitToLast(1).on('child_added', (snapshot) => {
    const leitura = snapshot.val();
    if (!leitura) return;

    const temperatura = leitura.temperatura?.toFixed(1) || 0;
    const umidade = leitura.umidade?.toFixed(1) || 0;
    const luz = leitura.valor_luz || 0;
    const nivelLuz = leitura.nivel_luz || "";

    const timestamp = new Date(leitura.timestamp * 1000);
    const hora = timestamp.toLocaleTimeString('pt-BR', { hour12: false });

    // Atualiza os cartões
    temperaturaElement.textContent = `${temperatura} °C`;
    umidadeElement.textContent = `${umidade} %`;
    luminosidadeElement.textContent = `${luz} (${nivelLuz})`;

    // Atualiza a cor do card de luminosidade
    luminosidadeElement.classList.remove(
        'luz-escuro', 'luz-fraco', 'luz-claro', 'luz-brilhante', 'luz-muito-brilhante'
    );
    switch (nivelLuz) {
        case "Escuro":
            luminosidadeElement.classList.add('luz-escuro');
            break;
        case "Fraco":
            luminosidadeElement.classList.add('luz-fraco');
            break;
        case "Claro":
            luminosidadeElement.classList.add('luz-claro');
            break;
        case "Brilhante":
            luminosidadeElement.classList.add('luz-brilhante');
            break;
        case "Muito brilhante":
            luminosidadeElement.classList.add('luz-muito-brilhante');
            break;
    }

    // Atualiza os gráficos
    addData(dhtChartTemperatura, hora, temperatura);
    addData(dhtChartUmidade, hora, umidade);
    addData(luzChart, hora, luz);
});
