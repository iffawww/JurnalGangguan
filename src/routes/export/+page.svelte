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
  
  const estimatedSlides = $derived.by(() => {
    if (dates.length === 0) return 0;
    let count = 2; // Slide Pembuka + Slide Penutup
    dates.forEach(d => {
      const len = pageData.jurnalByDate[d]?.length || 0;
      count += Math.ceil(len / 4); // Maksimal 4 item per slide
    });
    return count;
  });

  const totalItems = $derived.by(() => {
    return dates.reduce((sum, d) => sum + (pageData.jurnalByDate[d]?.length || 0), 0);
  });

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

      // --- 1. SLIDE PEMBUKA (CUSTOM DESIGN) ---
      const openingSlide = pptx.addSlide();
      openingSlide.background = { color: 'FFFFFF' }; 
      openingSlide.transition = { type: 'fade', speed: 'fast' };
      
      // 1. Gambar Gardu (Kiri) + Efek Memudar (Transparan)
      try { openingSlide.addImage({ path: origin + '/assets/bg_gardu.jpg', x: 0, y: 0, w: 5.5, h: 5.625, sizing: { type: 'cover' } }); } catch (e) {}
      openingSlide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 5.5, h: 5.625, fill: { color: 'FFFFFF', transparency: 30 } });

      // 2. Gambar Gedung (Kanan) - Menggunakan versi yang sudah dicut miring transparan
      try { openingSlide.addImage({ path: origin + '/assets/bg_gedung_cut.png', x: 4.5, y: 0, w: 5.5, h: 5.625, sizing: { type: 'cover' } }); } catch (e) {}

      // 3. Garis Miring (Pemisah) - Lebar sama rata, sejajar dengan potongan gambar
      // Garis Putih
      openingSlide.addShape(pptx.shapes.LINE, { x: 4.2, y: 0, w: 0.5625, h: 5.625, line: { color: 'FFFFFF', width: 8 }, flipH: true });
      // Garis Kuning
      openingSlide.addShape(pptx.shapes.LINE, { x: 4.35, y: 0, w: 0.5625, h: 5.625, line: { color: 'FFD600', width: 8 }, flipH: true });
      // Garis Biru
      openingSlide.addShape(pptx.shapes.LINE, { x: 4.5, y: 0, w: 0.5625, h: 5.625, line: { color: '0020C2', width: 8 }, flipH: true });

      // 4. Logo PLN (Kiri Atas) - Diperbaiki proporsinya agar tidak penyok (Rasio ~3:4)
      try {
        openingSlide.addImage({ path: logoPLN, x: 0.5, y: 0.3, w: 0.75, h: 1.0 });
      } catch (e) {}

      // 5. Teks Judul
      openingSlide.addText("UP3", { x: 0.5, y: 1.8, fontSize: 56, bold: true, color: '1C2A3A', fontFace: 'Arial Black' });
      openingSlide.addText("MADURA", { x: 0.5, y: 2.6, fontSize: 56, bold: true, color: '0020C2', fontFace: 'Arial Black' });
      openingSlide.addText("REALISASI", { x: 0.5, y: 3.4, fontSize: 32, bold: true, color: '1C2A3A', fontFace: 'Arial Black' });
      openingSlide.addText("GANGGUAN", { x: 0.5, y: 3.9, fontSize: 32, bold: true, color: '1C2A3A', fontFace: 'Arial Black' });
      
      const pTgl = `PERIODE ${startDate ? fmtDate(startDate) : ""} sd ${endDate ? fmtDate(endDate) : ""}`;
      openingSlide.addText(pTgl.toUpperCase(), { 
        x: 0.5, y: 4.6, fontSize: 12, bold: true, color: '1C2A3A', fontFace: 'Arial'
      });

      // --- 2. SLIDE DATA (STABLE TEAL DESIGN) ---
      let globalSlideNum = 2;
      for (const date of dates) {
        const allItems = pageData.jurnalByDate[date];
        for (let i = 0; i < allItems.length; i += 4) {
          const chunk = allItems.slice(i, i + 4);
          const slide = pptx.addSlide();
          slide.background = { color: 'FFFFFF' };
          slide.transition = { type: 'fade', speed: 'fast' };
          
          // Header Logo PLN Only (Top Right)
          try {
            slide.addImage({ path: logoPLN, x: 9.3, y: 0.1, w: 0.52, h: 0.7 });
          } catch (e) {}

          // Danantara Logo (Kiri Atas, proporsi disesuaikan agar tidak terlalu memanjang)
          try {
            slide.addImage({ path: origin + '/assets/logo_danantara.png', x: 0.1, y: 0.15, w: 1.2, h: 0.45 });
          } catch (e) {}

          // Title Bar (Di bawah gambar Danantara, digeser ke atas sedikit)
          slide.addShape("rect", { x: 0.1, y: 0.6, w: 4.5, h: 0.45, fill: { color: '0020C2' } });
          slide.addShape(pptx.shapes.RIGHT_TRIANGLE, { x: 4.6, y: 0.6, w: 0.2, h: 0.45, fill: { color: '0020C2' } });
          slide.addShape("rect", { x: 0.1, y: 1.05, w: 4.7, h: 0.05, fill: { color: 'FFD600' } });
          slide.addText("REALISASI GANGGUAN", { x: 0.3, y: 0.7, w: 4.3, fontSize: 16, bold: true, color: 'FFFFFF', align: 'left' });
          slide.addText(`Periode ${fmtDate(date)}`, { x: 0.3, y: 0.9, w: 4.3, fontSize: 8, bold: true, color: 'FFFFFF', align: 'left' });

          // Table
          const rows: any[] = [];
          rows.push([
            { text: "NO", options: { bold: true, fill: '005F9E', color: 'FFFFFF', align: 'center', fontSize: 9 } },
            { text: "ULP", options: { bold: true, fill: '005F9E', color: 'FFFFFF', align: 'center', fontSize: 9 } },
            { text: "PENYULANG", options: { bold: true, fill: '005F9E', color: 'FFFFFF', align: 'center', fontSize: 9 } },
            { text: "NAMA PROTEKSI", options: { bold: true, fill: '005F9E', color: 'FFFFFF', align: 'center', fontSize: 9 } },
            { text: "KODE J", options: { bold: true, fill: '005F9E', color: 'FFFFFF', align: 'center', fontSize: 9 } },
            { text: "TGL Trip", options: { bold: true, fill: '005F9E', color: 'FFFFFF', align: 'center', fontSize: 9 } },
            { text: "RELE KERJA", options: { bold: true, fill: '005F9E', color: 'FFFFFF', align: 'center', fontSize: 9 } },
            { text: "CUACA", options: { bold: true, fill: '005F9E', color: 'FFFFFF', align: 'center', fontSize: 9 } },
            { text: "P/T", options: { bold: true, fill: '005F9E', color: 'FFFFFF', align: 'center', fontSize: 9 } },
            { text: "KETERANGAN", options: { bold: true, fill: '005F9E', color: 'FFFFFF', align: 'center', fontSize: 9 } }
          ]);

          chunk.forEach((item, idx) => {
            rows.push([
              { text: String(i + idx + 1), options: { fontSize: 8, align: 'center' } },
              { text: item.ulp, options: { fontSize: 8, align: 'center' } },
              { text: item.penyulang, options: { fontSize: 8, align: 'center' } },
              { text: item.nama_proteksi, options: { fontSize: 8, align: 'center', color: item.nama_proteksi === 'PMT' ? 'FF0000' : undefined, bold: item.nama_proteksi === 'PMT' } },
              { text: item.kode_j, options: { fontSize: 8, align: 'center' } },
              { text: item.tgl_trip, options: { fontSize: 8, align: 'center' } },
              { text: item.rele_kerja, options: { fontSize: 8, align: 'center' } },
              { text: item.cuaca, options: { fontSize: 8, align: 'center' } },
              { text: item.status_tp === 'Permanent' ? 'P' : 'T', options: { fontSize: 8, align: 'center' } },
              { text: item.keterangan || "-", options: { fontSize: 8 } }
            ]);
          });

          slide.addTable(rows, { 
            x: 0.1, y: 1.2, w: 9.8, 
            colW: [0.4, 0.8, 1.0, 1.1, 1.1, 1.0, 0.8, 0.8, 0.4, 2.4], 
            border: { type: 'solid', color: '999999', pt: 0.5 },
            rowH: 0.28
          });

          // Hitung estimasi tinggi tabel agar posisi foto dinamis
          let estimatedTableHeight = 0.35; // Tinggi header
          chunk.forEach((item) => {
            const ketLength = (item.keterangan || "-").length;
            const lines = Math.ceil(Math.max(ketLength, 1) / 40); // Estimasi 40 karakter per baris
            const rowHeight = Math.max(0.28, lines * 0.15); // Minimal 0.28, bertambah sesuai jumlah baris
            estimatedTableHeight += rowHeight;
          });

          // Photos Grid (Dinamis mengikuti tinggi tabel)
          let picX = 0.1;
          let picY = 1.2 + estimatedTableHeight + 0.25; // Mulai Y tabel + Tinggi Tabel + Jarak Margin
          
          chunk.forEach((item, idx) => {
            const startX = picX;
            let ket = item.keterangan || "-";
            let labelText = `${i + idx + 1}. ${ket}`;
            
            if (item.path_foto_1) {
              try { slide.addImage({ path: origin + item.path_foto_1, x: startX, y: picY, w: 1.15, h: 1.6, sizing: { type: 'cover' }, border: { color: '005F9E', pt: 1 } }); } catch (e) {}
            } else {
              slide.addShape("rect", { x: startX, y: picY, w: 1.15, h: 1.6, fill: { color: 'F1F5F9' }, border: { color: 'CBD5E1', pt: 1, type: 'dash' } });
              slide.addText("Belum Ada Eviden", { x: startX, y: picY, w: 1.15, h: 1.6, fontSize: 6, color: '94A3B8', align: 'center', valign: 'middle', bold: true });
            }

            if (item.path_foto_2) {
              try { slide.addImage({ path: origin + item.path_foto_2, x: startX + 1.2, y: picY, w: 1.15, h: 1.6, sizing: { type: 'cover' }, border: { color: '005F9E', pt: 1 } }); } catch (e) {}
            } else {
              slide.addShape("rect", { x: startX + 1.2, y: picY, w: 1.15, h: 1.6, fill: { color: 'F1F5F9' }, border: { color: 'CBD5E1', pt: 1, type: 'dash' } });
              slide.addText("Belum Ada Eviden", { x: startX + 1.2, y: picY, w: 1.15, h: 1.6, fontSize: 6, color: '94A3B8', align: 'center', valign: 'middle', bold: true });
            }
            
            slide.addText(labelText, { 
              x: startX, y: picY + 1.65, w: 2.35, h: 0.6, fontSize: 7, bold: true, align: 'center', valign: 'middle',
              fill: { color: '005F9E' }, color: 'FFFFFF', wrap: true
            });
            
            picX += 2.45;
          });

          // Footer
          slide.addText(`www.pln.co.id | ${globalSlideNum++}`, { 
            x: 8.0, y: 5.3, w: 1.8, fontSize: 8, align: 'right', color: '005F9E', bold: true 
          });
        }
      }

      // --- 3. SLIDE PENUTUP ---
      const closingSlide = pptx.addSlide();
      closingSlide.background = { color: 'FFFFFF' };
      closingSlide.transition = { type: 'fade', speed: 'fast' };
      
      // 1. Gambar Gardu (Full Screen) + Efek Memudar (Transparan)
      try { closingSlide.addImage({ path: origin + '/assets/bg_gardu.jpg', x: 0, y: 0, w: 10.0, h: 5.625, sizing: { type: 'cover' } }); } catch (e) {}
      closingSlide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 10.0, h: 5.625, fill: { color: 'FFFFFF', transparency: 50 } });

      // 2. Logo PLN (Kiri Atas)
      try { closingSlide.addImage({ path: logoPLN, x: 0.3, y: 0.3, w: 0.75, h: 1.0 }); } catch (e) {}

      // 3. Teks Tengah
      closingSlide.addText("TERIMA", { x: 0, y: 2.0, w: 10.0, fontSize: 72, bold: true, color: '1C2A3A', fontFace: 'Arial Black', align: 'center' });
      closingSlide.addText("KASIH", { x: 0, y: 2.9, w: 10.0, fontSize: 72, bold: true, color: '0020C2', fontFace: 'Arial Black', align: 'center' });
      closingSlide.addText("PLN UP3 MADURA", { x: 0, y: 3.8, w: 10.0, fontSize: 16, bold: true, color: '1C2A3A', fontFace: 'Arial', align: 'center' });

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
    
    {#if startDate && endDate}
      {#if dates.length > 0}
        <div class="mt-6 flex flex-col items-center gap-2 py-4 border-t border-slate-200">
          <div class="text-center">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estimasi Hasil Laporan</p>
            <p class="text-sm font-bold text-pln-teal">{estimatedSlides} Slide Presentasi</p>
          </div>
        </div>
      {:else}
        <div class="mt-6 flex flex-col items-center gap-2 py-4 border-t border-slate-200">
          <div class="text-center flex flex-col items-center gap-2">
            <div class="bg-red-50 p-2 rounded-full text-red-500">
               <AlertTriangle size={20} />
            </div>
            <p class="text-[10px] font-black text-red-500 uppercase tracking-widest">Tidak ada data gangguan</p>
            <p class="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Silakan pilih rentang tanggal lain</p>
          </div>
        </div>
      {/if}
    {/if}
  </div>

  <button 
    onclick={handleExport} 
    disabled={isGenerating || dates.length === 0}
    class="flex items-center gap-4 bg-pln-teal hover:bg-pln-teal-dark text-white px-12 py-5 rounded-2xl font-black text-xs shadow-xl disabled:opacity-50 uppercase tracking-widest {isGenerating ? 'animate-pulse cursor-wait' : ''}"
  >
    {#if isGenerating}
      <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      MENYUSUN...
    {:else}
      <Download size={22} /> DOWNLOAD FILE PPTX
    {/if}
  </button>
</div>
