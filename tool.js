console.log("🚀 Script TOOL caricato correttamente.");
console.log("🔍 Inizio chiamate di controllo...");

const csrfToken = window.Game.csrfToken;
const townId = window.Game.townId;
const json = {
  model_url: "PremiumExchange",
  action_name: "read",
  town_id: townId,
  nl_init: true,
};
const jsonString = encodeURIComponent(JSON.stringify(json));

const httpMethod = "GET";
const headers = {
  Accept: "text/plain, */*; q=0.01",
  "Accept-Encoding": "gzip, deflate, br, zstd",
  "Accept-Language": "it-IT,it;q=0.9,en;q=0.8",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  "X-Requested-With": "XMLHttpRequest",
  Referer:
    "https://it116.grepolis.com/game/index?login=1&p=848934474&ts=1730752741",
};
const credentials = "include";

const url = `https://it116.grepolis.com/game/frontend_bridge?town_id=${townId}&action=execute&h=${csrfToken}&json=${jsonString}&_=${Date.now()}`;

const commonDiscordUrl =
  "https://discord.com/api/webhooks/1303320171439718410/t-3tc91Bq5-zzecQ-tmixOoD1Sb2CtHDJMpV_FMZfg0ekukcKApB_nniueCWHhd48FCk";

const sendMessageUrl = `${commonDiscordUrl}?wait=true`;
const deleteMessageUrl = `${commonDiscordUrl}/messages/`;

const ocean = 0;

let notifiedIron = false;
let notifiedWood = false;
let notifiedStone = false;

const fetchData = () => {
  const ocean = document.querySelector(".ocean_number").textContent;
  console.log("Ocean: ", ocean);

  console.log("🔄 Inizio chiamata al server...");

  fetch(url, {
    method: httpMethod,
    headers: headers,
    credentials: credentials,
  })
    .then((response) => {
      if (!response.ok) {
        console.error(
          "🚨 Errore nella risposta del server:",
          response.status,
          response.statusText
        );
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("✅ Risposta ricevuta dal server, elaborazione dei dati...");
      return response.json();
    })
    .then((data) => {
      const ironStock = data.json.iron.stock;
      const ironCapacity = data.json.iron.capacity;
      const woodStock = data.json.wood.stock;
      const woodCapacity = data.json.wood.capacity;
      const stoneStock = data.json.stone.stock;
      const stoneCapacity = data.json.stone.capacity;

      const availableIron = ironCapacity - ironStock;
      const availableWood = woodCapacity - woodStock;
      const availableStone = stoneCapacity - stoneStock;

      const ironName = "Argento";
      const woodName = "Legno";
      const stoneName = "Pietra";

      if (availableIron > 500 && !notifiedIron) {
        let message = `📦@everyone Coglione muoviti stanno sgoldando **${ironName}** nel mare **${ocean}**:\n`;
        message += `Argento sgoldato: **${availableIron}**\n`;
        notifyDiscord(message);
        notifiedIron = true;
      } else if (availableIron <= 500) {
        notifiedIron = false;
      }

      if (availableWood > 500 && !notifiedWood) {
        let message = `📦@everyone Coglione muoviti stanno sgoldando **${woodName}** nel mare **${ocean}**:\n`;
        message += `Legno sgoldato: **${availableWood}**\n`;
        notifyDiscord(message);
        notifiedWood = true;
      } else if (availableWood <= 500) {
        notifiedWood = false;
      }

      if (availableStone > 500 && !notifiedStone) {
        let message = `📦@everyone Coglione muoviti stanno sgoldando **${stoneName}** nel mare **${ocean}**:\n`;
        message += `Pietra sgoldata: **${availableStone}**\n`;
        notifyDiscord(message);
        notifiedStone = true;
      } else if (availableStone <= 500) {
        notifiedStone = false;
      }
    })
    .catch((error) => {
      console.error("🚨 Errore nella chiamata al server:", error);
    });
};

setInterval(fetchData, 10000);

const notifyDiscord = (message) => {
  fetch(sendMessageUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: message }),
  })
    .then((response) => {
      if (!response.ok) {
        console.error(
          "🚨 Errore nella notifica Discord:",
          response.status,
          response.statusText
        );
      } else {
        console.log("Notifica a discord inviata");
      }
    })
    .catch((error) => {
      console.error(
        "🚨 Errore durante l'invio della notifica a Discord:",
        error
      );
    });
};
