(function () {
  const PAGE_SIZE_DEFAULT = 50;
  let currentPage = 1;
  let pageSize = PAGE_SIZE_DEFAULT;
  let total = 0;
  let editingRow = null;

  const filters = {
    filename: "",
    locale: "",
    model: "",
    source_hash: "",
    source_text: "",
    translated_text: "",
    last_hit_at_null: false,
  };

  function getFilters() {
    return {
      filename: document.getElementById("filter-filename").value.trim(),
      locale: document.getElementById("filter-locale").value.trim(),
      model: document.getElementById("filter-model").value.trim(),
      source_hash: document.getElementById("filter-source-hash").value.trim(),
      source_text: document.getElementById("filter-source-text").value.trim(),
      translated_text: document.getElementById("filter-translated-text").value.trim(),
      last_hit_at_null: filters.last_hit_at_null,
    };
  }

  function buildQueryParams() {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("pageSize", String(pageSize));
    if (filters.filename) params.set("filename", filters.filename);
    if (filters.locale) params.set("locale", filters.locale);
    if (filters.model) params.set("model", filters.model);
    if (filters.source_hash) params.set("source_hash", filters.source_hash);
    if (filters.source_text) params.set("source_text", filters.source_text);
    if (filters.translated_text) params.set("translated_text", filters.translated_text);
    if (filters.last_hit_at_null) params.set("last_hit_at_null", "true");
    return params.toString();
  }

  async function fetchTranslations() {
    const qs = buildQueryParams();
    const res = await fetch(`/api/translations?${qs}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function fetchFilepaths() {
    const res = await fetch("/api/filepaths");
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  function escapeHtml(str) {
    if (str == null) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function truncate(str, maxLen) {
    if (str == null) return "";
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen) + "\u2026";
  }

  function renderTable(rows) {
    const tbody = document.getElementById("table-body");
    tbody.innerHTML = "";

    for (const row of rows) {
      const tr = document.createElement("tr");
      tr.dataset.sourceHash = row.source_hash;
      tr.dataset.locale = row.locale;

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "icon-btn";
      editBtn.title = "Edit";
      editBtn.innerHTML = "✏️"; // pencil
      editBtn.addEventListener("click", () => openEditModal(row));

      const logLinksBtn = document.createElement("button");
      logLinksBtn.type = "button";
      logLinksBtn.className = "icon-btn log-links-btn";
      logLinksBtn.title = "Show file links in server console";
      logLinksBtn.innerHTML = "🔗"; // link
      logLinksBtn.addEventListener("click", (e) => logLinksToServer(row, e));

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "icon-btn delete-btn";
      deleteBtn.title = "Delete";
      deleteBtn.innerHTML = "❌"; // cross
      deleteBtn.addEventListener("click", () => deleteRow(row));

      tr.innerHTML = `
        <td>${escapeHtml(row.filepath || "")}</td>
        <td>${row.start_line != null ? escapeHtml(String(row.start_line)) : ""}</td>
        <td>${escapeHtml(row.locale)}</td>
        <td><code>${escapeHtml(row.source_hash)}</code></td>
        <td class="source-text" title="${escapeHtml(row.source_text || "")}">${escapeHtml(truncate(row.source_text, 200))}</td>
        <td class="translated-text" title="${escapeHtml(row.translated_text || "")}">${escapeHtml(truncate(row.translated_text, 200))}</td>
        <td>${escapeHtml(row.model || "")}</td>
        <td>${escapeHtml(row.created_at || "")}</td>
        <td class="last-hit-at ${row.last_hit_at ? "" : "stale"}" title="${escapeHtml(row.last_hit_at || "null")}">${escapeHtml(row.last_hit_at || "—")}</td>
        <td class="actions"></td>
      `;
      tr.querySelector(".actions").append(editBtn, logLinksBtn, deleteBtn);
      tbody.appendChild(tr);
    }
  }

  function updatePagination(data) {
    total = data.total;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    document.getElementById("pagination-info").textContent =
      `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, total)} of ${total}`;
    document.getElementById("pagination-info-bottom").textContent =
      `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, total)} of ${total}`;

    document.getElementById("page-indicator").textContent =
      `Page ${currentPage} of ${totalPages}`;
    document.getElementById("page-indicator-bottom").textContent =
      `Page ${currentPage} of ${totalPages}`;

    document.getElementById("btn-prev").disabled = currentPage <= 1;
    document.getElementById("btn-next").disabled = currentPage >= totalPages;
    document.getElementById("btn-prev-bottom").disabled = currentPage <= 1;
    document.getElementById("btn-next-bottom").disabled = currentPage >= totalPages;
  }

  async function loadData() {
    try {
      const data = await fetchTranslations();
      renderTable(data.rows);
      updatePagination(data);
    } catch (err) {
      alert("Error loading data: " + err.message);
    } finally {
      // Reset button text after loading completes
      const applyBtn = document.getElementById("btn-apply");
      if (applyBtn) {
        applyBtn.textContent = "Apply";
        applyBtn.disabled = false;
      }
    }
  }

  async function loadFilepaths() {
    try {
      const data = await fetchFilepaths();
      const select = document.getElementById("select-filepath");
      select.innerHTML = '<option value="">-- Select filepath --</option>';
      for (const fp of data.filepaths) {
        const opt = document.createElement("option");
        opt.value = fp;
        opt.textContent = fp;
        select.appendChild(opt);
      }
    } catch (err) {
      console.error("Error loading filepaths:", err);
    }
  }

  function openEditModal(row) {
    editingRow = row;
    document.getElementById("modal-textarea").value = row.translated_text || "";
    document.getElementById("modal-overlay").classList.remove("hidden");
  }

  function closeEditModal() {
    editingRow = null;
    document.getElementById("modal-overlay").classList.add("hidden");
  }

  async function saveEdit() {
    if (!editingRow) return;
    const newText = document.getElementById("modal-textarea").value;
    try {
      const res = await fetch("/api/translations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_hash: editingRow.source_hash,
          locale: editingRow.locale,
          translated_text: newText,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      closeEditModal();
      await loadData();
    } catch (err) {
      alert("Error saving: " + err.message);
    }
  }

  async function logLinksToServer(row, e) {
    try {
      const res = await fetch("/api/log-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filepath: row.filepath,
          start_line: row.start_line,
          locale: row.locale,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      // Brief feedback - user should look at server console
      const btn = e?.target?.closest(".log-links-btn");
      if (btn) {
        const origTitle = btn.title;
        btn.title = "Links logged to server console";
        setTimeout(() => { btn.title = origTitle; }, 2000);
      }
    } catch (err) {
      alert("Error logging links: " + err.message);
    }
  }

  async function deleteRow(row) {
    if (!confirm("Delete this translation?")) return;
    try {
      const sourceHashEnc = encodeURIComponent(row.source_hash);
      const localeEnc = encodeURIComponent(row.locale);
      const res = await fetch(`/api/translations/${sourceHashEnc}/${localeEnc}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      await loadData();
      await loadFilepaths();
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  }

  async function deleteFiltered() {
    const count = total;
    if (count === 0) {
      alert("No entries to delete.");
      return;
    }
    if (!confirm(`Delete all ${count} filtered translation(s)?`)) return;
    try {
      const params = new URLSearchParams();
      if (filters.filename) params.set("filename", filters.filename);
      if (filters.locale) params.set("locale", filters.locale);
      if (filters.model) params.set("model", filters.model);
      if (filters.source_hash) params.set("source_hash", filters.source_hash);
      if (filters.source_text) params.set("source_text", filters.source_text);
      if (filters.translated_text) params.set("translated_text", filters.translated_text);
      if (filters.last_hit_at_null) params.set("last_hit_at_null", "true");
      const qs = params.toString();
      const res = await fetch(
        `/api/translations/by-filters${qs ? "?" + qs : ""}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.statusText);
      alert(`Deleted ${data.deleted} translation(s).`);
      await loadData();
      await loadFilepaths();
      await loadLocales();
      await loadModels();
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  }

  async function deleteByFilepath() {
    const filepath = document.getElementById("select-filepath").value;
    if (!filepath) return;
    if (!confirm(`Delete all translations for "${filepath}"?`)) return;
    try {
      const res = await fetch(
        `/api/translations/by-filepath?filepath=${encodeURIComponent(filepath)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.statusText);
      alert(`Deleted ${data.deleted} translation(s).`);
      document.getElementById("select-filepath").value = "";
      document.getElementById("btn-delete-filepath").disabled = true;
      await loadData();
      await loadFilepaths();
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  }

  function debounce(fn, ms) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  async function loadLocales() {
    try {
      const res = await fetch("/api/locales");
      if (!res.ok) return;
      const data = await res.json();
      const select = document.getElementById("filter-locale");
      select.innerHTML = '<option value="">All locales</option>';
      for (const loc of data.locales) {
        const opt = document.createElement("option");
        opt.value = loc;
        opt.textContent = loc;
        select.appendChild(opt);
      }
    } catch (err) {
      console.error("Error loading locales:", err);
    }
  }

  async function loadModels() {
    try {
      const res = await fetch("/api/models");
      if (!res.ok) return;
      const data = await res.json();
      const select = document.getElementById("filter-model");
      select.innerHTML = '<option value="">All models</option>';
      for (const model of data.models) {
        const opt = document.createElement("option");
        opt.value = model;
        opt.textContent = model;
        select.appendChild(opt);
      }
    } catch (err) {
      console.error("Error loading models:", err);
    }
  }

  function applyFilters() {
    filters.filename = document.getElementById("filter-filename").value.trim();
    filters.locale = document.getElementById("filter-locale").value.trim();
    filters.model = document.getElementById("filter-model").value.trim();
    filters.source_hash = document.getElementById("filter-source-hash").value.trim();
    filters.source_text = document.getElementById("filter-source-text").value.trim();
    filters.translated_text = document.getElementById("filter-translated-text").value.trim();
    filters.last_hit_at_null = document.getElementById("filter-stale-only").checked;
    currentPage = 1;
    
    // Show loading state on button
    const applyBtn = document.getElementById("btn-apply");
    if (applyBtn) {
      applyBtn.textContent = "Loading...";
      applyBtn.disabled = true;
    }
    
    loadData();
  }


  function init() {
    document.getElementById("btn-apply").addEventListener("click", applyFilters);

    document.getElementById("filter-filename").addEventListener("keydown", (e) => {
      if (e.key === "Enter") applyFilters();
    });
    document.getElementById("filter-source-hash").addEventListener("keydown", (e) => {
      if (e.key === "Enter") applyFilters();
    });
    document.getElementById("filter-source-text").addEventListener("keydown", (e) => {
      if (e.key === "Enter") applyFilters();
    });
    document.getElementById("filter-translated-text").addEventListener("keydown", (e) => {
      if (e.key === "Enter") applyFilters();
    });

    document.getElementById("filter-locale").addEventListener("change", applyFilters);
    document.getElementById("filter-model").addEventListener("change", applyFilters);

    document.getElementById("select-filepath").addEventListener("change", (e) => {
      document.getElementById("btn-delete-filepath").disabled = !e.target.value;
    });
    document.getElementById("btn-delete-filepath").addEventListener("click", deleteByFilepath);
    document.getElementById("btn-delete-filtered").addEventListener("click", deleteFiltered);

    document.getElementById("btn-prev").addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        loadData();
      }
    });
    document.getElementById("btn-next").addEventListener("click", () => {
      if (currentPage < Math.ceil(total / pageSize)) {
        currentPage++;
        loadData();
      }
    });
    document.getElementById("btn-prev-bottom").addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        loadData();
      }
    });
    document.getElementById("btn-next-bottom").addEventListener("click", () => {
      if (currentPage < Math.ceil(total / pageSize)) {
        currentPage++;
        loadData();
      }
    });

    document.getElementById("page-size").addEventListener("change", (e) => {
      pageSize = parseInt(e.target.value, 10);
      currentPage = 1;
      loadData();
    });

    document.getElementById("btn-modal-cancel").addEventListener("click", closeEditModal);
    document.getElementById("btn-modal-save").addEventListener("click", saveEdit);

    document.getElementById("modal-overlay").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeEditModal();
    });

    loadData();
    loadFilepaths();
    loadLocales();
    loadModels();
  }

  init();
})();
