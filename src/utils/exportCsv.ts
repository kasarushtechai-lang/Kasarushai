import { SchoolDocument } from '../types';
import { DEPARTMENTS, CATEGORIES, PRIORITIES, STATUSES } from '../constants';

export function exportDocumentsToCsv(documents: SchoolDocument[], filename = 'school_documents_registry.csv') {
  // UTF-8 BOM so Excel opens Thai text properly
  const BOM = '\uFEFF';

  const headers = [
    'เลขที่เอกสาร',
    'ปีการศึกษา',
    'ภาคเรียน',
    'วันที่ในเอกสาร',
    'วันที่ลงรับ',
    'ชื่อเรื่อง',
    'ฝ่ายงาน',
    'หมวดหมู่',
    'ชั้นความเร็ว',
    'สถานะ',
    'ผู้จัดทำ',
    'ผู้ลงนาม',
    'สรุปสาระสำคัญ',
    'คำค้นหา (Tags)',
    'ไฟล์ Google Drive',
    'ลิงก์เปิดไฟล์',
  ];

  const rows = documents.map(doc => {
    const dept = DEPARTMENTS[doc.department]?.labelTh || doc.department;
    const cat = CATEGORIES.find(c => c.id === doc.category)?.labelTh || doc.category;
    const prio = PRIORITIES[doc.priority]?.labelTh || doc.priority;
    const stat = STATUSES[doc.status]?.labelTh || doc.status;

    return [
      `"${doc.code.replace(/"/g, '""')}"`,
      `"${doc.academicYear}"`,
      `"${doc.semester === 'both' ? 'ตลอดปี' : `ภาคเรียนที่ ${doc.semester}`}"`,
      `"${doc.docDate}"`,
      `"${doc.registeredDate}"`,
      `"${doc.title.replace(/"/g, '""')}"`,
      `"${dept.replace(/"/g, '""')}"`,
      `"${cat.replace(/"/g, '""')}"`,
      `"${prio.replace(/"/g, '""')}"`,
      `"${stat.replace(/"/g, '""')}"`,
      `"${doc.issuer.replace(/"/g, '""')}"`,
      `"${(doc.signer || '').replace(/"/g, '""')}"`,
      `"${(doc.summary || '').replace(/"/g, '""')}"`,
      `"${(doc.tags || []).join(', ').replace(/"/g, '""')}"`,
      `"${doc.driveAttachment ? doc.driveAttachment.name.replace(/"/g, '""') : 'ไม่มี'}"`,
      `"${doc.driveAttachment?.webViewLink || ''}"`,
    ];
  });

  const csvContent = BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
