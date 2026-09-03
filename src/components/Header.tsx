import React from 'react';
import { User } from 'firebase/auth';
import { 
  School, 
  FilePlus, 
  HardDrive, 
  Download, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { GoogleSignInButton } from './GoogleSignInButton';

interface HeaderProps {
  user: User | null;
  isConnectedToDrive: boolean;
  isLoggingIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onOpenNewDocModal: () => void;
  onOpenDriveManager: () => void;
  onExportData: () => void;
  totalDocsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isConnectedToDrive,
  isLoggingIn,
  onLogin,
  onLogout,
  onOpenNewDocModal,
  onOpenDriveManager,
  onExportData,
  totalDocsCount,
}) => {
  return (
    <header className="bg-white border-b-[3px] border-black sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & School Branding */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black text-yellow-400 border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
              <School className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-black text-black tracking-tighter uppercase leading-none truncate">
                  School Document Hub
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-black uppercase tracking-wider bg-yellow-400 text-black border-2 border-black">
                  ARCHIVE V1
                </span>
              </div>
              <p className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider truncate mt-0.5">
                ระบบสารบรรณและคลังเอกสารโรงเรียน เชื่อมโยง Google Drive
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Export CSV Button */}
            <button
              id="export-documents-btn"
              type="button"
              onClick={onExportData}
              title="ส่งออกทะเบียนเอกสารเป็นไฟล์ CSV"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase tracking-wider text-black bg-white hover:bg-neutral-100 border-2 border-black transition-colors"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>ส่งออก CSV</span>
            </button>

            {/* Google Drive Status & Manager Button */}
            <button
              id="open-drive-manager-btn"
              type="button"
              onClick={onOpenDriveManager}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase tracking-wider text-black bg-white hover:bg-neutral-100 border-2 border-black transition-colors"
              title="ดูรายการไฟล์ที่จัดเก็บบน Google Drive"
            >
              <HardDrive className={`w-3.5 h-3.5 stroke-[2.5] ${isConnectedToDrive ? 'text-blue-600' : 'text-neutral-400'}`} />
              <span className="hidden sm:inline">ไดรฟ์โรงเรียน</span>
              {isConnectedToDrive && (
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              )}
            </button>

            {/* Google Sign-in / User Profile */}
            {user && isConnectedToDrive ? (
              <div className="flex items-center gap-2 pl-1 border-l-2 border-black">
                <div 
                  className="flex items-center gap-2 py-1 px-2.5 bg-neutral-100 border-2 border-black max-w-[180px] sm:max-w-[220px]"
                  title={`ลงชื่อเข้าใช้: ${user.email}`}
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-none border border-black shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-black text-white text-xs flex items-center justify-center font-black shrink-0">
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="truncate text-left hidden sm:block">
                    <p className="text-xs font-black text-black uppercase tracking-tight truncate leading-tight">
                      {user.displayName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5 stroke-[3] inline" /> เชื่อมต่อแล้ว
                    </p>
                  </div>
                </div>
                <button
                  id="signout-btn"
                  onClick={onLogout}
                  title="ออกจากระบบ Google"
                  className="p-2 text-black hover:bg-black hover:text-white border-2 border-black transition-colors"
                >
                  <LogOut className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <GoogleSignInButton
                  onClick={onLogin}
                  isLoading={isLoggingIn}
                  text="เชื่อมต่อ Drive"
                  className="!h-9 !text-xs !px-2.5 !border-2 !border-black !rounded-none !font-bold"
                />
              </div>
            )}

            {/* Primary Action: Add Document */}
            <button
              id="new-document-main-btn"
              type="button"
              onClick={onOpenNewDocModal}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-black text-black bg-yellow-400 hover:bg-black hover:text-white uppercase tracking-wider border-[3px] border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all shrink-0"
            >
              <FilePlus className="w-4 h-4 stroke-[2.5]" />
              <span>ลงทะเบียนเอกสาร</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
