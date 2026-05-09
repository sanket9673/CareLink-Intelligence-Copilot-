/**
 * CareLinkRecord represents the unified data contract for patient health events
 * across the CareLink Intelligence Copilot monorepo.
 */
export interface CareLinkRecord {
  /** ISO 8601 formatted timestamp */
  timestamp: string;
  
  /** Glucose level in mg/dL (optional if the event is not a reading) */
  glucose_mgdl?: number;
  
  /** Insulin delivered in units (optional if the event is not a bolus) */
  insulin_units?: number;
  
  /** Carbohydrates consumed in grams (optional if the event is not a meal) */
  carb_grams?: number;
  
  /** Type of event recorded */
  event_type: 'meal' | 'bolus' | 'sensor' | 'other';
}
