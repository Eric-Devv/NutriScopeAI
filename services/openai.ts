import { OPENAI_API_KEY } from '@env';

const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{type: string; image_url?: { url: string }; text?: string}>;
}

export async function getChatResponse(messages: Message[]): Promise<string> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to get response from OpenAI');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting chat response:', error);
    throw error;
  }
}

export async function analyzeImage(imageUri: string, prompt: string): Promise<string> {
  try {
    // First convert the image to base64
    const base64Image = await imageToBase64(imageUri);
    
    const messages: Message[] = [
      {
        role: 'system',
        content: 'You are a helpful nutrition assistant that can analyze food images and provide detailed information about the food items in the image, including nutritional value and health properties.'
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          },
          {
            type: 'text',
            text: prompt || 'Identify the food in this image and provide detailed nutritional information.'
          }
        ]
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to analyze image');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}

async function imageToBase64(uri: string): Promise<string> {
  // For a complete implementation, you would use expo-file-system to read the image
  // and convert it to base64. However, this is a simplified implementation.
  try {
    const { readAsStringAsync } = await import('expo-file-system');
    const base64 = await readAsStringAsync(uri, { encoding: 'base64' });
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}

export interface NutritionTip {
  title: string;
  description: string;
  imageUrl: string;
  category: string;
}

export async function getDailyTip(preferences: any): Promise<NutritionTip> {
  const dietaryRestrictions = preferences?.dietaryRestrictions || [];
  const dietGoals = preferences?.dietGoals || [];
  
  const messages: Message[] = [
    {
      role: 'system',
      content: 'You are a nutrition expert providing helpful, accurate, and personalized daily tips. Format your response as a JSON object with title, description, category, and imageUrl properties. The imageUrl should be a placeholder with the format "https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Nutrition+Tip" that will be replaced later.'
    },
    {
      role: 'user',
      content: `Generate a daily nutrition or wellness tip. Consider these dietary restrictions: ${dietaryRestrictions.join(', ')} and diet goals: ${dietGoals.join(', ')}. Return ONLY a JSON object with the following format: 
      {
        "title": "The tip title",
        "description": "Detailed description of the tip (100-150 words)",
        "category": "One of: Nutrition, Hydration, Exercise, Mindfulness, Sleep",
        "imageUrl": "https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Nutrition+Tip"
      }`
    }
  ];

  try {
    const response = await getChatResponse(messages);
    // Parse the JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to parse tip response');
    }
  } catch (error) {
    console.error('Error getting daily tip:', error);
    // Return a default tip if there's an error
    return {
      title: 'Stay Hydrated',
      description: 'Remember to drink enough water throughout the day. Proper hydration helps maintain energy levels, supports digestion, and can even help with weight management.',
      category: 'Hydration',
      imageUrl: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Hydration+Tip'
    };
  }
}

export async function analyzeMealHistory(mealHistory: any[]): Promise<string> {
  try {
    const messages: Message[] = [
      {
        role: 'system',
        content: 'You are a nutrition expert analyzing meal patterns and providing helpful feedback. Focus on constructive advice and positive reinforcement. Limit your response to 300 words.'
      },
      {
        role: 'user',
        content: `Analyze this meal history and provide helpful feedback about patterns, nutritional balance, and suggestions for improvement: ${JSON.stringify(mealHistory)}`
      }
    ];

    return await getChatResponse(messages);
  } catch (error) {
    console.error('Error analyzing meal history:', error);
    return 'Unable to analyze meal history at this time. Please try again later.';
  }
}