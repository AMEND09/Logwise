import { OpenFoodFactsProduct, USDAFoodItem, FoodSearchResult } from '@/types';
import { FOOD_DATA_CENTRAL_API_KEY, FOOD_DATA_CENTRAL_SEARCH_URL, OPENFOODFACTS_SEARCH_URL } from './foodApiConfig';

// Search USDA Food Data Central API
const searchUSDAFoods = async (query: string): Promise<FoodSearchResult[]> => {
  if (!FOOD_DATA_CENTRAL_API_KEY) {
    console.warn('USDA Food Data Central API key not configured');
    return [];
  }

  try {
    const params = new URLSearchParams({
      query,
      pageSize: '15',
      api_key: FOOD_DATA_CENTRAL_API_KEY,
      dataType: 'Foundation,SR Legacy,Survey (FNDDS)',
    });

    const response = await fetch(`${FOOD_DATA_CENTRAL_SEARCH_URL}?${params}`);
    const data = await response.json();

    if (!data.foods) return [];

    return data.foods.map((food: USDAFoodItem): FoodSearchResult => {
      // Extract nutrients (per 100g)
      const nutrients = food.foodNutrients.reduce((acc, nutrient) => {
        switch (nutrient.nutrientNumber) {
          case '208': // Energy (kcal)
            acc.calories = nutrient.value;
            break;
          case '203': // Protein
            acc.protein_g = nutrient.value;
            break;
          case '205': // Carbohydrates
            acc.carbs_g = nutrient.value;
            break;
          case '204': // Total fat
            acc.fats_g = nutrient.value;
            break;
        }
        return acc;
      }, { calories: 0, protein_g: 0, carbs_g: 0, fats_g: 0 });

      return {
        id: `usda-${food.fdcId}`,
        name: food.description,
        brand: food.brandOwner,
        source: 'usda',
        sourceId: food.fdcId,
        ...nutrients,
      };
    }).filter((food: FoodSearchResult) => food.calories > 0); // Only include foods with calorie data
  } catch (error) {
    console.error('Error searching USDA foods:', error);
    return [];
  }
};

// Search OpenFoodFacts API
const searchOpenFoodFacts = async (query: string): Promise<FoodSearchResult[]> => {
  try {
    const params = new URLSearchParams({
      search_terms: query,
      search_simple: '1',
      action: 'process',
      json: '1',
      page_size: '10',
    });

    const response = await fetch(`${OPENFOODFACTS_SEARCH_URL}?${params}`);
    const data = await response.json();

    if (!data.products) return [];

    return data.products
      .filter((product: OpenFoodFactsProduct) => 
        product.product_name && 
        product.nutriments && 
        product.nutriments['energy-kcal_100g'] !== undefined
      )
      .map((product: OpenFoodFactsProduct): FoodSearchResult => {
        const calories = parseFloat(String(product.nutriments['energy-kcal_100g'] || 0));
        const protein_g = parseFloat(String(product.nutriments.proteins_100g || 0));
        const carbs_g = parseFloat(String(product.nutriments.carbohydrates_100g || 0));
        const fats_g = parseFloat(String(product.nutriments.fat_100g || 0));

        return {
          id: `off-${product.product_name?.replace(/\s+/g, '-').toLowerCase()}`,
          name: product.product_name || product.product_name_en || 'Unknown Product',
          brand: product.brands,
          source: 'openfoodfacts',
          sourceId: product.product_name || '',
          calories,
          protein_g,
          carbs_g,
          fats_g,
        };
      });
  } catch (error) {
    console.error('Error searching OpenFoodFacts:', error);
    return [];
  }
};

// Main search function that aggregates results from both APIs
export const searchFoods = async (query: string): Promise<FoodSearchResult[]> => {
  if (!query.trim()) return [];

  try {
    // Search both APIs in parallel
    const [usdaResults, openFoodFactsResults] = await Promise.all([
      searchUSDAFoods(query),
      searchOpenFoodFacts(query),
    ]);

    // Combine results, prioritizing USDA Food Data Central
    const combinedResults = [
      ...usdaResults,
      ...openFoodFactsResults,
    ];

    // Remove duplicates based on similar names (simple deduplication)
    const uniqueResults = combinedResults.filter((result, index, self) => {
      const normalizedName = result.name.toLowerCase().trim();
      return index === self.findIndex(r => 
        r.name.toLowerCase().trim() === normalizedName && r.source === result.source
      );
    });

    // Sort by source priority (USDA first, then OpenFoodFacts)
    return uniqueResults.sort((a, b) => {
      if (a.source === 'usda' && b.source === 'openfoodfacts') return -1;
      if (a.source === 'openfoodfacts' && b.source === 'usda') return 1;
      return 0;
    });
  } catch (error) {
    console.error('Error searching foods:', error);
    return [];
  }
};

// Legacy function for backward compatibility
export const searchFoodsLegacy = async (query: string): Promise<OpenFoodFactsProduct[]> => {
  const results = await searchOpenFoodFacts(query);
  return results.map(result => ({
    product_name: result.name,
    brands: result.brand,
    nutriments: {
      'energy-kcal_100g': result.calories,
      proteins_100g: result.protein_g,
      carbohydrates_100g: result.carbs_g,
      fat_100g: result.fats_g,
    },
  }));
};