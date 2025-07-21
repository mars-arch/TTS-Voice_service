import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { writeFile } from 'fs/promises';
import path from 'path';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const message: string | null = data.message;

    if (!message) {
      return NextResponse.json({ success: false, error: 'Missing message' }, { status: 400 });
    }

    // Get LLM response from Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: message }],
      model: 'llama3-8b-8192',
    });
    const llmResponse = chatCompletion.choices[0]?.message?.content || 'I am speechless.';

    return NextResponse.json({ 
      success: true, 
      llmResponse,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
