import axios from 'axios';

export async function fetchExchangeRates() {
  try {
    const response = await axios.get('https://open.er-api.com/v6/latest/USD', {
      timeout: 10000
    });
    return response.data.rates;
  } catch (error) {
    throw new Error(`Failed to fetch exchange rates: ${error.message}`);
  }
}
