import { test } from "@cross/test";
import { assertEquals } from "@std/assert";
import { parseUserDirs } from "./userdirs.ts";

const HOME = "/home/user";

test("parseUserDirs expands $HOME", () => {
    const result = parseUserDirs(`XDG_DOWNLOAD_DIR="$HOME/Downloads"`, HOME);
    assertEquals(result, { XDG_DOWNLOAD_DIR: "/home/user/Downloads" });
});

test("parseUserDirs accepts absolute paths", () => {
    const result = parseUserDirs(`XDG_MUSIC_DIR="/mnt/media/music"`, HOME);
    assertEquals(result, { XDG_MUSIC_DIR: "/mnt/media/music" });
});

test("parseUserDirs skips entries pointing to home (disabled)", () => {
    const content = [
        `XDG_DESKTOP_DIR="$HOME/"`,
        `XDG_TEMPLATES_DIR="$HOME"`,
        `XDG_PUBLICSHARE_DIR="/home/user"`,
    ].join("\n");
    assertEquals(parseUserDirs(content, HOME), {});
});

test("parseUserDirs handles a home directory with trailing slash", () => {
    const content = `XDG_DESKTOP_DIR="$HOME/"\nXDG_VIDEOS_DIR="$HOME/Videos"`;
    assertEquals(parseUserDirs(content, "/home/user/"), { XDG_VIDEOS_DIR: "/home/user/Videos" });
});

test("parseUserDirs removes trailing slashes", () => {
    const result = parseUserDirs(`XDG_PICTURES_DIR="$HOME/Pictures/"`, HOME);
    assertEquals(result, { XDG_PICTURES_DIR: "/home/user/Pictures" });
});

test("parseUserDirs unescapes shell-escaped characters", () => {
    const result = parseUserDirs(`XDG_DOCUMENTS_DIR="$HOME/My \\"Docs\\" \\$1"`, HOME);
    assertEquals(result, { XDG_DOCUMENTS_DIR: `/home/user/My "Docs" $1` });
});

test("parseUserDirs ignores comments, blank lines, relative paths and invalid lines", () => {
    const content = [
        "# This file is written by xdg-user-dirs-update",
        "",
        `# XDG_COMMENTED_DIR="$HOME/Commented"`,
        `XDG_RELATIVE_DIR="relative/path"`,
        `XDG_UNQUOTED_DIR=$HOME/Unquoted`,
        `SOMETHING_ELSE="$HOME/Else"`,
        `  XDG_PROJECTS_DIR="$HOME/Projects"  `,
    ].join("\n");
    assertEquals(parseUserDirs(content, HOME), { XDG_PROJECTS_DIR: "/home/user/Projects" });
});

test("parseUserDirs handles CRLF line endings", () => {
    const content = `XDG_DOWNLOAD_DIR="$HOME/Downloads"\r\nXDG_MUSIC_DIR="$HOME/Music"\r\n`;
    assertEquals(parseUserDirs(content, HOME), {
        XDG_DOWNLOAD_DIR: "/home/user/Downloads",
        XDG_MUSIC_DIR: "/home/user/Music",
    });
});
