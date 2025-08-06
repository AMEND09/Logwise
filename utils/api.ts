import { OpenFoodFactsProduct } from '@/types';

const OPENFOODFACTS_SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl';

export const searchFoods = async (query: string): Promise<OpenFoodFactsProduct[]> => {
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

    // Filter products with valid nutritional data
    return data.products.filter((product: OpenFoodFactsProduct) => 
      product.product_name && 
      product.nutriments && 
      product.nutriments['energy-kcal_100g'] !== undefined
    );
  } catch (error) {
    console.error('Error searching foods:', error);
    return [];
  }
};