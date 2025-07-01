# Metis API Client

[![NPM](https://nodei.co/npm/@metis-w/api-client.png)](https://npmjs.com/package/@metis-w/api-client)

## ✨ Features

- 🎯 **Dynamic Routes** - `api.users.getProfile()`, `api.admin.users.ban()`
- 📊 **Parameterized Endpoints** - `api.users(123).follow()`, `api.posts('slug').view()`
- 🔧 **TypeScript First** - Full type safety and IntelliSense support
- 🚀 **Modern Fetch API** - No XMLHttpRequest, pure modern JavaScript
- 🔄 **Interceptors** - Request/Response middleware with logging, caching, performance
- ⚡ **Automatic Retries** - Configurable retry logic with exponential backoff
- 🏷️ **Case Conversion** - Automatic camelCase ↔ kebab-case conversion
- 📁 **File Upload** - Automatic FormData handling for File/Blob objects
- 🎨 **Flexible Configuration** - Per-request and global settings

## 📦 Installation

```bash
npm install @metis-w/api-client
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { APIClient } from '@metis-w/api-client';

const api = new APIClient({
    baseUrl: 'https://api.example.com',
    timeout: 5000
});

// Simple requests
const users = await api.get('/users');
const newUser = await api.post('/users', { name: 'John', email: 'john@example.com' });
```

### Dynamic Routes

```typescript
import { DynamicClient } from '@metis-w/api-client';

const api = new DynamicClient({
    baseUrl: 'https://api.example.com',
    useKebabCase: true // converts getUserInfo → get-user-info
});

// Dynamic routing magic
const profile = await api.users.getProfile({ id: 123 });
const result = await api.admin.users.ban({ userId: 456, reason: 'spam' });

// Multi-level routes
const settings = await api.users.profile.getSettings({ theme: 'dark' });
```

### Parameterized Routes

```typescript
// RESTful endpoints with parameters
const user = await api.users(123).get();                    // GET /users/123
const follow = await api.users(123).follow({ notify: true }); // POST /users/123/follow
const profile = await api.users(456).profile.update({ bio: 'New bio' }); // POST /users/456/profile/update
```

## 🔧 Advanced Features

### Interceptors

```typescript
import { requestLoggingInterceptor, performanceInterceptor } from '@metis-w/api-client';

// Logging
api.addRequestInterceptor(requestLoggingInterceptor({ logLevel: 'info' }));

// Performance monitoring
const { requestInterceptor, responseInterceptor } = performanceInterceptor();
api.addRequestInterceptor(requestInterceptor);
api.addResponseInterceptor(responseInterceptor);
```

### Caching

```typescript
import { CacheInterceptor } from '@metis-w/api-client';

const cache = new CacheInterceptor({ 
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100 
});

api.addRequestInterceptor(cache.requestInterceptor);
api.addResponseInterceptor(cache.responseInterceptor);
```

### File Uploads

```typescript
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

// Automatic FormData handling
const response = await api.upload.avatar({
    file: file,
    userId: 123,
    metadata: { title: 'Profile Picture' }
});
```

## 📝 API Reference

### APIClient

| Method | Description |
|--------|-------------|
| `get<T>(url, config?)` | GET request |
| `post<T>(url, data?, config?)` | POST request |
| `put<T>(url, data?, config?)` | PUT request |
| `delete<T>(url, config?)` | DELETE request |
| `patch<T>(url, data?, config?)` | PATCH request |
| `addRequestInterceptor(fn)` | Add request middleware |
| `addResponseInterceptor(fn)` | Add response middleware |

### Configuration

```typescript
interface APIConfig {
    baseUrl: string;
    timeout?: number;
    headers?: Record<string, string>;
    withCredentials?: boolean;
    retries?: number;
    retryDelay?: number;
    useKebabCase?: boolean;
}
```

### Response Format

```typescript
interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code?: number;
        message?: string;
    };
}
```

## 🧪 Examples

Check out the `test/` directory for comprehensive examples:
- `test-api-client.ts` - Basic API client usage
- `test-dynamic-client.ts` - Dynamic routes examples  
- `test-parameterized.ts` - Parameterized endpoints
- `test-interceptors.ts` - Interceptors and middleware

## 📄 License

MIT © [whiteakyloff](https://github.com/whiteakyloff)

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines and submit pull requests.

---
