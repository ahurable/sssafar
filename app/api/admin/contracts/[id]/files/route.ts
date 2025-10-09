// app/api/contracts/[id]/files/route.ts (add DELETE method)
import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import fs from 'fs';
import path from 'path';
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest, {params}:{params: {id:string}}) {
  const session = await getSession()
  if (!session || session.role != "ADMIN") {
    return NextResponse.json({
        error: "لطفا وارد حساب کاربری خود شوید"
    }, { status: 401 })
  }
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const contractId = params.id;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (!contractId) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    // Check if contract exists
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'uploads', 'contracts');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadedFiles = [];

    for (const file of files) {
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        continue; // Skip oversized files
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        continue; // Skip invalid file types
      }

      // Generate unique filename
      const fileExt = path.extname(file.name);
      const fileName = `${contractId}-${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);

      // Convert File to Buffer and save to disk
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      fs.writeFileSync(filePath, buffer);

      // Save file info to database
      const savedFile = await prisma.file.create({
        data: {
          filename: file.name,
          mimetype: file.type,
          path: `/uploads/contracts/${fileName}`,
          size: file.size,
          contractId,
        },
      });

      uploadedFiles.push({
        id: savedFile.id,
        filename: savedFile.filename,
        mimetype: savedFile.mimetype,
        size: savedFile.size,
        path: savedFile.path,
        createdAt: savedFile.createdAt,
      });
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: 'No valid files were uploaded' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contractId');

    if (!contractId) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    const files = await prisma.file.findMany({
      where: { contractId },
      select: {
        id: true,
        filename: true,
        mimetype: true,
        size: true,
        path: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Files retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve files' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractId = params.id;
    const body = await request.json();
    const { fileId } = body;

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Find the file to get its path
    const file = await prisma.file.findUnique({
      where: { id: fileId, contractId },
    });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Delete file from database
    await prisma.file.delete({
      where: { id: fileId },
    });

    // Delete physical file
    const filePath = path.join(process.cwd(), file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json({
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('File deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}