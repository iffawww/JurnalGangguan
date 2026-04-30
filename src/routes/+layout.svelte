<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { Activity, LayoutDashboard, History, Download } from 'lucide-svelte';

	let { children } = $props();

	const navItems = [
		{ label: 'Dashboard', href: '/', icon: LayoutDashboard },
		{ label: 'Input Gangguan', href: '/input', icon: Activity },
		{ label: 'Riwayat Gangguan', href: '/riwayat', icon: History },
		{ label: 'Export PPT', href: '/export', icon: Download }
	];
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-h-screen flex flex-col relative">
	<!-- TOP NAVBAR (SOLID TEAL GRADIENT - REFINED) -->
	<header class="sticky top-0 z-50 w-full shadow-lg" 
		style="background: linear-gradient(90deg, #007A7A 0%, #005F5F 100%);">
		
		<nav class="w-full flex items-center px-6 py-6 relative z-10">
			<!-- Logo & Branding -->
			<div class="flex items-center gap-4 flex-1">
				<img src="https://upload.wikimedia.org/wikipedia/commons/9/97/Logo_PLN.png" alt="PLN Logo" class="h-10 w-auto filter drop-shadow-sm">
				<div class="h-8 w-px bg-white/20"></div>
				<div>
					<h1 class="text-xl font-black text-white leading-none uppercase tracking-tighter">SIM-GPD</h1>
					<p class="text-[9px] text-pln-yellow font-black uppercase tracking-[0.2em] mt-0.5">PLN UP3 Madura</p>
				</div>
			</div>

			<!-- Navigation Links -->
			<div class="flex items-center gap-1 justify-center">
				{#each navItems as item}
					{@const Icon = item.icon}
					<a 
						href={item.href} 
						class="flex items-center gap-2 px-5 py-3 rounded-xl text-[11px] font-black transition-all duration-300 uppercase tracking-widest relative group
						{$page.url.pathname === item.href 
							? 'text-pln-yellow' 
							: 'text-white/70 hover:text-white'}"
					>
						<Icon size={16} />
						<span class="hidden md:inline">{item.label}</span>
						{#if $page.url.pathname === item.href}
							<div class="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-pln-yellow rounded-full"></div>
						{/if}
					</a>
				{/each}
			</div>

			<!-- Empty Right Section for centering -->
			<div class="flex-1"></div>
		</nav>
	</header>

	<!-- Main Content Area -->
	<main class="flex-1 w-full relative">
		<div class="max-w-full mx-auto p-4 sm:p-6 lg:p-8 w-full min-h-full">
			{@render children()}
		</div>
	</main>
</div>
