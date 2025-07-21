import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filePathParam = searchParams.get('path');

  if (!filePathParam) {
    return new NextResponse('File path is required', { status: 400 });
  }

  // Security check: only allow access to files within the temporary directory.
  const tempDir = path.join(process.cwd(), 'tmp');
  const baseName = path.basename(filePathParam);
  const requestedPath = path.join(tempDir, baseName);

  if (!requestedPath.startsWith(tempDir)) {
    return new NextResponse('Forbidden: Access is restricted to the temporary directory.', { status: 403 });
  }

  try {
    const stats = await stat(requestedPath);
    const data = await readFile(requestedPath);

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': stats.size.toString(),
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse('File not found', { status: 404 });
  }
}
