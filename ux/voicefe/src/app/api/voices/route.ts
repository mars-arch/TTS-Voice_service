import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readdir, mkdir } from 'fs/promises';
import path from 'path';
import { statSync } from 'fs';

const voicesDir = path.join(process.cwd(), 'voices');

// Ensure the voices directory exists
const ensureVoicesDir = async () => {
  try {
    await mkdir(voicesDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create voices directory:', error);
  }
};

// Handler for GET requests to list saved voices
export async function GET() {
  await ensureVoicesDir();
  try {
    const files = await readdir(voicesDir);
    const voiceFiles = files.filter(file => file.endsWith('.wav') || file.endsWith('.mp3'));
    return NextResponse.json({ success: true, voices: voiceFiles });
  } catch (error) {
    console.error('Error reading voices directory:', error);
    return NextResponse.json({ success: false, error: 'Failed to list voices' }, { status: 500 });
  }
}

// Handler for POST requests to save a new voice
export async function POST(request: NextRequest) {
  await ensureVoicesDir();
  try {
    const data = await request.formData();
    const file: File | null = data.get('voiceSample') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // Sanitize filename to prevent security issues
    const sanitizedFilename = path.basename(file.name).replace(/[^a-zA-Z0-9._-]/g, '');
    const filePath = path.join(voicesDir, sanitizedFilename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    return NextResponse.json({ success: true, message: 'Voice saved successfully', voiceId: sanitizedFilename });
  } catch (error) {
    console.error('Error saving voice:', error);
    return NextResponse.json({ success: false, error: 'Failed to save voice' }, { status: 500 });
  }
}
