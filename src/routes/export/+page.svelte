<script lang="ts">
  import type { PageData } from './$types';
  import { FileText, Download, AlertTriangle } from 'lucide-svelte';
  let { data: pageData }: { data: PageData } = $props();
  
  let startDate = $state('');
  let endDate = $state('');
  
  const dates = $derived(
    Object.keys(pageData.jurnalByDate)
      .filter(dateStr => {
        // String comparison is much safer for YYYY-MM-DD
        return (!startDate || dateStr >= startDate) && (!endDate || dateStr <= endDate);
      })
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()) // Ascending order for report
  );
  
  let isGenerating = $state(false);

  async function handleExport() {
    if (dates.length === 0) {
      alert('Pilih rentang tanggal yang berisi data terlebih dahulu.');
      return;
    }
    isGenerating = true;
    try {
      const PptxGenJS = (await import('pptxgenjs')).default;
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9';
      const origin = window.location.origin;

      const fmtDate = (dStr: string) => {
        const d = new Date(dStr);
        return isNaN(d.getTime()) ? "-" : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
      };

      const startFmt = startDate ? fmtDate(startDate).replace(/ /g, '_') : 'Awal';
      const endFmt = endDate ? fmtDate(endDate).replace(/ /g, '_') : 'Akhir';
      const fileName = `Realisasi_Gangguan_${startFmt}_sd_${endFmt}.pptx`;
      const logoPLN = "https://upload.wikimedia.org/wikipedia/commons/9/97/Logo_PLN.png";

      // --- 1. SLIDE PEMBUKA ---
      const openingSlide = pptx.addSlide();
      openingSlide.background = { color: '005F9E' }; 
      openingSlide.addShape("rect", { x: 0.0, y: 0.0, w: '100%', h: 0.1, fill: { color: 'FFD600' } }); 
      openingSlide.addShape("rect", { x: 8.0, y: 5.0, w: 3.0, h: 3.0, fill: { color: 'FFFFFF', transparency: 90 }, rotate: 45 });
      openingSlide.addText("UP3 MADURA", { x: 0.6, y: 3.2, fontSize: 44, bold: true, color: 'FFFFFF' });
      openingSlide.addText("REALISASI GANGGUAN", { x: 0.6, y: 4.1, fontSize: 44, bold: true, color: 'FFFFFF' });
      openingSlide.addText(`PERIODE ${startDate ? fmtDate(startDate) : ""} sd ${endDate ? fmtDate(endDate) : ""}`, { x: 0.6, y: 5.0, fontSize: 16, bold: true, color: 'FFFFFF' });
      try { openingSlide.addImage({ path: logoPLN, x: 8.8, y: 0.3, w: 0.8, h: 1.0 }); } catch (e) {}

      // --- 2. SLIDE DATA (HARIAN + PAGINATION) ---
      let globalSlideNum = 2;
      for (const date of dates) {
        const allItems = pageData.jurnalByDate[date];
        
        // Chunk items into groups of 5
        for (let i = 0; i < allItems.length; i += 5) {
          const chunk = allItems.slice(i, i + 5);
          const slide = pptx.addSlide();
          
          // Header Logos
          try {
            // Using the logo from static/images/ (User needs to put the file there)
            slide.addImage({ path: origin + "/images/logo_danantara.png", x: 0.3, y: 0.1, w: 1.8, h: 0.6 });
            slide.addImage({ path: logoPLN, x: 9.0, y: 0.1, w: 0.5, h: 0.7 });
          } catch (e) {
            slide.addText("Danantara Indonesia", { x: 0.3, y: 0.15, fontSize: 16, bold: true, color: '333333' });
          }

          // Combined Title & Period Bar (ONE UNIT)
          slide.addShape("rect", { x: 0.0, y: 0.8, w: '65%', h: 0.8, fill: { color: '2E7D7A' } });
          slide.addText("REALISASI GANGGUAN", { x: 0.3, y: 0.85, w: 6, fontSize: 24, bold: true, color: 'FFFFFF', align: 'left', margin: 5 });
          slide.addText(`Periode ${fmtDate(date)}`, { x: 0.3, y: 1.25, w: 6, fontSize: 11, bold: true, color: 'FFFFFF', align: 'left', margin: 5 });

          // Table (Moved UP to meet the bar)
          const rows: any[] = [];
          rows.push([
            { text: "NO", options: { bold: true, fill: 'A50000', color: 'FFFFFF', align: 'center', fontSize: 9 } },
            { text: "PENYULANG", options: { bold: true, fill: 'A50000', color: 'FFFFFF', align: 'center', fontSize: 9 } },
            { text: "NAMA PROTEKSI", options: { bold: true, fill: 'A50000', color: 'FFFFFF', align: 'center', fontSize: 9 } },
            { text: "KODE J", options: { bold: true, fill: 'A50000', color: 'FFFFFF', align: 'center', fontSize: 9 } },
            { text: "TGL Trip", options: { bold: true, fill: 'A50000', color: 'FFFFFF', align: 'center', fontSize: 9 } },
            { text: "RELE KERJA", options: { bold: true, fill: 'A50000', color: 'FFFFFF', align: 'center', fontSize: 9 } },
            { text: "CUACA", options: { bold: true, fill: 'A50000', color: 'FFFFFF', align: 'center', fontSize: 9 } },
            { text: "T/P", options: { bold: true, fill: 'A50000', color: 'FFFFFF', align: 'center', fontSize: 9 } },
            { text: "KETERANGAN", options: { bold: true, fill: 'A50000', color: 'FFFFFF', align: 'center', fontSize: 9 } }
          ]);

          chunk.forEach((item, idx) => {
            rows.push([
              { text: String(i + idx + 1), options: { fontSize: 8, align: 'center' } },
              { text: item.penyulang, options: { fontSize: 8, align: 'center' } },
              { text: item.nama_proteksi, options: { fontSize: 8, align: 'center' } },
              { text: item.kode_j, options: { fontSize: 8, align: 'center' } },
              { text: item.tgl_trip, options: { fontSize: 8, align: 'center' } },
              { text: item.rele_kerja, options: { fontSize: 8, align: 'center' } },
              { text: item.cuaca, options: { fontSize: 8, align: 'center' } },
              { text: item.status_tp === 'Permanent' ? 'P' : 'T', options: { fontSize: 8, align: 'center' } },
              { text: item.keterangan || "-", options: { fontSize: 8 } }
            ]);
          });

          slide.addTable(rows, { x: 0.1, y: 1.62, w: 9.8, colW: [0.4, 1.0, 1.2, 1.3, 1.0, 0.8, 0.8, 0.4, 2.9], border: { type: 'solid', color: '999999', pt: 0.5 } });

          // Photos Grid (Landscape proportion)
          let picX = 0.25;
          let picY = 1.62 + (rows.length * 0.4) + 0.3;
          
          chunk.forEach((item, idx) => {
            if (item.path_foto_1 || item.path_foto_2) {
              const startX = picX;
              if (item.path_foto_1) {
                try { slide.addImage({ path: origin + item.path_foto_1, x: startX, y: picY, w: 0.8, h: 1.1, sizing: { type: 'cover' }, border: { color: '2E7D7A', pt: 1 } }); } catch (e) {}
              }
              if (item.path_foto_2) {
                try { slide.addImage({ path: origin + item.path_foto_2, x: startX + 0.82, y: picY, w: 0.8, h: 1.1, sizing: { type: 'cover' }, border: { color: '2E7D7A', pt: 1 } }); } catch (e) {}
              }
              
              const labelText = `${i + idx + 1}. ${item.keterangan || item.penyulang}`;
              slide.addText(labelText.substring(0, 30) + (labelText.length > 30 ? '...' : ''), { 
                x: startX, y: picY + 1.15, w: 1.62, h: 0.3, fontSize: 6, bold: true, align: 'center', 
                fill: { color: '005F9E' }, color: 'FFFFFF', margin: 2 
              });
            }
            picX += 1.95;
          });

          // Footer
          slide.addText(`www.pln.co.id | ${globalSlideNum++}`, { x: 8.0, y: 7.2, w: 1.8, fontSize: 9, align: 'right', color: '005F9E', bold: true });
          slide.addShape("rect", { x: 0.0, y: 7.5, w: '100%', h: 0.01, fill: { color: 'EFEFEF' } });
        }
      }

      // --- 3. SLIDE PENUTUP ---
      const closingSlide = pptx.addSlide();
      closingSlide.addText("Danantara Indonesia", { x: 3.0, y: 3.2, fontSize: 24, bold: true, color: '333333' });
      closingSlide.addText("|", { x: 5.5, y: 3.2, fontSize: 32, color: 'CCCCCC' });
      try { closingSlide.addImage({ path: logoPLN, x: 5.8, y: 2.7, w: 0.8, h: 1.1 }); } catch (e) {}

      await pptx.writeFile({ fileName });

    } catch (err: any) {
      console.error('PPT Export Error:', err);
      alert('Gagal Export: ' + (err.message || 'Kesalahan sistem'));
    } finally {
      isGenerating = false;
    }
  }

</script>

<svelte:head>
  <title>Export Data | SIM-GPD</title>
</svelte:head>

<div class="mb-10 flex justify-between items-center">
  <div class="flex items-center gap-6">
    <div class="flex items-center gap-4">
      <div class="bg-pln-teal p-3 rounded-2xl shadow-lg">
        <FileText class="text-white" size={32} />
      </div>
      <div>
        <h2 class="text-2xl font-black text-pln-navy leading-none uppercase tracking-tighter">Export Laporan Digital</h2>
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Otomatisasi pembuatan slide presentasi harian</p>
      </div>
    </div>
  </div>
  <div class="bg-pln-yellow p-4 rounded-xl shadow-xl flex items-center gap-3 border-2 border-white">
    <p class="text-pln-navy font-black text-xs uppercase tracking-tighter">Format PPTX High Quality</p>
  </div>
</div>

<div class="bg-white rounded-3xl shadow-xl border border-slate-50 p-12 max-w-2xl mx-auto text-center flex flex-col items-center transition-all hover:shadow-2xl">
  
  <div class="w-24 h-24 rounded-3xl bg-pln-teal/10 flex items-center justify-center mb-8 border-2 border-pln-teal/5 shadow-inner">
    <FileText size={48} class="text-pln-teal" />
  </div>

  <h3 class="text-2xl font-black text-pln-navy mb-4 uppercase tracking-tight">DATA SIAP DI-EXPORT</h3>
  
  <!-- Date Range Selector -->
  <div class="mb-10 w-full max-w-md bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col gap-4">
    <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Tentukan Rentang Laporan</p>
    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col text-left gap-1">
        <label class="text-[9px] font-black text-pln-navy uppercase ml-2">Mulai</label>
        <input type="date" bind:value={startDate} class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-pln-teal/20 focus:border-pln-teal transition-all">
      </div>
      <div class="flex flex-col text-left gap-1">
        <label class="text-[9px] font-black text-pln-navy uppercase ml-2">Selesai</label>
        <input type="date" bind:value={endDate} class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-pln-teal/20 focus:border-pln-teal transition-all">
      </div>
    </div>
  </div>

  <p class="text-slate-500 mb-10 max-w-sm font-medium leading-relaxed">Data akan dirangkum otomatis menjadi <strong class="text-pln-teal">{dates.length} Slide</strong> untuk periode yang dipilih.</p>

  <button 
    onclick={handleExport} 
    disabled={isGenerating || dates.length === 0}
    class="flex items-center gap-4 bg-pln-teal hover:bg-pln-teal-dark transition-all duration-300 text-white px-12 py-5 rounded-2xl font-black text-xs shadow-xl shadow-pln-teal/20 disabled:opacity-50 hover:-translate-y-1 active:translate-y-0 uppercase tracking-widest"
  >
    {#if isGenerating}
      <div class="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
      MENYUSUN LAPORAN...
    {:else}
      <Download size={22} /> DOWNLOAD FILE PPTX
    {/if}
  </button>
  
  {#if dates.length === 0}
    <div class="mt-8 text-orange-500 text-[10px] font-black uppercase tracking-widest bg-orange-50 px-6 py-3 rounded-xl border border-orange-100 flex items-center gap-3">
      <AlertTriangle size={18} /> Tidak ada data gangguan untuk di-export saat ini.
    </div>
  {/if}
</div>
