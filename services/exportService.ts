
import type { StudentResult } from "../types.ts";

// These are expected to be available globally from the script tags in index.html
declare const jspdf: any;
declare const XLSX: any;

export const exportToPDF = (results: StudentResult[]) => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();

    doc.text("Laporan Akumulasi Nilai Ujian", 14, 16);
    
    const tableColumn = ["Nama Siswa", "NISN", "Nilai Akhir", "Waktu Pengerjaan"];
    const tableRows: (string | number)[][] = [];

    results.forEach(result => {
        const resultData = [
            result.studentName,
            result.studentNisn,
            result.score.toFixed(2),
            result.submissionTime,
        ];
        tableRows.push(resultData);
    });

    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
    });
    
    doc.save("hasil_ujian.pdf");
};

export const exportToExcel = (results: StudentResult[]) => {
    const worksheetData = results.map(result => ({
        "Nama Siswa": result.studentName,
        "NISN": result.studentNisn,
        "Nilai Akhir": result.score,
        "Waktu Pengerjaan": result.submissionTime,
        ...result.answers.reduce((acc, curr, index) => {
            acc[`Soal ${index + 1}`] = curr.question.soal;
            acc[`Jawaban Siswa ${index + 1}`] = curr.answer;
            return acc;
        }, {} as Record<string, string>)
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hasil Ujian");
    
    XLSX.writeFile(workbook, "hasil_ujian.xlsx");
};

export const exportToWord = (results: StudentResult[]) => {
    let content = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Hasil Ujian</title></head>
        <body>
            <h1>Laporan Akumulasi Nilai Ujian</h1>
            <table border="1" style="border-collapse: collapse; width: 100%;">
                <thead>
                    <tr>
                        <th>Nama Siswa</th>
                        <th>NISN</th>
                        <th>Nilai Akhir</th>
                        <th>Waktu Pengerjaan</th>
                    </tr>
                </thead>
                <tbody>
    `;

    results.forEach(result => {
        content += `
            <tr>
                <td>${result.studentName}</td>
                <td>${result.studentNisn}</td>
                <td>${result.score.toFixed(2)}</td>
                <td>${result.submissionTime}</td>
            </tr>
        `;
    });

    content += `
                </tbody>
            </table>
        </body>
        </html>
    `;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(content);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'hasil_ujian.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
};