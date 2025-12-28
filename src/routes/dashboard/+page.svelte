<script>
	import { useSession, signOut } from '$lib/auth-client.js';
	import { goto } from '$app/navigation';
	
	const session = useSession();
	
	// Derived values for easier access
	const user = $derived($session.data?.user);
	const sessionData = $derived($session.data?.session);
	
	async function handleSignOut() {
		await signOut();
		goto('/');
	}
</script>

<svelte:head>
	<title>Dashboard — AuthFlow</title>
</svelte:head>

<main class="dashboard">
	<nav class="dashboard-nav">
		<a href="/" class="logo">
			<span class="logo-icon">⚡</span>
			<span class="logo-text">AuthFlow</span>
		</a>
		<div class="nav-actions">
			<button class="btn btn-outline" onclick={handleSignOut}>
				Sign Out
			</button>
		</div>
	</nav>

	<div class="dashboard-content animate-slide-up">
		{#if user}
			<div class="welcome-section">
				<div class="avatar">
					{#if user.image}
						<img src={user.image} alt={user.name} />
					{:else}
						<span class="avatar-initials">
							{user.name.split(' ').map((/** @type {string} */ n) => n[0]).join('').toUpperCase()}
						</span>
					{/if}
				</div>
				<h1>Welcome back, {user.name}!</h1>
				<p>You're successfully authenticated with AuthFlow.</p>
			</div>

			<div class="info-grid stagger-children">
				<div class="info-card">
					<div class="info-icon">👤</div>
					<h3>Profile</h3>
					<div class="info-details">
						<div class="info-row">
							<span class="info-label">Name</span>
							<span class="info-value">{user.name}</span>
						</div>
						<div class="info-row">
							<span class="info-label">Email</span>
							<span class="info-value">{user.email}</span>
						</div>
						<div class="info-row">
							<span class="info-label">Verified</span>
							<span class="info-value">
								{#if user.emailVerified}
									<span class="badge badge-success">✓ Verified</span>
								{:else}
									<span class="badge badge-warning">Pending</span>
								{/if}
							</span>
						</div>
					</div>
				</div>

				<div class="info-card">
					<div class="info-icon">🔐</div>
					<h3>Session</h3>
					<div class="info-details">
						<div class="info-row">
							<span class="info-label">Session ID</span>
							<span class="info-value code">{sessionData?.id?.slice(0, 8)}...</span>
						</div>
						<div class="info-row">
							<span class="info-label">Status</span>
							<span class="info-value">
								<span class="badge badge-success">Active</span>
							</span>
						</div>
					</div>
				</div>

				<div class="info-card">
					<div class="info-icon">🚀</div>
					<h3>Stack</h3>
					<div class="stack-tags">
						<span class="tag">SvelteKit</span>
						<span class="tag">Better Auth</span>
						<span class="tag">PostgreSQL</span>
						<span class="tag">Cloudflare</span>
						<span class="tag">Supabase</span>
						<span class="tag">Podman</span>
					</div>
				</div>

				<div class="info-card">
					<div class="info-icon">📚</div>
					<h3>Next Steps</h3>
					<ul class="next-steps">
						<li>Add OAuth providers (Google, GitHub)</li>
						<li>Enable email verification</li>
						<li>Set up password reset</li>
						<li>Add two-factor authentication</li>
					</ul>
				</div>
			</div>
		{:else}
			<div class="loading-state">
				<div class="loading-spinner"></div>
				<p>Loading your session...</p>
			</div>
		{/if}
	</div>
</main>

<style>
	.dashboard {
		min-height: 100vh;
		background: var(--color-bg-deep);
	}

	.dashboard-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 2rem;
		background: var(--color-bg-surface);
		border-bottom: 1px solid var(--color-border);
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

	.nav-actions {
		display: flex;
		gap: 1rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		font-size: 0.9rem;
		font-weight: 500;
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
		cursor: pointer;
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

	.dashboard-content {
		max-width: 1000px;
		margin: 0 auto;
		padding: 3rem 2rem;
	}

	.welcome-section {
		text-align: center;
		margin-bottom: 3rem;
	}

	.avatar {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		margin: 0 auto 1.5rem;
		background: var(--gradient-aurora);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.75rem;
		font-weight: 600;
		color: white;
		overflow: hidden;
	}

	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.avatar-initials {
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.welcome-section h1 {
		font-size: 2rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.welcome-section p {
		color: var(--color-text-secondary);
		font-size: 1.1rem;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	.info-card {
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: 1.5rem;
		transition: all var(--transition-normal);
	}

	.info-card:hover {
		background: var(--color-bg-elevated);
		border-color: var(--color-border-focus);
	}

	.info-icon {
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	.info-card h3 {
		font-size: 1.1rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: var(--color-text-primary);
	}

	.info-details {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.info-label {
		font-size: 0.9rem;
		color: var(--color-text-muted);
	}

	.info-value {
		font-size: 0.9rem;
		color: var(--color-text-primary);
	}

	.info-value.code {
		font-family: var(--font-mono);
		font-size: 0.85rem;
		color: var(--color-accent);
	}

	.badge {
		display: inline-flex;
		align-items: center;
		padding: 0.25rem 0.625rem;
		font-size: 0.75rem;
		font-weight: 500;
		border-radius: 100px;
	}

	.badge-success {
		background: rgba(35, 209, 139, 0.15);
		color: var(--color-success);
	}

	.badge-warning {
		background: rgba(250, 166, 26, 0.15);
		color: var(--color-warning);
	}

	.stack-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tag {
		display: inline-flex;
		align-items: center;
		padding: 0.375rem 0.75rem;
		font-size: 0.8rem;
		font-weight: 500;
		background: var(--color-bg-deep);
		border: 1px solid var(--color-border);
		border-radius: 100px;
		color: var(--color-text-secondary);
	}

	.next-steps {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.next-steps li {
		font-size: 0.9rem;
		color: var(--color-text-secondary);
		padding-left: 1.5rem;
		position: relative;
	}

	.next-steps li::before {
		content: '→';
		position: absolute;
		left: 0;
		color: var(--color-accent);
	}

	.loading-state {
		text-align: center;
		padding: 4rem 2rem;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid var(--color-border);
		border-top-color: var(--color-accent);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin: 0 auto 1rem;
	}

	.loading-state p {
		color: var(--color-text-secondary);
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
