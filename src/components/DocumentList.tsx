import React, { useState } from 'react';
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
  FileText, 
  ExternalLink, 
  Eye, 
  Edit3, 
  Trash2, 
  HardDrive, 
  Calendar, 
  User as UserIcon, 
  LayoutList, 
  LayoutGrid, 
  ArrowUpDown,
  Tag,
  AlertCircle
} from 'lucide-react';

interface DocumentListProps {
  documents: SchoolDocument[];
  onViewDoc: (doc: SchoolDocument) => void;
  onEditDoc: (doc: SchoolDocument) => void;
  onDeleteDoc: (doc: SchoolDocument) => void;
  onOpenNewDoc: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onViewDoc,
  onEditDoc,
  onDeleteDoc,
  onOpenNewDoc,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortField, setSortField] = useState<'date' | 'code' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Helper to format Thai date nicely
  const formatThaiDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const thaiYear = year > 2400 ? year : year + 543;
        const months = [
          'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
          'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
        ];
        const month = months[parseInt(parts[1], 10) - 1] || parts[1];
        return `${parseInt(parts[2], 10)} ${month} ${thaiYear}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const sortedDocuments = [...documents].sort((a, b) => {
    let comp = 0;
    if (sortField === 'date') {
      comp = (a.docDate || '').localeCompare(b.docDate || '');
    } else if (sortField === 'code') {
      comp = a.code.localeCompare(b.code);
    } else if (sortField === 'title') {
      comp = a.title.localeCompare(b.title);
    }
    return sortOrder === 'desc' ? -comp : comp;
  });

  const toggleSort = (field: 'date' | 'code' | 'title') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  if (documents.length === 0) {
    return (
      <div className="bg-white border-[3px] border-black p-12 text-center shadow-[4px_4px_0px_0px_#000]">
        <div className="w-16 h-16 mx-auto bg-black text-yellow-400 border-2 border-black flex items-center justify-center mb-4 shadow-[3px_3px_0px_0px_#000]">
          <FileText className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h3 className="text-lg font-black text-black uppercase tracking-tight">ไม่พบเอกสารตามเงื่อนไขที่เลือก</h3>
        <p className="text-sm font-medium text-neutral-600 max-w-md mx-auto mt-1 mb-6">
          ลองปรับคำค้นหาหรือเปลี่ยนตัวกรองฝ่ายงาน หรือเพิ่มเอกสารใหม่เข้าสู่ระบบ
        </p>
        <button
          onClick={onOpenNewDoc}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-black hover:text-white text-black text-sm font-black uppercase tracking-wider border-[3px] border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
        >
          <span>ลงทะเบียนเอกสารใหม่</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* List Header Bar: Count and View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-black">
          รายการเอกสาร: <span className="text-base font-black text-blue-600 font-mono px-2 py-0.5 bg-neutral-100 border border-black ml-1">{documents.length}</span> ฉบับ
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-black bg-white border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_#000]">
            <ArrowUpDown className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline text-neutral-500">เรียงตาม:</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="bg-transparent font-black focus:outline-none cursor-pointer"
            >
              <option value="date">วันที่เอกสาร</option>
              <option value="code">เลขที่เอกสาร</option>
              <option value="title">ชื่อเรื่อง</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="text-black hover:bg-black hover:text-white font-mono px-1.5 border border-black"
              title={sortOrder === 'asc' ? 'เรียงจากน้อยไปมาก' : 'เรียงจากมากไปน้อย'}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {/* Table / Card view toggle */}
          <div className="flex items-center bg-white border-2 border-black p-0.5 shadow-[2px_2px_0px_0px_#000]">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-black text-yellow-400 font-black'
                  : 'text-black hover:bg-neutral-100'
              }`}
              title="มุมมองตารางสารบรรณ"
            >
              <LayoutList className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-black text-yellow-400 font-black'
                  : 'text-black hover:bg-neutral-100'
              }`}
              title="มุมมองการ์ด"
            >
              <LayoutGrid className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-black border-collapse">
              <thead>
                <tr className="bg-black text-white border-b-2 border-black font-black uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-3.5 w-32 cursor-pointer select-none" onClick={() => toggleSort('code')}>
                    <div className="flex items-center gap-1">
                      <span>เลขที่เอกสาร</span>
                      {sortField === 'code' && <span className="font-mono text-yellow-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </div>
                  </th>
                  <th className="py-3.5 px-3 w-28 cursor-pointer select-none" onClick={() => toggleSort('date')}>
                    <div className="flex items-center gap-1">
                      <span>วันที่ลงรับ</span>
                      {sortField === 'date' && <span className="font-mono text-yellow-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </div>
                  </th>
                  <th className="py-3.5 px-3.5 min-w-[280px]">ชื่อเรื่อง / สาระสำคัญ</th>
                  <th className="py-3.5 px-3 w-36">ฝ่ายงาน / หมวดหมู่</th>
                  <th className="py-3.5 px-3 w-24 text-center">ความเร็ว</th>
                  <th className="py-3.5 px-3 w-28 text-center">สถานะ</th>
                  <th className="py-3.5 px-3 w-28 text-center">Google Drive</th>
                  <th className="py-3.5 px-3.5 w-24 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-neutral-200">
                {sortedDocuments.map((doc) => {
                  const dept = DEPARTMENTS[doc.department];
                  const cat = CATEGORIES.find(c => c.id === doc.category);
                  const prio = PRIORITIES[doc.priority];
                  const stat = STATUSES[doc.status];

                  return (
                    <tr 
                      key={doc.id}
                      className="hover:bg-yellow-50 transition-colors group"
                    >
                      {/* Code */}
                      <td className="py-3.5 px-3.5 font-mono font-bold text-black whitespace-nowrap align-top">
                        <span className="bg-black text-white px-2 py-0.5 text-xs font-black border border-black">
                          {doc.code}
                        </span>
                        <div className="text-[10px] font-black uppercase tracking-wider text-neutral-500 mt-1">
                          ปี {doc.academicYear} {doc.semester !== 'both' ? `(เทอม ${doc.semester})` : ''}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-black align-top font-bold">
                        <div className="font-black text-black">{formatThaiDate(doc.docDate)}</div>
                        <div className="text-[10px] font-medium text-neutral-500">รับ: {formatThaiDate(doc.registeredDate)}</div>
                      </td>

                      {/* Title & Summary */}
                      <td className="py-3.5 px-3.5 align-top">
                        <button
                          onClick={() => onViewDoc(doc)}
                          className="text-left font-black text-black hover:text-blue-600 hover:underline decoration-2 underline-offset-2 transition-colors line-clamp-2 leading-snug cursor-pointer text-sm"
                        >
                          {doc.title}
                        </button>
                        {doc.summary && (
                          <p className="text-[11px] font-medium text-neutral-700 line-clamp-1 mt-1 leading-relaxed">
                            {doc.summary}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-[10px] font-bold text-neutral-700 flex items-center gap-1 bg-neutral-100 px-1.5 py-0.5 border border-black">
                            <UserIcon className="w-2.5 h-2.5 stroke-[2.5]" />
                            {doc.issuer}
                          </span>
                          {doc.tags && doc.tags.length > 0 && doc.tags.slice(0, 3).map((t, idx) => (
                            <span key={idx} className="inline-flex items-center text-[10px] font-black uppercase text-black bg-yellow-300 px-1.5 py-0.5 border border-black">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Department & Category */}
                      <td className="py-3.5 px-3 whitespace-nowrap align-top">
                        <span className={`inline-block px-2 py-0.5 text-[11px] font-black uppercase ${dept?.badgeBg || 'bg-neutral-100'}`}>
                          {dept?.labelTh?.replace('กลุ่มบริหาร', '').replace('กลุ่มแผนงานและ', '') || doc.department}
                        </span>
                        <div className="text-[11px] font-bold text-neutral-700 mt-1 truncate max-w-[140px]" title={cat?.labelTh}>
                          {cat?.labelTh || doc.category}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-center align-top">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-black ${prio?.badge || 'bg-white'}`}>
                          {prio?.labelTh || doc.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-center align-top">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-black ${stat?.badge || 'bg-white'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${stat?.dot || 'bg-black'}`}></span>
                          <span>{stat?.labelTh || doc.status}</span>
                        </span>
                      </td>

                      {/* Google Drive Link */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-center align-top">
                        {doc.driveAttachment ? (
                          <a
                            href={doc.driveAttachment.webViewLink || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-300 text-black hover:bg-black hover:text-yellow-300 border-2 border-black text-[11px] font-black uppercase tracking-wider transition-colors shadow-[1px_1px_0px_0px_#000]"
                            title={`เปิดไฟล์ใน Google Drive (${doc.driveAttachment.name})`}
                          >
                            <HardDrive className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                            <span className="truncate max-w-[70px]">ไฟล์ Drive</span>
                            <ExternalLink className="w-3 h-3 stroke-[2.5]" />
                          </a>
                        ) : (
                          <span className="text-xs text-neutral-400 font-bold">
                            -
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap text-right align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewDoc(doc)}
                            className="p-1.5 text-black hover:bg-black hover:text-white border border-black transition-colors"
                            title="ดูรายละเอียดฉบับเต็ม"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                          <button
                            onClick={() => onEditDoc(doc)}
                            className="p-1.5 text-black hover:bg-yellow-400 border border-black transition-colors"
                            title="แก้ไขข้อมูลเอกสาร"
                          >
                            <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                          <button
                            onClick={() => onDeleteDoc(doc)}
                            className="p-1.5 text-black hover:bg-rose-600 hover:text-white border border-black transition-colors"
                            title="ลบเอกสาร"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CARDS VIEW */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedDocuments.map((doc) => {
            const dept = DEPARTMENTS[doc.department];
            const cat = CATEGORIES.find(c => c.id === doc.category);
            const prio = PRIORITIES[doc.priority];
            const stat = STATUSES[doc.status];

            return (
              <div
                key={doc.id}
                className="bg-white border-[3px] border-black p-5 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Code & Priority */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-black px-2.5 py-1 bg-black text-white border-2 border-black">
                      {doc.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 text-[10px] font-black uppercase ${prio?.badge}`}>
                        {prio?.labelTh}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 
                    onClick={() => onViewDoc(doc)}
                    className="text-base font-black text-black hover:text-blue-600 hover:underline decoration-2 underline-offset-2 cursor-pointer line-clamp-2 leading-snug mb-2"
                  >
                    {doc.title}
                  </h4>

                  {/* Summary */}
                  {doc.summary && (
                    <p className="text-xs font-medium text-neutral-700 line-clamp-2 leading-relaxed mb-3">
                      {doc.summary}
                    </p>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 ${dept?.badgeBg}`}>
                      {dept?.labelTh}
                    </span>
                    <span className="text-[10px] font-bold text-black bg-neutral-100 px-2 py-0.5 border-2 border-black">
                      {cat?.labelTh}
                    </span>
                  </div>

                  {/* Meta info: Issuer & Date */}
                  <div className="text-[11px] text-black space-y-1.5 mb-4 pt-2.5 border-t-2 border-neutral-200">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 font-bold uppercase tracking-wider">ผู้จัดทำ:</span>
                      <span className="font-bold text-black truncate max-w-[180px]">{doc.issuer}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 font-bold uppercase tracking-wider">วันที่เอกสาร:</span>
                      <span className="font-mono font-bold text-black">{formatThaiDate(doc.docDate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 font-bold uppercase tracking-wider">สถานะ:</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black ${stat?.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${stat?.dot}`}></span>
                        {stat?.labelTh}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="flex items-center justify-between pt-3 border-t-2 border-black mt-2">
                  <div>
                    {doc.driveAttachment ? (
                      <a
                        href={doc.driveAttachment.webViewLink || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-black bg-yellow-300 px-3 py-1.5 border-2 border-black hover:bg-black hover:text-yellow-300 transition-colors shadow-[2px_2px_0px_0px_#000]"
                      >
                        <HardDrive className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>ไดรฟ์</span>
                        <ExternalLink className="w-3 h-3 stroke-[2.5]" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-neutral-400 font-bold italic">ไม่มีไฟล์แนบ</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onViewDoc(doc)}
                      className="p-2 text-black hover:bg-black hover:text-white border-2 border-black transition-colors cursor-pointer shadow-[1px_1px_0px_0px_#000]"
                      title="ดูรายละเอียด"
                    >
                      <Eye className="w-4 h-4 stroke-[2.5]" />
                    </button>
                    <button
                      onClick={() => onEditDoc(doc)}
                      className="p-2 text-black hover:bg-yellow-400 border-2 border-black transition-colors cursor-pointer shadow-[1px_1px_0px_0px_#000]"
                      title="แก้ไข"
                    >
                      <Edit3 className="w-4 h-4 stroke-[2.5]" />
                    </button>
                    <button
                      onClick={() => onDeleteDoc(doc)}
                      className="p-2 text-black hover:bg-rose-600 hover:text-white border-2 border-black transition-colors cursor-pointer shadow-[1px_1px_0px_0px_#000]"
                      title="ลบเอกสาร"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
