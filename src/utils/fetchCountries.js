import axios from 'axios';

export async function fetchCountries() {
  try {
    const response = await axios.get('https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies', {
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch countries: ${error.message}`);
  }
}

export function processCountries(countries, rates) {
  return countries.map(country => {
    const currencies = country.currencies || [];
    const currencyCode = currencies.length > 0 ? currencies[0].code : null;
    const exchangeRate = currencyCode && rates[currencyCode] ? rates[currencyCode] : null;

    let estimatedGdp = null;
    if (exchangeRate && country.population) {
      const randomMultiplier = Math.random() * 1000 + 1000; // 1000-2000
      estimatedGdp = (country.population * randomMultiplier) / exchangeRate;
    } else if (!currencyCode) {
      estimatedGdp = 0;
    }

    return {
      name: country.name,
      capital: country.capital || null,
      region: country.region || null,
      population: country.population,
      currency_code: currencyCode,
      exchange_rate: exchangeRate,
      estimated_gdp: estimatedGdp,
      flag_url: country.flag || null
    };
  });
}
