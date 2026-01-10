<script>
	/**
	 * Reusable Avatar Component
	 * 
	 * @typedef {Object} User
	 * @property {string | null} [avatarUrl]
	 * @property {string | null} [firstName]
	 * @property {string | null} [lastName]
	 * @property {string | null} [username]
	 * @property {string | null} [name] - Full name (for auth users)
	 * @property {string | null} [email] - Email (for auth users)
	 * @property {boolean} [emailVerified]
	 */

	/** 
	 * @type {{ 
	 *   user?: User | null,
	 *   avatarUrl?: string | null,
	 *   firstName?: string | null,
	 *   lastName?: string | null,
	 *   username?: string | null,
	 *   name?: string | null,
	 *   email?: string | null,
	 *   emailVerified?: boolean,
	 *   size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl',
	 *   showVerified?: boolean,
	 *   alt?: string,
	 *   class?: string
	 * }} 
	 */
	let {
		user = null,
		avatarUrl = null,
		firstName = null,
		lastName = null,
		username = null,
		name = null,
		email = null,
		emailVerified = false,
		size = 'md',
		showVerified = false,
		alt = 'Avatar',
		class: className = ''
	} = $props();

	// Get avatar URL - prefer user object, then direct prop
	const finalAvatarUrl = $derived(
		user?.avatarUrl || avatarUrl || null
	);

	// Get user info - prefer user object, then direct props
	const finalFirstName = $derived(
		user?.firstName || firstName || null
	);
	const finalLastName = $derived(
		user?.lastName || lastName || null
	);
	const finalUsername = $derived(
		user?.username || username || null
	);
	const finalName = $derived(
		user?.name || name || null
	);
	const finalEmail = $derived(
		user?.email || email || null
	);
	const finalEmailVerified = $derived(
		user?.emailVerified ?? emailVerified
	);

	// Generate user initials
	function getUserInitials() {
		// Try marketplace user format first (firstName + lastName)
		if (finalFirstName && finalLastName) {
			return (finalFirstName[0] + finalLastName[0]).toUpperCase();
		}
		// Try username
		if (finalUsername) {
			return finalUsername[0].toUpperCase();
		}
		// Try full name (auth user format)
		if (finalName) {
			const names = finalName.split(" ");
			if (names.length >= 2) {
				return (names[0][0] + names[names.length - 1][0]).toUpperCase();
			}
			return finalName[0].toUpperCase();
		}
		// Try email as fallback
		if (finalEmail) {
			return finalEmail[0].toUpperCase();
		}
		return "?";
	}

	// Get alt text
	const altText = $derived(
		alt || 
		(finalFirstName && finalLastName 
			? `${finalFirstName} ${finalLastName}` 
			: finalUsername || finalName || finalEmail || 'User')
	);
</script>

<div class="avatar avatar--{size} {className}">
	{#if finalAvatarUrl}
		<img src={finalAvatarUrl} alt={altText} />
	{:else}
		<div class="avatar__initials">
			{getUserInitials()}
		</div>
	{/if}
	{#if showVerified && finalEmailVerified}
		<span class="avatar__badge" title="Verified">✓</span>
	{/if}
</div>

<style>
	.avatar {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		overflow: hidden;
		flex-shrink: 0;
		background: linear-gradient(
			135deg,
			var(--color-primary) 0%,
			var(--color-tertiary) 100%
		);
		color: white;
		font-weight: 600;
	}

	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.avatar__initials {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		user-select: none;
	}

	.avatar__badge {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 20%;
		height: 20%;
		min-width: 12px;
		min-height: 12px;
		background: var(--color-success);
		border: 2px solid white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.6em;
		font-weight: bold;
		color: white;
		line-height: 1;
	}

	/* Size variants */
	.avatar--sm {
		width: 32px;
		height: 32px;
		font-size: var(--text-sm);
	}

	.avatar--md {
		width: 48px;
		height: 48px;
		font-size: var(--text-base);
	}

	.avatar--lg {
		width: 64px;
		height: 64px;
		font-size: var(--text-lg);
	}

	.avatar--xl {
		width: 96px;
		height: 96px;
		font-size: var(--text-xl);
	}

	.avatar--2xl {
		width: 128px;
		height: 128px;
		font-size: var(--text-2xl);
	}
</style>
