export interface Crop {
  id: string;
  name: string;
  minMoisture: number;
  maxMoisture: number;
  description: string;
}

export interface MoistureRecord {
  id: number;
  timestamp: string;
  moisture_level: number;
  crop_type: string;
  irrigation_status: number;
}

export type SoilCondition = 'Dry' | 'Optimal' | 'Wet';
