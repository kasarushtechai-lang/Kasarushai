import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  itemDetails?: {
    name: string;
    code?: string;
    extra?: string;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'ยืนยันการลบ',
  cancelLabel = 'ยกเลิก',
  isDestructive = true,
  isLoading = false,
  itemDetails,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="confirmation-modal-box"
        className="w-full max-w-md bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000] overflow-hidden rounded-none"
      >
        <div className="flex items-start justify-between p-5 border-b-2 border-black bg-black text-white">
          <div className="flex items-center gap-3">
            <div className={`p-2 border border-black ${isDestructive ? 'bg-rose-500 text-white' : 'bg-yellow-400 text-black'}`}>
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-white">{title}</h3>
              <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider">การยืนยันดำเนินการ (Required Confirmation)</p>
            </div>
          </div>
          <button
            id="close-confirmation-modal-btn"
            onClick={onCancel}
            disabled={isLoading}
            className="p-1 text-white hover:bg-yellow-400 hover:text-black border border-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <div className="p-6 space-y-4 bg-white">
          <p className="text-xs sm:text-sm font-bold text-black leading-relaxed">{message}</p>

          {itemDetails && (
            <div className="p-3.5 bg-yellow-50 border-2 border-black text-xs text-black space-y-1.5 shadow-[2px_2px_0px_0px_#000]">
              <div className="font-black text-black flex items-center gap-2">
                <span className="uppercase text-neutral-600">เอกสาร:</span>
                <span className="truncate">{itemDetails.name}</span>
              </div>
              {itemDetails.code && (
                <div className="text-neutral-700 font-mono font-bold">
                  เลขที่: {itemDetails.code}
                </div>
              )}
              {itemDetails.extra && (
                <div className="text-neutral-600 italic">
                  {itemDetails.extra}
                </div>
              )}
            </div>
          )}

          {isDestructive && (
            <p className="text-xs text-rose-600 font-black uppercase tracking-wider">
              * ข้อมูลและไฟล์ที่ถูกลบออกจาก Google Drive จะไม่สามารถกู้คืนได้ผ่านระบบนี้
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-neutral-100 border-t-2 border-black">
          <button
            id="cancel-confirmation-btn"
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-black uppercase tracking-wider text-black bg-white border-2 border-black hover:bg-neutral-200 shadow-[2px_2px_0px_0px_#000] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            id="confirm-action-btn"
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 text-xs font-black uppercase tracking-wider text-white border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer ${
              isDestructive 
                ? 'bg-rose-600 hover:bg-black' 
                : 'bg-black hover:bg-yellow-400 hover:text-black'
            } disabled:opacity-50`}
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
