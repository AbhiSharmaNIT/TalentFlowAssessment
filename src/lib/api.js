export const api = {
  async get(path, params = {}, signal) {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") usp.set(k, String(v));
    });

    const qs = usp.toString();
    const url = qs ? `/api${path}${path.includes("?") ? "&" : "?"}${qs}` : `/api${path}`;

    const res = await fetch(url, { signal });
    if (!res.ok) {
      const msg = await safeText(res);
      throw new Error(msg || "Network error");
    }
    return res.json();
  },

  async post(path, body, signal) {
    const res = await fetch(`/api${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
      signal,
    });
    if (!res.ok) {
      const msg = await safeText(res);
      throw new Error(msg || "Request failed");
    }
    return res.json();
  },

  async patch(path, body, signal) {
    const res = await fetch(`/api${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
      signal,
    });
    if (!res.ok) {
      const msg = await safeText(res);
      throw new Error(msg || "Request failed");
    }
    return res.json();
  },

  async put(path, body, signal) {
    const res = await fetch(`/api${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
      signal,
    });
    if (!res.ok) {
      const msg = await safeText(res);
      throw new Error(msg || "Request failed");
    }
    return res.json();
  },
};

async function safeText(res) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}
