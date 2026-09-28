# Panic Mode — Modalità privata per Obsidian

Un tasto 🕶️ sempre visibile che nasconde all'istante **l'intero vault** dietro una cover scura con blur. Si esce solo con un PIN numerico personale.

Funziona identico su **desktop (Windows/macOS/Linux) e mobile (iOS/Android)**.

> ⚠️ **Nota onesta**: è un blocco *visivo* istantaneo, non una crittografia. Se qualcuno accede ai file del vault (es. cartella iCloud/Drive), i contenuti restano leggibili. Per proteggere l'apertura dell'app su iOS usa anche l'opzione nativa *Require Face ID* di Obsidian.

## Funzionalità

- 🕶️ **Tasto fluttuante** in basso a sinistra, visibile su ogni nota
- 🔒 **Cover totale**: blur + sfondo scuro su tutto il vault
- 🔑 **Sblocco automatico**: si esce digitando il PIN corretto, senza premere nulla
- 🔢 PIN numerico **4-8 cifre**, salvato **solo come hash SHA-256 con salt** (mai in chiaro)
- ⌨️ Comando da Command Palette: *"Attiva modalità privata"* → assegnabile a una hotkey su desktop
- 🚫 Esc **non** chiude l'overlay: si esce solo col PIN

## Installazione

### Manuale (tutte le piattaforme)

1. Scarica l'ultima **release** da GitHub.
2. Estrai la cartella `panic-mode/` in `.obsidian/plugins/` del tuo vault.
3. Riavvia Obsidian.
4. Impostazioni → Plugin della community → **Attiva** "Panic Mode".

### Via BRAT (sperimentale)

1. Installa il plugin [BRAT](https://github.com/TfTHacker/obsidian42-brat) dal catalogo.
2. Aggiungi questo repo come beta plugin.
3. Cerca la nuova versione quando esce (relase → BRAT → "Check for updates").

## Uso

1. Premi il tasto **🕶️** (o esegui il comando *"Attiva modalità privata"*).
2. Al primo utilizzo ti viene chiesto di **impostare il PIN** (due volte).
3. Da quel momento, l'overlay compare su **qualunque nota**.
4. Per uscire: digita il PIN → sblocco **automatico** appena è corretto.

### PIN dimenticato?

Cancella il file `.obsidian/plugins/panic-mode/data.json` e riavvia Obsidian: ti verrà chiesto di impostare un nuovo PIN.

## Compatibilità

App Obsidian ≥ 1.1.0. Tutte le piattaforme (desktop + mobile).

## Licenza

MIT — vedi [LICENSE](LICENSE).

---

*Plugin creato per uso personale, pubblicato perché può servire ad altri. Non raccoglie alcun dato: il PIN è salvato come hash con salt nel solo data.json locale.*