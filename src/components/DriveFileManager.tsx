import React, { useState, useEffect } from 'react';
import { 
  listAppDriveFiles, 
  DriveFileInfo, 
  uploadFileToDrive 
} from '../services/drive';
import { GoogleSignInButton } from './GoogleSignInButton';
import { 
  X, 
  HardDrive, 
  RefreshCw, 
  UploadCloud, 
  ExternalLink, 
  Trash2, 
  FileText, 
  FolderCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface DriveFileManagerProps {
  isOpen: boolean;
  isConnectedToDrive: boolean;
  onLoginGoogle: () => void;
  onClose: () => void;
  onRequestDeleteFile: (file: DriveFileInfo) => void;
}

export const DriveFileManager: React.FC<DriveFileManagerProps> = ({
  isOpen,
  isConnectedToDrive,
  onLoginGoogle,
  onClose,
  onRequestDeleteFile,
}) => {
  if (!isOpen) return null;

  const [files, setFiles] = useState<DriveFileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    if (!isConnectedToDrive) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await listAppDriveFiles();
      setFiles(result);
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถดึงรายการไฟล์จาก Google Drive ได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isConnectedToDrive) {
      fetchFiles();
    }
  }, [isOpen, isConnectedToDrive]);

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    setUploading(true);
    setError(null);
    setUploadSuccess(null);

    try {
      const res = await uploadFileToDrive(file, 'UPLOAD', file.name);
      setUploadSuccess(`อัปโหลดไฟล์ "${file.name}" เรียบร้อยแล้ว`);
      await fetchFiles();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div 
        id="drive-manager-modal"
        className="w-full max-w-3xl bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000] overflow-hidden flex flex-col my-auto max-h-[90vh] rounded-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-black bg-black text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400 text-black border border-black shrink-0">
              <HardDrive className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-white">
                แฟ้มเอกสาร Google Drive โรงเรียน
              </h3>
              <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider">
                School_Documents_Archive • จัดเก็บบน Google Drive ของสถานศึกษา
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isConnectedToDrive && (
              <button
                onClick={fetchFiles}
                disabled={isLoading}
                className="p-2 text-white hover:bg-yellow-400 hover:text-black border border-white transition-colors cursor-pointer"
                title="รีเฟรชรายการไฟล์"
              >
                <RefreshCw className={`w-4 h-4 stroke-[2.5] ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-yellow-400 hover:text-black border border-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 bg-neutral-50/40">
          {!isConnectedToDrive ? (
            <div className="p-8 text-center bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] space-y-4">
              <div className="w-14 h-14 bg-black text-yellow-400 border-2 border-black flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_#000]">
                <HardDrive className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="font-black text-black text-lg uppercase tracking-tight">
                  กรุณาเชื่อมต่อ Google Drive
                </h4>
                <p className="text-xs text-neutral-600 mt-1 font-medium leading-relaxed">
                  เข้าสู่ระบบด้วยบัญชี Google เพื่อเข้าถึงแฟ้มจัดเก็บเอกสารและอัปโหลดไฟล์จริงลงบนคลาวด์ไดรฟ์ของโรงเรียน
                </p>
              </div>
              <div className="pt-2">
                <GoogleSignInButton
                  onClick={onLoginGoogle}
                  text="เข้าสู่ระบบ Google เพื่อเปิดใช้งาน"
                />
              </div>
            </div>
          ) : (
            <>
              {/* Quick Upload Box */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-yellow-50 border-2 border-black shadow-[3px_3px_0px_0px_#000] gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black text-yellow-400 border border-black shrink-0">
                    <FolderCheck className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-black block">
                      อัปโหลดไฟล์ด่วนเข้าไดรฟ์
                    </span>
                    <span className="text-[11px] font-bold text-neutral-600">
                      ไฟล์จะถูกเก็บในแฟ้ม School_Documents_Archive โดยอัตโนมัติ
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <input
                    type="file"
                    id="quick-drive-file-input"
                    onChange={handleDirectUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <label
                    htmlFor="quick-drive-file-input"
                    className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-black hover:text-yellow-400 text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] transition-colors"
                  >
                    <UploadCloud className="w-4 h-4 stroke-[2.5]" />
                    <span>{uploading ? 'กำลังอัปโหลด...' : 'เลือกไฟล์อัปโหลด'}</span>
                  </label>
                </div>
              </div>

              {uploadSuccess && (
                <div className="p-3.5 bg-yellow-300 text-black border-2 border-black text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_0px_#000]">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5] shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              {error && (
                <div className="p-3.5 bg-rose-500 text-white border-2 border-black text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_0px_#000]">
                  <AlertCircle className="w-4 h-4 stroke-[2.5] shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Files List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b-2 border-black pb-2">
                  <h4 className="text-xs font-black uppercase text-black tracking-wider">
                    รายการไฟล์บน Google Drive ({files.length})
                  </h4>
                  {isLoading && <span className="text-xs font-bold text-neutral-500">กำลังโหลดข้อมูล...</span>}
                </div>

                {files.length === 0 && !isLoading ? (
                  <div className="p-8 text-center bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                    <FileText className="w-8 h-8 text-black mx-auto mb-2 stroke-[2]" />
                    <p className="text-xs text-black font-black uppercase">ยังไม่มีไฟล์ใน Google Drive ของโรงเรียน</p>
                    <p className="text-[11px] text-neutral-600 mt-1 font-medium">
                      ท่านสามารถลงทะเบียนเอกสารพร้อมแนบไฟล์ หรืออัปโหลดไฟล์ผ่านปุ่มด้านบน
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-black divide-y-2 divide-black bg-white shadow-[3px_3px_0px_0px_#000]">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="p-3.5 flex items-center justify-between hover:bg-yellow-50 transition-colors gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-black text-yellow-400 border border-black shrink-0">
                            <FileText className="w-4 h-4 stroke-[2.5]" />
                          </div>
                          <div className="truncate">
                            <h5 className="text-xs font-black text-black truncate">
                              {file.name}
                            </h5>
                            <p className="text-[10px] text-neutral-600 font-mono font-bold mt-0.5">
                              {file.size ? `${(parseInt(file.size, 10) / 1024).toFixed(1)} KB` : 'Google Document'} • 
                              {file.createdTime ? ` สร้างเมื่อ ${new Date(file.createdTime).toLocaleDateString('th-TH')}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-white hover:bg-black hover:text-white text-black border-2 border-black text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-[1px_1px_0px_0px_#000] transition-colors"
                              title="เปิดดูใน Google Drive"
                            >
                              <span>เปิดดู</span>
                              <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                            </a>
                          )}
                          <button
                            onClick={() => onRequestDeleteFile(file)}
                            className="p-1.5 text-white bg-rose-600 hover:bg-black border-2 border-black text-xs font-bold transition-colors shadow-[1px_1px_0px_0px_#000] cursor-pointer"
                            title="ลบไฟล์ออกจาก Google Drive"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-100 border-t-2 border-black flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-black text-white hover:bg-yellow-400 hover:text-black border-2 border-black font-black uppercase tracking-wider text-xs shadow-[2px_2px_0px_0px_#000] transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
