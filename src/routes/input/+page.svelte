<script lang="ts">
  import { enhance } from '$app/forms';
  import imageCompression from 'browser-image-compression';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { UploadCloud, CheckCircle, Save, AlertCircle, FileText } from 'lucide-svelte';

  let { form }: { form: any } = $props();
  let isSubmitting = $state(false);
  let file1Temp: File | null = $state(null);
  let file2Temp: File | null = $state(null);

  const todayStr = new Date().toISOString().split('T')[0];
  let inputDate = $state(todayStr);

  async function handleDropOrSelect(event: Event | DragEvent, setFile: (file: File) => void) {
    let file: File | null = null;

    if (event.type === 'drop') {
      event.preventDefault();
      const e = event as DragEvent;
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        file = e.dataTransfer.files[0];
      }
    } else {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files[0]) {
        file = input.files[0];
      }
    }

    if (file) {
      if (!file.type.startsWith('image/')) return;
      const options = { maxSizeMB: 0.28, maxWidthOrHeight: 1280, useWebWorker: true };
      try {
        const compressed = await imageCompression(file, options);
        setFile(compressed);
      } catch (err) {
        console.error('Error compressing', err);
      }
    }
  }

  const submitAction: SubmitFunction = ({ formData }) => {
    isSubmitting = true;
    if (file1Temp) formData.set('foto1', file1Temp, file1Temp.name);
    else formData.delete('foto1');
    if (file2Temp) formData.set('foto2', file2Temp, file2Temp.name);
    else formData.delete('foto2');

    return async ({ update }) => {
      isSubmitting = false;
      file1Temp = null;
      file2Temp = null;
      update();
    };
  };

  const ulpList = ['Bangkalan', 'Kamal', 'Blega', 'Sampang', 'Ketapang', 'Waru', 'Pamekasan', 'Sumenep', 'Ambunten', 'Arjasa'];
  const giList = ['Gili Timur', 'Bangkalan', 'Sampang', 'Pamekasan', 'Sumenep', 'Guluk-Guluk'];
</script>

<svelte:head>
  <title>Input Gangguan | SIM-GPD</title>
</svelte:head>

<div class="mb-8 flex justify-between items-center">
  <div class="flex items-center gap-6">
    <div class="flex items-center gap-3">
      <img src="https://upload.wikimedia.org/wikipedia/commons/9/97/Logo_PLN.png" alt="Logo PLN" class="h-12 w-auto filter drop-shadow-sm">
      <div class="h-10 w-0.5 bg-slate-200"></div>
      <div>
        <h1 class="text-3xl font-black text-pln-navy leading-none uppercase tracking-tighter">SIM-GPD</h1>
        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Sistem Monitoring Gangguan & Pelaporan Digital</p>
      </div>
    </div>
  </div>
  <a href="/export" class="bg-pln-yellow hover:bg-[#ffe000] p-4 rounded-xl shadow-xl flex items-center gap-4 border-2 border-white transition-all hover:-translate-y-1 group">
    <div class="bg-black/5 p-2 rounded-lg group-hover:bg-black/10 transition-colors">
      <FileText class="text-pln-navy" size={24} />
    </div>
    <div class="text-left">
      <p class="text-pln-navy font-black text-sm uppercase leading-none">Generate PPT</p>
      <p class="text-pln-navy/60 font-bold text-[10px] uppercase mt-1">(Daily / Weekly)</p>
    </div>
  </a>
</div>

<div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
  <div class="p-8 border-b border-slate-50 flex items-center gap-3 bg-slate-50/30">
    <div class="w-10 h-10 bg-pln-teal/10 rounded-lg flex items-center justify-center">
      <FileText class="text-pln-teal" size={24} />
    </div>
    <div>
      <h3 class="text-xl font-black text-pln-teal">Form Input Gangguan</h3>
      <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lengkapi data gangguan. Foto dapat diunggah menyusul (opsional).</p>
    </div>
  </div>

  <form method="POST" action="?/create" use:enhance={submitAction} enctype="multipart/form-data" class="p-8 space-y-12 bg-slate-50/20">
    {#if form?.error}
      <div class="bg-red-50 border-2 border-red-100 p-6 rounded-2xl flex items-center gap-4 text-red-600 animate-in fade-in slide-in-from-top-4 duration-500">
        <div class="bg-red-100 p-2 rounded-lg">
          <AlertCircle size={24} />
        </div>
        <div>
          <p class="text-xs font-black uppercase tracking-widest leading-none mb-1">Terjadi Kesalahan</p>
          <p class="text-sm font-bold">{form.error}</p>
        </div>
      </div>
    {/if}

    <!-- SECTION 1: LOKASI & UNIT -->
    <div class="space-y-6">
      <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
        <div class="w-2 h-6 bg-pln-navy rounded-full"></div>
        <h4 class="text-xs font-black text-pln-navy uppercase tracking-widest">Bagian 1: Lokasi & Unit Kerja</h4>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="ulp" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Unit Layanan Pelanggan (ULP)</label>
          <select name="ulp" id="ulp" required class="block w-full rounded-2xl bg-white border-slate-200 text-slate-800 shadow-sm focus:border-pln-teal focus:ring-4 focus:ring-pln-teal/10 p-4 transition-all outline-none font-bold">
            <option value="" disabled selected>Pilih ULP</option>
            {#each ulpList as u}
              <option value={u}>{u}</option>
            {/each}
          </select>
        </div>

        <div>
          <label for="gi" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Gardu Induk (GI)</label>
          <select name="gi" id="gi" required class="block w-full rounded-2xl bg-white border-slate-200 text-slate-800 shadow-sm focus:border-pln-teal focus:ring-4 focus:ring-pln-teal/10 p-4 transition-all outline-none font-bold">
            <option value="" disabled selected>Pilih Gardu Induk</option>
            {#each giList as g}
              <option value={g}>{g}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>

    <!-- SECTION 2: DETAIL GANGGUAN -->
    <div class="space-y-6">
      <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
        <div class="w-2 h-6 bg-pln-teal rounded-full"></div>
        <h4 class="text-xs font-black text-pln-teal uppercase tracking-widest">Bagian 2: Detail Gangguan & Proteksi</h4>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label for="penyulang" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama Penyulang</label>
          <input type="text" name="penyulang" id="penyulang" placeholder="Contoh: Birem" required class="block w-full rounded-2xl bg-white border-slate-200 text-slate-800 shadow-sm focus:border-pln-teal focus:ring-4 focus:ring-pln-teal/10 p-4 transition-all outline-none font-bold">
        </div>

        <div>
          <label for="nama_proteksi" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Alat Proteksi</label>
          <input type="text" name="nama_proteksi" id="nama_proteksi" placeholder="Contoh: REC, PMT, PMCB" required class="block w-full rounded-2xl bg-white border-slate-200 text-slate-800 shadow-sm focus:border-pln-teal focus:ring-4 focus:ring-pln-teal/10 p-4 transition-all outline-none font-bold">
        </div>

        <div>
          <label for="kode_j" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">ID Kode J</label>
          <input type="text" name="kode_j" id="kode_j" placeholder="Masukkan Kode J" required class="block w-full rounded-2xl bg-white border-slate-200 text-slate-800 shadow-sm focus:border-pln-teal focus:ring-4 focus:ring-pln-teal/10 p-4 transition-all outline-none font-bold">
        </div>

        <div>
          <label for="tgl_trip" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tanggal Kejadian</label>
          <input type="date" name="tgl_trip" id="tgl_trip" bind:value={inputDate} required class="block w-full rounded-2xl bg-white border-slate-200 text-slate-800 shadow-sm focus:border-pln-teal focus:ring-4 focus:ring-pln-teal/10 p-4 transition-all outline-none font-bold">
        </div>

        <div>
          <label for="rele_kerja" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Rele Kerja</label>
          <input type="text" name="rele_kerja" id="rele_kerja" placeholder="Contoh: OCR, DGR" required class="block w-full rounded-2xl bg-white border-slate-200 text-slate-800 shadow-sm focus:border-pln-teal focus:ring-4 focus:ring-pln-teal/10 p-4 transition-all outline-none font-bold">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="cuaca" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Cuaca</label>
            <select name="cuaca" id="cuaca" required class="block w-full rounded-2xl bg-white border-slate-200 text-slate-800 shadow-sm focus:border-pln-teal focus:ring-4 focus:ring-pln-teal/10 p-4 transition-all outline-none font-bold">
              <option value="Cerah">Cerah</option>
              <option value="Hujan">Hujan</option>
              <option value="Mendung">Mendung</option>
              <option value="Petir">Petir</option>
            </select>
          </div>
          <div>
            <label for="status_tp" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Status</label>
            <select name="status_tp" id="status_tp" required class="block w-full rounded-2xl bg-white border-slate-200 text-slate-800 shadow-sm focus:border-pln-teal focus:ring-4 focus:ring-pln-teal/10 p-4 transition-all outline-none font-bold text-center">
              <option value="Permanent">Permanent</option>
              <option value="Temporer">Trip</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION 3: KETERANGAN & EVIDEN -->
    <div class="space-y-6">
      <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
        <div class="w-2 h-6 bg-pln-yellow rounded-full"></div>
        <h4 class="text-xs font-black text-pln-navy uppercase tracking-widest">Bagian 3: Penyebab & Bukti Foto</h4>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <label for="keterangan" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Detail Keterangan Penyebab</label>
          <textarea id="keterangan" name="keterangan" rows="6" placeholder="Masukkan keterangan detail penyebab gangguan (misal: Pohon tumbang menimpa kabel)..." class="block w-full rounded-3xl bg-white border-slate-200 text-slate-800 shadow-sm focus:border-pln-teal focus:ring-4 focus:ring-pln-teal/10 p-6 transition-all outline-none font-medium leading-relaxed"></textarea>
        </div>

        <div class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Foto 1 -->
            <div class="space-y-2">
              <span class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Eviden (Sebelum)</span>
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div 
                class="relative h-[125px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center transition-all {file1Temp ? 'border-pln-teal bg-pln-teal/5 ring-4 ring-pln-teal/10' : 'border-slate-200 bg-white hover:border-pln-teal/50 hover:bg-slate-50 shadow-sm'}"
                ondragover={(e) => e.preventDefault()} 
                ondrop={(e) => handleDropOrSelect(e, (f) => file1Temp = f)}
              >
                <input type="file" name="foto1_ignore" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onchange={(e) => handleDropOrSelect(e, (f) => file1Temp = f)} />
                {#if file1Temp}
                  <div class="bg-pln-teal/20 p-2 rounded-full mb-2">
                    <CheckCircle class="text-pln-teal" size={24} />
                  </div>
                  <p class="text-[9px] font-black text-slate-800 uppercase tracking-tighter">Siap Diunggah</p>
                  <p class="text-[8px] text-slate-400 mt-0.5 truncate max-w-[120px]">{file1Temp.name}</p>
                {:else}
                  <UploadCloud class="text-slate-300 mb-2" size={32} />
                  <p class="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Pilih Foto</p>
                  <p class="text-[8px] text-slate-300 mt-1 font-bold uppercase tracking-widest">Klik / Drag</p>
                {/if}
              </div>
            </div>

            <!-- Foto 2 -->
            <div class="space-y-2">
              <span class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Eviden (Sesudah)</span>
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div 
                class="relative h-[125px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center transition-all {file2Temp ? 'border-pln-teal bg-pln-teal/5 ring-4 ring-pln-teal/10' : 'border-slate-200 bg-white hover:border-pln-teal/50 hover:bg-slate-50 shadow-sm'}"
                ondragover={(e) => e.preventDefault()} 
                ondrop={(e) => handleDropOrSelect(e, (f) => file2Temp = f)}
              >
                <input type="file" name="foto2_ignore" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onchange={(e) => handleDropOrSelect(e, (f) => file2Temp = f)} />
                {#if file2Temp}
                  <div class="bg-pln-teal/20 p-2 rounded-full mb-2">
                    <CheckCircle class="text-pln-teal" size={24} />
                  </div>
                  <p class="text-[9px] font-black text-slate-800 uppercase tracking-tighter">Siap Diunggah</p>
                  <p class="text-[8px] text-slate-400 mt-0.5 truncate max-w-[120px]">{file2Temp.name}</p>
                {:else}
                  <UploadCloud class="text-slate-300 mb-2" size={32} />
                  <p class="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Pilih Foto</p>
                  <p class="text-[8px] text-slate-300 mt-1 font-bold uppercase tracking-widest">Klik / Drag</p>
                {/if}
              </div>
            </div>
          </div>
          <div class="bg-orange-50/50 rounded-2xl p-4 border border-orange-100/50">
             <p class="text-[9px] text-orange-600 font-bold uppercase leading-relaxed text-center tracking-wider">
               <AlertCircle size={10} class="inline mb-0.5" /> Foto bersifat opsional dan dapat diunggah menyusul melalui halaman Riwayat.
             </p>
          </div>
        </div>
      </div>
    </div>

    <div class="pt-10 flex flex-col sm:flex-row justify-between items-center gap-6">
      <div class="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
        <div class="bg-pln-teal/10 p-2 rounded-lg">
          <CheckCircle size={16} class="text-pln-teal" />
        </div>
        <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Keamanan Data Terjamin & Kompresi Aktif</p>
      </div>

      <button type="submit" disabled={isSubmitting} class="w-full sm:w-auto flex items-center justify-center gap-4 rounded-2xl bg-pln-navy py-5 px-16 text-xs font-black text-white shadow-2xl hover:bg-black transition-all duration-300 uppercase tracking-[0.2em] active:scale-95 shadow-pln-navy/30">
        {#if isSubmitting}
          <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> 
          <span>Menyimpan...</span>
        {:else}
          <Save size={20} /> 
          <span>Simpan Jurnal Gangguan</span>
        {/if}
      </button>
    </div>
  </form>
</div>

