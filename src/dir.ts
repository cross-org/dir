import { getEnv } from "@cross/env";
import { getCurrentOS } from "@cross/runtime";
import { spawn } from "@cross/utils";
import {
    directoryConfig,
    type DirectoryPathConfig,
    DirectoryTypes,
    isUserDirsConfigItem,
    isWindowsConfigItem,
} from "./config.ts";
import { DirectoryNotFoundError, UnsupportedDirectoryError } from "./errors.ts";
import { getUserDir } from "./userdirs.ts";
export { DirectoryTypes } from "./config.ts";
export { DirectoryNotFoundError, UnsupportedDirectoryError } from "./errors.ts";

/**
 * Options for `dir()`.
 */
export interface DirOptions {
    /**
     * Resolve Windows special folders with PowerShell when no environment variable is available for the directory.
     * Ignored on other platforms. Defaults to false.
     */
    windowsSpecialFolders?: boolean;
}

/**
 * Retrieves the path to a standard user directory based on the provided type and the current operating system.
 *
 * @param {DirectoryTypes} type - The type of directory to retrieve (e.g., 'home', 'cache', 'config').
 * @param {DirOptions} [options] - Optional options.
 * @returns {Promise<string>} A promise that resolves to the full path of the directory.
 * @throws {UnsupportedDirectoryError} If the directory type is unknown or not supported on the current platform.
 * @throws {DirectoryNotFoundError} If the directory path could not be resolved.
 */
export async function dir(type: keyof typeof DirectoryTypes | DirectoryTypes, options?: DirOptions): Promise<string>;

/**
 * Retrieves the path to a standard user directory based on the provided type and the current operating system.
 *
 * @deprecated Pass an options object instead: `dir(type, { windowsSpecialFolders: true })`.
 * @param {DirectoryTypes} type - The type of directory to retrieve (e.g., 'home', 'cache', 'config').
 * @param {boolean} [parseWindowsSpecialDirectories] - Resolve Windows special folders with PowerShell.
 * @returns {Promise<string>} A promise that resolves to the full path of the directory.
 * @throws {UnsupportedDirectoryError} If the directory type is unknown or not supported on the current platform.
 * @throws {DirectoryNotFoundError} If the directory path could not be resolved.
 */
export async function dir(
    type: keyof typeof DirectoryTypes | DirectoryTypes,
    parseWindowsSpecialDirectories?: boolean,
): Promise<string>;

export async function dir(type: string, options?: DirOptions | boolean): Promise<string> {
    const { windowsSpecialFolders = false } = typeof options === "boolean"
        ? { windowsSpecialFolders: options }
        : options ?? {};
    const platform = getCurrentOS();
    const dirType = typeof type === "string" ? DirectoryTypes[type.toLowerCase() as keyof typeof DirectoryTypes] : type;
    const configs = directoryConfig[dirType] && directoryConfig[dirType][platform as keyof DirectoryPathConfig];

    if (!configs) {
        throw new UnsupportedDirectoryError(dirType ?? type, platform);
    }

    let gotWindowsConfigItem: boolean = false;
    let baseEnv: string | undefined;

    for (const config of configs) {
        if (platform === "windows" && isWindowsConfigItem(config)) {
            if (windowsSpecialFolders) {
                const ps = await spawn([
                    "powershell",
                    "-Command",
                    `[Environment]::GetFolderPath('${config.key}')`,
                ]);
                baseEnv = ps.stdout.trim();
            } else {
                gotWindowsConfigItem = true;
            }
        } else {
            baseEnv = getEnv(config.key);
            if (!baseEnv && isUserDirsConfigItem(config)) {
                baseEnv = await getUserDir(config.key);
            }
        }

        if (baseEnv) {
            const fullPath = config.extraFolder ? `${baseEnv}${config.extraFolder}` : baseEnv;
            return fullPath;
        } else if (config.defaultDir) {
            return config.defaultDir;
        }
    }

    if (gotWindowsConfigItem) {
        throw new DirectoryNotFoundError(
            dirType,
            platform,
            `No environment variable set for ${dirType} on ${platform}, run dir() with the windowsSpecialFolders option set to true to parse windows special directories.`,
        );
    } else {
        throw new DirectoryNotFoundError(dirType, platform);
    }
}
