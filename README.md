# Panic Mode — Private mode for Obsidian

An always-visible 🕶️ button that instantly hides your **entire vault** behind a dark blurred overlay. You can only exit by entering your personal numeric PIN.

Works identically on **desktop (Windows/macOS/Linux)** and **mobile (iOS/Android)**.

> ⚠️ **Honest disclaimer**: this is an instant *visual* lock, not encryption. Anyone with direct access to your vault files (e.g. the iCloud/Drive folder) can still read them. On iOS, also enable Obsidian's native *Require Face ID* option to protect app opening.

## Features

- 🕶️ **Floating button** at the bottom-left, visible on every note
- 🔒 **Full overlay**: blur + dark background over the whole vault
- 🔑 **Auto unlock**: type the correct PIN and it unlocks by itself, no button press
- 🔢 Numeric PIN **4-8 digits**, stored **only as a SHA-256 hash with salt** (never in plain text)
- ⌨️ Command Palette command: *"Attiva modalità privata"* → assignable to a hotkey on desktop
- 🚫 Esc **cannot** close the overlay: only the PIN can

## Installation

### Manual (all platforms)

1. Download the latest **release** from GitHub.
2. Extract the `panic-mode/` folder into `.obsidian/plugins/` inside your vault.
3. Restart Obsidian.
4. Settings → Community plugins → **Enable** "Panic Mode".

### Via BRAT (experimental)

1. Install the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin from the catalog.
2. Add this repository as a beta plugin.
3. Check for updates when a new release comes out.

## Usage

1. Press the **🕶️** button (or run the *"Attiva modalità privata"* command).
2. On first use you'll be asked to **set your PIN** (twice).
3. From then on, the overlay appears on **any note**.
4. To exit: type your PIN → **auto unlock** as soon as it's correct.

### Forgot your PIN?

Delete the file `.obsidian/plugins/panic-mode/data.json` and restart Obsidian: you'll be asked to set a new PIN.

## Compatibility

Obsidian app ≥ 1.1.0. All platforms (desktop + mobile).

## License

MIT — see [LICENSE](LICENSE).

---

*Built for personal use, published in case it helps others. Collects no data: the PIN is stored as a salted hash in the local data.json only.*