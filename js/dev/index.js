import { d as dataMediaQueries, s as slideToggle, a as slideUp, b as bodyLockToggle, c as bodyLockStatus, i as isMobile, e as addLoadedAttr } from "./common.min.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function spollers() {
  const spollersArray = document.querySelectorAll("[data-fls-spollers]");
  if (spollersArray.length > 0) {
    let initSpollers = function(spollersArray2, matchMedia = false) {
      spollersArray2.forEach((spollersBlock) => {
        spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
        if (matchMedia.matches || !matchMedia) {
          spollersBlock.classList.add("--spoller-init");
          initSpollerBody(spollersBlock);
        } else {
          spollersBlock.classList.remove("--spoller-init");
          initSpollerBody(spollersBlock, false);
        }
      });
    }, initSpollerBody = function(spollersBlock, hideSpollerBody = true) {
      let spollerItems = spollersBlock.querySelectorAll("details");
      if (spollerItems.length) {
        spollerItems.forEach((spollerItem) => {
          let spollerTitle = spollerItem.querySelector("summary");
          if (hideSpollerBody) {
            spollerTitle.removeAttribute("tabindex");
            if (!spollerItem.hasAttribute("data-fls-spollers-open")) {
              spollerItem.open = false;
              spollerTitle.nextElementSibling.hidden = true;
            } else {
              spollerTitle.classList.add("--spoller-active");
              spollerItem.open = true;
            }
          } else {
            spollerTitle.setAttribute("tabindex", "-1");
            spollerTitle.classList.remove("--spoller-active");
            spollerItem.open = true;
            spollerTitle.nextElementSibling.hidden = false;
          }
        });
      }
    }, setSpollerAction = function(e) {
      const el = e.target;
      if (el.closest("summary") && el.closest("[data-fls-spollers]")) {
        e.preventDefault();
        if (el.closest("[data-fls-spollers]").classList.contains("--spoller-init")) {
          const spollerTitle = el.closest("summary");
          const spollerBlock = spollerTitle.closest("details");
          const spollersBlock = spollerTitle.closest("[data-fls-spollers]");
          const oneSpoller = spollersBlock.hasAttribute("data-fls-spollers-one");
          const scrollSpoller = spollerBlock.hasAttribute("data-fls-spollers-scroll");
          const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
          if (!spollersBlock.querySelectorAll(".--slide").length) {
            if (oneSpoller && !spollerBlock.open) {
              hideSpollersBody(spollersBlock);
            }
            !spollerBlock.open ? spollerBlock.open = true : setTimeout(() => {
              spollerBlock.open = false;
            }, spollerSpeed);
            spollerTitle.classList.toggle("--spoller-active");
            slideToggle(spollerTitle.nextElementSibling, spollerSpeed);
            if (scrollSpoller && spollerTitle.classList.contains("--spoller-active")) {
              const scrollSpollerValue = spollerBlock.dataset.flsSpollersScroll;
              const scrollSpollerOffset = +scrollSpollerValue ? +scrollSpollerValue : 0;
              const scrollSpollerNoHeader = spollerBlock.hasAttribute("data-fls-spollers-scroll-noheader") ? document.querySelector(".header").offsetHeight : 0;
              window.scrollTo(
                {
                  top: spollerBlock.offsetTop - (scrollSpollerOffset + scrollSpollerNoHeader),
                  behavior: "smooth"
                }
              );
            }
          }
        }
      }
      if (!el.closest("[data-fls-spollers]")) {
        const spollersClose = document.querySelectorAll("[data-fls-spollers-close]");
        if (spollersClose.length) {
          spollersClose.forEach((spollerClose) => {
            const spollersBlock = spollerClose.closest("[data-fls-spollers]");
            const spollerCloseBlock = spollerClose.parentNode;
            if (spollersBlock.classList.contains("--spoller-init")) {
              const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
              spollerClose.classList.remove("--spoller-active");
              slideUp(spollerClose.nextElementSibling, spollerSpeed);
              setTimeout(() => {
                spollerCloseBlock.open = false;
              }, spollerSpeed);
            }
          });
        }
      }
    }, hideSpollersBody = function(spollersBlock) {
      const spollerActiveBlock = spollersBlock.querySelector("details[open]");
      if (spollerActiveBlock && !spollersBlock.querySelectorAll(".--slide").length) {
        const spollerActiveTitle = spollerActiveBlock.querySelector("summary");
        const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
        spollerActiveTitle.classList.remove("--spoller-active");
        slideUp(spollerActiveTitle.nextElementSibling, spollerSpeed);
        setTimeout(() => {
          spollerActiveBlock.open = false;
        }, spollerSpeed);
      }
    };
    document.addEventListener("click", setSpollerAction);
    const spollersRegular = Array.from(spollersArray).filter(function(item, index, self) {
      return !item.dataset.flsSpollers.split(",")[0];
    });
    if (spollersRegular.length) {
      initSpollers(spollersRegular);
    }
    let mdQueriesArray = dataMediaQueries(spollersArray, "flsSpollers");
    if (mdQueriesArray && mdQueriesArray.length) {
      mdQueriesArray.forEach((mdQueriesItem) => {
        mdQueriesItem.matchMedia.addEventListener("change", function() {
          initSpollers(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
        });
        initSpollers(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
      });
    }
  }
}
window.addEventListener("load", spollers);
function menuInit() {
  document.addEventListener("click", function(e) {
    if (bodyLockStatus && e.target.closest("[data-fls-menu]")) {
      bodyLockToggle();
      document.documentElement.toggleAttribute("data-fls-menu-open");
    }
  });
}
document.querySelector("[data-fls-menu]") ? window.addEventListener("load", menuInit) : null;
function debounce(func, wait = 200) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
document.addEventListener("DOMContentLoaded", () => {
  let isMobileMode = window.innerWidth <= 768;
  initMenuBehavior();
  window.addEventListener(
    "resize",
    debounce(() => {
      const newMobileMode = window.innerWidth <= 768;
      if (newMobileMode !== isMobileMode) {
        isMobileMode = newMobileMode;
        resetMenuState();
        initMenuBehavior();
      }
    }, 200)
  );
  function initMenuBehavior() {
    document.removeEventListener("click", desktopHandler);
    document.removeEventListener("click", mobileHandler);
    if (isMobileMode) {
      document.addEventListener("click", mobileHandler);
    } else {
      document.addEventListener("click", desktopHandler);
    }
  }
  function desktopHandler(e) {
    const targetElement = e.target;
    const mainItem = targetElement.closest(".main-item");
    if (mainItem && isMobile.any()) {
      mainItem.classList.toggle("_sub-menu-active");
    }
  }
  function mobileHandler(e) {
    const target = e.target;
    const top = target.closest(".main-item__top");
    if (top) {
      const item = top.closest(".main-item");
      const submenu = item.querySelector(".mega.sub-menu");
      if (!submenu) return;
      const isActive = item.classList.contains("_sub-menu-active");
      document.querySelectorAll(".main-item._sub-menu-active").forEach((opened) => {
        if (opened !== item) {
          closeSubmenu(opened);
        }
      });
      if (isActive) {
        closeSubmenu(item);
      } else {
        openSubmenu(item);
      }
      return;
    }
    if (!target.closest(".main-item")) {
      document.querySelectorAll(".main-item._sub-menu-active").forEach((opened) => {
        closeSubmenu(opened);
      });
    }
  }
  function openSubmenu(item) {
    const submenu = item.querySelector(".mega.sub-menu");
    if (!submenu) return;
    submenu.style.maxHeight = setTimeout(() => {
      submenu.style.maxHeight = submenu.scrollHeight + "px";
    }, 175);
    item.classList.add("_sub-menu-active");
  }
  function closeSubmenu(item) {
    const submenu = item.querySelector(".mega.sub-menu");
    if (!submenu) return;
    submenu.style.maxHeight = "0px";
    item.classList.remove("_sub-menu-active");
  }
  function resetMenuState() {
    document.querySelectorAll(".mega.sub-menu").forEach((submenu) => {
      submenu.style.maxHeight = "";
    });
    document.querySelectorAll("._sub-menu-active").forEach((item) => {
      item.classList.remove("_sub-menu-active");
    });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth > 560) return;
  const lists = document.querySelectorAll("ul.mega__list");
  lists.forEach((list) => {
    const items = Array.from(list.querySelectorAll("li"));
    if (items.length <= 2) return;
    items.forEach((li, i) => {
      if (i > 1) {
        li.classList.add("mega-hidden");
        li.style.height = "0px";
        li.style.opacity = "0";
        li.style.overflow = "hidden";
        li.style.transition = "height .35s ease, opacity .35s ease";
      }
    });
    const btnLi = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = "Показать ещё";
    btn.className = "mega__more-btn";
    btnLi.appendChild(btn);
    list.appendChild(btnLi);
    let opened = false;
    btn.addEventListener("click", () => {
      opened = !opened;
      items.forEach((li, i) => {
        if (i > 1) {
          if (opened) {
            li.classList.remove("mega-hidden");
            li.classList.add("mega-open");
            const fullHeight = li.scrollHeight + "px";
            li.style.height = fullHeight;
            li.style.opacity = "1";
            li.addEventListener("transitionend", function tr() {
              if (opened) li.style.height = "auto";
              li.removeEventListener("transitionend", tr);
            });
          } else {
            li.classList.remove("mega-open");
            li.classList.add("mega-hidden");
            li.style.height = li.scrollHeight + "px";
            requestAnimationFrame(() => {
              li.style.height = "0px";
              li.style.opacity = "0";
            });
          }
        }
      });
      const submenu = document.querySelector(".mega.sub-menu");
      submenu.style.maxHeight = setTimeout(() => {
        submenu.style.maxHeight = submenu.scrollHeight + "px";
      }, 350);
      btn.textContent = opened ? "Скрыть" : "Показать ещё";
    });
  });
});
addLoadedAttr();
