<script>
	import { signIn } from '$lib/auth-client.js';
	import { goto } from '$app/navigation';
	
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);
	
	/** @param {SubmitEvent} e */
	async function handleSubmit(e) {
		e.preventDefault();
		error = '';
		loading = true;
		
		try {
			const result = await signIn.email({ email, password });
			
			if (result.error) {
				error = result.error.message || 'Invalid credentials';
			} else {
				goto('/dashboard');
			}
		} catch (err) {
			error = 'An unexpected error occurred';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Sign In — AuthFlow</title>
</svelte:head>

<main class="auth-page">
	<a href="/" class="back-link">
		<span>←</span> Back to home
	</a>
	
	<div class="auth-container animate-slide-up">
		<div class="auth-header">
			<div class="auth-logo">⚡</div>
			<h1>Welcome back</h1>
			<p>Sign in to your account to continue</p>
		</div>
		
		<form class="auth-form" onsubmit={handleSubmit}>
			{#if error}
				<div class="error-banner">
					<span class="error-icon">⚠️</span>
					{error}
				</div>
			{/if}
			
			<div class="form-group">
				<label for="email">Email</label>
				<input
					type="email"
					id="email"
					bind:value={email}
					placeholder="you@example.com"
					required
					disabled={loading}
				/>
			</div>
			
			<div class="form-group">
				<label for="password">Password</label>
				<input
					type="password"
					id="password"
					bind:value={password}
					placeholder="••••••••"
					required
					disabled={loading}
					minlength="8"
				/>
			</div>
			
			<button type="submit" class="btn btn-primary btn-full" disabled={loading}>
				{#if loading}
					<span class="spinner"></span>
					Signing in...
				{:else}
					Sign In
				{/if}
			</button>
		</form>
		
		<div class="auth-footer">
			<p>Don't have an account? <a href="/register">Create one</a></p>
		</div>
	</div>
	
	<div class="auth-decoration">
		<div class="glow glow-1"></div>
		<div class="glow glow-2"></div>
	</div>
</main>

<style>
	.auth-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		position: relative;
		overflow: hidden;
	}

	.back-link {
		position: absolute;
		top: 2rem;
		left: 2rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--color-text-secondary);
		font-size: 0.9rem;
		transition: color var(--transition-fast);
	}

	.back-link:hover {
		color: var(--color-text-primary);
	}

	.auth-container {
		width: 100%;
		max-width: 420px;
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: 2.5rem;
		position: relative;
		z-index: 1;
	}

	.auth-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.auth-logo {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.auth-header h1 {
		font-size: 1.75rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.auth-header p {
		color: var(--color-text-secondary);
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.error-banner {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.875rem 1rem;
		background: rgba(242, 63, 66, 0.1);
		border: 1px solid rgba(242, 63, 66, 0.3);
		border-radius: var(--radius-md);
		color: var(--color-error);
		font-size: 0.9rem;
	}

	.error-icon {
		font-size: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--color-text-secondary);
	}

	.form-group input {
		width: 100%;
		padding: 0.875rem 1rem;
		background: var(--color-bg-deep);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: 1rem;
		transition: all var(--transition-fast);
	}

	.form-group input::placeholder {
		color: var(--color-text-muted);
	}

	.form-group input:focus {
		outline: none;
		border-color: var(--color-border-focus);
		box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.15);
	}

	.form-group input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.875rem 1.5rem;
		font-size: 1rem;
		font-weight: 500;
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
		cursor: pointer;
	}

	.btn-primary {
		background: var(--color-accent);
		color: white;
		border: none;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--color-accent-hover);
		transform: translateY(-1px);
	}

	.btn-primary:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.btn-full {
		width: 100%;
	}

	.spinner {
		width: 18px;
		height: 18px;
		border: 2px solid transparent;
		border-top-color: currentColor;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.auth-footer {
		margin-top: 2rem;
		text-align: center;
		color: var(--color-text-secondary);
		font-size: 0.9rem;
	}

	.auth-footer a {
		color: var(--color-accent);
		font-weight: 500;
	}

	.auth-decoration {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
	}

	.glow {
		position: absolute;
		border-radius: 50%;
		filter: blur(80px);
		opacity: 0.4;
	}

	.glow-1 {
		width: 400px;
		height: 400px;
		background: var(--color-accent);
		top: -200px;
		right: -100px;
	}

	.glow-2 {
		width: 300px;
		height: 300px;
		background: #eb459e;
		bottom: -150px;
		left: -100px;
	}
</style>

