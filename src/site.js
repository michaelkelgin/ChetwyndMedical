(function () {
  const toggle = document.querySelector(".menu-toggle");
  const overlay = document.querySelector(".nav-overlay");

  function setOpen(open) {
    document.body.classList.toggle("nav-open", open);
    if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setOpen(!document.body.classList.contains("nav-open"));
    });
  }
  if (overlay) overlay.addEventListener("click", function () { setOpen(false); });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setOpen(false);
  });

  const desktop = window.matchMedia("(min-width: 960px)");
  function onDesktopChange() {
    if (desktop.matches) setOpen(false);
  }
  if (desktop.addEventListener) desktop.addEventListener("change", onDesktopChange);
  else if (desktop.addListener) desktop.addListener(onDesktopChange);

  document.querySelectorAll(".submenu-toggle").forEach(function (button) {
    button.addEventListener("click", function () {
      const item = button.closest(".nav-item");
      const open = item.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  const newsButtons = document.querySelectorAll("[data-news-filter]");
  const newsItems = document.querySelectorAll("[data-news-item]");
  newsButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const tag = button.getAttribute("data-news-filter");
      newsButtons.forEach(function (other) {
        other.classList.toggle("is-active", other === button);
      });
      newsItems.forEach(function (item) {
        const tags = (item.getAttribute("data-tags") || "").split(",");
        item.hidden = tag !== "all" && tags.indexOf(tag) === -1;
      });
    });
  });

  const upcoming = document.querySelector("[data-upcoming-list]");
  if (upcoming) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    upcoming.querySelectorAll(".event-row").forEach(function (row) {
      const when = new Date(row.getAttribute("data-date") + "T00:00:00");
      if (when < today) row.remove();
    });
    Array.prototype.slice.call(upcoming.querySelectorAll(".event-row"), 4).forEach(function (row) {
      row.remove();
    });
    if (!upcoming.querySelector(".event-row")) {
      const note = document.createElement("p");
      note.textContent = "No upcoming items are left in this sample calendar. [placeholder]";
      upcoming.appendChild(note);
    }
  }

  const eventList = document.querySelector("[data-event-list]");
  if (eventList) {
    const rows = Array.prototype.slice.call(eventList.querySelectorAll(".event-row"));
    const rangeButtons = Array.prototype.slice.call(document.querySelectorAll("[data-range]"));
    const tagButtons = Array.prototype.slice.call(document.querySelectorAll("[data-tag-filter]"));
    const empty = document.querySelector("[data-event-empty]");
    const params = new URLSearchParams(window.location.search);
    let range = "all";
    let tag = params.get("tag") || "all";

    tagButtons.forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-tag-filter") === tag);
    });

    function apply() {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const end = new Date(now);
      const windows = { week: 7, month: 31, "3": 92, "6": 183 };
      if (windows[range]) end.setDate(end.getDate() + windows[range]);

      rows.forEach(function (row) {
        const when = new Date(row.getAttribute("data-date") + "T00:00:00");
        const tagOk = tag === "all" || row.getAttribute("data-tag") === tag;
        const rangeOk = range === "all" || (when >= now && when <= end);
        row.hidden = !(tagOk && rangeOk);
      });

      if (empty) empty.hidden = rows.some(function (row) { return !row.hidden; });

      document.querySelectorAll("[data-cal-day]").forEach(function (day) {
        const iso = day.getAttribute("data-cal-day");
        const visible = rows.some(function (row) {
          return !row.hidden && row.getAttribute("data-date") === iso;
        });
        day.classList.toggle("has", visible);
      });
    }

    rangeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        range = button.getAttribute("data-range");
        rangeButtons.forEach(function (other) {
          other.classList.toggle("is-active", other === button);
        });
        apply();
      });
    });
    tagButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        tag = button.getAttribute("data-tag-filter");
        tagButtons.forEach(function (other) {
          other.classList.toggle("is-active", other === button);
        });
        apply();
      });
    });
    apply();
  }

  const searchForm = document.querySelector("#site-search");
  const searchBox = document.querySelector("#q");
  const searchOut = document.querySelector("#search-results");
  if (searchForm && searchBox && searchOut) {
    let index = [];

    function render() {
      const query = searchBox.value.trim().toLowerCase();
      searchOut.replaceChildren();
      if (!index.length) {
        searchOut.textContent = "Search is still loading.";
        return;
      }
      if (!query) {
        searchOut.textContent = "Enter a word to search the public pages.";
        return;
      }
      const hits = index.filter(function (item) {
        return (item.title + " " + item.text).toLowerCase().indexOf(query) !== -1;
      }).slice(0, 20);
      if (!hits.length) {
        searchOut.textContent = "No pages matched that search.";
        return;
      }
      const list = document.createElement("ul");
      list.className = "search-hits";
      hits.forEach(function (hit) {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = hit.url;
        link.textContent = hit.title;
        const summary = document.createElement("p");
        summary.textContent = hit.summary;
        item.appendChild(link);
        item.appendChild(summary);
        list.appendChild(item);
      });
      searchOut.appendChild(list);
    }

    fetch("/search-index.json")
      .then(function (response) { return response.json(); })
      .then(function (data) {
        index = data;
        render();
      })
      .catch(function () {
        searchOut.textContent = "Search could not be loaded.";
      });

    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const url = new URL(window.location.href);
      url.searchParams.set("q", searchBox.value);
      window.history.replaceState(null, "", url);
      render();
    });

    const initial = new URLSearchParams(window.location.search).get("q");
    if (initial) searchBox.value = initial;
  }
})();
