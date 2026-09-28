/* Panic Mode (Modalità Privata) — plugin Obsidian
   Copre all'istante l'intero vault con una cover scura+blur.
   Si esce solo con il PIN numerico (salvato come hash SHA-256, mai in chiaro).
   Fatto per funzionare identico su PC e mobile. */

const { Plugin, Modal, Notice, Setting } = require('obsidian');

/* SHA-256 compatto (pubblico dominio, adattato da Geraint Luff) */
function sha256(ascii) {
	function rightRotate(value, amount) {
		return (value >>> amount) | (value << (32 - amount));
	}
	var mathPow = Math.pow;
	var maxWord = mathPow(2, 32);
	var lengthProperty = 'length';
	var i, j;
	var result = '';

	var words = [];
	var asciiBitLength = ascii[lengthProperty] * 8;

	var hash = sha256.h = sha256.h || [];
	var k = sha256.k = sha256.k || [];
	var primeCounter = k[lengthProperty];

	var isComposite = {};
	for (var candidate = 2; primeCounter < 64; candidate++) {
		if (!isComposite[candidate]) {
			for (i = 0; i < 313; i += candidate) {
				isComposite[i] = candidate;
			}
			hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
			k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
		}
	}

	ascii += '\x80';
	while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
	for (i = 0; i < ascii[lengthProperty]; i++) {
		j = ascii.charCodeAt(i);
		if (j >> 8) return;
		words[i >> 2] |= j << ((3 - i) % 4) * 8;
	}
	words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
	words[words[lengthProperty]] = asciiBitLength;

	for (j = 0; j < words[lengthProperty];) {
		var w = words.slice(j, j += 16);
		var oldHash = hash;
		hash = hash.slice(0, 8);

		for (i = 0; i < 64; i++) {
			var i2 = i + j;
			var w15 = w[i - 15], w2 = w[i - 2];

			var a = hash[0], e = hash[4];
			var temp1 = hash[7]
				+ (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
				+ ((e & hash[5]) ^ ((~e) & hash[6]))
				+ k[i]
				+ (w[i] = (i < 16) ? w[i] : (
						w[i - 16]
						+ (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
						+ w[i - 7]
						+ (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
					) | 0
				);
			var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
				+ ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

			hash = [(temp1 + temp2) | 0].concat(hash);
			hash[4] = (hash[4] + temp1) | 0;
		}

		for (i = 0; i < 8; i++) {
			hash[i] = (hash[i] + oldHash[i]) | 0;
		}
	}

	for (i = 0; i < 8; i++) {
		for (j = 3; j + 1; j--) {
			var b = (hash[i] >> (j * 8)) & 255;
			result += ((b < 16) ? 0 : '') + b.toString(16);
		}
	}
	return result;
}

/* Modale per impostare il PIN al primo utilizzo */
class SetPinModal extends Modal {
	constructor(app, onSave) {
		super(app);
		this.onSave = onSave;
	}

	onOpen() {
		this.titleEl.setText('🕶️ Modalità privata — imposta il PIN');

		new Setting(this.contentEl)
			.setName('PIN numerico (4-8 cifre)')
			.addText(t => {
				t.inputEl.type = 'password';
				t.inputEl.inputMode = 'numeric';
				t.inputEl.maxLength = 8;
				this.pinField = t;
			});

		new Setting(this.contentEl)
			.setName('Conferma PIN')
			.addText(t => {
				t.inputEl.type = 'password';
				t.inputEl.inputMode = 'numeric';
				t.inputEl.maxLength = 8;
				this.confField = t;
			});

		new Setting(this.contentEl).addButton(b => b
			.setButtonText('Salva e attiva')
			.setCta()
			.onClick(() => {
				const pin = this.pinField.getValue().trim();
				if (!/^\d{4,8}$/.test(pin)) {
					new Notice('Il PIN deve essere di 4-8 cifre.');
					return;
				}
				if (pin !== this.confField.getValue().trim()) {
					new Notice('I due PIN non coincidono.');
					return;
				}
				this.onSave(pin);
				this.close();
			}));
	}

	onClose() {
		this.contentEl.empty();
	}
}

class PanicModePlugin extends Plugin {
	onload() {
		this.data = Object.assign({ salt: '', pinHash: '' });

		this.overlay = null;

		// Bottone fluttuante, visibile su ogni nota (PC e mobile)
		this.fab = document.createElement('button');
		this.fab.className = 'panic-fab';
		this.fab.textContent = '🕶️';
		this.fab.title = 'Modalità privata: nascondi tutto (si sblocca col PIN)';
		this.fab.addEventListener('click', () => this.activate());
		document.body.appendChild(this.fab);

		// Comando dalla Command Palette -> assegnabile a una hotkey su PC
		this.addCommand({
			id: 'activate',
			name: 'Activate private mode (panic mode)',
			callback: () => this.activate(),
		});

		// Caricamento dati (PIN hash + salt) senza bloccare onload
		this.loadData().then((stored) => {
			this.data = Object.assign({ salt: '', pinHash: '' }, stored || {});
			// Salt casuale (serve a non avere due PIN uguali con lo stesso hash)
			if (!this.data.salt) {
				this.data.salt = this.randomSalt();
				this.saveData(this.data);
			}
		});
	}

	onunload() {
		if (this.fab && this.fab.parentNode) this.fab.parentNode.removeChild(this.fab);
		if (this.overlay && this.overlay.parentNode) this.overlay.parentNode.removeChild(this.overlay);
	}

	randomSalt() {
		try {
			const a = new Uint32Array(4);
			crypto.getRandomValues(a);
			return Array.from(a).map(x => x.toString(16)).join('');
		} catch (e) {
			return Math.random().toString(36).slice(2) + Date.now().toString(36);
		}
	}

	activate() {
		// Se i dati (salt) non sono ancora caricati, riprova tra un attimo
		if (!this.data.salt) {
			setTimeout(() => this.activate(), 100);
			return;
		}

		// Primo utilizzo: il PIN va impostato
		if (!this.data.pinHash) {
			new SetPinModal(this.app, (pin) => {
				this.data.pinHash = sha256(this.data.salt + pin);
				this.saveData(this.data);
				this.activate();
			}).open();
			return;
		}

		if (!this.overlay) this.buildOverlay();
		this.overlay.classList.remove('panic-hidden');
		this.errorEl.textContent = '';
		this.inputEl.value = '';
		setTimeout(() => {
			try { this.inputEl.focus(); } catch (e) { /* mobile: ok */ }
		}, 200);
	}

	buildOverlay() {
		const ov = this.overlay = document.createElement('div');
		ov.className = 'panic-overlay panic-hidden';
		ov.innerHTML = `
			<div class="panic-lock">🕶️</div>
			<div class="panic-title">Modalità privata</div>
			<div class="panic-sub">Tutto il vault è nascosto. Inserisci il PIN per uscire.</div>
			<input class="panic-input" type="password" inputmode="numeric" autocomplete="off" maxlength="8" placeholder="••••••">
			<button class="panic-btn" type="button">Sblocca</button>
			<div class="panic-error"></div>
			<div class="panic-hint">PIN dimenticato? Cancella il file<br>.obsidian/plugins/panic-mode/data.json</div>
		`;

		this.inputEl = ov.querySelector('.panic-input');
		this.errorEl = ov.querySelector('.panic-error');

		const submit = () => this.tryUnlock();
		ov.querySelector('.panic-btn').addEventListener('click', submit);
		// Sblocco automatico: appena il PIN completo è corretto, si esce da soli
		this.inputEl.addEventListener('input', () => { if (this.inputEl.value.length >= 4) this.tryUnlock(true); });
		this.inputEl.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') { e.preventDefault(); submit(); }
			if (e.key === 'Escape') e.stopPropagation();
		});
		// Niente Esc che chiude l'overlay: si esce solo col PIN
		ov.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); }
		});

		document.body.appendChild(ov);
	}

	tryUnlock(silent) {
		const pin = this.inputEl.value.trim();
		if (pin && sha256(this.data.salt + pin) === this.data.pinHash) {
			this.overlay.classList.add('panic-hidden');
			this.errorEl.textContent = '';
			this.inputEl.value = '';
			new Notice('✅ Modalità privata disattivata.');
			return;
		}
		// In modalità automatica nessun messaggio di errore durante la digitazione:
		// l'errore compare solo premendo Invio / il pulsante Sblocca.
		if (silent) return;
		this.errorEl.textContent = 'PIN errato, riprova.';
		this.inputEl.value = '';
		this.inputEl.classList.remove('panic-shake');
		void this.inputEl.offsetWidth; // riavvia l'animazione
		this.inputEl.classList.add('panic-shake');
		this.inputEl.focus();
	}
}

module.exports = PanicModePlugin;