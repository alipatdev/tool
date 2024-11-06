// ==UserScript==
// @name         OroColato
// @namespace    http://tampermonkey.net/
// @version      2024-11-05
// @description  try to take over the world!
// @author       You
// @match        https://*.grepolis.com/game/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  console.log("🚀 Script TOOL caricato correttamente.");
  console.log("🔍 Inizio chiamate di controllo...");

  // #region Data initialization
  const csrfToken = window.Game.csrfToken;
  const townId = window.Game.townId;
  const playerId = window.Game.player_id;
  const worldId = window.Game.world_id;

  let worldName = worldId;

  switch (worldId) {
    case "it112":
      worldName = "Saranda";
      break;
    case "it113":
      worldName = "Side";
      break;
    case "it114":
      worldName = "Teo";
      break;
    case "it115":
      worldName = "Anfipoli";
      break;
    case "it116":
      worldName = "La Canea";
      break;
  }

  const httpMethod = "GET";
  const headers = {
    Accept: "text/plain, */*; q=0.01",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Accept-Language": "it-IT,it;q=0.9,en;q=0.8",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest",
    Referer: `https://${worldId}.grepolis.com/game/index?login=1&p=${playerId}&ts=1730752741`,
  };
  const credentials = "include";

  const buildJson = (urlTownId) => {
    return {
      model_url: "PremiumExchange",
      action_name: "read",
      town_id: urlTownId,
      nl_init: true,
    };
  };

  const getUrl = (urlTownId) => {
    const json = buildJson(urlTownId);
    const jsonString = encodeURIComponent(JSON.stringify(json));
    return `https://${worldId}.grepolis.com/game/frontend_bridge?town_id=${urlTownId}&action=execute&h=${csrfToken}&json=${jsonString}&_=${Date.now()}`;
  };

  const commonDiscordUrl =
    "https://discord.com/api/webhooks/1303320171439718410/t-3tc91Bq5-zzecQ-tmixOoD1Sb2CtHDJMpV_FMZfg0ekukcKApB_nniueCWHhd48FCk";

  const sendMessageUrl = `${commonDiscordUrl}?wait=true`;

  const citiesListeners = new Map();

  const AlertType = {
    ERROR: {
      message: "Una polis sta già controllando il mercato di questo mare!",
      cssClass: "error_msg",
    },
    SUCCESS: {
      message: "Da adesso, questa città terrà sotto controllo il mercato.",
      cssClass: "success_msg",
    },
    REMOVED: {
      message:
        "Questa città non terrà più sotto controllo il mercato da questo momento.",
      cssClass: "success_msg",
    },
  };

  //#endregion

  // #region Polis initialization
  const dropdownClick = () => {
    const toggleGroup = document.querySelector(".js-button-caption");
    if (toggleGroup) {
      toggleGroup.click();
    }
  };

  const getPolisIds = () => {
    dropdownClick();

    setTimeout(() => {
      const townElements = document.querySelectorAll(
        '.group_towns[data-groupid="-1"]'
      );

      townElements.forEach((groupTown) => {
        const townsDiv = groupTown.querySelectorAll(".town_group_town");

        const names = Array.from(townsDiv).map((element) =>
          element.getAttribute("name")
        );

        names.forEach((cityId) => {
          citiesListeners.set(cityId, new City(cityId, 0));
        });
      });

      dropdownClick();
    }, 500);

    console.log(citiesListeners);
  };
  // #endregion

  // #region Button preparation
  const unselectedColor = "background-color: rgba(0, 0, 198, 0.3);";
  const selectedColor = "background-color: rgba(0, 161, 56, 0.5);";

  const buildButton = () => {
    let superPoint = document.querySelector(".tb_activities .middle");
    const newDiv = document.createElement("div");
    newDiv.className = "activity_wrap";
    newDiv.innerHTML = `
    <div class="activity" id="oro_colato">
        <div class="hover_state" id="oro_colato_color" style="${unselectedColor}; align-content: center; align-items: center;">
          <span style="color: gold; font-size: 16px;">G</span>
        </div>
    </div>`;
    superPoint.appendChild(newDiv);
  };
  // #endregion

  // #region Button click
  $(document).on("click", "#oro_colato", () => {
    const townName = window.Game.townName;
    let ocean = 0;

    $('li.profile.main_menu_item[data-option-id="profile"]').click();

    setTimeout(() => {
      $(`a.gp_town_link:contains(${townName})`).click();

      setTimeout(() => {
        $("#info").click();

        setTimeout(() => {
          const targetLi = $("li.odd").filter(function () {
            return $(this).text().includes("Mare:");
          });

          const text = targetLi.text().trim();
          const number = text.match(/\d+/);

          if (number) {
            ocean = number[0];

            $(".icon_right.icon_type_speed.ui-dialog-titlebar-close").each(
              function (index) {
                setTimeout(() => {
                  $(this).click();
                }, index * 351);
              }
            );

            setTimeout(() => {
              const selectedCityId = window.Game.townId;
              if (hasCityWithId(selectedCityId)) {
                setCitySelected(selectedCityId, false, 0);
                showAlert(AlertType.REMOVED);
              } else {
                if (hasCityWithOcean(ocean)) {
                  showAlert(AlertType.ERROR);
                } else {
                  setCitySelected(selectedCityId, true, ocean);
                  showAlert(AlertType.SUCCESS);
                }
              }

              changeColor(selectedCityId);
            }, 300);
          } else {
            console.log("Numero non trovato");
          }
        }, 503);
      }, 752);
    }, 709);
  });

  $(document).on("click", ".button_arrow", () => {
    const townId = window.Game.townId;
    changeColor(townId);
  });

  const changeColor = (townId) => {
    const isSelected = hasCityWithId(townId);
    $("#oro_colato_color").css(
      "background-color",
      isSelected ? `${selectedColor}` : `${unselectedColor}`
    );
  };
  // #endregion

  // #region Discord notifier
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
  // #endregion

  // #region Observers
  const target = document.querySelector(
    ".town_name.js-townname-caption.js-rename-caption.ui-game-selectable"
  );
  if (target) {
    const config = { characterData: true, childList: true, subtree: true };

    const callback = (mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          changeColor(window.Game.townId);
        } else if (mutation.type === "characterData") {
          console.log("I dati di testo sono cambiati:", mutation.target.data);
        }
      }
    };

    const observer = new MutationObserver(callback);
    observer.observe(target, config);

    console.log("Osservatore inizializzato.");
  } else {
    console.log("Elemento non trovato.");
  }
  // #endregion

  // #region Models
  class City {
    constructor(id, ocean) {
      this.id = id;
      this.ocean = ocean;
      this.selected = false;
      this.fetcher = undefined;
    }

    listen() {
      this.fetcher = new FetchService(this);
      this.fetcher.fetchData();
    }

    stop() {
      this.fetcher.stop();
    }
  }

  class FetchService {
    constructor(city) {
      this.city = city;
      this.notifiedIron = false;
      this.notifiedWood = false;
      this.notifiedStone = false;
      this.interval = undefined;
    }

    stop() {
      clearInterval(this.interval);
      this.interval = undefined;
    }

    async fetchData() {
      this.interval = setInterval(() => {
        fetch(getUrl(this.city.id), {
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

            if (availableIron > 500 && !this.notifiedIron) {
              let message = `📦@everyone Coglione muoviti stanno sgoldando **${ironName}** nel mare **${this.city.ocean}** su **${worldName}**:\n`;
              message += `Argento sgoldato: **${availableIron}**\n`;
              notifyDiscord(message);
              this.notifiedIron = true;
            } else {
              if (availableIron <= 500) {
                this.notifiedIron = false;
              }
            }

            if (availableWood > 500 && !this.notifiedWood) {
              let message = `📦@everyone Coglione muoviti stanno sgoldando **${woodName}** nel mare **${this.city.ocean}** su **${worldName}**:\n`;
              message += `Legno sgoldato: **${availableWood}**\n`;
              notifyDiscord(message);
              this.notifiedWood = true;
            } else {
              if (availableWood <= 500) {
                this.notifiedWood = false;
              }
            }

            if (availableStone > 500 && !this.notifiedStone) {
              let message = `📦@everyone Coglione muoviti stanno sgoldando **${stoneName}** nel mare **${this.city.ocean}** su **${worldName}**:\n`;
              message += `Pietra sgoldata: **${availableStone}**\n`;
              notifyDiscord(message);
              this.notifiedStone = true;
            } else {
              if (availableStone <= 500) {
                this.notifiedStone = false;
              }
            }
          })
          .catch((error) => {
            console.error("🚨 Errore nella chiamata al server:", error);
          });
      }, 12000);
    }
  }

  function hasCityWithOcean(oceanValue) {
    for (const value of citiesListeners.values()) {
      if (value.ocean === oceanValue) {
        return true;
      }
    }
    return false;
  }

  function hasCityWithId(townId) {
    const townIdStr = String(townId);

    if (citiesListeners.has(townIdStr)) {
      return citiesListeners.get(townIdStr).selected;
    }
    return false;
  }

  function setCitySelected(cityId, selected, ocean) {
    const cityIdStr = String(cityId);

    if (!citiesListeners.has(cityIdStr)) {
      return;
    }

    const city = citiesListeners.get(cityIdStr);

    if (city) {
      city.selected = selected;
      city.ocean = selected ? ocean : 0;

      if (selected) {
        city.listen();
      } else {
        city.stop();
      }

      citiesListeners.set(cityIdStr, city);
    } else {
      console.log("L'oggetto city è undefined");
    }
  }

  // #endregion

  // #region On start
  setTimeout(() => {
    getPolisIds();
    setTimeout(() => {
      buildButton();
    }, 300);
  }, 5000);
  // #endregion

  // #region Utils
  function showAlert(alertType) {
    $("#human_message").removeClass("success_msg");
    $("#human_message").removeClass("error_msg");

    $("#human_message .middle .inner .text").html("");
    $("#human_message").css("opacity", "0");
    $("#human_message").css("display", "none");

    $("#human_message").addClass(alertType.cssClass);
    $("#human_message").css("display", "inline-block");
    $("#human_message").css("opacity", "1");
    $("#human_message .middle .inner .text").html(alertType.message);

    setTimeout(() => {
      $("#human_message").fadeOut(300, () => {
        $("#human_message .middle .inner .text").html("");
        $("#human_message").css("opacity", "0");
        $("#human_message").css("display", "none");
      });
    }, 3000);
  }
  // #endregion
})();
