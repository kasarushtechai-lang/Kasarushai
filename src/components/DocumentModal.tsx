import React, { useState, useEffect } from 'react';
import { 
  SchoolDocument, 
  SchoolDepartment, 
  DocumentCategory, 
  DocumentPriority, 
  DocumentStatus,
  DriveAttachment 
} from '../types';
import { 
  DEPARTMENTS, 
  CATEGORIES, 
  PRIORITIES, 
  STATUSES 
} from '../constants';
import { generateSuggestedCode } from '../services/storage';
import { uploadFileToDrive } from '../services/drive';
import { GoogleSignInButton } from './GoogleSignInButton';
import { 
  X, 
  UploadCloud, 
  HardDrive, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink,
  AlertCircle
} from 'lucide-react';

interface DocumentModalProps {
  isOpen: boolean;
  initialDoc?: SchoolDocument | null;
  isConnectedToDrive: boolean;
  onLoginGoogle: () => void;
  onSave: (docData: Omit<SchoolDocument, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  initialDoc,
  isConnectedToDrive,
  onLoginGoogle,
  onSave,
  onClose,
}) => {
  if (!isOpen) return null;

  const isEditing = !!initialDoc;

  // Form states
  const [code, setCode] = useState(initialDoc?.code || '');
  const [title, setTitle] = useState(initialDoc?.title || '');
  const [department, setDepartment] = useState<SchoolDepartment>(initialDoc?.department || 'academic');
  const [category, setCategory] = useState<DocumentCategory>(initialDoc?.category || 'lesson_plan');
  const [priority, setPriority] = useState<DocumentPriority>(initialDoc?.priority || 'normal');
  const [status, setStatus] = useState<DocumentStatus>(initialDoc?.status || 'approved');
  const [academicYear, setAcademicYear] = useState(initialDoc?.academicYear || '2568');
  const [semester, setSemester] = useState<'1' | '2' | 'both'>(initialDoc?.semester || '1');
  const [issuer, setIssuer] = useState(initialDoc?.issuer || '');
  const [signer, setSigner] = useState(initialDoc?.signer || 'นายสมชาย ประเสริฐวิทย์ (ผู้อำนวยการโรงเรียน)');
  const [docDate, setDocDate] = useState(initialDoc?.docDate || new Date().toISOString().split('T')[0]);
  const [registeredDate, setRegisteredDate] = useState(initialDoc?.registeredDate || new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState(initialDoc?.summary || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialDoc?.tags || []);
  
  // Drive attachment state
  const [driveAttachment, setDriveAttachment] = useState<DriveAttachment | undefined>(initialDoc?.driveAttachment);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Auto-generate reference code on category / year change if code is empty
  useEffect(() => {
    if (!isEditing && !code) {
      handleGenerateCode();
    }
  }, [category, academicYear]);

  const handleGenerateCode = () => {
    const cat = CATEGORIES.find(c => c.id === category);
    const prefix = cat?.codePrefix || 'วช.';
    const newCode = generateSuggestedCode(prefix, academicYear);
    setCode(newCode);
  };

  // Sync category when department changes
  const handleDepartmentChange = (dept: SchoolDepartment) => {
    setDepartment(dept);
    const validCats = CATEGORIES.filter(c => c.department === dept);
    if (validCats.length > 0) {
      setCategory(validCats[0].id);
    }
  };

  // Handle Tag addition
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const clean = tagInput.trim().replace(/^#/, '');
    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  // Upload file to Google Drive
  const handleUploadToDrive = async () => {
    if (!selectedFile) return;
    if (!isConnectedToDrive) {
      setUploadError('กรุณาลงชื่อเข้าใช้ Google Drive ก่อนอัปโหลดไฟล์');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setUploadError(null);

    try {
      const attachment = await uploadFileToDrive(
        selectedFile,
        code || 'DOC-REF',
        title || selectedFile.name,
        (p) => setUploadProgress(p)
      );

      setDriveAttachment(attachment);
      setSelectedFile(null);
      setUploadProgress(100);
    } catch (err: any) {
      console.error('Upload to Drive failed:', err);
      setUploadError(err.message || 'ไม่สามารถอัปโหลดไฟล์ไปยัง Google Drive ได้');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('กรุณากรอกชื่อเรื่องเอกสาร');
      return;
    }

    // If user selected a file but didn't click upload yet, try uploading it if connected
    let finalAttachment = driveAttachment;
    if (selectedFile && isConnectedToDrive && !driveAttachment) {
      setIsUploading(true);
      try {
        finalAttachment = await uploadFileToDrive(
          selectedFile,
          code || 'DOC-REF',
          title || selectedFile.name
        );
      } catch (err: any) {
        console.warn('Auto upload failed, continuing with doc registration:', err);
      } finally {
        setIsUploading(false);
      }
    }

    onSave({
      code: code || 'ศธ 04225/ว 01',
      title: title.trim(),
      department,
      category,
      priority,
      status,
      academicYear,
      semester,
      issuer: issuer.trim() || 'บุคลากรโรงเรียน',
      signer: signer.trim(),
      docDate,
      registeredDate,
      summary: summary.trim(),
      tags,
      driveAttachment: finalAttachment,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div 
        id="document-form-modal"
        className="w-full max-w-3xl bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000] overflow-hidden my-6 max-h-[92vh] flex flex-col rounded-none"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-black bg-black text-white shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
              {isEditing ? 'แก้ไขข้อมูลเอกสารโรงเรียน' : 'ลงทะเบียนเอกสารโรงเรียนใหม่'}
            </h2>
            <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider">
              บันทึกข้อมูลสารบรรณและแนบไฟล์จัดเก็บใน Google Drive
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white hover:bg-yellow-400 hover:text-black border-2 border-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 bg-neutral-50/50">
          {/* Section 1: Identification & Classification */}
          <div className="space-y-4 bg-white border-2 border-black p-4 shadow-[3px_3px_0px_0px_#000]">
            <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5 border-b-2 border-black pb-2">
              <span>1. ข้อมูลการลงรับและสังกัด</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              {/* Document Reference Code */}
              <div className="sm:col-span-6">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-black">
                    เลขที่เอกสาร / ทะเบียนคุม <span className="text-rose-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="text-[10px] font-black uppercase tracking-wider bg-yellow-300 text-black border border-black px-2 py-0.5 hover:bg-black hover:text-yellow-300 transition-colors flex items-center gap-1 shadow-[1px_1px_0px_0px_#000] cursor-pointer"
                    title="สร้างเลขที่เอกสารอัตโนมัติ"
                  >
                    <Sparkles className="w-3 h-3 stroke-[2.5]" />
                    <span>สร้างเลขอัตโนมัติ</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="เช่น ศธ 04225/ว 102 หรือ วช 05/2568"
                  className="w-full text-xs font-mono font-bold px-3 py-2 bg-white border-2 border-black rounded-none focus:bg-yellow-50 focus:outline-none"
                />
              </div>

              {/* Academic Year & Semester */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">ปีการศึกษา</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 bg-white border-2 border-black rounded-none focus:bg-yellow-50 focus:outline-none"
                >
                  <option value="2568">2568</option>
                  <option value="2567">2567</option>
                  <option value="2566">2566</option>
                  <option value="2565">2565</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">ภาคเรียน</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value as any)}
                  className="w-full text-xs font-bold px-3 py-2 bg-white border-2 border-black rounded-none focus:bg-yellow-50 focus:outline-none"
                >
                  <option value="1">ภาคเรียนที่ 1</option>
                  <option value="2">ภาคเรียนที่ 2</option>
                  <option value="both">ตลอดปีการศึกษา</option>
                </select>
              </div>
            </div>

            {/* Department & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                  ฝ่ายงาน / กลุ่มบริหารงาน <span className="text-rose-600">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => handleDepartmentChange(e.target.value as SchoolDepartment)}
                  className="w-full text-xs font-bold px-3 py-2 bg-white border-2 border-black rounded-none focus:bg-yellow-50 focus:outline-none"
                >
                  {Object.entries(DEPARTMENTS).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.labelTh} ({info.labelEn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                  หมวดหมู่เอกสาร <span className="text-rose-600">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                  className="w-full text-xs font-bold px-3 py-2 bg-white border-2 border-black rounded-none focus:bg-yellow-50 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.labelTh}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Document Content & Details */}
          <div className="space-y-4 bg-white border-2 border-black p-4 shadow-[3px_3px_0px_0px_#000]">
            <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5 border-b-2 border-black pb-2">
              <span>2. รายละเอียดเอกสาร</span>
            </h3>

            {/* Title */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                ชื่อเรื่องเอกสาร <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น แผนการจัดการเรียนรู้วิทยาศาสตร์ ม.3 หรือ คำสั่งแต่งตั้งคณะกรรมการจัดกิจกรรมวันไหว้ครู"
                className="w-full text-sm font-black px-3 py-2 bg-white border-2 border-black rounded-none focus:bg-yellow-50 focus:outline-none"
              />
            </div>

            {/* Summary */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                สรุปสาระสำคัญ / วัตถุประสงค์
              </label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="ระบุข้อความสรุป วัตถุประสงค์ หรือแนวปฏิบัติของเอกสารเพื่อความสะดวกในการสืบค้น..."
                className="w-full text-xs font-medium px-3 py-2 bg-white border-2 border-black rounded-none focus:bg-yellow-50 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Issuer, Signer & Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                  ผู้จัดทำ / ผู้เสนอเอกสาร <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  placeholder="เช่น ครูสมหมาย ใจดี หรือ งานพัสดุ"
                  className="w-full text-xs font-bold px-3 py-2 bg-white border-2 border-black rounded-none focus:bg-yellow-50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                  ผู้ลงนาม / ผู้อนุมัติ
                </label>
                <input
                  type="text"
                  value={signer}
                  onChange={(e) => setSigner(e.target.value)}
                  placeholder="เช่น ผู้อำนวยการโรงเรียน หรือ รองผู้อำนวยการฝ่ายวิชาการ"
                  className="w-full text-xs font-bold px-3 py-2 bg-white border-2 border-black rounded-none focus:bg-yellow-50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">วันที่ในเอกสาร</label>
                <input
                  type="date"
                  value={docDate}
                  onChange={(e) => setDocDate(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 bg-white border-2 border-black rounded-none focus:bg-yellow-50 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">วันที่ลงรับในระบบ</label>
                <input
                  type="date"
                  value={registeredDate}
                  onChange={(e) => setRegisteredDate(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 bg-white border-2 border-black rounded-none focus:bg-yellow-50 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Priority & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">ชั้นความเร็ว</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as DocumentPriority)}
                  className="w-full text-xs font-bold px-3 py-2 bg-white border-2 border-black rounded-none focus:bg-yellow-50 focus:outline-none"
                >
                  {Object.entries(PRIORITIES).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.labelTh} ({info.labelEn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">สถานะเอกสาร</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DocumentStatus)}
                  className="w-full text-xs font-bold px-3 py-2 bg-white border-2 border-black rounded-none focus:bg-yellow-50 focus:outline-none"
                >
                  {Object.entries(STATUSES).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.labelTh}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                คำค้นหา / ป้ายกำกับ (Tags)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="พิมพ์คำค้นหา เช่น ม.ต้น, งบกลาง แล้วกดเพิ่ม"
                  className="flex-1 text-xs font-bold px-3 py-2 bg-white border-2 border-black rounded-none focus:bg-yellow-50 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-black text-white text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer"
                >
                  เพิ่มป้าย
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {tags.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-1.5 text-xs font-black uppercase bg-yellow-300 text-black border-2 border-black px-2.5 py-0.5 shadow-[1px_1px_0px_0px_#000]"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        className="text-black hover:text-rose-600 font-bold ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Google Drive Attachment */}
          <div className="space-y-3 bg-white border-2 border-black p-4 shadow-[3px_3px_0px_0px_#000]">
            <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center justify-between border-b-2 border-black pb-2">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 stroke-[2.5]" />
                <span>3. จัดเก็บไฟล์ใน Google Drive</span>
              </span>
              {isConnectedToDrive ? (
                <span className="text-[11px] bg-black text-yellow-400 px-2 py-0.5 border border-black font-black uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 stroke-[3]" /> พร้อมอัปโหลดเข้า Drive
                </span>
              ) : (
                <span className="text-[11px] text-black bg-yellow-300 border border-black px-2 py-0.5 font-black uppercase">
                  ยังไม่ได้เชื่อมต่อ Drive
                </span>
              )}
            </h3>

            {/* Current Attached Drive File */}
            {driveAttachment && (
              <div className="p-3.5 bg-yellow-50 border-2 border-black flex items-center justify-between gap-3 shadow-[2px_2px_0px_0px_#000]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 bg-black text-yellow-400 border border-black shrink-0">
                    <FileText className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="truncate text-xs">
                    <p className="font-black text-black truncate">{driveAttachment.name}</p>
                    <p className="text-neutral-600 font-mono text-[11px] font-bold">
                      {driveAttachment.size ? `${(driveAttachment.size / 1024).toFixed(1)} KB` : 'Google Drive File'} • อัปโหลดเมื่อ {new Date(driveAttachment.uploadedAt).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {driveAttachment.webViewLink && (
                    <a
                      href={driveAttachment.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-white text-black border-2 border-black text-xs font-black uppercase tracking-wider flex items-center gap-1 hover:bg-black hover:text-white transition-colors shadow-[1px_1px_0px_0px_#000]"
                      title="เปิดดูใน Google Drive"
                    >
                      <span>เปิดดู</span>
                      <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setDriveAttachment(undefined)}
                    className="p-1.5 bg-rose-600 text-white border-2 border-black text-xs font-black uppercase tracking-wider transition-colors shadow-[1px_1px_0px_0px_#000] cursor-pointer"
                    title="ปลดไฟล์แนบ"
                  >
                    ปลดไฟล์
                  </button>
                </div>
              </div>
            )}

            {/* Upload New File Zone */}
            {!driveAttachment && (
              <div className="space-y-2">
                {isConnectedToDrive ? (
                  <div className="border-2 border-dashed border-black hover:bg-yellow-50/50 p-4 text-center transition-colors bg-white">
                    <input
                      type="file"
                      id="doc-file-upload-input"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label 
                      htmlFor="doc-file-upload-input"
                      className="cursor-pointer block"
                    >
                      <UploadCloud className="w-9 h-9 text-black mx-auto mb-1.5 stroke-[2]" />
                      <p className="text-xs font-black uppercase tracking-wider text-black">
                        {selectedFile ? selectedFile.name : 'คลิกเพื่อเลือกไฟล์เอกสาร (PDF, DOCX, XLSX, ภาพ)'}
                      </p>
                      <p className="text-[11px] font-medium text-neutral-500 mt-1">
                        {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'ไฟล์จะถูกส่งไปจัดเก็บยังแฟ้ม School_Documents_Archive บน Google Drive ของท่าน'}
                      </p>
                    </label>

                    {selectedFile && (
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={handleUploadToDrive}
                          className="px-4 py-2 bg-yellow-400 hover:bg-black hover:text-yellow-400 text-black text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          {isUploading ? (
                            <span>กำลังอัปโหลด... {uploadProgress}%</span>
                          ) : (
                            <>
                              <HardDrive className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>อัปโหลดเข้า Google Drive ทันที</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          disabled={isUploading}
                          className="px-3 py-2 bg-white text-black hover:bg-neutral-100 border-2 border-black text-xs font-black uppercase cursor-pointer"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    )}

                    {uploadError && (
                      <p className="text-xs font-bold text-rose-600 mt-2 flex items-center justify-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 stroke-[2.5] inline" /> {uploadError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border-2 border-black text-center space-y-3">
                    <p className="text-xs font-bold text-black">
                      เชื่อมต่อ Google Drive เพื่ออัปโหลดเอกสารจริงและจัดเก็บอย่างเป็นทางการ
                    </p>
                    <GoogleSignInButton
                      onClick={onLoginGoogle}
                      text="เข้าสู่ระบบด้วย Google เพื่อแนบไฟล์"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black bg-white hover:bg-neutral-100 border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider text-black bg-yellow-400 hover:bg-black hover:text-white border-[3px] border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50 cursor-pointer"
            >
              {isEditing ? 'บันทึกการแก้ไข' : 'บันทึกลงทะเบียนเอกสาร'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
