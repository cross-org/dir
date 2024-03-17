import { getEnv } from "@cross/env";
import { detectPlatform } from "./platform.ts";
import { spawn } from "@cross/utils";
import { directoryConfig, DirectoryTypes, DirectoryTypeStrings, isWindowsConfigItem } from "./config.ts";
export { DirectoryTypes } from "./config.ts";

/**
 * Retrieves the path to a standard user directory based on the provided string and the current operating system.
 *
 * @param {string} type - The type of directory to retrieve as a string.
 * @returns {Promise<string>} A promise that resolves to the full path of the directory.
 */
export async function dir(type: DirectoryTypeStrings): Promise<string>;

/**
 * Retrieves the path to a standard user directory based on the provided type and the current operating system.
 *
 * @param {DirectoryTypes} type - The type of directory to retrieve.
 * @returns {Promise<string>} A promise that resolves to the full path of the directory.
 */
export async function dir(type: DirectoryTypes): Promise<string>;

/**
 * Retrieves the path to a standard user directory based on the provided type and the current operating system.
 *
 * @param {DirectoryTypes} type - The type of directory to retrieve (e.g., 'home', 'cache', 'config').
 * @returns {Promise<string>} A promise that resolves to the full path of the directory.
 * @throws {Error} If the directory type is not supported on the current platform.
 * @throws {Error} If no suitable environment variable is found for the requested directory.
 */

export async function dir(type: string): Promise<string> {
    const platform = detectPlatform();
    const dirType = typeof type === "string" ? DirectoryTypes[type.toLowerCase() as keyof typeof DirectoryTypes] : type;
    const configs = directoryConfig[dirType] && directoryConfig[dirType][platform];

    if (!configs) {
        throw new Error(`Directory type ${dirType ?? type} not supported on this platform (${platform})`);
    }

    for (const config of configs) {
        if (platform === "windows" && isWindowsConfigItem(config)) {
            const ps = await spawn([
                "powershell",
                "-Command",
                `[Environment]::GetFolderPath('${config.key}')`,
            ]);
            const baseEnv = ps.stdout.trim();

            if (baseEnv) {
                const fullPath = config.extraFolder ? `${baseEnv}${config.extraFolder}` : baseEnv;
                return fullPath;
            }
        } else {
            // Handle non-Windows logic
            const baseEnv = getEnv(config.key);
            if (baseEnv) {
                const fullPath = config.extraFolder ? `${baseEnv}${config.extraFolder}` : baseEnv;
                return fullPath;
            }
        }
    }

    throw new Error(`No environment variable set for ${dirType} on ${platform}`);
}
