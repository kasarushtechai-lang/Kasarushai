export type SchoolDepartment = 
  | 'academic'      // ฝ่ายวิชาการ
  | 'administration'// ฝ่ายบริหารทั่วไป / สารบรรณ
  | 'personnel'     // ฝ่ายบริหารงานบุคคล
  | 'budget'        // ฝ่ายแผนงานและงบประมาณ
  | 'student_affairs'; // ฝ่ายกิจการนักเรียน

export type DocumentCategory = 
  | 'order'             // คำสั่งโรงเรียน
  | 'official_memo'     // หนังสือราชการ / บันทึกข้อความ
  | 'announcement'      // ประกาศโรงเรียน
  | 'lesson_plan'       // แผนการจัดการเรียนรู้
  | 'curriculum'        // หลักสูตร / โครงการสอน
  | 'student_record'    // ปพ. / ทะเบียนวัดผล
  | 'portfolio'         // แฟ้มสะสมงาน / PA ครู
  | 'training'          // วุฒิบัตร / เกียรติบัตร
  | 'procurement'       // จัดซื้อจัดจ้าง / พัสดุ
  | 'budget_plan'       // แผนปฏิบัติการ / งบประมาณ
  | 'meeting_minutes'   // รายงานการประชุม
  | 'general';          // อื่นๆ

export type DocumentPriority = 
  | 'normal'     // ปกติ
  | 'urgent'     // ด่วน
  | 'urgent_high'// ด่วนมาก
  | 'urgent_top'; // ด่วนที่สุด

export type DocumentStatus = 
  | 'draft'      // ร่าง
  | 'pending'    // รอตรวจสอบ / รอลงนาม
  | 'approved'   // อนุมัติ / ลงนามแล้ว
  | 'published'  // ประกาศใช้ / เผยแพร่
  | 'archived';  // จัดเก็บ / สิ้นสุด

export interface DriveAttachment {
  fileId: string;
  name: string;
  mimeType: string;
  size?: number;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  uploadedAt: string;
}

export interface SchoolDocument {
  id: string;
  code: string;                 // e.g. ศธ 04225/ว 104
  title: string;                // ชื่อเรื่องเอกสาร
  department: SchoolDepartment; // ฝ่ายงาน
  category: DocumentCategory;   // หมวดหมู่
  priority: DocumentPriority;   // ชั้นความเร็ว/ความสำคัญ
  status: DocumentStatus;       // สถานะเอกสาร
  academicYear: string;         // ปีการศึกษา เช่น 2567, 2568
  semester: '1' | '2' | 'both'; // ภาคเรียน
  issuer: string;               // ผู้จัดทำ / เสนอ
  signer?: string;              // ผู้ลงนามอนุมัติ (เช่น ผู้อำนวยการ)
  docDate: string;              // วันที่ในเอกสาร YYYY-MM-DD
  registeredDate: string;       // วันที่ลงรับ/ลงทะเบียน YYYY-MM-DD
  summary: string;              // สรุปสาระสำคัญ
  tags: string[];               // คำค้นหา เช่น ม.ปลาย, วิทยาศาสตร์, เบิกจ่าย
  driveAttachment?: DriveAttachment; // ข้อมูลไฟล์บน Google Drive
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentInfo {
  id: SchoolDepartment;
  labelTh: string;
  labelEn: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  icon: string;
}

export interface CategoryInfo {
  id: DocumentCategory;
  department: SchoolDepartment;
  labelTh: string;
  labelEn: string;
  codePrefix: string;
}
