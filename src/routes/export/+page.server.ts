import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { jurnalGangguan } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
    try {
        const allData = await db.select()
            .from(jurnalGangguan)
            .orderBy(desc(jurnalGangguan.tgl_trip), jurnalGangguan.no_urut);

        // Group by tgl_trip
        const groupedData: Record<string, any[]> = {};
        for (const item of allData) {
            if (!groupedData[item.tgl_trip]) {
                groupedData[item.tgl_trip] = [];
            }
            groupedData[item.tgl_trip].push({
                ...item,
                created_at: item.created_at instanceof Date ? item.created_at.toISOString() : new Date(item.created_at).toISOString()
            });
        }

        return {
            jurnalByDate: groupedData
        };
    } catch (err) {
        console.error('Export load error:', err);
        return {
            jurnalByDate: {},
            error: 'Gagal mengambil data export'
        };
    }
};
