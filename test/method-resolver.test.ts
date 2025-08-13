import { MethodResolver, MethodResolverOptions } from '../src';

describe('MethodResolver', () => {
    describe('determineMethod', () => {
        const defaultOptions: MethodResolverOptions = {
            defaultMethod: 'POST',
            methodRules: {
                'users': 'GET',
                'auth': 'POST'
            }
        };

        it('should return explicit method when provided', () => {
            const result = MethodResolver.determineMethod('anyAction', defaultOptions, 'PUT');
            expect(result).toBe('PUT');
        });

        it('should resolve direct HTTP method', () => {
            expect(MethodResolver.determineMethod('get', defaultOptions)).toBe('GET');
            expect(MethodResolver.determineMethod('post', defaultOptions)).toBe('POST');
            expect(MethodResolver.determineMethod('put', defaultOptions)).toBe('PUT');
            expect(MethodResolver.determineMethod('delete', defaultOptions)).toBe('DELETE');
            expect(MethodResolver.determineMethod('patch', defaultOptions)).toBe('PATCH');
        });

        it('should apply custom method rules', () => {
            expect(MethodResolver.determineMethod('users', defaultOptions)).toBe('GET');
            expect(MethodResolver.determineMethod('auth', defaultOptions)).toBe('POST');
        });

        it('should perform semantic analysis for GET methods', () => {
            const getActions = [
                'fetch', 'get', 'load', 'retrieve', 'find', 'read', 'show', 'view',
                'fetchUsers', 'getUserById', 'loadProfile', 'readItems',
                'showDetails', 'viewData', 'retrieveInfo'
            ];

            getActions.forEach(action => {
                const result = MethodResolver.determineMethod(action, defaultOptions);
                expect(result).toBe('GET');
            });
        });

        it('should perform semantic analysis for POST methods', () => {
            const postActions = [
                'create', 'add', 'insert', 'store', 'save', 'register', 'submit', 'new',
                'createUser', 'addItem', 'insertRecord', 'saveData', 'registerUser', 'submitForm'
            ];

            postActions.forEach(action => {
                const result = MethodResolver.determineMethod(action, defaultOptions);
                expect(result).toBe('POST');
            });
        });

        it('should perform semantic analysis for PUT methods', () => {
            const putActions = [
                'update', 'replace', 'put', 'modify', 'edit', 'change', 'set',
                'updateUser', 'replaceItem', 'modifyRecord', 'editProfile',
                'changePassword', 'setStatus'
            ];

            putActions.forEach(action => {
                const result = MethodResolver.determineMethod(action, defaultOptions);
                expect(result).toBe('PUT');
            });
        });

        it('should perform semantic analysis for DELETE methods', () => {
            const deleteActions = [
                'delete', 'remove', 'destroy', 'clear', 'drop', 'cancel',
                'deleteUser', 'removeItem', 'destroyRecord', 'clearCache',
                'dropTable', 'cancelOrder'
            ];

            deleteActions.forEach(action => {
                const result = MethodResolver.determineMethod(action, defaultOptions);
                expect(result).toBe('DELETE');
            });
        });

        it('should perform semantic analysis for PATCH methods', () => {
            const patchActions = [
                'patch', 'partial', 'toggle', 'enable', 'disable', 'activate', 'deactivate',
                'patchUser', 'partialUpdate', 'toggleStatus', 'enableFeature',
                'disableService', 'activateAccount', 'deactivateUser'
            ];

            patchActions.forEach(action => {
                const result = MethodResolver.determineMethod(action, defaultOptions);
                expect(result).toBe('PATCH');
            });
        });

        it('should return default method when no patterns match', () => {
            const result = MethodResolver.determineMethod('unknownAction', defaultOptions);
            expect(result).toBe('POST');
        });

        it('should handle empty method rules', () => {
            const options: MethodResolverOptions = {
                defaultMethod: 'GET',
                methodRules: {}
            };

            const result = MethodResolver.determineMethod('users', options);
            expect(result).toBe('GET'); // Should use defaultMethod
        });

        it('should handle undefined method rules', () => {
            const options: MethodResolverOptions = {
                defaultMethod: 'GET'
            };

            const result = MethodResolver.determineMethod('users', options);
            expect(result).toBe('GET'); // Should use defaultMethod
        });

        it('should prioritize explicit method over all other rules', () => {
            const options: MethodResolverOptions = {
                defaultMethod: 'POST',
                methodRules: {
                    'create': 'GET' // Conflicting rule
                }
            };

            const result = MethodResolver.determineMethod('create', options, 'DELETE');
            expect(result).toBe('DELETE'); // Explicit method should win
        });

        it('should prioritize direct HTTP method over custom rules', () => {
            const options: MethodResolverOptions = {
                defaultMethod: 'POST',
                methodRules: {
                    'get': 'PUT' // Conflicting rule
                }
            };

            const result = MethodResolver.determineMethod('get', options);
            expect(result).toBe('GET'); // Direct HTTP method should win
        });

        it('should prioritize custom rules over semantic analysis', () => {
            const options: MethodResolverOptions = {
                defaultMethod: 'POST',
                methodRules: {
                    'create': 'GET' // Override semantic analysis
                }
            };

            const result = MethodResolver.determineMethod('create', options);
            expect(result).toBe('GET'); // Custom rule should win over semantic analysis
        });

        it('should handle case sensitivity correctly', () => {
            expect(MethodResolver.determineMethod('GET', defaultOptions)).toBe('GET');
            expect(MethodResolver.determineMethod('get', defaultOptions)).toBe('GET');
            expect(MethodResolver.determineMethod('Create', defaultOptions)).toBe('POST');
            expect(MethodResolver.determineMethod('CREATE', defaultOptions)).toBe('POST');
        });

        it('should handle edge cases', () => {
            expect(MethodResolver.determineMethod('', defaultOptions)).toBe('POST');
            expect(MethodResolver.determineMethod('  ', defaultOptions)).toBe('POST');
        });
    });
});
