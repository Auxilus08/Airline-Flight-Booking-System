import db from '../config/db.js';

export const getAllAircraft = async (req, res, next) => {
  try {
    const sql = `
      SELECT
        aircraft_id,
        aircraft_model,
        registration_number,
        total_seats,
        economy_seats,
        business_seats,
        first_class_seats,
        status
      FROM aircraft
      ORDER BY aircraft_model
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
