import { NUTRITIONIX_APP_ID, NUTRITIONIX_API_KEY } from '@env';

const API_ENDPOINT = 'https://trackapi.nutritionix.com/v2';

export interface NutritionInfo {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  potassium_mg: number;
  cholesterol_mg: number;
  serving_qty: number;
  serving_unit: string;
  serving_weight_grams: number;
  full_nutrients: any[];
  photo: {
    thumb: string;
    highres: string;
  };
}

export async function searchFoods(query: string): Promise<NutritionInfo[]> {
  try {
    const response = await fetch(`${API_ENDPOINT}/search/instant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': NUTRITIONIX_APP_ID,
        'x-app-key': NUTRITIONIX_API_KEY,
      },
      body: JSON.stringify({
        query,
        detailed: true,
        full_nutrients: true,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch food data');
    }

    const data = await response.json();
    
    // Format the response to our NutritionInfo interface
    return data.common.map((item: any) => ({
      name: item.food_name,
      calories: item.full_nutrients.find((n: any) => n.attr_id === 208)?.value || 0,
      protein_g: item.full_nutrients.find((n: any) => n.attr_id === 203)?.value || 0,
      carbs_g: item.full_nutrients.find((n: any) => n.attr_id === 205)?.value || 0,
      fat_g: item.full_nutrients.find((n: any) => n.attr_id === 204)?.value || 0,
      fiber_g: item.full_nutrients.find((n: any) => n.attr_id === 291)?.value || 0,
      sugar_g: item.full_nutrients.find((n: any) => n.attr_id === 269)?.value || 0,
      sodium_mg: item.full_nutrients.find((n: any) => n.attr_id === 307)?.value || 0,
      potassium_mg: item.full_nutrients.find((n: any) => n.attr_id === 306)?.value || 0,
      cholesterol_mg: item.full_nutrients.find((n: any) => n.attr_id === 601)?.value || 0,
      serving_qty: item.serving_qty,
      serving_unit: item.serving_unit,
      serving_weight_grams: item.serving_weight_grams,
      full_nutrients: item.full_nutrients,
      photo: {
        thumb: item.photo.thumb,
        highres: item.photo.highres,
      },
    }));
  } catch (error) {
    console.error('Error searching foods:', error);
    throw error;
  }
}

export async function getNutritionFromText(text: string): Promise<NutritionInfo[]> {
  try {
    const response = await fetch(`${API_ENDPOINT}/natural/nutrients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': NUTRITIONIX_APP_ID,
        'x-app-key': NUTRITIONIX_API_KEY,
      },
      body: JSON.stringify({
        query: text,
        detailed: true,
        full_nutrients: true,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch nutrition data');
    }

    const data = await response.json();
    
    // Format the response to our NutritionInfo interface
    return data.foods.map((item: any) => ({
      name: item.food_name,
      calories: item.nf_calories || 0,
      protein_g: item.nf_protein || 0,
      carbs_g: item.nf_total_carbohydrate || 0,
      fat_g: item.nf_total_fat || 0,
      fiber_g: item.nf_dietary_fiber || 0,
      sugar_g: item.nf_sugars || 0,
      sodium_mg: item.nf_sodium || 0,
      potassium_mg: item.nf_potassium || 0,
      cholesterol_mg: item.nf_cholesterol || 0,
      serving_qty: item.serving_qty,
      serving_unit: item.serving_unit,
      serving_weight_grams: item.serving_weight_grams,
      full_nutrients: item.full_nutrients,
      photo: {
        thumb: item.photo?.thumb,
        highres: item.photo?.highres,
      },
    }));
  } catch (error) {
    console.error('Error getting nutrition from text:', error);
    throw error;
  }
}