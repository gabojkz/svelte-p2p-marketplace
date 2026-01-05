# Security Implementation Guide

This project uses industry-standard libraries for input validation and sanitization to prevent SQL injection, XSS attacks, and other security vulnerabilities.

## Installed Libraries

1. **Zod** (`zod`) - Schema validation library
   - TypeScript-friendly
   - Runtime type checking
   - Automatic type inference

2. **Validator.js** (`validator`) - String validation and sanitization
   - Email, URL, phone validation
   - String sanitization utilities

3. **DOMPurify** (`dompurify` / `isomorphic-dompurify`) - HTML sanitization
   - Prevents XSS attacks
   - Removes malicious HTML/JavaScript
   - Works in both browser and Node.js

## Security Features

### 1. SQL Injection Prevention

**Already Protected:**
- Drizzle ORM uses parameterized queries by default
- All database queries use Drizzle's query builder, which prevents SQL injection

**Additional Protection:**
- `sanitizeSQL()` function removes dangerous SQL patterns
- Input validation ensures only expected data types are accepted

### 2. XSS (Cross-Site Scripting) Prevention

**HTML Sanitization:**
```javascript
import { sanitizeHTML } from '$lib/utils/security.js';

// Sanitize user-generated HTML content
const safeHTML = sanitizeHTML(userInput);
```

**Text Sanitization:**
```javascript
import { sanitizeText } from '$lib/utils/security.js';

// Remove all HTML tags and dangerous characters
const safeText = sanitizeText(userInput);
```

### 3. Input Validation

**Using Zod Schemas:**
```javascript
import { createListingSchema } from '$lib/utils/security-schemas.js';
import { validateRequestBodySafe } from '$lib/utils/api-validation.js';

// In API endpoint
const body = await request.json();
const validation = validateRequestBodySafe(createListingSchema, body);

if (!validation.valid) {
  return json(validation.errors, { status: 400 });
}

// Use validated data
const safeData = validation.data;
```

## Usage Examples

### Example 1: API Endpoint Validation

```javascript
// src/routes/api/listings/+server.js
import { createListingSchema } from '$lib/utils/security-schemas.js';
import { validateRequestBodySafe } from '$lib/utils/api-validation.js';

export async function POST({ request, locals }) {
  const body = await request.json();
  
  // Validate and sanitize
  const validation = validateRequestBodySafe(createListingSchema, body);
  if (!validation.valid) {
    return json(validation.errors, { status: 400 });
  }
  
  // Use validated data (already sanitized)
  const data = validation.data;
  // ... rest of your code
}
```

### Example 2: Client-Side Sanitization

```javascript
// In Svelte component
import { sanitizeText, sanitizeHTML } from '$lib/utils/security.js';

let userInput = $state('');

// For plain text
const safeText = sanitizeText(userInput);

// For HTML content (like descriptions)
const safeHTML = sanitizeHTML(userInput);
```

### Example 3: Custom Validation

```javascript
import { validateWithSchema, validationSchemas } from '$lib/utils/security.js';
import { z } from 'zod';

// Create custom schema
const customSchema = z.object({
  name: validationSchemas.text(100),
  email: validationSchemas.email,
  age: z.number().int().min(18).max(120)
});

// Validate
const result = validateWithSchema(customSchema, userData);
if (result.success) {
  // Use result.data
} else {
  // Handle result.error
}
```

## Available Validation Schemas

Pre-defined schemas in `src/lib/utils/security-schemas.js`:

- `createListingSchema` - For creating listings
- `updateListingSchema` - For updating listings
- `updateProfileSchema` - For user profile updates
- `createReportSchema` - For user reports
- `createDisputeSchema` - For trade disputes
- `createMessageSchema` - For chat messages
- `createConversationSchema` - For conversations
- `createTradeSchema` - For trades
- `createReviewSchema` - For reviews
- `validateEmailSchema` - For email validation
- `forgotPasswordSchema` - For password reset requests
- `resetPasswordSchema` - For password resets

## Security Functions

### Sanitization Functions

- `sanitizeText(input)` - Removes HTML and dangerous characters
- `sanitizeHTML(input, options)` - Sanitizes HTML using DOMPurify
- `sanitizeSQL(input)` - Removes SQL injection patterns
- `sanitizeFilename(filename)` - Prevents path traversal attacks

### Validation Functions

- `isValidEmail(email)` - Validates email format
- `isValidURL(url)` - Validates URL format
- `validateLength(input, min, max)` - Validates string length
- `isSafeString(input, pattern)` - Checks for safe characters
- `validateWithSchema(schema, data)` - Validates using Zod schema
- `validateFormData(data, rules)` - Validates form data with custom rules

## Best Practices

1. **Always validate on the server** - Client-side validation can be bypassed
2. **Use parameterized queries** - Drizzle ORM does this automatically
3. **Sanitize before storing** - Clean data before saving to database
4. **Sanitize before displaying** - Clean data before rendering to users
5. **Use type-safe schemas** - Zod schemas provide type safety
6. **Limit input length** - Prevent DoS attacks with length limits
7. **Validate file uploads** - Check file types and sizes
8. **Use HTTPS** - Encrypt data in transit
9. **Implement rate limiting** - Prevent abuse
10. **Log security events** - Monitor for suspicious activity

## Migration Guide

To migrate existing endpoints:

1. Import the appropriate schema from `security-schemas.js`
2. Replace manual validation with `validateRequestBodySafe()`
3. Use the validated data instead of raw request body
4. Remove manual sanitization (already handled by schemas)

Example migration:

```javascript
// Before
const body = await request.json();
if (!body.title || body.title.trim() === "") {
  return json({ error: "Title required" }, { status: 400 });
}
const title = body.title.trim();

// After
import { createListingSchema } from '$lib/utils/security-schemas.js';
import { validateRequestBodySafe } from '$lib/utils/api-validation.js';

const body = await request.json();
const validation = validateRequestBodySafe(createListingSchema, body);
if (!validation.valid) {
  return json(validation.errors, { status: 400 });
}
const title = validation.data.title; // Already sanitized
```

## Additional Resources

- [Zod Documentation](https://zod.dev/)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Validator.js Documentation](https://github.com/validatorjs/validator.js)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

