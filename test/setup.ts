global.fetch = jest.fn();

expect.extend({
    toBeAPIResponse(received) {
        const pass =
            typeof received === "object" &&
            received !== null &&
            typeof received.success === "boolean";

        if (pass) {
            return {
                message: () =>
                    `expected ${received} not to be a valid API response`,
                pass: true,
            };
        } else {
            return {
                message: () =>
                    `expected ${received} to be a valid API response with success property`,
                pass: false,
            };
        }
    },
});

global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};
