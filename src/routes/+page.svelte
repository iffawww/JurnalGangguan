<script lang="ts">
  import type { PageData } from './$types';
  import { Activity, AlertTriangle, MapPin, Clock, CheckCircle, FileText } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Dashboard | SIM-GPD</title>
</svelte:head>

<!-- WELCOME BANNER (SUBTLE) -->
<div class="mb-8 relative overflow-hidden rounded-3xl bg-pln-navy p-8 shadow-xl border border-white/5">
  <div class="absolute top-0 right-0 w-64 h-64 bg-pln-teal/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
  <div class="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
    <div>
      <h2 class="text-3xl font-black text-white leading-tight uppercase tracking-tighter">
        Monitoring <span class="text-pln-yellow">Center</span>
      </h2>
      <p class="text-white/50 text-[10px] font-bold mt-2 uppercase tracking-[0.2em]">Sistem Monitoring Gangguan & Pelaporan Digital UP3 Madura</p>
    </div>
    <div class="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
      <div class="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
      <span class="text-[10px] text-white font-black uppercase tracking-widest">Sistem Online</span>
    </div>
  </div>
</div>

<!-- STATS CARDS (CLEAN & PROFESSIONAL) -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 transition-all hover:shadow-md group">
    <div class="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
      <Activity size={28} />
    </div>
    <div>
      <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Gangguan</p>
      <h3 class="text-3xl font-black text-slate-800 tracking-tighter">{data.totalTrip}</h3>
    </div>
  </div>

  <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 transition-all hover:shadow-md group">
    <div class="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
      <AlertTriangle size={28} />
    </div>
    <div>
      <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Trip Hari Ini</p>
      <h3 class="text-3xl font-black text-slate-800 tracking-tighter">{data.todayTrip}</h3>
    </div>
  </div>

  <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 transition-all hover:shadow-md group">
    <div class="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
      <CheckCircle size={28} />
    </div>
    <div>
      <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Sistem Aman</p>
      <h3 class="text-lg font-black text-slate-800 uppercase tracking-tight">Terproteksi</h3>
    </div>
  </div>

  <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 transition-all hover:shadow-md group">
    <div class="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
      <FileText size={28} />
    </div>
    <div>
      <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Laporan PPT</p>
      <h3 class="text-lg font-black text-slate-800 uppercase tracking-tight">Siap Cetak</h3>
    </div>
  </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <!-- Chart -->
  <div class="col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col">
    <div class="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
      <div class="w-10 h-10 bg-pln-navy rounded-xl flex items-center justify-center text-white">
        <MapPin size={20} />
      </div>
      <h3 class="text-sm font-black text-pln-navy uppercase tracking-widest">Sebaran Gangguan Per Gardu Induk</h3>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
      {#each data.groupedGi as gi}
        <div class="group">
          <div class="flex justify-between text-[10px] mb-2 font-black uppercase tracking-widest">
            <span class="text-slate-500">{gi.gi}</span>
            <span class="text-pln-navy">{gi.count} Trip</span>
          </div>
          <div class="w-full bg-slate-50 rounded-full h-2 overflow-hidden ring-1 ring-slate-100">
            <div class="bg-pln-teal h-full rounded-full transition-all duration-1000" style="width: {Math.min((gi.count / Math.max(1, data.totalTrip)) * 100, 100)}%"></div>
          </div>
        </div>
      {:else}
        <div class="col-span-2 py-20 text-center">
           <MapPin size={40} class="mx-auto text-slate-100 mb-2" />
           <p class="text-slate-300 text-[9px] font-black uppercase tracking-widest">Belum ada data operasional.</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Recent Entries -->
  <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col">
    <div class="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
      <div class="w-10 h-10 bg-pln-yellow rounded-xl flex items-center justify-center text-pln-navy">
        <Clock size={20} />
      </div>
      <h3 class="text-sm font-black text-pln-navy uppercase tracking-widest">Data Input Terbaru</h3>
    </div>
    
    <div class="space-y-4 flex-1">
      {#each data.recentRecords as rec}
        <div class="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-slate-50 group">
          <div class="w-10 h-10 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center text-pln-teal font-black text-[10px] group-hover:bg-pln-navy group-hover:text-white transition-all">
            {rec.ulp.substring(0, 2).toUpperCase()}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-black text-slate-800 truncate uppercase tracking-tighter">{rec.penyulang}</p>
            <div class="flex items-center gap-2 mt-1 text-[8px] text-slate-400 font-bold uppercase tracking-widest">
              <span class="truncate">{rec.gi}</span>
              <span class="text-pln-teal/60">{rec.tgl_trip}</span>
            </div>
          </div>
        </div>
      {:else}
        <div class="flex-1 flex flex-col items-center justify-center text-slate-100 py-10">
           <Clock size={40} class="mb-2 opacity-50" />
           <p class="italic text-[9px] font-black uppercase tracking-widest">Belum ada input.</p>
        </div>
      {/each}
    </div>
    
    <a href="/riwayat" class="mt-6 block text-center py-3 bg-slate-50 rounded-xl text-[9px] font-black text-pln-navy uppercase tracking-widest hover:bg-pln-navy hover:text-white transition-all">
      Lihat Semua Data
    </a>
  </div>
</div>



