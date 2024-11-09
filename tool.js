// ==UserScript==
// @name         OroColato
// @namespace    http://tampermonkey.net/
// @version      1.3.4
// @description  try to take over the world!
// @author       You
// @updateURL    https://raw.githubusercontent.com/alipatdev/tool/refs/heads/main/tool.js
// @downloadURL  https://raw.githubusercontent.com/alipatdev/tool/refs/heads/main/tool.js
// @match        https://*.grepolis.com/game/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=claude.ai
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  console.log("OroColato enabled successfully");

  // #region Data configuration
  const Config = {
    csrfToken: window.Game.csrfToken,
    playerId: window.Game.player_id,
    worldId: window.Game.world_id,
    worldName: null,
    discordUrl:
      "https://discord.com/api/webhooks/1303320171439718410/t-3tc91Bq5-zzecQ-tmixOoD1Sb2CtHDJMpV_FMZfg0ekukcKApB_nniueCWHhd48FCk?wait=true",
    HttpMethod: {
      GET: "GET",
      POST: "POST",
      PUT: "PUT",
      DELETE: "DELETE",
    },
    headers: {
      Accept: "text/plain, */*; q=0.01",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "it-IT,it;q=0.9,en;q=0.8",
      "User-Agent": navigator.userAgent,
      "X-Requested-With": "XMLHttpRequest",
      Referer: `https://${window.Game.world_id}.grepolis.com/game/index?login=1&p=${window.Game.player_id}&ts=1730752741`,
    },
    credentials: true,
    AlertType: {
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
    },
    unselectedColor: "background-color: rgba(0, 0, 198, 0.3);",
    selectedColor: "background-color: rgba(0, 161, 56, 0.5);",
    citiesListeners: new Map(),
  };
  // #endregion

  // #region Utils
  const Utils = {
    getWorldName: () => {
      switch (Config.worldId) {
        case "it112":
          Config.worldName = "Saranda";
          break;
        case "it113":
          Config.worldName = "Side";
          break;
        case "it114":
          Config.worldName = "Teo";
          break;
        case "it115":
          Config.worldName = "Anfipoli";
          break;
        case "it116":
          Config.worldName = "La Canea";
          break;
        default:
          Config.worldName = Config.worldId;
      }
    },
    buildJson: (urlTownId) => {
      return {
        model_url: "PremiumExchange",
        action_name: "read",
        town_id: urlTownId,
        nl_init: true,
      };
    },
    getUrl: (urlTownId) => {
      const json = buildJson(urlTownId);
      const jsonString = encodeURIComponent(JSON.stringify(json));
      return `https://${
        Config.worldId
      }.grepolis.com/game/frontend_bridge?town_id=${urlTownId}&action=execute&h=${
        Config.csrfToken
      }&json=${jsonString}&_=${Date.now()}`;
    },
    notifyDiscord: (message) => {
      fetch(Config.discordUrl, {
        method: Config.HttpMethod.POST,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: message }),
      })
        .then((response) => {
          if (!response.ok) {
            console.error(
              "🚨 Discord Notification Error:",
              response.status,
              response.statusText
            );
          } else {
            console.log("Discord notification sent");
          }
        })
        .catch((error) => {
          console.error("🚨 Error sending notification to Discord:", error);
        });
    },
    hasCityWithOcean: (oceanValue) => {
      for (const value of Config.citiesListeners.values()) {
        if (value.ocean === oceanValue) {
          return true;
        }
      }
      return false;
    },
    hasCityWithId: (townId) => {
      const townIdStr = String(townId);

      if (Config.citiesListeners.has(townIdStr)) {
        return Config.citiesListeners.get(townIdStr).selected;
      }
      return false;
    },
    setCitySelected: (cityId, selected, ocean) => {
      const cityIdStr = String(cityId);

      if (!Config.citiesListeners.has(cityIdStr)) {
        return;
      }

      const city = Config.citiesListeners.get(cityIdStr);

      if (city) {
        city.selected = selected;
        city.ocean = selected ? ocean : 0;

        if (selected) {
          city.listen();
        } else {
          city.stop();
        }

        Config.citiesListeners.set(cityIdStr, city);
      } else {
        console.log("L'oggetto city è undefined");
      }
    },
    buildButton: () => {
      let superPoint = document.querySelector(".tb_activities .middle");
      const newDiv = document.createElement("div");
      newDiv.className = "activity_wrap";
      newDiv.innerHTML = `
      <div class="activity" id="oro_colato">
          <div class="hover_state" id="oro_colato_color" style="${Config.unselectedColor}; align-content: center; align-items: center;">
            <span style="color: gold; font-size: 16px;">G</span>
          </div>
      </div>`;
      superPoint.appendChild(newDiv);
    },
    showWindow: () => {
      $("body").append(`
        <div class="window_curtain ui-front" style="height: 919px; z-index: 1004;">

<div id="window_c2268" class="js-window-main-container classic_window domination  " style="position: absolute; width: 770px; height: 570px; min-width: 150px; min-height: 200px; margin-top: 0px; inset: 194px auto auto 495px; margin-left: 0px;">
	<div class="wnd_border_b"></div>
	<div class="wnd_border_l"></div>
	<div class="wnd_border_r"></div>
	<div class="corner_tl"></div>
	<div class="corner_tr"></div>
	<div class="corner_bl"></div>
	<div class="corner_br"></div>
	<div class="wnd_border_t js-wnd-buttons">
		<div class="title" unselectable="on" style="width: 0px;">ORO COLATO</div>
		<div class="js-window-move window_move_container"></div>
		<div class="buttons_container">
			
			
				<div class="btn_wnd minimize" style="display:block"></div>
				<div class="btn_wnd maximize" style="display:none"></div>
			
			
				<div class="btn_wnd close"></div>
			
		</div>
		
	</div>
	<div class="filler"></div>
	<div class="filler window_background"></div>
	<div class="window_content js-window-content"><div class="domination_info post_domination">
    <div class="progress_wrapper" style="display: flex; align-items: center; justify-content: center;"><div class="progress_title" style="">CONFIGURAZIONE<br>ORO COLATO</div>
<br>
</div>
    <div class="info_wrapper js-scrollbar-viewport viewport scrollbar_not_active">
	<div class="scrollbar skinable-scrollbar js-sb-3 vertical red" style="display: none;">
		<div class="scrollbar-arrow1 js-sb-arrow1 disabled"></div>
		<div class="scrollbar-arrow2 js-sb-arrow2"></div>
		<div class="scrollbar-slider-container js-sb-slider-container">
			<div class="skinable-scrollbar-background">
				<div class="skinable-scrollbar-background-top"></div>
				<div class="skinable-scrollbar-background-center"></div>
				<div class="skinable-scrollbar-background-bottom"></div>
			</div>
			<div class="scrollbar-slider js-sb-slider" style="height: 299px; transform: translate(0px, -299px);">
				<div class="skinable-scrollbar-slider-top"></div>
				<div class="skinable-scrollbar-slider-center"></div>
				<div class="skinable-scrollbar-slider-bottom"></div>
			</div>
		</div>
	</div>

        <div class="js-scrollbar-content" style="position: relative; overflow: visible; transform: translate(0px);">
            
            
            <div class="footer">
  <div>
    <span>Controllare il mercato in tutti mari</span>
  </div>
</div>
        </div>
    </div>
</div></div>
</div>
</div>`);
    },
    closeOcwWindow: () => {
      $("body").remove("#ocw");
    },
    showAlert: (alertType) => {
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
    },
    changeColor: (townId) => {
      const isSelected = Utils.hasCityWithId(townId);
      $("#oro_colato_color").css(
        "background-color",
        isSelected ? `${Config.selectedColor}` : `${Config.unselectedColor}`
      );
    },
    onCitySwitch: () => {
      $(document).on("click", ".button_arrow", () => {
        const townId = window.Game.townId;
        changeColor(townId);
      });
    },
  };
  // #endregion

  // #region Main functions
  const MainFunctions = {
    dropdownClick: () => {
      const toggleGroup = document.querySelector(".js-button-caption");
      if (toggleGroup) {
        toggleGroup.click();
      }
    },
    getPolisIds: () => {
      MainFunctions.dropdownClick();

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
            Config.citiesListeners.set(cityId, new City(cityId, 0));
          });
        });

        MainFunctions.dropdownClick();
      }, 500);

      console.log(Config.citiesListeners);
    },
    onButtonClick: () => {
      $(document).on("click", "#oro_colato", () => {
        Utils.showWindow();
        // const townName = window.Game.townName;
        // let ocean = 0;

        // $('li.profile.main_menu_item[data-option-id="profile"]').click();

        // setTimeout(() => {
        //   $(`a.gp_town_link:contains(${townName})`).click();

        //   setTimeout(() => {
        //     $("#info").click();

        //     setTimeout(() => {
        //       const targetLi = $("li.odd").filter(function () {
        //         return $(this).text().includes("Mare:");
        //       });

        //       const text = targetLi.text().trim();
        //       const number = text.match(/\d+/);

        //       if (number) {
        //         ocean = number[0];

        //         $(".icon_right.icon_type_speed.ui-dialog-titlebar-close").each(
        //           function (index) {
        //             setTimeout(() => {
        //               $(this).click();
        //             }, index * 351);
        //           }
        //         );

        //         setTimeout(() => {
        //           const selectedCityId = window.Game.townId;
        //           if (Utils.hasCityWithId(selectedCityId)) {
        //             Utils.setCitySelected(selectedCityId, false, 0);
        //             Utils.showAlert(Config.AlertType.REMOVED);
        //           } else {
        //             if (Utils.hasCityWithOcean(ocean)) {
        //               Utils.showAlert(Config.AlertType.ERROR);
        //             } else {
        //               Utils.setCitySelected(selectedCityId, true, ocean);
        //               Utils.showAlert(Config.AlertType.SUCCESS);
        //             }
        //           }

        //           Utils.changeColor(selectedCityId);
        //         }, 300);
        //       } else {
        //         console.log("Polis ID Number not found.");
        //       }
        //     }, 503);
        //   }, 752);
        // }, 709);
      });
    },
  };
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
        fetch(Utils.getUrl(this.city.id), {
          method: Config.HttpMethod.GET,
          headers: Config.headers,
          credentials: Config.credentials,
        })
          .then((response) => {
            if (!response.ok) {
              console.error(
                "🚨 Server response error:",
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
              let message = `📦@everyone Coglione muoviti stanno sgoldando **${ironName}** nel mare **${this.city.ocean}** su **${Config.worldName}**:\n`;
              message += `Argento sgoldato: **${availableIron}**\n`;
              Utils.notifyDiscord(message);
              this.notifiedIron = true;
            } else {
              if (availableIron <= 500) {
                this.notifiedIron = false;
              }
            }

            if (availableWood > 500 && !this.notifiedWood) {
              let message = `📦@everyone Coglione muoviti stanno sgoldando **${woodName}** nel mare **${this.city.ocean}** su **${Config.worldName}**:\n`;
              message += `Legno sgoldato: **${availableWood}**\n`;
              Utils.notifyDiscord(message);
              this.notifiedWood = true;
            } else {
              if (availableWood <= 500) {
                this.notifiedWood = false;
              }
            }

            if (availableStone > 500 && !this.notifiedStone) {
              let message = `📦@everyone Coglione muoviti stanno sgoldando **${stoneName}** nel mare **${this.city.ocean}** su **${Config.worldName}**:\n`;
              message += `Pietra sgoldata: **${availableStone}**\n`;
              Utils.notifyDiscord(message);
              this.notifiedStone = true;
            } else {
              if (availableStone <= 500) {
                this.notifiedStone = false;
              }
            }
          })
          .catch((error) => {
            console.error("🚨 Error calling sevrer:", error);
          });
      }, 12000);
    }
  }
  // #endregion

  // #region AudioUtils
  let audio = null;

  const AudioUtils = {
    playAudio: () => {
      if (!audio) {
        const base64audio =
          "http://commondatastorage.googleapis.com/codeskulptor-assets/jump.ogg";
        audio = new Audio(base64audio);
        audio.play().catch((error) => {
          console.error("Error playing audio:", error);
        });
      } else if (audio.paused) {
        audio.play().catch((error) => {
          console.error("Error playing audio:", error);
        });
      }
    },
    stopAudio: () => {
      if (audio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    },
  };
  // #endregion

  // #region Observers
  const Observers = {
    polisTitleObserver: {
      initialize: () => {
        const target = document.querySelector(
          ".town_name.js-townname-caption.js-rename-caption.ui-game-selectable"
        );
        if (target) {
          const config = {
            characterData: true,
            childList: true,
            subtree: true,
          };

          const callback = (mutationsList) => {
            for (const mutation of mutationsList) {
              if (mutation.type === "childList") {
                changeColor(window.Game.townId);
              } else if (mutation.type === "characterData") {
                console.log(
                  "I dati di testo sono cambiati:",
                  mutation.target.data
                );
              }
            }
          };

          const observer = new MutationObserver(callback);
          observer.observe(target, config);

          console.log("Switch polis observer initialized");
        } else {
          console.log(
            "Unable to initialize Switch polis observer, target not found."
          );
        }
      },
    },
    captchaObserver: {
      initalize: () => {
        const observer = new MutationObserver((mutationList) => {
          for (const mutation of mutationList) {
            if (mutation.type === "childList") {
              const captchaElement = document.getElementById("captcha_curtain");
              if (captchaElement) {
                AudioUtils.playAudio();
              } else {
                AudioUtils.stopAudio();
              }
            }
          }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        console.log("Captcha observer initialized");
      },
    },
  };
  // #endregion

  setTimeout(() => {
    MainFunctions.getPolisIds();
    MainFunctions.onButtonClick();

    Utils.getWorldName();
    Utils.closeOcwWindow();

    Observers.polisTitleObserver.initialize();
    Observers.captchaObserver.initalize();

    setTimeout(() => {
      Utils.buildButton();
    }, 300);
  }, 5000);
})();
