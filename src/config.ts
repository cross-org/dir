/**
 * directory types and values are copied and based from this Deno issue when deno support got removed
 * https://github.com/denoland/deno/pull/6385
 */

/**
 * Enumerates standard user directory types
 *
 * @enum {string}
 */
export enum DirectoryTypes {
    /** The user's home directory. */
    home = "home",

    /**  A directory for storing application-specific cache data. */
    cache = "cache",

    /**  A directory for storing application configuration data. */
    config = "config",

    /**  A directory for storing application-specific data (non-cache). */
    data = "data",

    /**  A directory for storing application-specific local (non-roaming) data. */
    data_local = "data_local",

    /**  A directory for storing application state that should persist between restarts, like logs and history. */
    state = "state",

    /**  The user's default download directory. */
    download = "download",

    /**  A temporary directory for storing short-lived files. */
    tmp = "tmp",

    /** A directory for storing executable files (Linux only). */
    executable = "executable",

    /** A directory for storing audio files. */
    audio = "audio",

    /**  The user's desktop directory. */
    desktop = "desktop",

    /**  The user's documents directory. */
    document = "document",

    /**  A directory for storing font files. */
    font = "font",

    /**  A directory for storing picture files. */
    picture = "picture",

    /**  The user's projects directory (Linux only). */
    projects = "projects",

    /**  A directory for storing shared data accessible to all users. */
    public = "public",

    /** A directory for storing user template files. */
    template = "template",

    /** A directory for storing video files.  */
    video = "video",
}

/**
 * Checks if a configuration item is specifically for Windows special folders.
 * @param {WindowsDirectoryPathConfigItem} item - The configuration item
 * @returns {boolean} True if 'winSpecialFolder' property is true, otherwise false.
 */
export function isWindowsConfigItem(item: WindowsDirectoryPathConfigItem): item is WindowsDirectoryPathConfigItem {
    return item.winSpecialFolder !== undefined;
}

/**
 * Checks if a configuration item should fall back to the xdg-user-dirs `user-dirs.dirs` file.
 * @param {DirectoryPathConfigItem} item - The configuration item
 * @returns {boolean} True if 'userDirs' property is true, otherwise false.
 */
export function isUserDirsConfigItem(item: DirectoryPathConfigItem): item is UnixDirectoryPathConfigItem {
    return "userDirs" in item && item.userDirs === true;
}

/**
 * A mapping of standard directory types to their  cross-platform configuration objects.
 * Each key is a `DirectoryTypes`, and the value is a `DirectoryPathConfig` object.
 */
export const directoryConfig: { [key in DirectoryTypes]: DirectoryPathConfig } = {
    [DirectoryTypes.home]: {
        windows: [{ key: "USERPROFILE" }, { key: "UserProfile", winSpecialFolder: true }],
        linux: [{ key: "HOME" }],
        macos: [{ key: "HOME" }],
    },
    [DirectoryTypes.cache]: {
        windows: [{ key: "LOCALAPPDATA" }, { key: "LocalApplicationData", winSpecialFolder: true }],
        linux: [
            { key: "XDG_CACHE_HOME" },
            { key: "HOME", extraFolder: "/.cache" },
        ],
        macos: [{ key: "HOME", extraFolder: "/Library/Caches" }],
    },
    [DirectoryTypes.config]: {
        windows: [{ key: "APPDATA" }, { key: "ApplicationData", winSpecialFolder: true }],
        linux: [
            { key: "XDG_CONFIG_HOME" },
            { key: "HOME", extraFolder: "/.config" },
        ],
        macos: [{ key: "HOME", extraFolder: "/Library/Preferences" }],
    },
    [DirectoryTypes.executable]: {
        linux: [
            { key: "XDG_BIN_HOME" },
            { key: "XDG_DATA_HOME", extraFolder: "/../bin" },
            { key: "HOME", extraFolder: "/.local/bin" },
        ],
    },
    [DirectoryTypes.data]: {
        windows: [{ key: "APPDATA" }, { key: "ApplicationData", winSpecialFolder: true }],
        linux: [
            { key: "XDG_DATA_HOME" },
            { key: "HOME", extraFolder: "/.local/share" },
        ],
        macos: [{ key: "HOME", extraFolder: "/Library/Application Support" }],
    },
    [DirectoryTypes.data_local]: {
        windows: [{ key: "LOCALAPPDATA" }, { key: "LocalApplicationData", winSpecialFolder: true }],
        linux: [
            { key: "XDG_DATA_HOME" },
            { key: "HOME", extraFolder: "/.local/share" },
        ],
        macos: [{ key: "HOME", extraFolder: "/Library/Application Support" }],
    },
    [DirectoryTypes.state]: {
        windows: [{ key: "LOCALAPPDATA" }, { key: "LocalApplicationData", winSpecialFolder: true }],
        linux: [
            { key: "XDG_STATE_HOME" },
            { key: "HOME", extraFolder: "/.local/state" },
        ],
        macos: [{ key: "HOME", extraFolder: "/Library/Application Support" }],
    },
    [DirectoryTypes.audio]: {
        windows: [{ key: "MyMusic", winSpecialFolder: true }],
        linux: [{ key: "XDG_MUSIC_DIR", userDirs: true }],
        macos: [{ key: "HOME", extraFolder: "/Music" }],
    },
    [DirectoryTypes.desktop]: {
        windows: [{ key: "DesktopDirectory", winSpecialFolder: true }],
        linux: [{ key: "XDG_DESKTOP_DIR", userDirs: true }],
        macos: [{ key: "HOME", extraFolder: "/Desktop" }],
    },
    [DirectoryTypes.document]: {
        windows: [{ key: "MyDocuments", winSpecialFolder: true }],
        linux: [{ key: "XDG_DOCUMENTS_DIR", userDirs: true }],
        macos: [{ key: "HOME", extraFolder: "/Documents" }],
    },
    [DirectoryTypes.download]: {
        windows: [{ key: "UserProfile", winSpecialFolder: true, extraFolder: "\\Downloads" }],
        linux: [{ key: "XDG_DOWNLOAD_DIR", userDirs: true }],
        macos: [{ key: "HOME", extraFolder: "/Downloads" }],
    },
    [DirectoryTypes.font]: {
        windows: [{ key: "Fonts", winSpecialFolder: true }],
        linux: [
            { key: "XDG_DATA_HOME", extraFolder: "/fonts" },
            { key: "HOME", extraFolder: "/.local/share/fonts" },
        ],
        macos: [{ key: "HOME", extraFolder: "/Library/Fonts" }],
    },
    [DirectoryTypes.picture]: {
        windows: [{ key: "MyPictures", winSpecialFolder: true }],
        linux: [{ key: "XDG_PICTURES_DIR", userDirs: true }],
        macos: [{ key: "HOME", extraFolder: "/Pictures" }],
    },
    [DirectoryTypes.projects]: {
        linux: [{ key: "XDG_PROJECTS_DIR", userDirs: true }],
    },
    [DirectoryTypes.public]: {
        windows: [{ key: "PUBLIC" }],
        linux: [{ key: "XDG_PUBLICSHARE_DIR", userDirs: true }],
        macos: [{ key: "HOME", extraFolder: "/Public" }],
    },
    [DirectoryTypes.template]: {
        windows: [{ key: "Templates", winSpecialFolder: true }],
        linux: [{ key: "XDG_TEMPLATES_DIR", userDirs: true }],
    },
    [DirectoryTypes.tmp]: {
        windows: [{ key: "TMP" }, { key: "TEMP" }],
        linux: [{ key: "TMPDIR", defaultDir: "/tmp" }],
        macos: [{ key: "TMPDIR" }],
    },
    [DirectoryTypes.video]: {
        windows: [{ key: "MyVideos", winSpecialFolder: true }],
        linux: [{ key: "XDG_VIDEOS_DIR", userDirs: true }],
        macos: [{ key: "HOME", extraFolder: "/Movies" }],
    },
};

/**
 * Configuration item for Windows directory paths.
 * @property {string} key -  Environment variable name
 * @property {string} [extraFolder] - Optional subfolder to append
 * @property {string} [defaultDir] - Optional default directory if "key" is undefined
 * @property {boolean} [winSpecialFolder] - Indicates if a Windows special folder
 */
type WindowsDirectoryPathConfigItem = {
    key: string;
    extraFolder?: string;
    defaultDir?: string;
    winSpecialFolder?: boolean;
};

/**
 * Configuration item for Unix (Linux/macOS) directory paths.
 * @property {string} key -  Environment variable name
 * @property {string} [extraFolder] - Optional subfolder to append
 * @property {string} [defaultDir] - Optional default directory if "key" is undefined
 * @property {boolean} [userDirs] - Fall back to looking up "key" in the xdg-user-dirs `user-dirs.dirs` file (Linux)
 */
type UnixDirectoryPathConfigItem = {
    key: string;
    extraFolder?: string;
    defaultDir?: string;
    userDirs?: boolean;
};

/**
 * Any configuration item, regardless of platform.
 */
type DirectoryPathConfigItem = WindowsDirectoryPathConfigItem | UnixDirectoryPathConfigItem;

/**
 * Represents the configuration for resolving a directory path across operating systems.
 * @property {WindowsDirectoryPathConfigItem[]} [windows] - Array of Windows configuration items
 * @property {UnixDirectoryPathConfigItem[]} [linux] - Array of Linux configuration items
 * @property {UnixDirectoryPathConfigItem[]} [macos] - Array of macOS configuration items
 */
export type DirectoryPathConfig = {
    windows?: WindowsDirectoryPathConfigItem[];
    linux?: UnixDirectoryPathConfigItem[];
    macos?: UnixDirectoryPathConfigItem[];
};
