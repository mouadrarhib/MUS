import apiClient from "@/services/api";

const unwrap = (response) => response.data;

export const get = (url, config) => apiClient.get(url, config).then(unwrap);
export const post = (url, data, config) => apiClient.post(url, data, config).then(unwrap);
export const patch = (url, data, config) => apiClient.patch(url, data, config).then(unwrap);
export const del = (url, config) => apiClient.delete(url, config).then(unwrap);
