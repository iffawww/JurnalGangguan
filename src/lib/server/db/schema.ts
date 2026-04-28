import { mysqlTable, serial, int, text, varchar, timestamp, date } from 'drizzle-orm/mysql-core';

export const jurnalGangguan = mysqlTable('jurnal_gangguan', {
	id: int('id').autoincrement().primaryKey(),
	no_urut: int('no_urut').notNull(),
	ulp: varchar('ulp', { length: 50 }).notNull(),
	gi: varchar('gi', { length: 100 }).notNull(),
	penyulang: varchar('penyulang', { length: 100 }).notNull(),
	nama_proteksi: varchar('nama_proteksi', { length: 50 }).notNull(),
	kode_j: varchar('kode_j', { length: 50 }).notNull(),
	tgl_trip: date('tgl_trip', { mode: 'string' }).notNull(),
	rele_kerja: varchar('rele_kerja', { length: 50 }).notNull(),
	cuaca: varchar('cuaca', { length: 50 }).notNull(),
	status_tp: varchar('status_tp', { length: 50 }).notNull(),
	keterangan: text('keterangan'),
	path_foto_1: varchar('path_foto_1', { length: 255 }),
	path_foto_2: varchar('path_foto_2', { length: 255 }),
	created_at: timestamp('created_at').defaultNow().notNull()
});
