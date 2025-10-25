import pool from '../db.js';

export class CountryModel {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS countries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        capital VARCHAR(255),
        region VARCHAR(255),
        population BIGINT NOT NULL,
        currency_code VARCHAR(10),
        exchange_rate DECIMAL(15,6),
        estimated_gdp DECIMAL(20,2),
        flag_url VARCHAR(500),
        last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await pool.execute(query);
  }

  static async upsertCountries(countries) {
    const query = `
      INSERT INTO countries (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        capital = VALUES(capital),
        region = VALUES(region),
        population = VALUES(population),
        currency_code = VALUES(currency_code),
        exchange_rate = VALUES(exchange_rate),
        estimated_gdp = VALUES(estimated_gdp),
        flag_url = VALUES(flag_url)
    `;

    const promises = countries.map(country =>
      pool.execute(query, [
        country.name,
        country.capital,
        country.region,
        country.population,
        country.currency_code,
        country.exchange_rate,
        country.estimated_gdp,
        country.flag_url
      ])
    );

    await Promise.all(promises);
  }

  static async getAll(filters = {}, sort = {}) {
    let query = 'SELECT * FROM countries';
    const conditions = [];
    const params = [];

    if (filters.region) {
      conditions.push('region = ?');
      params.push(filters.region);
    }

    if (filters.currency) {
      conditions.push('currency_code = ?');
      params.push(filters.currency);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    if (sort.field && sort.order) {
      query += ` ORDER BY ${sort.field} ${sort.order}`;
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async getByName(name) {
    const query = 'SELECT * FROM countries WHERE LOWER(name) = LOWER(?)';
    const [rows] = await pool.execute(query, [name]);
    return rows[0];
  }

  static async deleteByName(name) {
    const query = 'DELETE FROM countries WHERE LOWER(name) = LOWER(?)';
    const [result] = await pool.execute(query, [name]);
    return result.affectedRows > 0;
  }

  static async getStatus() {
    const [rows] = await pool.execute('SELECT COUNT(*) as total_countries, MAX(last_refreshed_at) as last_refreshed_at FROM countries');
    return rows[0];
  }

  static async getTopByGDP(limit = 5) {
    const query = 'SELECT name, estimated_gdp FROM countries WHERE estimated_gdp IS NOT NULL ORDER BY estimated_gdp DESC LIMIT ?';
    const [rows] = await pool.execute(query, [limit]);
    return rows;
  }
}
