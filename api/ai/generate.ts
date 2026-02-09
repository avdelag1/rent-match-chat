/**
 * AI Generation API Route
 * Supports multiple providers: Minimax, OpenAI, Anthropic
 * Configure your preferred provider in environment variables
 */

import { NextRequest, NextResponse } from 'next/server';

// Configuration - set these in Vercel Environment Variables
const CONFIG = {
  // Provider selection: 'minimax' | 'openai' | 'anthropic'
  provider: process.env.AI_PROVIDER || 'openai',
  
  // OpenAI (default fallback)
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o',
  },
  
  // Minimax (your preferred choice)
  minimax: {
    apiKey: process.env.MINIMAX_API_KEY || '',
    baseUrl: process.env.MINIMAX_BASE_URL || 'https://api.minimax.chat/v1/text',
    model: process.env.MINIMAX_MODEL || 'abab6.5s-chat',
  },
  
  // Anthropic
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
  },
  
  // Rate limiting (requests per hour per user)
  rateLimit: parseInt(process.env.AI_RATE_LIMIT || '20'),
};

// Prompt templates for different generation types
const PROMPTS = {
  listing: {
    system: `You are an expert real estate copywriter. Your job is to create compelling, marketing-focused property listings that:
- Highlight unique features and benefits
- Use descriptive, evocative language
- Include practical details (size, amenities, location)
- Appeal to the target rental/buyer audience
- Always write in the language the user provided
- Keep descriptions between 150-300 words`,
    user: `Create a compelling property listing based on these details:

Photos provided: {photos}
Basic information: {basicInfo}
Property type: {propertyType}
Location: {location}
Price: {price}

Please generate:
1. An attention-grabbing title (max 8 words)
2. A full property description (150-300 words)
3. A list of key features and amenities
4. A call-to-action sentence

Respond in JSON format:
{
  "title": "...",
  "description": "...",
  "features": ["...", "..."],
  "callToAction": "..."
}`,
  },
  
  profile: {
    system: `You are an expert profile coach. Create authentic, engaging personal descriptions that:
- Highlight personality and lifestyle
- Are genuine and relatable
- Mention interests naturally
- Appeal to landlords/property owners
- Write in the first person (as the user)
- Keep it friendly but professional`,
    user: `Enhance this profile with minimal information:

Current info: {currentInfo}
Photos provided: {photos}
What they're looking for: {preferences}
Target audience: landlords/property owners

Create:
1. A friendly bio (50-100 words)
2. What makes them a great tenant/buyer (2-3 sentences)
3. Their lifestyle in a nutshell (short paragraph)

Respond in JSON format:
{
  "bio": "...",
  "whyGreatMatch": "...",
  "lifestyle": "..."
}`,
  },
  
  dealFinder: {
    system: `You are a helpful real estate assistant. Analyze user requests and provide personalized listing recommendations with clear reasoning.`,
    user: `The user is looking for: {searchCriteria}

Based on these available listings:
{listings}

Provide:
1. A summary of how well each listing matches their criteria
2. Your top 3 recommendations with reasoning
3. Questions the user should ask

Respond in JSON format:
{
  "summary": "...",
  "recommendations": [
    {
      "listingId": "...",
      "matchScore": 85,
      "reasoning": "...",
      "pros": ["...", "..."],
      "cons": ["..."]
    }
  ],
  "questionsToAsk": ["...", "..."]
}`,
  },
};

/**
 * Call OpenAI API
 */
async function callOpenAI(messages: any[], maxTokens: number = 500) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.openai.apiKey}`,
    },
    body: JSON.stringify({
      model: CONFIG.openai.model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Call Minimax API
 */
async function callMinimax(messages: any[], maxTokens: number = 500) {
  const response = await fetch(`${CONFIG.minimax.baseUrl}/chatcompletion_v2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.minimax.apiKey}`,
    },
    body: JSON.stringify({
      model: CONFIG.minimax.model,
      messages,
      max_output_tokens: maxTokens,
      temperature: 0.7,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Minimax API error: ${error}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Call Anthropic API
 */
async function callAnthropic(messages: any[], maxTokens: number = 500) {
  // Convert OpenAI format to Anthropic format
  const systemMessage = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role === 'user');
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CONFIG.anthropic.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CONFIG.anthropic.model,
      messages: userMessages,
      system: systemMessage?.content,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }
  
  const data = await response.json();
  return data.content[0].text;
}

/**
 * Main API handler
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { type, data: inputData, userId } = body;
    
    // Validate request
    if (!type || !inputData) {
      return NextResponse.json(
        { error: 'Missing required fields: type and data' },
        { status: 400 }
      );
    }
    
    // Validate generation type
    if (!PROMPTS[type]) {
      return NextResponse.json(
        { error: `Unknown generation type: ${type}` },
        { status: 400 }
      );
    }
    
    // Check if API key is configured
    const provider = CONFIG.provider;
    let apiKey = '';
    
    if (provider === 'openai') {
      apiKey = CONFIG.openai.apiKey;
    } else if (provider === 'minimax') {
      apiKey = CONFIG.minimax.apiKey;
    } else if (provider === 'anthropic') {
      apiKey = CONFIG.anthropic.apiKey;
    }
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: `${provider.toUpperCase()} API key not configured`,
          setupRequired: true,
          instructions: `Add ${provider.toUpperCase()}_API_KEY to your Vercel environment variables`
        },
        { status: 401 }
      );
    }
    
    // Build prompt
    const prompt = PROMPTS[type];
    
    // Replace placeholders with actual data
    const userContent = Object.entries(inputData).reduce((acc, [key, value]) => {
      return acc.replace(new RegExp(`{${key}}`, 'g'), JSON.stringify(value, null, 2));
    }, prompt.user);
    
    const messages = [
      { role: 'system', content: prompt.system },
      { role: 'user', content: userContent },
    ];
    
    // Call the appropriate API
    let result: string;
    
    if (provider === 'openai') {
      result = await callOpenAI(messages);
    } else if (provider === 'minimax') {
      result = await callMinimax(messages);
    } else if (provider === 'anthropic') {
      result = await callAnthropic(messages);
    } else {
      throw new Error(`Unknown provider: ${provider}`);
    }
    
    // Try to parse as JSON, or wrap in JSON object
    let parsedResult;
    try {
      parsedResult = JSON.parse(result);
    } catch {
      parsedResult = { raw: result };
    }
    
    // Log usage (you could store this in Supabase for billing)
    console.log(`[AI] Generated ${type} for user ${userId} using ${provider}`);
    
    return NextResponse.json({
      success: true,
      provider,
      type,
      result: parsedResult,
    });
    
  } catch (error: any) {
    console.error('[AI] Generation error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
}

/**
 * Get AI configuration status
 */
export async function GET(request: NextRequest) {
  const provider = CONFIG.provider;
  let configured = false;
  
  if (provider === 'openai') {
    configured = !!CONFIG.openai.apiKey;
  } else if (provider === 'minimax') {
    configured = !!CONFIG.minimax.apiKey;
  } else if (provider === 'anthropic') {
    configured = !!CONFIG.anthropic.apiKey;
  }
  
  return NextResponse.json({
    provider,
    configured,
    availableTypes: Object.keys(PROMPTS),
  });
}
