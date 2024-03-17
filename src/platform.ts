import { getCurrentRuntime } from "@cross/runtime";

//shims Node.js process object
declare const process: {
    platform: "aix" | "darwin" | "freebsd" | "linux" | "openbsd" | "sunos" | "win32";
};

/**
 * The supported platforms for which this function can determine the OS.
 * @enum {string}
 */
type SupportedPlatforms = "linux" | "macos" | "windows";

/**
 * Detects the current operating system (Linux, macOS, or Windows) based on the
 * runtime environment.
 *
 * Leverages the `@cross/runtime` library and Node.js process information (if applicable).
 *
 * @returns {SupportedPlatforms} The detected operating system, or "linux" as a
 *           fallback if detection fails.
 */
export function detectPlatform(): SupportedPlatforms {
    const runtime = getCurrentRuntime();

    try {
        if (runtime === "deno") {
            const os = Deno.build.os;
            if (os === "darwin") return "macos";
            if (os === "windows") return "windows";
            return "linux";
        } else if (runtime === "node" || runtime === "bun") {
            switch (process.platform) {
                case "darwin":
                    return "macos";
                case "win32":
                    return "windows";
                default:
                    return "linux";
            }
        }
    } catch (e) {
        console.error("Error detecting platform:", e);
    }

    // Default to 'linux' if the runtime environment is not detected or in case of an error.
    // This default behavior assumes that 'linux' is the most versatile choice for
    // environments where the platform cannot be determined.
    return "linux";
}
