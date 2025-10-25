/**
 * Fetches a random cat fact from the Cat Facts API
 * @async
 * @function getFact
 * @param {string} baseURL - The base URL of the Cat Facts API (e.g., 'https://catfact.ninja')
 * @returns {Promise<string|null>} A promise that resolves to a cat fact string, or null if an error occurs
 * @throws {Error} If the HTTP request fails or response is not OK
 * @example
 * // Usage example
 * const fact = await getFact('https://catfact.ninja');
 * console.log(fact); // "Cats have 32 muscles that control the outer ear..."
 */
export async function getFact(baseURL) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${baseURL}/fact`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.fact;
  } catch (error) {
    console.error("Error fetching cat fact:", error);
    throw error; // Re-throw to let caller handle
  }
}
