// Food API keys and endpoints
export const FOOD_DATA_CENTRAL_API_KEY = process.env.EXPO_PUBLIC_FOOD_DATA_CENTRAL_API_KEY || '';
export const FOOD_DATA_CENTRAL_SEARCH_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';
export const OPENFOODFACTS_SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl';

// Check if USDA API is configured
export const isUSDAConfigured = () => {
  return Boolean(FOOD_DATA_CENTRAL_API_KEY);
};

// Log configuration status
if (!FOOD_DATA_CENTRAL_API_KEY) {
  console.warn('USDA Food Data Central API key not configured. Only OpenFoodFacts will be used for food search.');
} else {
  console.log('USDA Food Data Central API configured successfully.');
}
