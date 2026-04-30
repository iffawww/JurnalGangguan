import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { jurnalGangguan } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export const load: PageServerLoad = async () => {
    try {
        const allData = await db.select()
            .from(jurnalGangguan)
            .orderBy(desc(jurnalGangguan.tgl_trip), desc(jurnalGangguan.created_at));

        return {
            riwayat: allData.map(item => ({
                ...item,
                created_at: item.created_at instanceof Date ? item.created_at.toISOString() : new Date(item.created_at).toISOString()
            }))
        };
    } catch (err) {
        console.error('Riwayat load error:', err);
        return {
            riwayat: [],
            error: 'Gagal mengambil data riwayat'
        };
    }
};

export const actions = {
    upload: async ({ request }) => {
        try {
            const formData = await request.formData();
            const idStr = formData.get('id') as string;
            const fotoIndex = formData.get('index') as string; // '1' or '2'
            const foto = formData.get('foto') as File | null;
            
            if (!idStr || !foto || foto.size === 0) {
                return { success: false, error: 'File atau ID tidak valid' };
            }
            
            const id = parseInt(idStr);
            const uploadDir = path.resolve('static/uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Sanitize filename: remove non-alphanumeric except dots and dashes
            const originalName = foto?.name || 'document.png';
            const safeName = originalName.replace(/[^a-zA-Z0-9.\-]/g, '_');
            const filename = `${Date.now()}-edit-${fotoIndex}-${safeName}`;
            const dest = path.join(uploadDir, filename);
            
            const buffer = Buffer.from(await foto.arrayBuffer());
            fs.writeFileSync(dest, buffer);
            const savedPath = `/uploads/${filename}`;

            if (fotoIndex === '1') {
                await db.update(jurnalGangguan).set({ path_foto_1: savedPath }).where(eq(jurnalGangguan.id, id));
            } else if (fotoIndex === '2') {
                await db.update(jurnalGangguan).set({ path_foto_2: savedPath }).where(eq(jurnalGangguan.id, id));
            }

            return { success: true };
        } catch (err: any) {
            console.error('Upload error:', err);
            return { success: false, error: err.message };
        }
    },
    edit: async ({ request }) => {
        try {
            const formData = await request.formData();
            const id = parseInt(formData.get('id') as string);
            
            const ulp = formData.get('ulp') as string;
            const gi = formData.get('gi') as string;
            const penyulang = (formData.get('penyulang') as string)?.toUpperCase() || '';
            const nama_proteksi = (formData.get('nama_proteksi') as string)?.toUpperCase() || '';
            const kode_j = (formData.get('kode_j') as string)?.toUpperCase() || '';
            const tgl_trip = formData.get('tgl_trip') as string;
            const rele_kerja = (formData.get('rele_kerja') as string)?.toUpperCase() || '';
            const cuaca = formData.get('cuaca') as string;
            const status_tp = formData.get('status_tp') as string;
            const keterangan = (formData.get('keterangan') as string)?.toUpperCase() || '';

            await db.update(jurnalGangguan).set({
                ulp,
                gi,
                penyulang,
                nama_proteksi,
                kode_j,
                tgl_trip,
                rele_kerja,
                cuaca,
                status_tp,
                keterangan
            }).where(eq(jurnalGangguan.id, id));

            return { success: true };
        } catch (err: any) {
            console.error('Edit error:', err);
            return { success: false, error: err.message };
        }
    },
    delete: async ({ request }) => {
        try {
            const formData = await request.formData();
            const id = parseInt(formData.get('id') as string);
            await db.delete(jurnalGangguan).where(eq(jurnalGangguan.id, id));
            return { success: true };
        } catch (err: any) {
            console.error('Delete error:', err);
            return { success: false, error: err.message };
        }
    }
} satisfies Actions;
