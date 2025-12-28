<script>
	import { useSession, signOut } from '$lib/auth-client.js';
	
	const session = useSession();
	
	// Derived values for easier access
	const user = $derived($session.data?.user);
</script>

<main class="landing">
	<nav class="navbar">
		<div class="nav-content">
			<a href="/" class="logo">
				<span class="logo-icon">⚡</span>
				<span class="logo-text">AuthFlow</span>
			</a>
			<div class="nav-links">
				{#if user}
					<span class="user-greeting">Hey, {user.name}</span>
					<a href="/dashboard" class="nav-link">Dashboard</a>
					<button class="btn btn-outline" onclick={() => signOut()}>Sign Out</button>
				{:else}
					<a href="/login" class="nav-link">Sign In</a>
					<a href="/register" class="btn btn-primary">Get Started</a>
				{/if}
			</div>
		</div>
	</nav>

	<section class="hero stagger-children">
		<div class="hero-badge">
			<span class="badge-icon">🚀</span>
			<span>Built with SvelteKit + Better Auth</span>
		</div>
		
		<h1 class="hero-title">
			Authentication that
			<span class="gradient-text">just works</span>
		</h1>
		
		<p class="hero-subtitle">
			Secure, lightning-fast authentication powered by SvelteKit, PostgreSQL, 
			and deployed globally on Cloudflare. Production-ready in minutes.
		</p>
		
		<div class="hero-actions">
			{#if user}
				<a href="/dashboard" class="btn btn-primary btn-lg">
					Go to Dashboard
					<span class="btn-arrow">→</span>
				</a>
			{:else}
				<a href="/register" class="btn btn-primary btn-lg">
					Start Building
					<span class="btn-arrow">→</span>
				</a>
				<a href="/login" class="btn btn-ghost btn-lg">
					Sign In
				</a>
			{/if}
		</div>
	</section>

	<section class="features">
		<div class="features-grid stagger-children">
			<div class="feature-card">
				<div class="feature-icon">🔐</div>
				<h3>Secure by Default</h3>
				<p>Industry-standard security with bcrypt hashing, secure sessions, and CSRF protection.</p>
			</div>
			
			<div class="feature-card">
				<div class="feature-icon">⚡</div>
				<h3>Edge-Ready</h3>
				<p>Runs on Cloudflare Workers for sub-50ms authentication globally.</p>
			</div>
			
			<div class="feature-card">
				<div class="feature-icon">🐘</div>
				<h3>PostgreSQL + Supabase</h3>
				<p>Battle-tested database with Supabase integration for instant scaling.</p>
			</div>
			
			<div class="feature-card">
				<div class="feature-icon">🐳</div>
				<h3>Podman Ready</h3>
				<p>Local development with Podman containers for a consistent environment.</p>
			</div>
		</div>
	</section>

	<footer class="footer">
		<p>Built with 💜 using SvelteKit, Better Auth, PostgreSQL, and Cloudflare</p>
	</footer>
</main>

<style>
	.landing {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	/* Navbar */
	.navbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		padding: 1rem 1.5rem;
		background: rgba(10, 10, 15, 0.8);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid var(--color-border);
	}

	.nav-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		font-size: 1.25rem;
		color: var(--color-text-primary);
	}

	.logo-icon {
		font-size: 1.5rem;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.nav-link {
		color: var(--color-text-secondary);
		font-weight: 500;
		transition: color var(--transition-fast);
	}

	.nav-link:hover {
		color: var(--color-text-primary);
	}

	.user-greeting {
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	/* Hero */
	.hero {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 8rem 1.5rem 4rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.hero-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: var(--gradient-subtle);
		border: 1px solid var(--color-border);
		border-radius: 100px;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin-bottom: 2rem;
	}

	.badge-icon {
		font-size: 1rem;
	}

	.hero-title {
		font-size: clamp(2.5rem, 8vw, 4rem);
		font-weight: 700;
		line-height: 1.1;
		margin-bottom: 1.5rem;
		letter-spacing: -0.02em;
	}

	.gradient-text {
		background: var(--gradient-aurora);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-subtitle {
		font-size: 1.25rem;
		color: var(--color-text-secondary);
		max-width: 600px;
		margin-bottom: 2.5rem;
		line-height: 1.7;
	}

	.hero-actions {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	/* Buttons */
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		font-size: 0.95rem;
		font-weight: 500;
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
	}

	.btn-primary {
		background: var(--color-accent);
		color: white;
		box-shadow: 0 4px 20px rgba(88, 101, 242, 0.3);
	}

	.btn-primary:hover {
		background: var(--color-accent-hover);
		transform: translateY(-2px);
		box-shadow: 0 6px 30px rgba(88, 101, 242, 0.4);
	}

	.btn-outline {
		border: 1px solid var(--color-border);
		color: var(--color-text-primary);
		background: transparent;
	}

	.btn-outline:hover {
		background: var(--color-bg-hover);
		border-color: var(--color-text-muted);
	}

	.btn-ghost {
		color: var(--color-text-secondary);
		background: transparent;
	}

	.btn-ghost:hover {
		color: var(--color-text-primary);
		background: var(--color-bg-hover);
	}

	.btn-lg {
		padding: 1rem 2rem;
		font-size: 1.05rem;
	}

	.btn-arrow {
		transition: transform var(--transition-fast);
	}

	.btn:hover .btn-arrow {
		transform: translateX(4px);
	}

	/* Features */
	.features {
		padding: 4rem 1.5rem 6rem;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		max-width: 1000px;
		margin: 0 auto;
	}

	.feature-card {
		padding: 2rem;
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		transition: all var(--transition-normal);
	}

	.feature-card:hover {
		background: var(--color-bg-elevated);
		border-color: var(--color-border-focus);
		transform: translateY(-4px);
		box-shadow: var(--shadow-glow);
	}

	.feature-icon {
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	.feature-card h3 {
		font-size: 1.15rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.feature-card p {
		font-size: 0.95rem;
		color: var(--color-text-secondary);
		line-height: 1.6;
	}

	/* Footer */
	.footer {
		padding: 2rem 1.5rem;
		text-align: center;
		color: var(--color-text-muted);
		font-size: 0.9rem;
		border-top: 1px solid var(--color-border);
	}
</style>
