<script lang="ts">
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
  const dates = $derived(Object.keys(data.jurnalByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()));

  function handlePrint() {
    window.print();
  }
</script>

<svelte:head>
  <title>Laporan Jurnal Gangguan</title>
  <style>
    @media print {
      body {
        background: white !important;
        color: black !important;
      }
      .no-print {
        display: none !important;
      }
      /* Ensure each slide uses exactly one A4 Landscape page */
      .slide-container {
        page-break-after: always;
        break-after: page;
        height: 100vh;
        width: 100vw;
        margin: 0;
        padding: 2cm;
        box-sizing: border-box;
      }
      .slide-content {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
    }
  </style>
</svelte:head>

<div class="mb-8 flex justify-between items-center no-print">
  <div>
    <h2 class="text-3xl font-black text-pln-navy mb-2 uppercase tracking-tighter">Laporan Harian (Otomatisasi PPT)</h2>
    <p class="text-slate-500 font-medium">Gunakan tombol print (Ctrl+P) untuk menyimpan sebagai PDF/PPT Landscape.</p>
  </div>
  <button onclick={handlePrint} class="bg-pln-teal hover:bg-pln-teal-dark transition text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-pln-teal/20">
    Cetak PPT / PDF
  </button>
</div>

{#if dates.length === 0}
  <div class="text-center py-20 bg-white/5 backdrop-blur-md rounded-xl border border-white/20">
    <p class="text-xl text-slate-300">Belum ada data jurnal gangguan.</p>
  </div>
{:else}
  {#each dates as date}
    {@const items = data.jurnalByDate[date]}
    <div class="slide-container mb-12 bg-white text-black p-8 rounded-xl shadow-2xl relative overflow-hidden">
      <!-- PLN slide accent -->
      <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pln-blue to-pln-yellow no-print"></div>

      <div class="slide-content">
        <div class="sm:col-span-2">
        <span class="block text-sm font-medium text-slate-200 mb-2">Unggah Eviden Foto</span>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/9/97/Logo_PLN.png" alt="Logo PLN" class="h-12 w-auto">
            <div>
              <h1 class="text-2xl font-bold text-slate-800">Evaluasi Harian Gangguan Jaringan</h1>
              <p class="text-md font-medium text-slate-600">PLN UP3 Madura - Tanggal: {date}</p>
            </div>
        </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto w-full mb-6 flex-shrink-0">
          <table class="w-full text-xs text-left border-collapse border border-slate-300">
            <thead class="bg-slate-100 uppercase font-bold text-slate-700">
              <tr>
                <th class="border border-slate-300 p-2 text-center w-8">No</th>
                <th class="border border-slate-300 p-2">ULP</th>
                <th class="border border-slate-300 p-2">GI / Penyulang</th>
                <th class="border border-slate-300 p-2">Proteksi / Kode J</th>
                <th class="border border-slate-300 p-2">Rele Kerja</th>
                <th class="border border-slate-300 p-2">Cuaca</th>
                <th class="border border-slate-300 p-2 w-16">T/P</th>
                <th class="border border-slate-300 p-2">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {#each items as item}
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="border border-slate-300 p-2 text-center font-bold">{item.no_urut}</td>
                  <td class="border border-slate-300 p-2">{item.ulp}</td>
                  <td class="border border-slate-300 p-2">
                    <span class="block font-semibold">{item.gi}</span>
                    <span class="block text-slate-500">{item.penyulang}</span>
                  </td>
                  <td class="border border-slate-300 p-2">
                    <span class="block">{item.nama_proteksi}</span>
                    <span class="block text-slate-500">{item.kode_j}</span>
                  </td>
                  <td class="border border-slate-300 p-2">{item.rele_kerja}</td>
                  <td class="border border-slate-300 p-2">{item.cuaca}</td>
                  <td class="border border-slate-300 p-2 font-semibold {item.status_tp === 'Trip' ? 'text-red-600' : 'text-slate-800'}">
                    {item.status_tp}
                  </td>
                  <td class="border border-slate-300 p-2">{item.keterangan || '-'}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <!-- Photo Grid -->
        <div class="flex-grow grid grid-cols-4 gap-4 auto-rows-fr">
          {#each items as item}
            {#if item.path_foto_1 || item.path_foto_2}
              <div class="border border-slate-200 rounded-lg p-2 bg-slate-50 flex flex-col h-full object-contain overflow-hidden">
                <span class="inline-block px-2 py-1 bg-pln-blue text-white text-[10px] font-bold rounded mb-2 self-start">No: {item.no_urut}</span>
                <div class="flex gap-2 w-full h-full pb-4">
                  {#if item.path_foto_1}
                    <div class="flex-1 rounded border border-slate-200 overflow-hidden relative group h-full">
                      <img src={item.path_foto_1} alt="Eviden Sebelum - No {item.no_urut}" class="w-full h-full object-cover">
                      <div class="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] p-1 text-center font-medium">Sebelum</div>
                    </div>
                  {/if}
                  {#if item.path_foto_2}
                    <div class="flex-1 rounded border border-slate-200 overflow-hidden relative group h-full">
                      <img src={item.path_foto_2} alt="Eviden Sesudah - No {item.no_urut}" class="w-full h-full object-cover">
                      <div class="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] p-1 text-center font-medium">Sesudah</div>
                    </div>
                  {/if}
                </div>
              </div>
            {/if}
          {/each}
        </div>

      </div>
    </div>
  {/each}
{/if}
