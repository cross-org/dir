# @cross/dir

[![JSR Version](https://jsr.io/badges/@cross/dir)](https://jsr.io/@cross/dir)
[![JSR Score](https://jsr.io/badges/@cross/dir/score)](https://jsr.io/@cross/dir/score)

## Overview

This library provides a simple, cross-platform mechanism for retrieving the paths to standard user directories in Deno,
Bun and Node.js. It's designed for flexibility and ease of use, ensuring your applications can locate critical
directories regardless of the operating system or runtime environment.

Part of the @cross suite - check out our growing collection of cross-runtime tools at
[github.com/cross-org](https://github.com/cross-org).

**Features**

- **Cross-Platform Support:** Works consistently on Windows, macOS, and Linux.
- **Standard Directories:** Retrieve paths for common directories like `home`, `cache`, `config`, `data`, `download`,
  `projects`, `tmp`, and more.
- **Reliable:** Leverages well-established environment variables and platform-specific methods.
- **TypeScript Support:** Includes TypeScript definitions for improved type safety.

## Installation

```bash
#For Deno
deno add @cross/dir

#For Bun
bunx jsr add @cross/dir

#For Node.js
npx jsr add @cross/dir
```

## Getting Started

**Usage Examples**

import relevant functions.

```javascript
import { dir, DirectoryTypes } from "@cross/dir";
```

Usage

```javascript
const userHome = await dir("home");
// or
console.log(`Home directory: ${await dir("home")}`);

//You can also use the DirectoryTypes enum.
const userHome = await dir(DirectoryTypes.home);
```

**Error handling**

`dir()` throws an `UnsupportedDirectoryError` if the directory type is not supported on the current platform, or a
`DirectoryNotFoundError` if the directory could not be resolved (e.g. the environment variable is unset and there is no
fallback). Both extend `Error` and expose `type` and `platform` properties.

```javascript
import { dir, DirectoryNotFoundError, UnsupportedDirectoryError } from "@cross/dir";

try {
    const projects = await dir("projects");
} catch (error) {
    if (error instanceof UnsupportedDirectoryError) {
        // Unknown type, or not available on this platform (error.type, error.platform)
    } else if (error instanceof DirectoryNotFoundError) {
        // Supported, but could not be resolved on this system
    }
}
```

**Note concerning Windows special folders**

If no environment variable is configured for the directory or if it returns empty, `dir()` can resolve the
[special folders](https://learn.microsoft.com/en-us/dotnet/api/system.environment.specialfolder?view=net-8.0) found on
Windows systems when the `windowsSpecialFolders` option is set. PowerShell will be used to resolve the directory path.
The option is ignored on other platforms.

```javascript
const downloads = await dir("download", { windowsSpecialFolders: true });
```

> **Deprecated** Passing a boolean as the second argument, `dir("download", true)`, still works but is deprecated in
> favor of the options object and will be removed in 2.0.

**Note concerning Linux user directories**

User directories such as `download`, `document`, `audio`, `desktop`, `projects` etc. are first looked up as environment
variables (`XDG_DOWNLOAD_DIR`, ...). If unset, they are read from the
[xdg-user-dirs](https://www.freedesktop.org/wiki/Software/xdg-user-dirs/) file `$XDG_CONFIG_HOME/user-dirs.dirs`
(default `~/.config/user-dirs.dirs`). Entries set to the home directory itself are considered disabled and will throw.

## Supported directories

| Directory Type | Description                                                            | Win Env | Win SpecialFolder | Linux | macOS |
| -------------- | ---------------------------------------------------------------------- | ------- | ----------------- | ----- | ----- |
| home           | The user's home directory.                                             | X       | X                 | X     | X     |
| cache          | A directory for storing application-specific cache data.               | X       | X                 | X     | X     |
| config         | A directory for storing application configuration data.                | X       | X                 | X     | X     |
| preference     | A directory for storing application preferences (see note below).      | X       | X                 | X     | X     |
| data           | A directory for storing application-specific data (non-cache).         | X       | X                 | X     | X     |
| data_local     | A directory for storing application-specific local (non-roaming) data. | X       | X                 | X     | X     |
| state          | A directory for storing persistent application state (logs, history).  | X       | X                 | X     | X     |
| download       | The user's default download directory.                                 |         | X                 | X     | X     |
| tmp            | A temporary directory for storing short-lived files.                   | X       |                   | X     | X     |
| executable     | A directory for storing executable files (Linux only).                 |         |                   | X     |       |
| audio          | A directory for storing audio files.                                   |         | X                 | X     | X     |
| desktop        | The user's desktop directory.                                          |         | X                 | X     | X     |
| document       | The user's documents directory.                                        |         | X                 | X     | X     |
| font           | A directory for storing font files.                                    |         | X                 | X     | X     |
| picture        | A directory for storing picture files.                                 |         | X                 | X     | X     |
| projects       | The user's projects directory (Linux only).                            |         |                   | X     |       |
| public         | A directory for storing shared data accessible to all users.           | X       |                   | X     | X     |
| template       | A directory for storing user template files.                           |         | X                 | X     |       |
| video          | A directory for storing video files.                                   |         | X                 | X     | X     |

> **Note** Directories marked only under "Win SpecialFolder" require the `windowsSpecialFolders` option on Windows.
> `dir("type", { windowsSpecialFolders: true })`

> **Note** On macOS, `config` currently resolves to `~/Library/Preferences`, which Apple reserves for system-managed
> `.plist` files. In 2.0, `config` will move to `~/Library/Application Support`. `preference` resolves to the same path
> as `config` on all platforms except macOS, where it stays `~/Library/Preferences`. If you rely on the current macOS
> location, use `preference` instead.

## Development

```bash
deno task test   # run tests
deno task check  # format, lint, type check, test and check dependencies
```

## Issues

Issues or questions concerning the library can be raised at the
[github repository](https://github.com/cross-org/dir/issues) page.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
