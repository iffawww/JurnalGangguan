<script lang="ts">
  import { page } from '$app/stores';
</script>

<header class="sticky top-0 z-50 backdrop-blur-md bg-[#0f2027]/70 border-b border-white/10 shadow-lg select-none">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <div class="flex items-center gap-4">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/9/97/Logo_PLN.png" 
          alt="Logo PLN" 
          class="h-10 w-auto"
        />
        <div>
          <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pln-blue to-pln-blue-light drop-shadow-md pb-0.5">SIM-GPD</h1>
          <p class="text-xs text-slate-300 font-medium">PLN UP3 Madura</p>
        </div>
      </div>
      
      <nav class="flex gap-4">
        <a 
          href="/" 
          class="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-white/10 border border-transparent 
            {$page.url.pathname === '/' ? 'bg-white/10 border-white/20 text-pln-yellow' : 'text-slate-200'}"
        >
          Input Jurnal
        </a>
        <a 
          href="/laporan" 
          class="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-white/10 border border-transparent
            {$page.url.pathname === '/laporan' ? 'bg-white/10 border-white/20 text-pln-yellow' : 'text-slate-200'}"
        >
          Laporan
        </a>
      </nav>
    </div>
  </div>
</header>
