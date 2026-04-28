<script lang="ts">
  import type { PageData } from './$types';
  import { Search, Plus, Eye, Edit, Trash2, X, UploadCloud, CheckCircle, Save, ChevronLeft, ChevronRight, FileText } from 'lucide-svelte';
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';
  import imageCompression from 'browser-image-compression';

  let { data }: { data: PageData } = $props();
  
  let searchQuery = $state('');
  let startDate = $state('');
  let endDate = $state('');

  const filteredRiwayat = $derived(
    data.riwayat.filter(item => {
      const matchSearch = item.penyulang.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.gi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.ulp.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.kode_j.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.keterangan || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      // Normalize dates for robust comparison
      const itemTime = new Date(item.tgl_trip).setHours(0,0,0,0);
      const startTime = startDate ? new Date(startDate).setHours(0,0,0,0) : null;
      const endTime = endDate ? new Date(endDate).setHours(0,0,0,0) : null;
      
      const matchDate = (!startTime || itemTime >= startTime) && (!endTime || itemTime <= endTime);
      
      return matchSearch && matchDate;
    })
  );

  let isModalOpen = $state(false);
  let isEditModalOpen = $state(false);
  let isViewModalOpen = $state(false);
  let activeId = $state<number | null>(null);
  let activeIndex = $state<'1' | '2' | null>(null);
  let editData = $state<any>(null);
  let viewData = $state<any>(null);
  
  let isUploading = $state(false);
  let isSavingEdit = $state(false);
  let uploadFile: File | null = $state(null);

  function openModal(id: number, index: '1' | '2') {
    activeId = id;
    activeIndex = index;
    uploadFile = null;
    isModalOpen = true;
  }

  function openEditModal(item: any) {
    editData = { ...item };
    isEditModalOpen = true;
  }

  function openViewModal(item: any) {
    viewData = { ...item };
    isViewModalOpen = true;
  }

  function closeModal() {
    if (isUploading) return;
    isModalOpen = false;
    activeId = null;
    activeIndex = null;
  }

  async function handleCompress(event: Event | DragEvent) {
    let file: File | null = null;
    if (event.type === 'drop') {
      event.preventDefault();
      const e = event as DragEvent;
      if (e.dataTransfer && e.dataTransfer.files.length > 0) file = e.dataTransfer.files[0];
    } else {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files[0]) file = input.files[0];
    }

    if (file && file.type.startsWith('image/')) {
      const options = { maxSizeMB: 0.28, maxWidthOrHeight: 1280, useWebWorker: true };
      try {
        uploadFile = await imageCompression(file, options);
      } catch (err) {
        console.error(err);
      }
    }
  }

  const uploadAction: SubmitFunction = ({ formData, cancel }) => {
    if (!uploadFile || !activeId || !activeIndex) {
      cancel();
      return;
    }
    isUploading = true;
    formData.set('id', activeId.toString());
    formData.set('index', activeIndex);
    formData.set('foto', uploadFile, uploadFile.name);

    return async ({ result, update }) => {
      isUploading = false;
      if (result.type === 'success') {
        closeModal();
        update();
      } else {
        const errorMsg = result.type === 'failure' ? (result.data as any)?.error : 'Kesalahan Hubungan ke Server';
        alert('Gagal mengunggah eviden: ' + (errorMsg || 'Kesalahan Server'));
      }
    };
  };

  const editAction: SubmitFunction = () => {
    isSavingEdit = true;
    return async ({ result, update }) => {
      isSavingEdit = false;
      if (result.type === 'success') {
        isEditModalOpen = false;
        update();
      } else {
        alert('Gagal menyimpan perubahan');
      }
    };
  };

  const deleteAction: SubmitFunction = () => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    return async ({ result, update }) => {
      if (result.type === 'success') {
        update();
      } else {
        alert('Gagal menghapus data');
      }
    };
  };

  const ulpList = ['Bangkalan', 'Kamal', 'Blega', 'Sampang', 'Ketapang', 'Waru', 'Pamekasan', 'Sumenep', 'Ambunten', 'Arjasa'];
  const giList = ['Gili Timur', 'Bangkalan', 'Sampang', 'Pamekasan', 'Sumenep', 'Guluk-Guluk'];
</script>

<svelte:head>
  <title>Riwayat Gangguan | SIM-GPD</title>
</svelte:head>

<div class="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
  <div class="flex items-center gap-6">
    <div class="flex items-center gap-3">
      <div class="bg-pln-teal p-3 rounded-xl shadow-lg">
        <FileText class="text-white" size={32} />
      </div>
      <div>
        <h2 class="text-2xl font-black text-pln-navy leading-tight uppercase tracking-tight">Riwayat Jurnal</h2>
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Manajemen Data & Arsip Eviden</p>
      </div>
    </div>
  </div>
  
  <div class="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
    <!-- Date Filters -->
    <div class="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-2xl shadow-sm">
      <div class="flex items-center gap-2 px-3 border-r border-slate-100">
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dari</span>
        <input type="date" bind:value={startDate} class="text-xs font-bold text-slate-800 outline-none bg-transparent">
      </div>
      <div class="flex items-center gap-2 px-3">
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sampai</span>
        <input type="date" bind:value={endDate} class="text-xs font-bold text-slate-800 outline-none bg-transparent">
      </div>
      {#if startDate || endDate}
        <button onclick={() => { startDate = ''; endDate = ''; }} class="p-2 hover:bg-red-50 text-red-400 rounded-lg transition-colors" title="Reset Filter">
          <X size={14} />
        </button>
      {/if}
    </div>

    <!-- Search -->
    <div class="relative group flex-1 md:flex-none">
      <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-pln-teal transition-colors" size={18} />
      <input 
        type="text" 
        bind:value={searchQuery}
        placeholder="Cari data..." 
        class="bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-6 text-xs font-bold text-slate-800 w-full md:w-[280px] shadow-sm focus:ring-4 focus:ring-pln-teal/10 focus:border-pln-teal transition-all outline-none"
      >
    </div>
  </div>
</div>

<div class="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
  <div class="overflow-x-auto w-full">
    <table class="w-full text-[11px] text-left border-collapse">
      <thead class="bg-[#009292] text-white uppercase tracking-wider font-black">
        <tr>
          <th class="p-4 border-r border-white/10 text-center">No</th>
          <th class="p-4 border-r border-white/10 text-center">ULP</th>
          <th class="p-4 border-r border-white/10 text-center">GI</th>
          <th class="p-4 border-r border-white/10 text-center">Penyulang</th>
          <th class="p-4 border-r border-white/10 text-center">Proteksi</th>
          <th class="p-4 border-r border-white/10 text-center">Kode J</th>
          <th class="p-4 border-r border-white/10 text-center">TGL Trip</th>
          <th class="p-4 border-r border-white/10 text-center">Rele Kerja</th>
          <th class="p-4 border-r border-white/10 text-center">Cuaca</th>
          <th class="p-4 border-r border-white/10 text-center">T/P</th>
          <th class="p-4 border-r border-white/10">Keterangan</th>
          <th class="p-4 text-center bg-[#007a7a]">Eviden Foto</th>
          <th class="p-4 text-center">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 text-slate-600 font-medium">
        {#each filteredRiwayat as item}
          <tr class="hover:bg-slate-50/80 transition-colors">
            <td class="px-3 py-4 text-center font-bold text-slate-400 bg-slate-50/30 border-r border-slate-100">{item.no_urut}</td>
            <td class="px-3 py-4 text-center border-r border-slate-100">{item.ulp}</td>
            <td class="px-3 py-4 text-center font-bold text-slate-800 border-r border-slate-100 whitespace-nowrap">{item.gi}</td>
            <td class="px-3 py-4 text-center font-bold text-pln-teal border-r border-slate-100">{item.penyulang}</td>
            <td class="px-3 py-4 text-center border-r border-slate-100">{item.nama_proteksi}</td>
            <td class="px-3 py-4 text-center text-[10px] opacity-70 border-r border-slate-100 font-mono">{item.kode_j}</td>
            <td class="px-3 py-4 text-center border-r border-slate-100 whitespace-nowrap">{item.tgl_trip}</td>
            <td class="px-3 py-4 text-center border-r border-slate-100">{item.rele_kerja}</td>
            <td class="px-3 py-4 text-center border-r border-slate-100 uppercase tracking-tighter text-[9px] font-black">{item.cuaca}</td>
            <td class="px-3 py-4 text-center border-r border-slate-100">
              <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase {item.status_tp === 'Temporer' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}">
                {item.status_tp === 'Permanent' ? 'Permanent' : 'Trip'}
              </span>
            </td>
            <td class="px-4 py-4 leading-relaxed max-w-xs border-r border-slate-100 text-[10px]">{item.keterangan || "-"}</td>
            <td class="px-3 py-4 bg-slate-50/30 border-r border-slate-100">
              <div class="flex items-center justify-center gap-2">
                {#if item.path_foto_1}
                  <div class="w-12 h-10 rounded border border-slate-200 overflow-hidden shadow-sm hover:scale-110 transition-transform">
                    <img src={item.path_foto_1} alt="B" class="w-full h-full object-cover">
                  </div>
                {:else}
                  <button onclick={() => openModal(item.id, '1')} class="w-12 h-10 rounded border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:text-pln-teal group transition-colors">
                    <Plus size={14} />
                  </button>
                {/if}
                {#if item.path_foto_2}
                  <div class="w-12 h-10 rounded border border-slate-200 overflow-hidden shadow-sm hover:scale-110 transition-transform">
                    <img src={item.path_foto_2} alt="A" class="w-full h-full object-cover">
                  </div>
                {:else}
                  <button onclick={() => openModal(item.id, '2')} class="w-12 h-10 rounded border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:text-pln-teal group transition-colors">
                    <Plus size={14} />
                  </button>
                {/if}
              </div>
            </td>
            <td class="px-3 py-4">
              <div class="flex items-center justify-center gap-3">
                <button onclick={() => openViewModal(item)} class="text-slate-400 hover:text-pln-teal hover:scale-125 transition-all" title="View Detail"><Eye size={16} /></button>
                <button onclick={() => openEditModal(item)} class="text-slate-400 hover:text-orange-400 hover:scale-125 transition-all" title="Edit Data"><Edit size={16} /></button>
                <form method="POST" action="?/delete" use:enhance={deleteAction}>
                  <input type="hidden" name="id" value={item.id}>
                  <button type="submit" class="text-slate-400 hover:text-red-400 hover:scale-125 transition-all" title="Hapus Data"><Trash2 size={16} /></button>
                </form>
              </div>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="13" class="p-20 text-center opacity-20">
              <Search size={48} class="mx-auto mb-4" />
              <p class="text-lg font-black uppercase tracking-widest">Data Tidak Ditemukan</p>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
   </div>

  <div class="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
    <div>Total Data: {filteredRiwayat.length}</div>
    <nav class="flex items-center gap-1">
      <button class="p-2 rounded-lg hover:bg-white transition"><ChevronLeft size={16} /></button>
      <button class="w-8 h-8 rounded-lg bg-pln-teal text-white font-black shadow-md shadow-pln-teal/30">1</button>
      <button class="p-2 rounded-lg hover:bg-white transition"><ChevronRight size={16} /></button>
    </nav>
  </div>
</div>

{#if isModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-300">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-3xl overflow-hidden border border-slate-100">
      <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 class="text-sm font-black text-pln-navy uppercase tracking-widest">Upload Eviden {activeIndex}</h3>
        <button onclick={closeModal} class="text-slate-400 hover:text-red-500 transition" disabled={isUploading}>
          <X size={20} />
        </button>
      </div>

      <div class="p-6">
        <form method="POST" action="?/upload" enctype="multipart/form-data" use:enhance={uploadAction}>
          <div 
            class="relative mb-6 border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all {uploadFile ? 'border-pln-teal bg-pln-teal/5' : 'border-slate-200 bg-slate-50 hover:border-pln-teal/50 hover:bg-white'}"
            ondragover={(e) => e.preventDefault()} 
            ondrop={handleCompress}
          >
            <input type="file" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onchange={handleCompress} disabled={isUploading} />
            {#if uploadFile}
              <div class="bg-pln-teal/10 p-4 rounded-full mb-4">
                <CheckCircle class="text-pln-teal" size={40} />
              </div>
              <p class="text-xs font-black text-slate-800 uppercase tracking-tighter">File Siap Unggah!</p>
              <p class="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-widest">{uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)</p>
            {:else}
              <div class="bg-slate-100 p-4 rounded-full mb-4 group-hover:bg-pln-teal/10 transition-colors">
                <UploadCloud class="text-slate-400 group-hover:text-pln-teal" size={40} />
              </div>
              <p class="text-xs font-black text-slate-700 uppercase tracking-tighter">Geser file atau klik di sini</p>
              <p class="text-[8px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Otomatis kompres ke max 300KB</p>
            {/if}
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-slate-50">
            <button type="button" onclick={closeModal} disabled={isUploading} class="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
              Batal
            </button>
            <button type="submit" disabled={isUploading || !uploadFile} class="flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-pln-teal text-white shadow-xl shadow-pln-teal/20 hover:bg-pln-teal-dark disabled:opacity-50 transition active:scale-95">
              {#if isUploading}
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Proses...
              {:else}
                <Save size={16} /> Unggah Sekarang
              {/if}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}

{#if isEditModalOpen && editData}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 transition-all animate-in fade-in duration-300">
    <div class="w-full max-w-4xl bg-white rounded-3xl shadow-3xl overflow-hidden border border-white/20">
      <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div class="flex items-center gap-3">
          <div class="bg-orange-100 p-2 rounded-xl text-orange-600">
            <Edit size={20} />
          </div>
          <h3 class="text-lg font-black text-pln-navy uppercase tracking-tighter">Edit Data Gangguan #{editData.no_urut}</h3>
        </div>
        <button onclick={() => isEditModalOpen = false} class="text-slate-400 hover:text-red-500 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div class="p-8">
        <form method="POST" action="?/edit" use:enhance={editAction} class="space-y-6">
          <input type="hidden" name="id" value={editData.id}>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ULP</label>
              <select name="ulp" bind:value={editData.ulp} class="w-full rounded-xl bg-slate-50 border-slate-200 p-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-pln-teal/20 focus:border-pln-teal transition-all">
                {#each ulpList as u}
                  <option value={u}>{u}</option>
                {/each}
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">GI</label>
              <select name="gi" bind:value={editData.gi} class="w-full rounded-xl bg-slate-50 border-slate-200 p-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-pln-teal/20 focus:border-pln-teal transition-all">
                {#each giList as g}
                  <option value={g}>{g}</option>
                {/each}
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Penyulang</label>
              <input type="text" name="penyulang" bind:value={editData.penyulang} class="w-full rounded-xl bg-slate-50 border-slate-200 p-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-pln-teal/20 focus:border-pln-teal transition-all">
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Proteksi</label>
              <input type="text" name="nama_proteksi" bind:value={editData.nama_proteksi} class="w-full rounded-xl bg-slate-50 border-slate-200 p-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-pln-teal/20 focus:border-pln-teal transition-all">
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kode J</label>
              <input type="text" name="kode_j" bind:value={editData.kode_j} class="w-full rounded-xl bg-slate-50 border-slate-200 p-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-pln-teal/20 focus:border-pln-teal transition-all">
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tanggal Trip</label>
              <input type="date" name="tgl_trip" bind:value={editData.tgl_trip} class="w-full rounded-xl bg-slate-50 border-slate-200 p-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-pln-teal/20 focus:border-pln-teal transition-all">
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rele Kerja</label>
              <input type="text" name="rele_kerja" bind:value={editData.rele_kerja} class="w-full rounded-xl bg-slate-50 border-slate-200 p-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-pln-teal/20 focus:border-pln-teal transition-all">
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cuaca</label>
              <select name="cuaca" bind:value={editData.cuaca} class="w-full rounded-xl bg-slate-50 border-slate-200 p-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-pln-teal/20 focus:border-pln-teal transition-all">
                <option value="Cerah">Cerah</option>
                <option value="Hujan">Hujan</option>
                <option value="Mendung">Mendung</option>
                <option value="Petir">Petir</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status T/P</label>
              <select name="status_tp" bind:value={editData.status_tp} class="w-full rounded-xl bg-slate-50 border-slate-200 p-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-pln-teal/20 focus:border-pln-teal transition-all">
                <option value="Permanent">Permanent</option>
                <option value="Temporer">Temporer</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Keterangan</label>
            <textarea name="keterangan" bind:value={editData.keterangan} rows="3" class="w-full rounded-xl bg-slate-50 border-slate-200 p-4 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-pln-teal/20 focus:border-pln-teal transition-all"></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-6 border-t border-slate-50">
            <button type="button" onclick={() => isEditModalOpen = false} class="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
              Batal
            </button>
            <button type="submit" disabled={isSavingEdit} class="flex items-center gap-2 px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-pln-teal text-white shadow-xl shadow-pln-teal/20 hover:bg-pln-teal-dark transition active:scale-95">
              {#if isSavingEdit}
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Menyimpan...
              {:else}
                <Save size={16} /> Simpan Perubahan
              {/if}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}

{#if isViewModalOpen && viewData}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 transition-all animate-in fade-in duration-300">
    <div class="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-3xl overflow-hidden border border-white/20">
      <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 px-10">
        <div class="flex items-center gap-4">
          <div class="bg-pln-teal p-3 rounded-2xl text-white shadow-lg shadow-pln-teal/20">
            <Eye size={24} />
          </div>
          <div>
            <h3 class="text-xl font-black text-pln-navy uppercase tracking-tighter">Detail Eviden Gangguan</h3>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{viewData.penyulang} — {viewData.tgl_trip}</p>
          </div>
        </div>
        <button onclick={() => isViewModalOpen = false} class="w-12 h-12 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center">
          <X size={28} />
        </button>
      </div>

      <div class="p-10">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
          <!-- Foto Sebelum -->
          <div class="space-y-4 text-center">
            <p class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Kondisi Sebelum</p>
            <div class="aspect-video rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden shadow-inner flex items-center justify-center group relative">
              {#if viewData.path_foto_1}
                <img src={viewData.path_foto_1} alt="Sebelum" class="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105">
              {:else}
                <div class="text-slate-300 flex flex-col items-center gap-3">
                  <AlertTriangle size={48} class="opacity-20" />
                  <p class="text-[10px] font-black uppercase tracking-widest opacity-50">Belum Ada Foto</p>
                </div>
              {/if}
            </div>
          </div>

          <!-- Foto Sesudah -->
          <div class="space-y-4 text-center">
            <p class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Kondisi Sesudah</p>
            <div class="aspect-video rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden shadow-inner flex items-center justify-center group relative">
              {#if viewData.path_foto_2}
                <img src={viewData.path_foto_2} alt="Sesudah" class="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105">
              {:else}
                <div class="text-slate-300 flex flex-col items-center gap-3">
                  <AlertTriangle size={48} class="opacity-20" />
                  <p class="text-[10px] font-black uppercase tracking-widest opacity-50">Belum Ada Foto</p>
                </div>
              {/if}
            </div>
          </div>
        </div>

        <div class="mt-10 p-6 bg-slate-50 rounded-3xl border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
             <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Penyulang</p>
             <p class="text-xs font-black text-pln-navy uppercase">{viewData.penyulang}</p>
          </div>
          <div>
             <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Kode J</p>
             <p class="text-xs font-black text-pln-navy uppercase">{viewData.kode_j}</p>
          </div>
          <div>
             <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
             <p class="text-xs font-black text-pln-navy uppercase">{viewData.status_tp === 'Temporer' ? 'Trip' : 'Permanent'}</p>
          </div>
          <div>
             <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cuaca</p>
             <p class="text-xs font-black text-pln-navy uppercase">{viewData.cuaca}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
