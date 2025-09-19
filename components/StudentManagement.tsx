
import React, { useState, useMemo } from 'react';
import { useAuth } from '../App.tsx';
import type { User } from '../types.ts';

const StudentManagement: React.FC = () => {
    const { users, addUser } = useAuth();
    const [studentName, setStudentName] = useState('');
    const [studentNisn, setStudentNisn] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const students = useMemo(() => users.filter(u => u.role === 'Siswa'), [users]);

    const handleAddStudent = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!studentName.trim() || !studentNisn.trim()) {
            setError('Nama siswa dan NISN tidak boleh kosong.');
            return;
        }
        
        const result = addUser(studentName, studentNisn);

        if (result.success) {
            setSuccess(result.message);
            setStudentName('');
            setStudentNisn('');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="space-y-8">
            {/* Add Student Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Tambah Siswa Baru</h2>
                <form onSubmit={handleAddStudent} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="md:col-span-1">
                            <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">Nama Lengkap Siswa</label>
                            <input
                                type="text"
                                id="studentName"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Contoh: Budi Santoso"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor="studentNisn" className="block text-sm font-medium text-gray-700">NISN</label>
                            <input
                                type="text"
                                id="studentNisn"
                                value={studentNisn}
                                onChange={(e) => setStudentNisn(e.target.value.replace(/\D/g, ''))} // only allow numbers
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Contoh: 123456789"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <button
                                type="submit"
                                className="w-full px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors font-semibold h-fit focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Tambah Siswa
                            </button>
                        </div>
                    </div>
                </form>
                 {error && <div className="mt-4 p-3 bg-red-100 text-red-800 border border-red-200 rounded-lg text-sm" role="alert">{error}</div>}
                 {success && <div className="mt-4 p-3 bg-green-100 text-green-800 border border-green-200 rounded-lg text-sm" role="alert">{success}</div>}
            </div>

            {/* Student List */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Daftar Siswa Terdaftar</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NISN</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.length > 0 ? (
                                students.map((student: User) => (
                                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.nisn}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
                                        Belum ada siswa yang terdaftar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentManagement;