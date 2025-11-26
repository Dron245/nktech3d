import { b as bodyLockToggle, a as bodyLockStatus, i as isMobile, c as addLoadedAttr } from "./common.min.js";
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
