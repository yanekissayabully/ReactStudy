export const DATA_KEY = "lab-inventory-edits-v2";

export interface ApiConfig {
  minDelay: number;
  maxDelay: number;
  errorChance: number;
}

export const DEFAULT_API_CONFIG: ApiConfig = {
  minDelay: 500,
  maxDelay: 3000,
  errorChance: 0.05,
};

let config: ApiConfig = { ...DEFAULT_API_CONFIG };

export function getApiConfig(): ApiConfig {
  return config;
}

export function setApiConfig(patch: Partial<ApiConfig>): void {
  config = { ...config, ...patch };
}
