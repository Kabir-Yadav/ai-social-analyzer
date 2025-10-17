import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { promises as fsp } from "fs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

function ensureUploadsDirSync() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

function toHumanSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"]; 
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);
  const rounded = size >= 100 ? Math.round(size) : Math.round(size * 10) / 10;
  return `${rounded} ${sizes[i]}`;
}

function detectTypeByExt(name: string): string {
  const lower = name.toLowerCase();
  if (/(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.svg)$/.test(lower)) return "image";
  if (/(\.mp4|\.mov|\.avi|\.mkv|\.webm)$/.test(lower)) return "video";
  if (/(\.pdf)$/.test(lower)) return "pdf";
  if (/(\.zip|\.rar|\.7z|\.tar|\.gz)$/.test(lower)) return "archive";
  if (/(\.csv|\.xlsx|\.xls)$/.test(lower)) return "spreadsheet";
  if (/(\.txt|\.md|\.doc|\.docx)$/.test(lower)) return "document";
  return "other";
}

export async function GET() {
  try {
    ensureUploadsDirSync();
    const entries = await fsp.readdir(UPLOADS_DIR);
    const results = await Promise.all(
      entries.map(async (name) => {
        const absolute = path.join(UPLOADS_DIR, name);
        const stat = await fsp.stat(absolute);
        if (!stat.isFile()) return null;
        return {
          id: name,
          name,
          size: toHumanSize(stat.size),
          bytes: stat.size,
          type: detectTypeByExt(name),
          modified: stat.mtime.toISOString(),
          url: `/uploads/${encodeURIComponent(name)}`,
        };
      })
    );
    const files = results.filter(Boolean);
    return NextResponse.json({ files });
  } catch (err) {
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    ensureUploadsDirSync();
    const formData = await req.formData();
    const files = formData.getAll("files");
    const saved: any[] = [];

    for (const entry of files) {
      if (!(entry instanceof File)) continue;
      const originalName = entry.name || `file-${Date.now()}`;
      const safeBase = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const timestamp = Date.now();
      const uniqueName = `${timestamp}-${safeBase}`;
      const arrayBuffer = await entry.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const dest = path.join(UPLOADS_DIR, uniqueName);
      await fsp.writeFile(dest, buffer);
      const stat = await fsp.stat(dest);
      saved.push({
        id: uniqueName,
        name: uniqueName,
        size: toHumanSize(stat.size),
        bytes: stat.size,
        type: detectTypeByExt(uniqueName),
        modified: stat.mtime.toISOString(),
        url: `/uploads/${encodeURIComponent(uniqueName)}`,
      });
    }

    return NextResponse.json({ uploaded: saved });
  } catch (err) {
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    ensureUploadsDirSync();
    const { files } = await req.json();
    if (!Array.isArray(files)) {
      return NextResponse.json({ error: "'files' must be an array" }, { status: 400 });
    }
    const results: { name: string; deleted: boolean }[] = [];
    for (const name of files) {
      const safe = String(name).replace(/\/+|\\+/g, "");
      const p = path.join(UPLOADS_DIR, safe);
      try {
        await fsp.unlink(p);
        results.push({ name: safe, deleted: true });
      } catch {
        results.push({ name: safe, deleted: false });
      }
    }
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete files" }, { status: 500 });
  }
}


