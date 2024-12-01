//Aqui selecciono los elementos del DOM
document.getElementById("convert").addEventListener("click", async () => {
    const amount = document.getElementById("amount").value;
    const currency = document.getElementById("currency").value;

    if (!amount || amount <= 0) {
        alert("Por favor, ingresa un monto válido.");
        return;
    }

    try {
        const response = await fetch("https://mindicador.cl/api");
        if (!response.ok) throw new Error("Error al obtener los datos de la API");
        
        const data = await response.json();
        let conversionRate;

        switch (currency) {
            case "dolar":
                conversionRate = data.dolar.valor;
                break;
            case "euro":
                conversionRate = data.euro.valor;
                break;
            case "uf":
                conversionRate = data.uf.valor;
                break;
            default:
                throw new Error("Moneda no válida seleccionada");
        }

        // Realizar la conversión
        const result = (amount / conversionRate).toFixed(2);
        document.getElementById("result").innerText = 
            `El Resultado es: ${result} ${currency.toUpperCase()}`;

        // Obtener datos históricos
        const historicalResponse = await fetch(`https://mindicador.cl/api/${currency}`);
        if (!historicalResponse.ok) throw new Error("Error al obtener datos históricos");

        const historicalData = await historicalResponse.json();
        const last10Days = historicalData.serie.slice(0, 10);

        // Configurar datos para el gráfico
        const labels = last10Days.map(item => new Date(item.fecha).toLocaleDateString());
        const values = last10Days.map(item => item.valor);

        renderChart(labels, values, currency.toUpperCase());
    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un problema al realizar la conversión o al cargar el gráfico.");
    }
});

// Función para renderizar el gráfico con Chart.js
function renderChart(labels, values, currency) {
    const ctx = document.getElementById("chart").getContext("2d");
    if (window.myChart) {
        window.myChart.destroy(); // Destruir el gráfico existente si ya hay uno
    }
    window.myChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels.reverse(),
            datasets: [{
                label: `Historial últimos 10 días (${currency})`,
                data: values.reverse(),
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}
