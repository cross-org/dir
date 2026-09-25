import { test } from "@cross/test";
import { assertEquals, assertRejects } from "@std/assert";
import { getCurrentOS } from "@cross/runtime";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import process from "node:process";
import { dir, DirectoryNotFoundError, DirectoryTypes, UnsupportedDirectoryError } from "./dir.ts";
import { directoryConfig } from "./config.ts";

const platform = getCurrentOS();
const isLinux = platform === "linux";
const isWindows = platform === "windows";

/**
 * Runs fn with the given environment variables set (or unset when undefined), restoring them afterwards.
 */
async function withEnv(vars: Record<string, string | undefined>, fn: () => Promise<void>): Promise<void> {
    const saved: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(vars)) {
        saved[key] = process.env[key];
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
    }
    try {
        await fn();
    } finally {
        for (const [key, value] of Object.entries(saved)) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    }
}

/**
 * Runs fn with a temporary XDG_CONFIG_HOME containing a user-dirs.dirs file with the given content.
 */
async function withUserDirs(
    content: string,
    vars: Record<string, string | undefined>,
    fn: () => Promise<void>,
): Promise<void> {
    const configHome = await mkdtemp(`${tmpdir()}/cross-dir-test-`);
    try {
        await writeFile(`${configHome}/user-dirs.dirs`, content);
        await withEnv({ XDG_CONFIG_HOME: configHome, ...vars }, fn);
    } finally {
        await rm(configHome, { recursive: true, force: true });
    }
}

test("userDirs is only used with XDG_*_DIR keys on linux", () => {
    for (const [type, config] of Object.entries(directoryConfig)) {
        for (const platform of ["windows", "macos"] as const) {
            for (const item of config[platform] ?? []) {
                assertEquals("userDirs" in item, false, `${type} on ${platform} uses userDirs`);
            }
        }
        for (const item of config.linux ?? []) {
            if ("userDirs" in item && item.userDirs) {
                assertEquals(/^XDG_[A-Z]+_DIR$/.test(item.key), true, `${type} has invalid userDirs key ${item.key}`);
            }
        }
    }
});

test("dir resolves every directory type to an absolute path or a known error", async () => {
    const absolutePath = isWindows ? /^([A-Za-z]:[\\/]|\\\\)/ : /^\//;
    const results: string[] = [];

    for (const type of Object.values(DirectoryTypes)) {
        let path: string;
        try {
            path = await dir(type, { windowsSpecialFolders: isWindows });
        } catch (error) {
            const known = error instanceof UnsupportedDirectoryError || error instanceof DirectoryNotFoundError;
            assertEquals(known, true, `${type} threw an unexpected error: ${error}`);
            results.push(`${type.padEnd(12)} ${(error as Error).name}`);
            continue;
        }
        assertEquals(absolutePath.test(path), true, `${type} resolved to a non-absolute path: ${path}`);
        assertEquals(path.includes("$"), false, `${type} contains an unexpanded variable: ${path}`);
        results.push(`${type.padEnd(12)} ${path}`);
    }

    // Logged so CI output shows what each platform actually resolved.
    console.log(`\nResolved directories on ${platform}:\n${results.join("\n")}`);
});

test("dir always resolves home", async () => {
    const home = await dir("home", { windowsSpecialFolders: isWindows });
    assertEquals(home.length > 0, true);
});

test("dir throws for unknown directory types", async () => {
    // deno-lint-ignore no-explicit-any
    await assertRejects(() => dir("nonexistent" as any), UnsupportedDirectoryError);
});

if (isLinux) {
    test("linux: user dirs are read from user-dirs.dirs", async () => {
        const content = `XDG_DOWNLOAD_DIR="$HOME/Downloads"\nXDG_PROJECTS_DIR="$HOME/Projects"\n`;
        await withUserDirs(
            content,
            { HOME: "/home/user", XDG_DOWNLOAD_DIR: undefined, XDG_PROJECTS_DIR: undefined },
            async () => {
                assertEquals(await dir("download"), "/home/user/Downloads");
                assertEquals(await dir("projects"), "/home/user/Projects");
            },
        );
    });

    test("linux: env variable takes precedence over user-dirs.dirs", async () => {
        await withUserDirs(
            `XDG_DOWNLOAD_DIR="$HOME/Downloads"`,
            { HOME: "/home/user", XDG_DOWNLOAD_DIR: "/from/env" },
            async () => {
                assertEquals(await dir("download"), "/from/env");
            },
        );
    });

    test("linux: disabled user dir throws", async () => {
        await withUserDirs(`XDG_DESKTOP_DIR="$HOME/"`, { HOME: "/home/user", XDG_DESKTOP_DIR: undefined }, async () => {
            await assertRejects(() => dir("desktop"), DirectoryNotFoundError);
        });
    });

    test("linux: missing user-dirs.dirs throws", async () => {
        await withEnv(
            { HOME: "/home/user", XDG_CONFIG_HOME: "/nonexistent/cross-dir-test", XDG_MUSIC_DIR: undefined },
            async () => {
                await assertRejects(() => dir("audio"), DirectoryNotFoundError);
            },
        );
    });
}

test("errors expose type and platform and keep their messages", async () => {
    // deno-lint-ignore no-explicit-any
    const error = await assertRejects(() => dir("nonexistent" as any), UnsupportedDirectoryError);
    assertEquals(error.name, "UnsupportedDirectoryError");
    assertEquals(error.type, "nonexistent");
    assertEquals(error.platform, platform);
    assertEquals(error.message, `Directory type nonexistent not supported on this platform (${platform})`);
    assertEquals(error instanceof Error, true);
});

test("dir accepts an options object and the deprecated boolean", async () => {
    const expected = await dir("home");
    assertEquals(await dir("home", {}), expected);
    assertEquals(await dir("home", { windowsSpecialFolders: false }), expected);
    assertEquals(await dir("home", false), expected);
});

test("preference matches config on all platforms except macOS", () => {
    const { preference, config } = directoryConfig;
    assertEquals(preference.linux, config.linux);
    assertEquals(preference.windows, config.windows);
});

test("winShellFolder is only used together with winSpecialFolder", () => {
    for (const [type, config] of Object.entries(directoryConfig)) {
        for (const item of config.windows ?? []) {
            if (item.winShellFolder) {
                assertEquals(item.winSpecialFolder, true, `${type} uses winShellFolder without winSpecialFolder`);
            }
        }
    }
});
