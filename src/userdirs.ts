import { readFile } from "node:fs/promises";
import { getEnv } from "@cross/env";

/**
 * Parses the contents of an xdg-user-dirs `user-dirs.dirs` file.
 *
 * Lines are of the form `XDG_xxx_DIR="$HOME/yyy"` or `XDG_xxx_DIR="/yyy"`, where the value is shell-escaped.
 * Entries pointing to the home directory itself are treated as disabled and left out, as per the xdg-user-dirs spec.
 * https://www.freedesktop.org/wiki/Software/xdg-user-dirs/
 *
 * @param {string} content - The file content.
 * @param {string} home - The user's home directory, used to expand `$HOME`.
 * @returns {Record<string, string>} A map of variable names (e.g. `XDG_DOWNLOAD_DIR`) to absolute paths.
 */
export function parseUserDirs(content: string, home: string): Record<string, string> {
    const result: Record<string, string> = {};
    const normalizedHome = home.replace(/\/+$/, "");

    for (const rawLine of content.split("\n")) {
        const match = rawLine.trim().match(/^(XDG_[A-Z0-9_]+_DIR)="(.*)"$/);
        if (!match) continue;

        const [, key, rawValue] = match;
        const value = rawValue.replace(/\\(.)/g, "$1");

        let path: string;
        if (value === "$HOME" || value.startsWith("$HOME/")) {
            path = normalizedHome + value.slice("$HOME".length);
        } else if (value.startsWith("/")) {
            path = value;
        } else {
            continue;
        }

        path = path.replace(/\/+$/, "");
        if (path === normalizedHome || path === "") continue;

        result[key] = path;
    }

    return result;
}

/**
 * Looks up a directory in the user's `user-dirs.dirs` file, located in `$XDG_CONFIG_HOME` or `$HOME/.config`.
 *
 * @param {string} key - The variable name, e.g. `XDG_DOWNLOAD_DIR`.
 * @returns {Promise<string | undefined>} The resolved path, or undefined if the file or entry is missing or disabled.
 */
export async function getUserDir(key: string): Promise<string | undefined> {
    const home = getEnv("HOME");
    if (!home) return undefined;

    const configHome = getEnv("XDG_CONFIG_HOME") || `${home}/.config`;

    let content: string;
    try {
        content = await readFile(`${configHome}/user-dirs.dirs`, "utf8");
    } catch {
        return undefined;
    }

    return parseUserDirs(content, home)[key];
}
