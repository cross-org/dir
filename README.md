# @cross/dir

[![JSR Version](https://jsr.io/badges/@cross/dir)](https://jsr.io/@cross/dir)
[![JSR Score](https://jsr.io/badges/@cross/dir/score)](https://jsr.io/@cross/dir/score)

## Overview

This library provides a simple, cross-platform mechanism for retrieving the paths to standard user directories in Deno,
Bun and Node.js. It's designed for flexibility and ease of use, ensuring your applications can locate critical
directories regardless of the operating system or runtime environment.

**Features**

- **Cross-Platform Support:** Works consistently on Windows, macOS, and Linux.
- **Standard Directories:** Retrieve paths for common directories like `home`, `cache`, `config`, `data`, `download`,
  `tmp`, and more.
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
import { dir } from "@cross/dir";
```

Usage

```javascript
const userHome = await dir("home");
// or
console.log(`Home directory: ${await dir("home")}`);

//You can also use the DirectoryTypes enum.
const userHome = await dir(DirectoryTypes.home);
```

**Note concerning Windows special folders**

If no environment variable is configured for the directory or if it returns empty the program can try to parse the
[special folders](https://learn.microsoft.com/en-us/dotnet/api/system.environment.specialfolder?view=net-8.0) found on
windows systems if you supply a true argument for the second parameter of `dir()`, the optional
parseWindowsSpecialDirectories parameter. Powershell will be used to resolve the directory path.

```javascript
const userHome = await dir("home", true);
```

## Supported directories

| Directory Type | Description                                                            | Win Env | Win SpecialFolder | Linux | macOS |
| -------------- | ---------------------------------------------------------------------- | ------- | ----------------- | ----- | ----- |
| home           | The user's home directory.                                             | X       | X                 | X     | X     |
| cache          | A directory for storing application-specific cache data.               | X       | X                 | X     | X     |
| config         | A directory for storing application configuration data.                | X       | X                 | X     | X     |
| data           | A directory for storing application-specific data (non-cache).         | X       | X                 | X     | X     |
| data_local     | A directory for storing application-specific local (non-roaming) data. | X       | X                 | X     | X     |
| download       | The user's default download directory.                                 |         | X                 | X     | X     |
| tmp            | A temporary directory for storing short-lived files.                   | X       |                   | X     | X     |
| executable     | A directory for storing executable files (Linux only).                 |         |                   | X     |       |
| audio          | A directory for storing audio files.                                   |         | X                 | X     | X     |
| desktop        | The user's desktop directory.                                          |         | X                 | X     | X     |
| document       | The user's documents directory.                                        |         | X                 | X     | X     |
| font           | A directory for storing font files.                                    |         | X                 | X     | X     |
| picture        | A directory for storing picture files.                                 |         | X                 | X     | X     |
| public         | A directory for storing shared data accessible to all users.           |         |                   | X     | X     |
| template       | A directory for storing user template files.                           |         | X                 | X     |       |
| video          | A directory for storing video files.                                   |         | X                 | X     | X     |

> **Note** For some Windows directories where simple environmental variables is not enough `dir`uses powershell to
> retrieve the path if invoked with true as second function argument. `dir("type", true)`

## Issues

Issues or questions concerning the library can be raised at the
[github repository](https://github.com/cross-org/dir/issues) page.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
