/**
 * Base API utility for making HTTP requests
 */

/**
 * Makes an API request with error handling
 * @param {string} url - The API endpoint URL
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<any>} - The parsed JSON response
 * @throws {Error} - If the request fails
 */
export async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API request failed [${url}]:`, error);
    throw error;
  }
}

/**
 * Makes a GET request
 * @param {string} url - The API endpoint URL
 * @returns {Promise<any>} - The parsed JSON response
 */
export async function get(url) {
  return apiRequest(url, { method: 'GET' });
}

/**
 * Makes a POST request
 * @param {string} url - The API endpoint URL
 * @param {any} body - The request body
 * @returns {Promise<any>} - The parsed JSON response
 */
export async function post(url, body) {
  return apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Makes a PUT request
 * @param {string} url - The API endpoint URL
 * @param {any} body - The request body
 * @returns {Promise<any>} - The parsed JSON response
 */
export async function put(url, body) {
  return apiRequest(url, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * Makes a PATCH request
 * @param {string} url - The API endpoint URL
 * @returns {Promise<any>} - The parsed JSON response
 */
export async function patch(url, body = null) {
  return apiRequest(url, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Makes a DELETE request
 * @param {string} url - The API endpoint URL
 * @returns {Promise<any>} - The parsed JSON response
 */
export async function del(url) {
  return apiRequest(url, { method: 'DELETE' });
}

/**
 * Uploads files using FormData
 * @param {string} url - The API endpoint URL
 * @param {FormData} formData - The FormData containing files
 * @returns {Promise<any>} - The parsed JSON response
 */
export async function upload(url, formData) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      // Don't set Content-Type - browser will set it with boundary for FormData
      body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `Upload failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`Upload failed [${url}]:`, error);
    throw error;
  }
}

