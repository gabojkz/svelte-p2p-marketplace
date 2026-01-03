/// <reference types="@sveltejs/kit" />
/// <reference types="@cloudflare/workers-types" />

declare global {
	namespace App {
		interface Locals {
			db?: ReturnType<typeof import('$lib/server/db.js').createDb>;
			session: {
				id: string;
				userId: string;
				token: string;
				expiresAt: Date;
			} | null;
			user: {
				id: string;
				name: string;
				email: string;
				emailVerified: boolean;
				image?: string | null;
				createdAt: Date;
				updatedAt: Date;
			} | null;
		}
		interface Platform {
			env?: {
				DATABASE_URL: string;
				BETTER_AUTH_SECRET: string;
				R2_BUCKET?: R2Bucket;
			};
			context?: ExecutionContext;
			caches?: CacheStorage & { default: Cache };
		}
	}

	// Leaflet types for CDN usage
	interface Window {
		L?: any;
	}
}

export {};
