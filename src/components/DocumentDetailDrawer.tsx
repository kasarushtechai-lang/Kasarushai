import React from 'react';
import { 
  SchoolDocument 
} from '../types';
import { 
  DEPARTMENTS, 
  CATEGORIES, 
  PRIORITIES, 
  STATUSES 
} from '../constants';
import { 
  X, 
  FileText, 
  HardDrive, 
  ExternalLink, 
  Printer, 
  Edit3, 
  Trash2, 
  Calendar, 
  User, 
  CheckCircle2, 
  Tag,
  Building2,
  Clock,
  Download
} from 'lucide-react';

interface DocumentDetailDrawerProps {
  document: SchoolDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (doc: SchoolDocument) => void;
  onDelete: (doc: SchoolDocument) => void;
}

export const DocumentDetailDrawer: React.FC<DocumentDetailDrawerProps> = ({
  document,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !document) return null;

  const dept = DEPARTMENTS[document.department];
  const cat = CATEGORIES.find(c => c.id === document.category);
  const prio = PRIORITIES[document.priority];
  const stat = STATUSES[document.status];

  const formatThaiDateFull = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const thaiYear = year > 2400 ? year : year + 543;
        const months = [
          'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
          'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];
        const month = months[parseInt(parts[1], 10) - 1] || parts[1];
        return `${parseInt(parts[2], 10)} ${month} พ.ศ. ${thaiYear}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div 
        id="document-detail-modal"
        className="w-full max-w-2xl bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000] overflow-hidden flex flex-col my-auto max-h-[90vh] rounded-none"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-black bg-black text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400 text-black border border-black shrink-0">
              <FileText className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-mono font-black text-black bg-yellow-400 px-2 py-0.5 border border-black">
                {document.code}
              </span>
              <h3 className="text-sm font-black uppercase tracking-wider text-white mt-1">
                ทะเบียนเอกสารโรงเรียน
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-white hover:bg-yellow-400 hover:text-black border border-white transition-colors cursor-pointer"
              title="พิมพ์ใบสรุปเอกสาร"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={() => onEdit(document)}
              className="p-2 text-white hover:bg-yellow-400 hover:text-black border border-white transition-colors cursor-pointer"
              title="แก้ไข"
            >
              <Edit3 className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={() => onDelete(document)}
              className="p-2 text-white hover:bg-rose-600 border border-white transition-colors cursor-pointer"
              title="ลบ"
            >
              <Trash2 className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-yellow-400 hover:text-black border border-white transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-black text-xs sm:text-sm bg-neutral-50/40">
          {/* Main Title & Status Bar */}
          <div className="space-y-3 border-b-2 border-black pb-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 text-xs font-black uppercase ${prio?.badge}`}>
                {prio?.labelTh}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-black uppercase ${stat?.badge}`}>
                <span className={`w-2 h-2 rounded-full ${stat?.dot}`}></span>
                {stat?.labelTh}
              </span>
              <span className="text-xs text-neutral-600 font-black uppercase tracking-wider font-mono">
                ปีการศึกษา {document.academicYear} {document.semester !== 'both' ? `(เทอม ${document.semester})` : '(ตลอดปี)'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-black leading-tight tracking-tight">
              {document.title}
            </h2>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`px-3 py-1 font-black uppercase ${dept?.badgeBg}`}>
                {dept?.labelTh}
              </span>
              <span className="px-3 py-1 bg-neutral-100 text-black font-black uppercase border-2 border-black">
                {cat?.labelTh}
              </span>
            </div>
          </div>

          {/* Official Document Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-yellow-50/60 p-4 border-2 border-black text-xs font-bold shadow-[3px_3px_0px_0px_#000]">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-black shrink-0 mt-0.5 stroke-[2.5]" />
              <div>
                <span className="text-neutral-500 block font-black uppercase tracking-wider text-[10px]">วันที่ในเอกสาร:</span>
                <span className="font-black text-black text-sm">{formatThaiDateFull(document.docDate)}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-black shrink-0 mt-0.5 stroke-[2.5]" />
              <div>
                <span className="text-neutral-500 block font-black uppercase tracking-wider text-[10px]">วันที่ลงทะเบียนในระบบ:</span>
                <span className="font-black text-black text-sm">{formatThaiDateFull(document.registeredDate)}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <User className="w-4 h-4 text-black shrink-0 mt-0.5 stroke-[2.5]" />
              <div>
                <span className="text-neutral-500 block font-black uppercase tracking-wider text-[10px]">ผู้จัดทำ / เสนอเรื่อง:</span>
                <span className="font-black text-black text-sm">{document.issuer}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5 stroke-[2.5]" />
              <div>
                <span className="text-neutral-500 block font-black uppercase tracking-wider text-[10px]">ผู้ลงนาม / ผู้อนุมัติ:</span>
                <span className="font-black text-black text-sm">{document.signer || '-'}</span>
              </div>
            </div>
          </div>

          {/* Document Summary / Body */}
          <div className="space-y-1.5">
            <h4 className="font-black text-black text-xs uppercase tracking-wider">
              สรุปสาระสำคัญของเอกสาร
            </h4>
            <div className="p-4 bg-white border-2 border-black leading-relaxed whitespace-pre-wrap text-black text-sm font-medium shadow-[3px_3px_0px_0px_#000]">
              {document.summary || 'ไม่มีบันทึกสรุปสาระสำคัญ'}
            </div>
          </div>

          {/* Tags */}
          {document.tags && document.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-black text-black text-xs uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>คำค้นหาที่เกี่ยวข้อง</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {document.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-yellow-300 text-black border-2 border-black text-xs font-black uppercase shadow-[1px_1px_0px_0px_#000]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Google Drive Attachment Section */}
          <div className="space-y-2.5 pt-3 border-t-2 border-black">
            <h4 className="font-black text-black text-xs uppercase tracking-wider flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 stroke-[2.5]" />
              <span>ไฟล์เอกสารใน Google Drive</span>
            </h4>

            {document.driveAttachment ? (
              <div className="p-4 bg-yellow-50 border-2 border-black flex items-center justify-between gap-4 shadow-[3px_3px_0px_0px_#000]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-3 bg-black text-yellow-400 border border-black shrink-0">
                    <FileText className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div className="truncate">
                    <p className="font-black text-black text-sm truncate">
                      {document.driveAttachment.name}
                    </p>
                    <p className="text-xs text-neutral-600 font-mono font-bold mt-0.5">
                      {document.driveAttachment.size ? `${(document.driveAttachment.size / 1024).toFixed(1)} KB` : 'Google Drive Document'} • จัดเก็บบนคลาวด์โรงเรียน
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {document.driveAttachment.webViewLink && (
                    <a
                      href={document.driveAttachment.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-yellow-400 hover:bg-black hover:text-yellow-400 text-black border-2 border-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000] transition-colors"
                    >
                      <span>เปิดใน Drive</span>
                      <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-neutral-100 border-2 border-black text-center text-xs font-bold text-neutral-600">
                เอกสารนี้ยังไม่ได้แนบไฟล์บน Google Drive
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-100 border-t-2 border-black flex items-center justify-between text-xs font-black uppercase tracking-wider text-black shrink-0">
          <span>รหัสระบบ: {document.id}</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-black text-white hover:bg-yellow-400 hover:text-black border-2 border-black transition-colors shadow-[2px_2px_0px_0px_#000] cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
