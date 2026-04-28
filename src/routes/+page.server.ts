import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { jurnalGangguan } from '$lib/server/db/schema';
import { desc, sql, eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
    try {
        // Basic stats gathering
        const totalRecords = await db.select({ count: sql<number>`count(*)` }).from(jurnalGangguan);
        
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRecords = await db.select({ count: sql<number>`count(*)` })
                                     .from(jurnalGangguan)
                                     .where(eq(jurnalGangguan.tgl_trip, todayStr));

        const groupedGi = await db.select({
            gi: jurnalGangguan.gi,
            count: sql<number>`count(*)`
        }).from(jurnalGangguan).groupBy(jurnalGangguan.gi).orderBy(desc(sql`count(*)`));

        const recentRecords = await db.select()
            .from(jurnalGangguan)
            .orderBy(desc(jurnalGangguan.created_at))
            .limit(5);

        return {
            totalTrip: totalRecords[0]?.count ? Number(totalRecords[0].count) : 0,
            todayTrip: todayRecords[0]?.count ? Number(todayRecords[0].count) : 0,
            groupedGi: groupedGi.map(g => ({ ...g, count: Number(g.count || 0) })),
            recentRecords: recentRecords.map(item => ({
                ...item,
                created_at: item.created_at instanceof Date ? item.created_at.toISOString() : new Date(item.created_at).toISOString()
            }))
        };
    } catch (err) {
        console.error('Dashboard load error:', err);
        return {
            totalTrip: 0,
            todayTrip: 0,
            groupedGi: [],
            recentRecords: [],
            error: 'Gagal mengambil data dashboard'
        };
    }
};
