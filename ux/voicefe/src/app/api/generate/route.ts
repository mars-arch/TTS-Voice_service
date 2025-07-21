import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const text: string | null = data.get('text') as string;

    if (!file || !text) {
      return NextResponse.json({ success: false, error: 'Missing file or text' }, { status: 400 });
    }

    // Create temporary file paths
    const tempDir = path.join(process.cwd(), 'tmp');
    const tempRefPath = path.join(tempDir, `ref_${Date.now()}_${file.name}`);
    const tempOutPath = path.join(tempDir, `out_${Date.now()}.wav`);

    // Ensure temp directory exists
    await require('fs').promises.mkdir(tempDir, { recursive: true });

    // Write the uploaded audio to a temporary file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(tempRefPath, buffer);

    // Construct the command
    const f5TtsPath = path.resolve(process.cwd(), '../../F5-TTS');
    const command = `f5-tts_infer-cli --ref_audio "${tempRefPath}" --ref_text "" --gen_text "${text}" --output_file "${tempOutPath}" --nfe_step 16 --sway_sampling_coef 0.5`;

    // Execute the command
    await new Promise<void>((resolve, reject) => {
      exec(command, { cwd: f5TtsPath }, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          console.error(`stderr: ${stderr}`);
          reject(error);
          return;
        }
        console.log(`stdout: ${stdout}`);
        resolve();
      });
    });

    // Return the path to the generated file
    const generatedFileUrl = `/api/audio?path=${encodeURIComponent(tempOutPath)}`;
    return NextResponse.json({ success: true, audioUrl: generatedFileUrl });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
