# Metis API Client

[![NPM](https://nodei.co/npm/@metis-w/api-client.png)](https://npmjs.com/package/@metis-w/api-client)

## Features

- 🎯 **Dynamic Routes** - `api.users.getProfile()`, `api.admin.users.ban()`
- 📊 **Parameterized Endpoints** - `api.users(123).follow()`, `api.posts('slug').view()`
- 🔧 **TypeScript First** - Full type safety and IntelliSense support
- 🚀 **Modern Fetch API** - No XMLHttpRequest, pure modern JavaScript
- 🔄 **Interceptors** - Request/Response middleware with logging, caching, performance
- ⚡ **Automatic Retries** - Configurable retry logic with exponential backoff
- 🏷️ **Case Conversion** - Automatic camelCase ↔ kebab-case conversion
- 📁 **File Upload** - Automatic FormData handling for File/Blob objects
- 🎨 **Flexible Configuration** - Per-request and global settings

## Installation

```bash
npm install @metis-w/api-client
```

## Quick Start

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

// Alternative: Use convenience functions
import { createClient, createDynamicClient, IDynamicClient } from '@metis-w/api-client';

const apiClient = createClient({ baseUrl: 'https://api.example.com' });
const dynamicApi: IDynamicClient = createDynamicClient({ baseUrl: 'https://api.example.com' });
```

### Dynamic Routes

```typescript
import { DynamicClient, IDynamicClient } from '@metis-w/api-client';

const api: IDynamicClient = new DynamicClient({
    baseUrl: 'https://api.example.com',
    useKebabCase: true // converts getUserInfo → get-user-info
});

// Dynamic routing magic - no 'as any' needed!
const profile = await api.users.getProfile({ id: 123 });
const result = await api.admin.users.ban({ userId: 456, reason: 'spam' });

// Multi-level routes
const settings = await api.users.profile.getSettings({ theme: 'dark' });
```

### Parameterized Routes

Enhanced parameterized routes with direct call support:

```typescript
// Traditional parameterized routes with actions
const user = await api.users(123).get();                    // GET /users/123/get
const follow = await api.users(123).follow({ notify: true }); // POST /users/123/follow
const profile = await api.users(456).profile.update({ bio: 'New bio' }); // PUT /users/456/profile/update

// NEW: Direct parameterized route calls (RESTful)
const user = await api.users(123)();                        // GET /users/123
const updated = await api.users(123)({ name: "John" });     // PUT /users/123 (with payload = update)
const deleted = await api.users(123)({ method: "DELETE" }); // DELETE /users/123 (explicit method)

// With query parameters
const user = await api.users(123)({}, { include: "profile" }); // GET /users/123?include=profile
const updated = await api.users(123)({ name: "John" }, { format: "json" }); // PUT /users/123?format=json
```

#### Direct Call Logic

- **No payload**: `GET /resource/id` - Retrieve the resource
- **With payload**: `PUT /resource/id` - Update the resource (default semantic)
- **Explicit method**: Override with `{ method: "DELETE" }` etc.
- **Query params**: Second parameter for URL query string

### HTTP Method Resolution

The DynamicClient intelligently determines the appropriate HTTP method based on several factors:

#### 1. Explicit Method (Highest Priority)

```typescript
// Override any automatic method detection
await api.users.create({ name: "John", method: "PUT" });  // Forces PUT method
await api.users.delete({ confirm: true, method: "POST" }); // Forces POST method
```

#### 2. Direct HTTP Methods

```typescript
// Direct method calls
await api.users.get();     // GET /users/get
await api.users.post();    // POST /users/post
await api.users.put();     // PUT /users/put
await api.users.delete();  // DELETE /users/delete
await api.users.patch();   // PATCH /users/patch
```

#### 3. Semantic Analysis (Auto-detection)

The library automatically detects the intent from action names:

```typescript
// GET methods (reading data)
await api.users.fetch();           // GET
await api.users.load();            // GET
await api.users.find();            // GET
await api.users.retrieve();        // GET
await api.users.show();            // GET
await api.users.view();            // GET
await api.users.getProfile();      // GET (starts with 'get')
await api.users.loadSettings();    // GET (starts with 'load')

// POST methods (creating data)
await api.users.create();          // POST
await api.users.add();             // POST
await api.users.save();            // POST
await api.users.store();           // POST
await api.users.insert();          // POST
await api.users.register();        // POST
await api.users.submit();          // POST
await api.users.createUser();      // POST (starts with 'create')

// PUT methods (updating/replacing data)
await api.users.update();          // PUT
await api.users.replace();         // PUT
await api.users.modify();          // PUT
await api.users.edit();            // PUT
await api.users.change();          // PUT
await api.users.set();             // PUT
await api.users.updateProfile();   // PUT (starts with 'update')

// DELETE methods (removing data)
await api.users.delete();          // DELETE
await api.users.remove();          // DELETE
await api.users.destroy();         // DELETE
await api.users.clear();           // DELETE
await api.users.drop();            // DELETE
await api.users.deleteUser();      // DELETE (starts with 'delete')

// PATCH methods (partial updates)
await api.users.patch();           // PATCH
await api.users.partial();         // PATCH
await api.users.toggle();          // PATCH
await api.users.enable();          // PATCH
await api.users.disable();         // PATCH
await api.users.activate();        // PATCH
await api.users.deactivate();      // PATCH
```

#### 4. Custom Method Rules

Define custom patterns for your API:

```typescript
const api = new DynamicClient({
    baseUrl: 'https://api.example.com',
    methodRules: {
        'users': 'GET',           // api.users.anything() → GET
        'auth': 'POST',           // api.auth.anything() → POST
        'validate*': 'POST',      // api.*.validateSomething() → POST
        '*report': 'GET'          // api.*.generateReport() → GET
    }
});

await api.users.getAll();          // GET (rule override)
await api.auth.login();            // POST (rule override)
await api.data.validateInput();    // POST (pattern match)
await api.sales.monthlyReport();   // GET (pattern match)
```

#### 5. Default Method

Set a fallback method for unrecognized actions:

```typescript
const api = new DynamicClient({
    baseUrl: 'https://api.example.com',
    defaultMethod: 'GET' // Default to GET instead of POST
});

await api.users.unknownAction();   // GET (fallback to default)
```

#### Priority Order

The method resolution follows this priority:

1. **Explicit method** in payload (`{ method: "DELETE" }`)
2. **Direct HTTP method** (`get`, `post`, `put`, `delete`, `patch`)
3. **Custom method rules** (from `methodRules` config)
4. **Semantic analysis** (action name patterns)
5. **Default method** (from `defaultMethod` config, defaults to `POST`)

### File Uploads

```typescript
const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
const file = fileInput.files?.[0];

if (file) {
    // Automatic FormData handling
    const response = await api.post('/upload/avatar', {
        file: file,
        userId: 123,
        metadata: { title: 'Profile Picture' }
    });
}

// Multiple files
const files = Array.from(fileInput.files || []);
const response = await api.post('/upload/gallery', {
    files: files,
    albumId: 456,
    tags: ['vacation', 'summer']
});
```

### TypeScript Support

Full TypeScript integration with intelligent type inference and **zero use of `any`**:

```typescript
// Import types for proper typing
import { DynamicClient, IDynamicClient, APIClient } from '@metis-w/api-client';

// Define your API response types
interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
}

// Type-safe API calls with APIClient
const client = new APIClient({ baseUrl: 'https://api.example.com' });
const user = await client.get<User>('/users/123');
// user.data is typed as User | undefined

const newUser = await client.post<User, CreateUserRequest>('/users', {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'secure123'
});

// Type-safe dynamic client - no 'as any' casting needed!
const dynamicClient: IDynamicClient = new DynamicClient({ 
    baseUrl: 'https://api.example.com',
    defaultMethod: 'GET',
    methodRules: {
        'auth*': 'POST'
    }
});

// TypeScript understands these are dynamic routes with proper return types
const userData = await dynamicClient.users.getProfile({ id: 123 });
// userData is typed as APIResponse<unknown>

// All HTTP methods work seamlessly
await dynamicClient.users.create({ name: "John" });     // POST (semantic)
await dynamicClient.users.update({ id: 1 });            // PUT (semantic)
await dynamicClient.users.fetch();                      // GET (semantic)
await dynamicClient.users.remove();                     // DELETE (semantic)
await dynamicClient.users.patch({ status: "active" });  // PATCH (semantic)

// Custom method rules
await dynamicClient.auth.login({ email: "test@test.com" }); // POST (rule)

// Explicit method override
await dynamicClient.users.action({ data: "test", method: "DELETE" }); // DELETE (explicit)
const profile = await dynamicClient.users(123).get();
const updated = await dynamicClient.users(123).update({ name: 'John Smith' });
```

### Generic Type Support

```typescript
// Create a typed API client
class TypedAPIClient extends APIClient {
    async getUser(id: number): Promise<User> {
        const response = await this.get<User>(`/users/${id}`);
        if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'User not found');
        }
        return response.data;
    }

    async createUser(userData: CreateUserRequest): Promise<User> {
        const response = await this.post<User, CreateUserRequest>('/users', userData);
        if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Failed to create user');
        }
        return response.data;
    }
}

const typedApi = new TypedAPIClient({ baseUrl: 'https://api.example.com' });
const user = await typedApi.getUser(123); // Returns User directly
```

## API Reference

### APIClient

| Method | Description |
|--------|-------------|
| `get<T>(url, config?)` | GET request |
| `post<T>(url, data?, config?)` | POST request |
| `put<T>(url, data?, config?)` | PUT request |
| `delete<T>(url, config?)` | DELETE request |
| `patch<T>(url, data?, config?)` | PATCH request |
| `interceptors.addRequestInterceptor(fn)` | Add request middleware |
| `interceptors.addResponseInterceptor(fn)` | Add response middleware |
| `destroy()` | Clean up client resources |

### DynamicClient

All APIClient methods plus:

| Method | Description |
|--------|-------------|
| `cache.getStats()` | Get cache statistics for dynamic routes |
| `cache.clearProxyCache()` | Clear dynamic route cache |

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

interface ClientError {
    message: string;
    type: "network" | "timeout" | "abort" | "parse";
    originalError?: Error;
    response?: RawResponse;
}
```

## Testing

The project includes comprehensive test coverage using Jest and TypeScript.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

Our test suite covers all major functionality:

```
test/
├── api-client.test.ts     # Core APIClient functionality
├── dynamic-client.test.ts # Dynamic routing and parameterized endpoints
├── converter.test.ts      # Case conversion utilities
├── serializer.test.ts     # Data serialization and FormData handling
├── url-builder.test.ts    # URL construction utilities
├── setup.ts              # Test configuration and global mocks
└── globals.d.ts          # TypeScript definitions for test environment
```

### Key Test Scenarios

#### APIClient Tests
- ✅ Basic HTTP methods (GET, POST, PUT, DELETE, PATCH)
- ✅ Request/Response interceptors
- ✅ Error handling and retry logic
- ✅ FormData handling for file uploads
- ✅ Configuration merging and validation

#### DynamicClient Tests
- ✅ Dynamic route generation (`api.users.getProfile()`)
- ✅ Parameterized endpoints (`api.users(123).follow()`)
- ✅ Multi-level routing (`api.admin.users.ban()`)
- ✅ Case conversion (camelCase ↔ kebab-case)
- ✅ Nested parameters and complex data structures

#### Data Serialization Tests
- ✅ FormData handling for file uploads
- ✅ JSON serialization and content-type detection
- ✅ Deep object transformation
- ✅ File and Blob object detection
- ✅ Edge cases and performance validation

#### URL Builder Tests
- ✅ URL construction with path segments
- ✅ Query parameter handling
- ✅ Base URL normalization
- ✅ Special characters and encoding

#### Case Conversion Tests
- ✅ camelCase to kebab-case conversion
- ✅ kebab-case to camelCase conversion
- ✅ Deep object key transformation
- ✅ Array handling with nested objects

### Writing Tests

When contributing, follow these testing patterns:

```typescript
import { APIClient } from '../src/core/api-client';

describe('APIClient', () => {
    let client: APIClient;
    
    beforeEach(() => {
        client = new APIClient({ baseUrl: 'https://test.api' });
        jest.clearAllMocks();
    });
    
    afterEach(() => {
        client.destroy(); // Important: Clean up resources
    });
    
    it('should make GET request', async () => {
        const mockResponse = { success: true, data: { id: 1 } };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });
        
        const result = await client.get('/test');
        expect(result).toEqual(mockResponse);
    });
});
```

## Architecture

The project follows a modular architecture for maintainability and testability:

### Core Components

```
src/
├── core/                  # Main client classes
│   ├── api-client.ts     # Core HTTP client
│   └── dynamic-client.ts # Dynamic routing client
├── libs/                 # Reusable libraries
│   ├── builders/         # Request and route builders
│   ├── constants/        # Configuration constants
│   ├── managers/         # Cache, interceptor, retry managers
│   ├── parsers/          # Response parsing logic
│   └── security/         # Input sanitization
├── utils/                # Utility functions
│   ├── case-converter.ts # Case conversion logic
│   ├── data-serializer.ts# Data transformation and FormData handling
│   ├── url-builder.ts    # URL construction
│   └── route-validator.ts# Route validation
├── types/                # TypeScript definitions
│   ├── config.ts         # Configuration types
│   ├── request.ts        # Request types
│   └── response.ts       # Response types
└── interceptors/         # Pre-built interceptors
    ├── logging.ts        # Request/response logging
    ├── cache.ts          # Response caching
    └── timing.ts         # Performance monitoring
```

### Design Principles

1. **Separation of Concerns** - Each component has a single responsibility
2. **Dependency Injection** - Components accept dependencies, making testing easier
3. **Resource Management** - Proper cleanup with `destroy()` methods
4. **Type Safety** - Strict TypeScript configuration with full type coverage
5. **Immutability** - Configurations are cloned, not mutated
6. **Error Boundaries** - Graceful error handling at every level

## Integration Examples

### Next.js Integration

```typescript
// lib/api.ts
import { DynamicClient, IDynamicClient } from '@metis-w/api-client';

export const api: IDynamicClient = new DynamicClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth interceptor
api.interceptors.addRequestInterceptor(async (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
    }
    return config;
});

// pages/users/[id].tsx
import { api } from '../../lib/api';

export default function UserProfile({ user }) {
    const handleFollow = async () => {
        try {
            await api.users(user.id).follow();
            // Update UI
        } catch (error) {
            console.error('Failed to follow user:', error);
        }
    };

    return <div>{/* Component JSX */}</div>;
}

export async function getServerSideProps(context) {
    const { id } = context.params;
    const user = await api.users(id).get();
    
    return { props: { user: user.data } };
}
```

### React Query Integration

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

// Custom hooks
export const useUser = (id: number) => {
    return useQuery({
        queryKey: ['user', id],
        queryFn: () => api.users(id).get(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useFollowUser = () => {
    return useMutation({
        mutationFn: (userId: number) => api.users(userId).follow(),
        onSuccess: () => {
            // Invalidate and refetch user data
            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
    });
};
```

## Comparison with Other Libraries

### vs. Axios

| Feature | @metis-w/api-client | Axios |
|---------|-------------------|-------|
| Bundle Size | ~15KB | ~45KB |
| Dynamic Routes | ✅ `api.users.get()` | ❌ Manual URLs |
| TypeScript | ✅ Built-in | ⚠️ Community types |
| Modern Fetch | ✅ Native | ❌ XMLHttpRequest |
| Tree Shaking | ✅ Full support | ⚠️ Limited |
| Interceptors | ✅ Async/await | ✅ Promise-based |

### vs. Native Fetch

| Feature | @metis-w/api-client | Fetch API |
|---------|-------------------|-----------|
| Dynamic Routes | ✅ `api.users(123).follow()` | ❌ Manual |
| Error Handling | ✅ Automatic | ❌ Manual |
| Retries | ✅ Built-in | ❌ Manual |
| Interceptors | ✅ Built-in | ❌ Manual |
| File Uploads | ✅ Automatic | ❌ Manual FormData |
| TypeScript | ✅ Full support | ⚠️ Basic |

## Performance Considerations

### Bundle Size Optimization

```typescript
// Import only what you need
import { APIClient } from '@metis-w/api-client';
import { requestLoggingInterceptor } from '@metis-w/api-client';

// Or import specific modules
import { DynamicClient } from '@metis-w/api-client/core';
import { CacheInterceptor } from '@metis-w/api-client/interceptors';

// Tree-shaking will remove unused code
```

### Memory Management

```typescript
// Always destroy clients when done
const api = new APIClient(config);

// In cleanup (useEffect, componentWillUnmount, etc.)
useEffect(() => {
    return () => api.destroy();
}, []);

// For DynamicClient, cache is automatically cleared
const dynamicApi = new DynamicClient(config);
useEffect(() => {
    return () => dynamicApi.destroy(); // Clears both client and cache
}, []);
```

### Caching Strategy

```typescript
import { CacheInterceptor } from '@metis-w/api-client';

const cache = new CacheInterceptor({
    ttl: 5 * 60 * 1000,  // 5 minutes
    maxSize: 100         // Max 100 cached responses
});

// Add to client
api.interceptors.addRequestInterceptor(cache.requestInterceptor);
api.interceptors.addResponseInterceptor(cache.responseInterceptor);

// Check cache statistics
console.log(cache.getStats());
```

## Examples

Check out the comprehensive test suite for real-world examples:

- [`test/api-client.test.ts`](./test/api-client.test.ts) - Core APIClient functionality
- [`test/dynamic-client.test.ts`](./test/dynamic-client.test.ts) - Dynamic routing examples
- [`test/converter.test.ts`](./test/converter.test.ts) - Case conversion examples
- [`test/serializer.test.ts`](./test/serializer.test.ts) - Data transformation examples
- [`test/url-builder.test.ts`](./test/url-builder.test.ts) - URL construction examples

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

```bash
# Clone the repository
git clone https://github.com/metis-w/api-client.git
cd api-client

# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode during development
npm run test:watch
```

### Contribution Guidelines

1. **Code Style** - Follow the existing TypeScript patterns
2. **Tests Required** - All new features must include tests
3. **Documentation** - Update README.md for new features
4. **Type Safety** - Maintain strict TypeScript compliance
5. **Performance** - Consider bundle size and runtime performance

### Adding New Features

1. Create feature branch: `git checkout -b feature/new-feature`
2. Add implementation in appropriate `src/` directory
3. Write comprehensive tests in `test/` directory
4. Update documentation and examples
5. Submit pull request with detailed description

### Reporting Issues

When reporting bugs, please include:
- Environment details (Node.js version, TypeScript version)
- Minimal reproduction case
- Expected vs actual behavior
- Test case if possible

## 📄 License

MIT © [whiteakyloff](https://github.com/metis-w)

---
