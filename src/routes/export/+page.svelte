<script lang="ts">
  import type { PageData } from './$types';
  import { FileText, Download, AlertTriangle } from 'lucide-svelte';
  let { data: pageData }: { data: PageData } = $props();
  
  let startDate = $state('');
  let endDate = $state('');
  
  const dates = $derived(
    Object.keys(pageData.jurnalByDate)
      .filter(dateStr => {
        return (!startDate || dateStr >= startDate) && (!endDate || dateStr <= endDate);
      })
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
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
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
      };

      const startFmt = startDate ? fmtDate(startDate).replace(/ /g, '_') : 'Awal';
      const endFmt = endDate ? fmtDate(endDate).replace(/ /g, '_') : 'Akhir';
      const fileName = `Realisasi_Gangguan_${startFmt}_sd_${endFmt}.pptx`;
      const logoPLN = "https://upload.wikimedia.org/wikipedia/commons/9/97/Logo_PLN.png";

      // --- 1. SLIDE PEMBUKA (STABLE TEAL DESIGN) ---
      const openingSlide = pptx.addSlide();
      openingSlide.background = { color: '005F9E' }; 
      openingSlide.addShape("rect", { x: 0.0, y: 0.0, w: '100%', h: 0.1, fill: { color: 'FFD600' } }); 
      
      try {
        // Logo PLN Only
        openingSlide.addImage({ path: logoPLN, x: 8.8, y: 0.3, w: 0.8, h: 1.0, sizing: { type: 'contain' } });
      } catch (e) {}

      openingSlide.addText("UP3 MADURA", { x: 0.6, y: 2.5, fontSize: 36, bold: true, color: 'FFFFFF', fontFace: 'Arial' });
      openingSlide.addText("REALISASI GANGGUAN", { x: 0.6, y: 3.2, fontSize: 44, bold: true, color: 'FFFFFF', fontFace: 'Arial' });
      openingSlide.addText(`PERIODE ${startDate ? fmtDate(startDate) : ""} sd ${endDate ? fmtDate(endDate) : ""}`, { 
        x: 0.6, y: 4.2, fontSize: 14, bold: true, color: 'FFFFFF', italic: true, fontFace: 'Arial'
      });

      // --- 2. SLIDE DATA (STABLE TEAL DESIGN) ---
      let globalSlideNum = 2;
      for (const date of dates) {
        const allItems = pageData.jurnalByDate[date];
        for (let i = 0; i < allItems.length; i += 5) {
          const chunk = allItems.slice(i, i + 5);
          const slide = pptx.addSlide();
          slide.background = { color: 'FFFFFF' };

          // Header Logo PLN Only (Top Right)
          try {
            slide.addImage({ path: logoPLN, x: 9.3, y: 0.1, w: 0.5, h: 0.6, sizing: { type: 'contain' } });
          } catch (e) {}

          // Title Bar (Teal Box)
          slide.addShape("rect", { x: 0.0, y: 0.8, w: 6.5, h: 0.7, fill: { color: '2E7D7A' } });
          slide.addText("REALISASI GANGGUAN", { x: 0.3, y: 0.85, w: 6, fontSize: 20, bold: true, color: 'FFFFFF', align: 'left' });
          slide.addText(`Periode ${fmtDate(date)}`, { x: 0.3, y: 1.15, w: 6, fontSize: 9, bold: true, color: 'FFFFFF', align: 'left' });

          // Table
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

          slide.addTable(rows, { 
            x: 0.1, y: 1.6, w: 9.8, 
            colW: [0.4, 1.0, 1.2, 1.3, 1.0, 0.8, 0.8, 0.4, 2.9], 
            border: { type: 'solid', color: '999999', pt: 0.5 },
            rowH: 0.35
          });

          // Photos Grid
          let picX = 0.25;
          let picY = 1.6 + (rows.length * 0.35) + 0.25;
          
          chunk.forEach((item, idx) => {
            if (item.path_foto_1 || item.path_foto_2) {
              const startX = picX;
              if (item.path_foto_1) {
                try { slide.addImage({ path: origin + item.path_foto_1, x: startX, y: picY, w: 0.8, h: 1.0, sizing: { type: 'cover' }, border: { color: '2E7D7A', pt: 1 } }); } catch (e) {}
              }
              if (item.path_foto_2) {
                try { slide.addImage({ path: origin + item.path_foto_2, x: startX + 0.82, y: picY, w: 0.8, h: 1.0, sizing: { type: 'cover' }, border: { color: '2E7D7A', pt: 1 } }); } catch (e) {}
              }
              const labelText = `${i + idx + 1}. ${item.penyulang}`;
              slide.addText(labelText.substring(0, 25), { 
                x: startX, y: picY + 1.05, w: 1.62, h: 0.25, fontSize: 7, bold: true, align: 'center', 
                fill: { color: '005F9E' }, color: 'FFFFFF'
              });
            }
            picX += 1.95;
          });

          // Footer
          slide.addText(`www.pln.co.id | ${globalSlideNum++}`, { 
            x: 8.0, y: 5.3, w: 1.8, fontSize: 8, align: 'right', color: '005F9E', bold: true 
          });
        }
      }

      // --- 3. SLIDE PENUTUP ---
      const closingSlide = pptx.addSlide();
      closingSlide.background = { color: '005F9E' };
      closingSlide.addText("TERIMA KASIH", { x: 0, y: 2.2, w: '100%', fontSize: 48, bold: true, color: 'FFFFFF', align: 'center' });

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
</div>

<div class="bg-white rounded-3xl shadow-xl border border-slate-50 p-12 max-w-2xl mx-auto text-center flex flex-col items-center">
  <h3 class="text-2xl font-black text-pln-navy mb-4 uppercase tracking-tight">SIAP EXPORT LAPORAN</h3>
  
  <div class="mb-10 w-full max-w-md bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col gap-4">
    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col text-left gap-1">
        <label class="text-[9px] font-black text-pln-navy uppercase ml-2">Mulai</label>
        <input type="date" bind:value={startDate} class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none">
      </div>
      <div class="flex flex-col text-left gap-1">
        <label class="text-[9px] font-black text-pln-navy uppercase ml-2">Selesai</label>
        <input type="date" bind:value={endDate} class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none">
      </div>
    </div>
  </div>

  <button 
    onclick={handleExport} 
    disabled={isGenerating || dates.length === 0}
    class="flex items-center gap-4 bg-pln-teal hover:bg-pln-teal-dark text-white px-12 py-5 rounded-2xl font-black text-xs shadow-xl disabled:opacity-50 uppercase tracking-widest"
  >
    {#if isGenerating}
      MENYUSUN...
    {:else}
      <Download size={22} /> DOWNLOAD FILE PPTX
    {/if}
  </button>
</div>
