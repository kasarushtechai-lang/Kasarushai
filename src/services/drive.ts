import { DriveAttachment } from '../types';
import { getAccessToken } from './auth';

const SCHOOL_FOLDER_NAME = 'School_Documents_Archive';

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  createdTime?: string;
}

/**
 * Find or create the dedicated school archive folder on Google Drive
 */
export async function getOrCreateSchoolFolder(): Promise<string | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    // Search for existing folder
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(SCHOOL_FOLDER_NAME)}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }

    // If not found, create the folder
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: SCHOOL_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
        description: 'แฟ้มจัดเก็บเอกสารทางการของโรงเรียน (School Document Management Hub)',
      }),
    });

    if (createRes.ok) {
      const folderData = await createRes.json();
      return folderData.id;
    }
  } catch (err) {
    console.warn('Could not ensure folder on Drive:', err);
  }

  return null;
}

/**
 * Upload a school document file directly to Google Drive via multipart upload
 */
export async function uploadFileToDrive(
  file: File,
  docCode: string,
  docTitle: string,
  onProgress?: (progress: number) => void
): Promise<DriveAttachment> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('จำเป็นต้องลงชื่อเข้าใช้ Google Drive ก่อนอัปโหลดไฟล์');
  }

  const folderId = await getOrCreateSchoolFolder();

  const metadata: Record<string, any> = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    description: `เอกสารโรงเรียน: [${docCode}] ${docTitle}`,
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const fileArrayBuffer = await file.arrayBuffer();

  // Create multipart request payload
  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
  const mediaHeaderPart = `${delimiter}Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`;

  const encoder = new TextEncoder();
  const metadataBytes = encoder.encode(metadataPart);
  const mediaHeaderBytes = encoder.encode(mediaHeaderPart);
  const closeDelimiterBytes = encoder.encode(closeDelimiter);

  const combinedBody = new Uint8Array(
    metadataBytes.byteLength + mediaHeaderBytes.byteLength + fileArrayBuffer.byteLength + closeDelimiterBytes.byteLength
  );

  let offset = 0;
  combinedBody.set(metadataBytes, offset);
  offset += metadataBytes.byteLength;
  combinedBody.set(mediaHeaderBytes, offset);
  offset += mediaHeaderBytes.byteLength;
  combinedBody.set(new Uint8Array(fileArrayBuffer), offset);
  offset += fileArrayBuffer.byteLength;
  combinedBody.set(closeDelimiterBytes, offset);

  if (onProgress) onProgress(40);

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink,webContentLink,iconLink,thumbnailLink,createdTime',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: combinedBody,
    }
  );

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    throw new Error(`Google Drive Upload Error: ${errorText || uploadRes.statusText}`);
  }

  if (onProgress) onProgress(100);

  const data = await uploadRes.json();

  return {
    fileId: data.id,
    name: data.name || file.name,
    mimeType: data.mimeType || file.type,
    size: Number(data.size || file.size),
    webViewLink: data.webViewLink,
    webContentLink: data.webContentLink,
    iconLink: data.iconLink,
    thumbnailLink: data.thumbnailLink,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * List files saved in Google Drive by this application
 */
export async function listAppDriveFiles(): Promise<DriveFileInfo[]> {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    const res = await fetch(
      'https://www.googleapis.com/drive/v3/files?pageSize=50&fields=files(id,name,mimeType,size,webViewLink,webContentLink,iconLink,thumbnailLink,createdTime)&orderBy=createdTime desc',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      console.error('Failed to list files from Drive:', res.statusText);
      return [];
    }

    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error('Error fetching files from Drive:', err);
    return [];
  }
}

/**
 * Delete a file from Google Drive (MUST be called ONLY after explicit user confirmation dialog)
 */
export async function deleteDriveFile(fileId: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('กรุณาลงชื่อเข้าใช้ Google Drive');
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.ok || res.status === 204 || res.status === 404;
}
