
import { GoogleGenAI, Type } from "@google/genai";
import type { Question } from '../types.ts';

// IMPORTANT: This assumes process.env.API_KEY is set in the execution environment.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set. AI grading will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const gradingSchema = {
    type: Type.OBJECT,
    properties: {
        score: {
            type: Type.NUMBER,
            description: "A score from 0 to 100 for the student's answer."
        },
        feedback: {
            type: Type.STRING,
            description: "Brief feedback explaining the score."
        }
    }
};

export const gradeAnswer = async (question: Question, studentAnswer: string): Promise<{ score: number, feedback: string }> => {
    if (!API_KEY) {
        // Fallback for development without API key
        console.warn("No API Key found. Returning a random mock score.");
        const mockScore = Math.floor(Math.random() * 41) + 60; // Score between 60 and 100
        return { score: mockScore, feedback: "Ini adalah penilaian pura-pura karena kunci API tidak tersedia." };
    }

    const prompt = `Anda adalah asisten AI yang bertugas menilai jawaban esai siswa.
    
    TUGAS:
    1. Analisis pertanyaan yang diberikan.
    2. Analisis jawaban siswa.
    3. Bandingkan jawaban siswa dengan kunci jawaban (jika tersedia) atau dengan pengetahuan umum yang akurat mengenai topik tersebut.
    4. Berikan skor numerik dari 0 hingga 100 berdasarkan relevansi, akurasi, dan kelengkapan jawaban siswa.
    5. Berikan umpan balik singkat yang menjelaskan alasan skor tersebut.
    
    INFORMASI:
    - Pertanyaan: "${question.soal}"
    ${question.kunci_jawaban ? `- Kunci Jawaban Referensi: "${question.kunci_jawaban}"` : '- Tidak ada kunci jawaban yang disediakan. Nilai berdasarkan kebenaran faktual dan kelengkapan jawaban.'}
    - Jawaban Siswa: "${studentAnswer}"

    Mohon berikan penilaian Anda.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: gradingSchema,
                temperature: 0.2,
            },
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        return { score: result.score || 0, feedback: result.feedback || "Tidak ada umpan balik." };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return { score: 0, feedback: "Terjadi kesalahan saat menghubungi layanan penilaian AI." };
    }
};