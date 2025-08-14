import { getItemStorage } from "./storage.js";

const METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
};

const contentTypes = {
  "Content-Type": "application/json",
};

const baseUrl = "https://spotify.f8team.dev/api";

class HttpRequest {
  constructor() {
    this.baseUrl = baseUrl;
  }

  async _send(path, method, data, options = {}) {
    try {
      const _option = {
        ...options,
        method,
        headers: {
          ...options.headers,
          ...contentTypes,
        },
      };

      if (data) {
        _option.body = JSON.stringify(data);
      }
      const accessToken = getItemStorage("accessToken");
      if (accessToken) {
        _option.headers.Authorization = `Bearer ${accessToken}`;
      }

      const res = await fetch(`${this.baseUrl}${path}`, _option);
      const response = await res.json();
      if (!res.ok) {
        const error = new Error(`HTTP error: `, res.status);

        error.response = response?.error;
        error.status = res.status;
        throw error;
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async get(path, options) {
    return await this._send(path, METHODS.GET, null, options);
  }

  async post(path, data, options) {
    return await this._send(path, METHODS.POST, data, options);
  }

  async put(path, data, options) {
    return await this._send(path, METHODS.PUT, data, options);
  }

  async patch(path, data, options) {
    return await this._send(path, METHODS.PATCH, data, options);
  }

  async del(path, options) {
    return await this._send(path, METHODS.DELETE, null, options);
  }
}

const httpRequest = new HttpRequest();

export default httpRequest;
