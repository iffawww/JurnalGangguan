import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { jurnalGangguan } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { redirect } from '@sveltejs/kit';

export const actions = {
	create: async ({ request }) => {
		try {
			const formData = await request.formData();
			
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
			
			const foto1 = formData.get('foto1') as File | null;
			const foto2 = formData.get('foto2') as File | null;

			if (!ulp || !tgl_trip) {
				return { success: false, error: 'Data ULP dan Tanggal wajib diisi' };
			}

			// Calculate no_urut based on tgl_trip
			const latestRecords = await db.select({ no_urut: jurnalGangguan.no_urut })
				.from(jurnalGangguan)
				.where(eq(jurnalGangguan.tgl_trip, tgl_trip))
				.orderBy(desc(jurnalGangguan.no_urut))
				.limit(1);
				
			const nextNoUrut = (latestRecords.length > 0 && latestRecords[0].no_urut) ? latestRecords[0].no_urut + 1 : 1;

			// Save photos to static/uploads if they exist
			let path_foto_1: string | null = null;
			let path_foto_2: string | null = null;
			
			const uploadDir = path.resolve('static/uploads');
			if (!fs.existsSync(uploadDir)) {
				fs.mkdirSync(uploadDir, { recursive: true });
			}

			if (foto1 && foto1.size > 0) {
				const safeName = foto1.name.replace(/[^a-zA-Z0-9.\-]/g, '_');
				const filename = `${Date.now()}-1-${safeName}`;
				const dest = path.join(uploadDir, filename);
				const buffer = Buffer.from(await foto1.arrayBuffer());
				fs.writeFileSync(dest, buffer);
				path_foto_1 = `/uploads/${filename}`;
			}
			
			if (foto2 && foto2.size > 0) {
				const safeName = foto2.name.replace(/[^a-zA-Z0-9.\-]/g, '_');
				const filename = `${Date.now()}-2-${safeName}`;
				const dest = path.join(uploadDir, filename);
				const buffer = Buffer.from(await foto2.arrayBuffer());
				fs.writeFileSync(dest, buffer);
				path_foto_2 = `/uploads/${filename}`;
			}

			await db.insert(jurnalGangguan).values({
				no_urut: nextNoUrut,
				ulp,
				gi,
				penyulang,
				nama_proteksi,
				kode_j,
				tgl_trip,
				rele_kerja,
				cuaca,
				status_tp,
				keterangan,
				path_foto_1,
				path_foto_2
			});

		} catch (err: any) {
			if (err.status >= 300 && err.status < 400) throw err;
			console.error('Create action error:', err);
			
			let friendlyMessage = err.message || 'Gagal menyimpan data ke database';
			if (err.code === 'ECONNREFUSED') {
				friendlyMessage = 'DATABASE TIDAK TERJANGKAU! Pastikan MySQL di XAMPP sudah di-START.';
			} else if (err.code === 'ER_NO_SUCH_TABLE') {
				friendlyMessage = 'TABEL TIDAK DITEMUKAN! Silakan jalankan script SQL yang saya berikan di phpMyAdmin.';
			}

			return { success: false, error: friendlyMessage };
		}

		throw redirect(303, '/riwayat');
	}
} satisfies Actions;
