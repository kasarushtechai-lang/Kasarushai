import React from 'react';
import { 
  SchoolDocument, 
  SchoolDepartment 
} from '../types';
import { DEPARTMENTS } from '../constants';
import { 
  Files, 
  GraduationCap, 
  Building2, 
  Users, 
  Coins, 
  Clock, 
  AlertTriangle,
  HardDrive,
  Info
} from 'lucide-react';

interface StatsOverviewProps {
  documents: SchoolDocument[];
  selectedDepartment: SchoolDepartment | 'all';
  onSelectDepartment: (dept: SchoolDepartment | 'all') => void;
  isConnectedToDrive: boolean;
  onConnectDrive: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  documents,
  selectedDepartment,
  onSelectDepartment,
  isConnectedToDrive,
  onConnectDrive,
}) => {
  const totalCount = documents.length;
  const academicCount = documents.filter(d => d.department === 'academic').length;
  const adminCount = documents.filter(d => d.department === 'administration').length;
  const personnelCount = documents.filter(d => d.department === 'personnel').length;
  const budgetCount = documents.filter(d => d.department === 'budget').length;
  const pendingCount = documents.filter(d => d.status === 'pending').length;
  const urgentCount = documents.filter(d => d.priority === 'urgent_top' || d.priority === 'urgent_high').length;
  const withDriveCount = documents.filter(d => !!d.driveAttachment).length;

  return (
    <div className="space-y-4">
      {/* Notice bar if Google Drive is not connected */}
      {!isConnectedToDrive && (
        <div className="bg-yellow-300 border-[3px] border-black p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-black shadow-[3px_3px_0px_0px_#000]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black text-yellow-400 border-2 border-black shrink-0">
              <HardDrive className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="text-xs sm:text-sm">
              <span className="font-black uppercase tracking-wide">เชื่อมต่อ GOOGLE DRIVE:</span> เพื่ออัปโหลดและจัดเก็บเอกสารทางการของโรงเรียนลง Google Drive โดยตรง
            </div>
          </div>
          <button
            onClick={onConnectDrive}
            className="text-xs font-black uppercase tracking-wider text-white bg-black hover:bg-neutral-800 px-4 py-2 border-2 border-black transition-colors shrink-0 shadow-[2px_2px_0px_0px_#fff]"
          >
            เชื่อมต่อ Google Drive ทันที &rarr;
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Documents Card */}
        <button
          onClick={() => onSelectDepartment('all')}
          className={`text-left p-4 border-[3px] border-black transition-all cursor-pointer ${
            selectedDepartment === 'all'
              ? 'bg-black text-white shadow-[4px_4px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-black uppercase tracking-wider ${selectedDepartment === 'all' ? 'text-yellow-400' : 'text-neutral-600'}`}>
              เอกสารทั้งหมด
            </span>
            <Files className={`w-4 h-4 stroke-[2.5] ${selectedDepartment === 'all' ? 'text-yellow-400' : 'text-black'}`} />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black tracking-tighter leading-none">{totalCount}</span>
            <span className={`text-xs font-bold uppercase ${selectedDepartment === 'all' ? 'text-neutral-400' : 'text-neutral-600'}`}>ฉบับ</span>
          </div>
          <div className={`mt-2 text-[11px] font-bold truncate ${selectedDepartment === 'all' ? 'text-neutral-300' : 'text-neutral-500'}`}>
            บน Drive: {withDriveCount} ฉบับ
          </div>
        </button>

        {/* Academic Affairs Card */}
        <button
          onClick={() => onSelectDepartment('academic')}
          className={`text-left p-4 border-[3px] border-black transition-all cursor-pointer ${
            selectedDepartment === 'academic'
              ? 'bg-blue-600 text-white shadow-[4px_4px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-black uppercase tracking-wider ${selectedDepartment === 'academic' ? 'text-white' : 'text-neutral-600'}`}>
              ฝ่ายวิชาการ
            </span>
            <GraduationCap className={`w-4 h-4 stroke-[2.5] ${selectedDepartment === 'academic' ? 'text-yellow-300' : 'text-blue-600'}`} />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black tracking-tighter leading-none">{academicCount}</span>
            <span className={`text-xs font-bold uppercase ${selectedDepartment === 'academic' ? 'text-blue-200' : 'text-neutral-600'}`}>ฉบับ</span>
          </div>
          <div className={`mt-2 text-[11px] font-bold truncate ${selectedDepartment === 'academic' ? 'text-blue-100' : 'text-neutral-500'}`}>
            แผนการสอน / หลักสูตร
          </div>
        </button>

        {/* Administration & Circulars Card */}
        <button
          onClick={() => onSelectDepartment('administration')}
          className={`text-left p-4 border-[3px] border-black transition-all cursor-pointer ${
            selectedDepartment === 'administration'
              ? 'bg-emerald-600 text-white shadow-[4px_4px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-black uppercase tracking-wider ${selectedDepartment === 'administration' ? 'text-white' : 'text-neutral-600'}`}>
              งานสารบรรณ
            </span>
            <Building2 className={`w-4 h-4 stroke-[2.5] ${selectedDepartment === 'administration' ? 'text-yellow-300' : 'text-emerald-700'}`} />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black tracking-tighter leading-none">{adminCount}</span>
            <span className={`text-xs font-bold uppercase ${selectedDepartment === 'administration' ? 'text-emerald-200' : 'text-neutral-600'}`}>ฉบับ</span>
          </div>
          <div className={`mt-2 text-[11px] font-bold truncate ${selectedDepartment === 'administration' ? 'text-emerald-100' : 'text-neutral-500'}`}>
            คำสั่ง / หนังสือราชการ
          </div>
        </button>

        {/* Personnel / HR Card */}
        <button
          onClick={() => onSelectDepartment('personnel')}
          className={`text-left p-4 border-[3px] border-black transition-all cursor-pointer ${
            selectedDepartment === 'personnel'
              ? 'bg-purple-700 text-white shadow-[4px_4px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-black uppercase tracking-wider ${selectedDepartment === 'personnel' ? 'text-white' : 'text-neutral-600'}`}>
              งานบุคคล
            </span>
            <Users className={`w-4 h-4 stroke-[2.5] ${selectedDepartment === 'personnel' ? 'text-yellow-300' : 'text-purple-600'}`} />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black tracking-tighter leading-none">{personnelCount}</span>
            <span className={`text-xs font-bold uppercase ${selectedDepartment === 'personnel' ? 'text-purple-200' : 'text-neutral-600'}`}>ฉบับ</span>
          </div>
          <div className={`mt-2 text-[11px] font-bold truncate ${selectedDepartment === 'personnel' ? 'text-purple-100' : 'text-neutral-500'}`}>
            ข้อตกลง PA / วุฒิบัตร
          </div>
        </button>

        {/* Budget & Procurement Card */}
        <button
          onClick={() => onSelectDepartment('budget')}
          className={`text-left p-4 border-[3px] border-black transition-all cursor-pointer ${
            selectedDepartment === 'budget'
              ? 'bg-yellow-400 text-black shadow-[4px_4px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-black">
              งบประมาณ/พัสดุ
            </span>
            <Coins className="w-4 h-4 stroke-[2.5] text-black" />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black tracking-tighter leading-none">{budgetCount}</span>
            <span className="text-xs font-bold uppercase text-neutral-800">ฉบับ</span>
          </div>
          <div className="mt-2 text-[11px] font-bold truncate text-neutral-700">
            แผนปฏิบัติการ / จัดซื้อ
          </div>
        </button>

        {/* Pending / Urgent Attention Card */}
        <div className="p-4 border-[3px] border-black bg-rose-50 shadow-[2px_2px_0px_0px_#000]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-950">รอตรวจ/ด่วน</span>
            <Clock className="w-4 h-4 stroke-[2.5] text-rose-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-rose-600 tracking-tighter leading-none">{pendingCount}</span>
            <span className="text-xs font-bold uppercase text-rose-900">รอลงนาม</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-700 font-bold truncate flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5] inline shrink-0" /> ด่วนที่สุด {urgentCount} ฉบับ
          </div>
        </div>
      </div>
    </div>
  );
};
