/**
 * Thrown when a directory type is unknown or not supported on the current platform.
 */
export class UnsupportedDirectoryError extends Error {
    /** The requested directory type. */
    readonly type: string;
    /** The current platform. */
    readonly platform: string;

    /**
     * Creates a new UnsupportedDirectoryError.
     * @param {string} type - The requested directory type.
     * @param {string} platform - The current platform.
     */
    constructor(type: string, platform: string) {
        super(`Directory type ${type} not supported on this platform (${platform})`);
        this.name = "UnsupportedDirectoryError";
        this.type = type;
        this.platform = platform;
    }
}

/**
 * Thrown when a directory type is supported on the current platform, but its path could not be resolved.
 * For example when the environment variable is unset and there is no fallback, or a Linux user directory is disabled.
 */
export class DirectoryNotFoundError extends Error {
    /** The requested directory type. */
    readonly type: string;
    /** The current platform. */
    readonly platform: string;

    /**
     * Creates a new DirectoryNotFoundError.
     * @param {string} type - The requested directory type.
     * @param {string} platform - The current platform.
     * @param {string} [message] - Optional message, defaults to a generic "not set" message.
     */
    constructor(type: string, platform: string, message?: string) {
        super(message ?? `No environment variable set for ${type} on ${platform}`);
        this.name = "DirectoryNotFoundError";
        this.type = type;
        this.platform = platform;
    }
}
