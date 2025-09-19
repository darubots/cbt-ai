
import React, { useState, useCallback, ChangeEvent } from 'react';
import type { Question, StudentResult } from '../types.ts';
import { useAuth, useExam } from '../App.tsx';
import { exportToPDF, exportToExcel, exportToWord } from '../services/exportService.ts';
import { UploadIcon, ClockIcon, BookOpenIcon, ChartBarIcon, ArrowDownTrayIcon, PowerIcon, UserGroupIcon } from './icons.tsx';
import StudentManagement from './StudentManagement.tsx';

type ActiveTab = 'management' | 'results' | 'students';

const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<ActiveTab>('management');

    const renderContent = () => {
        switch (activeTab) {
            case 'management':
                return <ExamManagement />;
            case 'results':
                return <GradeAccumulation />;
            case 'students':
                return <StudentManagement />;
            default:
                return null;
        }
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Dasbor Admin</h1>
                        <p className="text-gray-500">Selamat datang, {user?.username}!</p>
                    </div>
                    <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all">
                        <PowerIcon className="w-5 h-5" />
                        Keluar
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <TabButton name="Manajemen Ujian" icon={<BookOpenIcon className="w-5 h-5" />} active={activeTab === 'management'} onClick={() => setActiveTab('management')} />
                        <TabButton name="Akumulasi Nilai" icon={<ChartBarIcon className="w-5 h-5" />} active={activeTab === 'results'} onClick={() => setActiveTab('results')} />
                        <TabButton name="Manajemen Siswa" icon={<UserGroupIcon className="w-5 h-5" />} active={activeTab === 'students'} onClick={() => setActiveTab('students')} />
                    </nav>
                </div>
                
                {renderContent()}
            </main>
        </div>
    );
};

const TabButton: React.FC<{name: string, icon: React.ReactNode, active: boolean, onClick: () => void}> = ({ name, icon, active, onClick }) => (
    <button
        onClick={onClick}
        className={`${
            active
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-t-md`}
    >
        {icon}
        {name}
    </button>
);


// --- Exam Management Component ---
const ExamManagement: React.FC = () => {
    const { questions, setQuestions, setSettings } = useExam();
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setFileName(e.target.files[0].name);
            setError('');
            setSuccess('');
        }
    };

    const handleFileUpload = useCallback(() => {
        if (!file) {
            setError('Silakan pilih file bank soal terlebih dahulu.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const data: Question[] = JSON.parse(text);
                
                if (!Array.isArray(data) || !data.every(q => 'mata_pelajaran' in q && 'soal' in q)) {
                    throw new Error('Format JSON tidak valid. Pastikan formatnya adalah: [{"mata_pelajaran": "...", "soal": "..."}]');
                }
                
                setQuestions(data);
                setSuccess(`${data.length} soal berhasil diunggah dari file ${file.name}.`);
                setError('');
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Gagal memproses file. Pastikan format JSON benar.');
                setSuccess('');
            }
        };
        reader.readAsText(file);
    }, [file, setQuestions]);

    const handleScheduleSet = useCallback(() => {
        if (!startTime || !endTime) {
            setError('Harap tentukan waktu mulai dan selesai ujian.');
            return;
        }
        if (new Date(startTime) >= new Date(endTime)) {
            setError('Waktu mulai harus sebelum waktu selesai.');
            return;
        }
        if (questions.length === 0) {
            setError('Unggah bank soal terlebih dahulu sebelum mengatur jadwal.');
            return;
        }
        
        const subject = questions.length > 0 ? questions[0].mata_pelajaran : 'Ujian Umum';

        setSettings({ startTime, endTime, subject });
        setSuccess(`Jadwal ujian untuk mata pelajaran "${subject}" berhasil diatur.`);
        setError('');
    }, [startTime, endTime, setSettings, questions]);


    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><UploadIcon className="w-6 h-6"/>Unggah Bank Soal</h2>
                <div className="flex items-center space-x-4">
                    <label className="w-64 flex flex-col items-center px-4 py-6 bg-white text-indigo-600 rounded-lg shadow-sm tracking-wide uppercase border-2 border-dashed border-gray-300 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                        <svg className="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4 4-4-4h3v-3h2v3z" /></svg>
                        <span className="mt-2 text-base leading-normal text-center truncate w-full">{fileName || 'Pilih file .json'}</span>
                        <input type='file' className="hidden" accept=".json,application/json" onChange={handleFileChange} />
                    </label>
                    <button onClick={handleFileUpload} className="px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Unggah Soal
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                 <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><ClockIcon className="w-6 h-6"/>Atur Waktu Ujian</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div>
                        <label htmlFor="start-time" className="block text-sm font-medium text-gray-700">Waktu Mulai</label>
                        <input type="datetime-local" id="start-time" value={startTime} onChange={e => setStartTime(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="end-time" className="block text-sm font-medium text-gray-700">Waktu Selesai</label>
                        <input type="datetime-local" id="end-time" value={endTime} onChange={e => setEndTime(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                    <button onClick={handleScheduleSet} className="px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-semibold h-fit focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        Atur Jadwal
                    </button>
                </div>
            </div>
            
            {error && <div className="p-4 bg-red-100 text-red-800 border border-red-200 rounded-lg" role="alert">{error}</div>}
            {success && <div className="p-4 bg-green-100 text-green-800 border border-green-200 rounded-lg" role="alert">{success}</div>}
        </div>
    );
};


// --- Grade Accumulation Component ---
const GradeAccumulation: React.FC = () => {
    const { results } = useExam();

    if (results.length === 0) {
        return <div className="text-center py-10 bg-white rounded-lg shadow-sm"><p className="text-gray-500">Belum ada data nilai siswa yang masuk.</p></div>
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-xl font-semibold text-gray-800">Hasil Ujian Siswa</h2>
                <div className="flex space-x-2">
                     <button onClick={() => exportToPDF(results)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        <ArrowDownTrayIcon className="w-4 h-4" /> PDF
                    </button>
                    <button onClick={() => exportToExcel(results)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-green-500 rounded-md hover:bg-green-600 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        <ArrowDownTrayIcon className="w-4 h-4" /> Excel
                    </button>
                    <button onClick={() => exportToWord(results)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <ArrowDownTrayIcon className="w-4 h-4" /> Word
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NISN</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu Pengerjaan</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail Jawaban</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {results.map((result, index) => <ResultRow key={index} result={result} />)}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ResultRow: React.FC<{ result: StudentResult }> = ({ result }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.studentName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.studentNisn}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600">{result.score.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.submissionTime}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => setIsOpen(!isOpen)} className="text-indigo-600 hover:text-indigo-900 transition-colors focus:outline-none focus:underline">
                        {isOpen ? 'Tutup' : 'Lihat'}
                    </button>
                </td>
            </tr>
            {isOpen && (
                <tr>
                    <td colSpan={5} className="p-4 bg-indigo-50">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-800">Detail Jawaban dan Soal:</h4>
                            {result.answers.map((ans, idx) => (
                                <div key={idx} className="p-3 border rounded-md bg-white shadow-sm">
                                    <p className="font-bold text-sm text-gray-700">Soal {idx + 1}: <span className="font-normal">{ans.question.soal}</span></p>
                                    <p className="font-bold text-sm text-blue-700 mt-2">Jawaban Siswa: <span className="font-normal text-gray-800">{ans.answer}</span></p>
                                    {ans.question.kunci_jawaban && <p className="font-bold text-sm text-green-700 mt-2">Kunci Jawaban: <span className="font-normal text-gray-800">{ans.question.kunci_jawaban}</span></p>}
                                </div>
                            ))}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

export default AdminDashboard;