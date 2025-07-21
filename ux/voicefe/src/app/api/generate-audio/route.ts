import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { writeFile } from 'fs/promises';
import path from 'path';

const voicesDir = path.join(process.cwd(), 'voices');

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const voiceId: string | null = data.voiceId;
    const text: string | null = data.text;

    if (!voiceId || !text) {
      return NextResponse.json({ success: false, error: 'Missing voiceId or text' }, { status: 400 });
    }

    // Use the saved voice from the persistent storage
    const tempDir = path.join(process.cwd(), 'tmp');
    const refPath = path.join(voicesDir, voiceId);
    const tempOutPath = path.join(tempDir, `out_chat_${Date.now()}.wav`);
    await require('fs').promises.mkdir(tempDir, { recursive: true });

    // Generate audio from the text using the selected voice
    const f5TtsPath = path.resolve(process.cwd(), '../../F5-TTS');
    const command = `f5-tts_infer-cli --ref_audio "${refPath}" --ref_text "" --gen_text "${text}" --output_file "${tempOutPath}" --nfe_step 16 --sway_sampling_coef 0.5`;

    await new Promise<void>((resolve, reject) => {
      exec(command, { cwd: f5TtsPath }, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          console.error(`stderr: ${stderr}`);
          reject(new Error(`Failed to execute F5-TTS command. Stderr: ${stderr}`));
          return;
        }
        resolve();
      });
    });

    const generatedFileUrl = `/api/audio?path=${encodeURIComponent(tempOutPath)}`;

    return NextResponse.json({ 
      success: true, 
      audioUrl: generatedFileUrl 
    });

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
