import { Crop } from "./types";

export const CROPS: Crop[] = [
  {
    id: "tomato",
    name: "Tomato",
    minMoisture: 60,
    maxMoisture: 80,
    description: "Requires consistent moisture. Avoid waterlogged soil."
  },
  {
    id: "rice",
    name: "Rice",
    minMoisture: 80,
    maxMoisture: 95,
    description: "High water requirement. Thrives in very wet conditions."
  },
  {
    id: "succulent",
    name: "Succulent",
    minMoisture: 10,
    maxMoisture: 30,
    description: "Drought-tolerant. Needs dry soil between waterings."
  },
  {
    id: "wheat",
    name: "Wheat",
    minMoisture: 40,
    maxMoisture: 60,
    description: "Moderate water needs. Sensitive to extreme dryness."
  }
];

export const DEFAULT_CROP = CROPS[0];
