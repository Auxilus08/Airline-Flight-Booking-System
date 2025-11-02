import db from '../config/db.js';

export const getAllAirlines = async (req, res, next) => {
  try {
    const sql = `
      SELECT
        airline_id,
        name,
        iata_code,
        icao_code,
        country,
        created_at
      FROM airlines
      ORDER BY name
    `;

    const result = await db.query(sql);
    res.json({
      success: true,
      data: result.rows || result,
    });
  } catch (error) {
    next(error);
  }
};
