console.log("🚀 Script TOOL caricato correttamente.");
console.log("🔍 Inizio chiamate di controllo...");

// Fare la chiamata HTTP GET
const fetchData = () => {
    console.log("🔄 Inizio chiamata al server...");

    fetch("https://it116.grepolis.com/game/frontend_bridge?town_id=6864&action=execute&h=c3d43e4c8d7ced7c48a8ebe04dfc291d51210879&json=%7B%22model_url%22%3A%22PremiumExchange%22%2C%22action_name%22%3A%22read%22%2C%22town_id%22%3A6864%2C%22nl_init%22%3Atrue%7D&_=" + Date.now(), {
        method: 'GET',
        headers: {
            "Accept": "text/plain, */*; q=0.01",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "it-IT,it;q=0.9,en;q=0.8",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
            "X-Requested-With": "XMLHttpRequest",
            "Referer": "https://it116.grepolis.com/game/index?login=1&p=848934474&ts=1730752741"
        },
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                console.error("🚨 Errore nella risposta del server:", response.status, response.statusText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log("✅ Risposta ricevuta dal server, elaborazione dei dati...");
            return response.json();
        })
        .then(data => {
            // Estrazione valori materie: Legno Argento e Pietra
            const ironStock = data.json.iron.stock;
            const ironCapacity = data.json.iron.capacity;
            const woodStock = data.json.wood.stock;
            const woodCapacity = data.json.wood.capacity;
            const stoneStock = data.json.stone.stock;
            const stoneCapacity = data.json.stone.capacity;

            // Mostro i valori in console (TEST! Togliere.)
            console.log("🔄 Valori estratti:");
            console.log(`   ➡️ Iron - Stock: ${ironStock}, Capacity: ${ironCapacity}`);
            console.log(`   ➡️ Wood - Stock: ${woodStock}, Capacity: ${woodCapacity}`);
            console.log(`   ➡️ Stone - Stock: ${stoneStock}, Capacity: ${stoneCapacity}`);
        })
        .catch(error => {
            console.error("🚨 Errore nella chiamata al server:", error);
        });
};

// Esegui fetchData ogni 20 secondi
setInterval(fetchData, 20000);
