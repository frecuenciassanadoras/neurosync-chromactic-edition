/**
 * ============================================================================
 * NEUROSYNC - STATE-OF-THE-ART AUDIO & FREQUENCY ENGINE
 * Web Audio API Synthesis, Multi-Track Nature Mixer & WAV File Exporter
 * ============================================================================
 */

class NeuroAudioEngine {
    constructor() {
        this.audioCtx = null;
        this.binauralActive = false;
        this.leftOsc = null;
        this.rightOsc = null;
        this.leftGain = null;
        this.rightGain = null;

        this.natureSounds = [
            { id: "nat-1", name: "Lluvia Ligera", icon: "fas fa-cloud-showers-heavy", url: "https://f005.backblazeb2.com/file/mis-frecuencias-musicales/SONIDOS+NATURALEZA/Lluvia+Ligera.mp3" },
            { id: "nat-2", name: "Lluvia Media", icon: "fas fa-cloud-rain", url: "https://f005.backblazeb2.com/file/mis-frecuencias-musicales/SONIDOS+NATURALEZA/Lluvia+Media.mp3" },
            { id: "nat-3", name: "Lluvia Fuerte", icon: "fas fa-poo-storm", url: "https://f005.backblazeb2.com/file/mis-frecuencias-musicales/SONIDOS+NATURALEZA/Lluvia+Fuerte.mp3" },
            { id: "nat-4", name: "Lluvia Suave", icon: "fas fa-cloud-sun-rain", url: "https://f005.backblazeb2.com/file/mis-frecuencias-musicales/SONIDOS+NATURALEZA/Lluvia+Suave.mp3" },
            { id: "nat-5", name: "Bosque", icon: "fas fa-tree", url: "https://f005.backblazeb2.com/file/mis-frecuencias-musicales/SONIDOS+NATURALEZA/Bosque.mp3" },
            { id: "nat-7", name: "Trueno", icon: "fas fa-bolt", url: "https://f005.backblazeb2.com/file/mis-frecuencias-musicales/SONIDOS+NATURALEZA/Trueno.mp3" },
            { id: "nat-8", name: "Viento", icon: "fas fa-wind", url: "https://f005.backblazeb2.com/file/mis-frecuencias-musicales/SONIDOS+NATURALEZA/Viento.mp3" },
            { id: "nat-9", name: "Olas", icon: "fas fa-water", url: "https://f005.backblazeb2.com/file/mis-frecuencias-musicales/SONIDOS+NATURALEZA/Olas.mp3" },
            { id: "nat-10", name: "Playa", icon: "fas fa-umbrella-beach", url: "https://f005.backblazeb2.com/file/mis-frecuencias-musicales/SONIDOS+NATURALEZA/Playa.mp3" },
            { id: "nat-11", name: "Río", icon: "fas fa-tint", url: "https://f005.backblazeb2.com/file/mis-frecuencias-musicales/SONIDOS+NATURALEZA/Rio.mp3" },
            { id: "nat-12", name: "Cascada", icon: "fas fa-water", url: "https://f005.backblazeb2.com/file/mis-frecuencias-musicales/SONIDOS+NATURALEZA/Cascada.mp3" },
            { id: "nat-13", name: "Fuego", icon: "fas fa-fire", url: "https://f005.backblazeb2.com/file/mis-frecuencias-musicales/SONIDOS+NATURALEZA/Fuego.mp3" },
            { id: "nat-14", name: "Grillos", icon: "fas fa-bug", url: "https://f005.backblazeb2.com/file/mis-frecuencias-musicales/SONIDOS+NATURALEZA/Grillos.mp3" },
            { id: "nat-15", name: "Pájaros", icon: "fas fa-dove", url: "https://f005.backblazeb2.com/file/mis-frecuencias-musicales/SONIDOS+NATURALEZA/Pajaros.mp3" }
        ];

        this.natureAudioElements = {};
        this.natureGainNodes = {};
        this.natureMasterLoop = true;
        this.sleepTimerInterval = null;
        this.sleepTimerSeconds = 0;

        // Custom Tone Generator state
        this.genOsc = null;
        this.genGain = null;
    }

    initCtx() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    /* ========================================================================
       BINAURAL SYNTHESIS MODULE
       ======================================================================== */
    toggleBinaural(leftHz, rightHz, onStateChange) {
        this.initCtx();

        if (this.binauralActive) {
            this.stopBinaural();
            if (onStateChange) onStateChange(false);
            return false;
        } else {
            this.startBinaural(leftHz, rightHz);
            if (onStateChange) onStateChange(true);
            return true;
        }
    }

    startBinaural(leftHz = 200, rightHz = 208) {
        this.initCtx();
        this.stopBinaural();

        // Left Channel
        const merger = this.audioCtx.createChannelMerger(2);

        this.leftOsc = this.audioCtx.createOscillator();
        this.leftGain = this.audioCtx.createGain();
        this.leftOsc.frequency.setValueAtTime(leftHz, this.audioCtx.currentTime);
        this.leftGain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        this.leftOsc.connect(this.leftGain);
        this.leftGain.connect(merger, 0, 0); // Left channel

        // Right Channel
        this.rightOsc = this.audioCtx.createOscillator();
        this.rightGain = this.audioCtx.createGain();
        this.rightOsc.frequency.setValueAtTime(rightHz, this.audioCtx.currentTime);
        this.rightGain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        this.rightOsc.connect(this.rightGain);
        this.rightGain.connect(merger, 0, 1); // Right channel

        merger.connect(this.audioCtx.destination);

        this.leftOsc.start();
        this.rightOsc.start();
        this.binauralActive = true;
    }

    updateBinauralFrequencies(leftHz, rightHz) {
        if (!this.binauralActive) return;
        if (this.leftOsc && isFinite(leftHz)) {
            this.leftOsc.frequency.setValueAtTime(leftHz, this.audioCtx.currentTime);
        }
        if (this.rightOsc && isFinite(rightHz)) {
            this.rightOsc.frequency.setValueAtTime(rightHz, this.audioCtx.currentTime);
        }
    }

    stopBinaural() {
        if (this.leftOsc) {
            try { this.leftOsc.stop(); this.leftOsc.disconnect(); } catch (e) {}
            this.leftOsc = null;
        }
        if (this.rightOsc) {
            try { this.rightOsc.stop(); this.rightOsc.disconnect(); } catch (e) {}
            this.rightOsc = null;
        }
        this.binauralActive = false;
    }

    /* ========================================================================
       NATURE SOUNDS MULTI-TRACK MIXER
       ======================================================================== */
    toggleNatureTrack(id, volume = 0.5) {
        this.initCtx();

        if (this.natureAudioElements[id] && !this.natureAudioElements[id].paused) {
            this.natureAudioElements[id].pause();
            return false;
        } else {
            if (!this.natureAudioElements[id]) {
                const config = this.natureSounds.find(s => s.id === id);
                if (!config) return false;

                const audio = new Audio(config.url);
                audio.loop = this.natureMasterLoop;
                audio.crossOrigin = "anonymous";

                try {
                    const source = this.audioCtx.createMediaElementSource(audio);
                    const gainNode = this.audioCtx.createGain();
                    gainNode.gain.value = volume;
                    source.connect(gainNode).connect(this.audioCtx.destination);
                    this.natureGainNodes[id] = gainNode;
                } catch (e) {
                    audio.volume = volume;
                }
                this.natureAudioElements[id] = audio;
            }

            this.setNatureVolume(id, volume);
            this.natureAudioElements[id].play().catch(() => {});
            return true;
        }
    }

    isNatureTrackActive(id) {
        return !!(this.natureAudioElements[id] && !this.natureAudioElements[id].paused);
    }

    getNatureTrackVolume(id) {
        if (this.natureGainNodes[id]) {
            return this.natureGainNodes[id].gain.value;
        } else if (this.natureAudioElements[id]) {
            return this.natureAudioElements[id].volume;
        }
        return 0.5;
    }

    setNatureVolume(id, volume) {
        const vol = Math.max(0, Math.min(1, parseFloat(volume)));
        if (this.natureGainNodes[id]) {
            this.natureGainNodes[id].gain.setValueAtTime(vol, this.audioCtx.currentTime);
        } else if (this.natureAudioElements[id]) {
            this.natureAudioElements[id].volume = vol;
        }
    }

    setMasterNatureVolume(masterVol) {
        const vol = Math.max(0, Math.min(1, parseFloat(masterVol)));
        Object.keys(this.natureAudioElements).forEach(id => {
            if (this.isNatureTrackActive(id)) {
                this.setNatureVolume(id, vol);
            }
        });
    }

    activatePresetNature(idsWithVolumes) {
        this.stopMasterNature();
        idsWithVolumes.forEach(item => {
            this.toggleNatureTrack(item.id, item.vol || 0.6);
        });
    }

    playMasterNature() {
        Object.keys(this.natureAudioElements).forEach(id => {
            const card = document.getElementById(`card-${id}`);
            if (card && card.classList.contains('active')) {
                this.natureAudioElements[id].play().catch(() => {});
            }
        });
    }

    pauseMasterNature() {
        Object.values(this.natureAudioElements).forEach(audio => audio.pause());
    }

    stopMasterNature() {
        Object.values(this.natureAudioElements).forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        clearInterval(this.sleepTimerInterval);
        this.sleepTimerSeconds = 0;
    }

    toggleMasterLoop() {
        this.natureMasterLoop = !this.natureMasterLoop;
        Object.values(this.natureAudioElements).forEach(audio => {
            audio.loop = this.natureMasterLoop;
        });
        return this.natureMasterLoop;
    }

    addSleepTimerMinutes(mins = 15, onTick) {
        this.sleepTimerSeconds += mins * 60;
        clearInterval(this.sleepTimerInterval);

        this.sleepTimerInterval = setInterval(() => {
            this.sleepTimerSeconds--;
            if (onTick) onTick(this.sleepTimerSeconds);
            if (this.sleepTimerSeconds <= 0) {
                clearInterval(this.sleepTimerInterval);
                this.stopMasterNature();
                this.stopBinaural();
                if (onTick) onTick(0);
            }
        }, 1000);

        if (onTick) onTick(this.sleepTimerSeconds);
    }

    /* ========================================================================
       TONE GENERATOR & WAV FILE EXPORTER
       ======================================================================== */
    playCustomTone(freq = 432, waveType = 'sine', volume = 0.4) {
        this.initCtx();
        this.stopCustomTone();

        this.genOsc = this.audioCtx.createOscillator();
        this.genGain = this.audioCtx.createGain();

        this.genOsc.type = waveType;
        this.genOsc.frequency.setValueAtTime(parseFloat(freq) || 432, this.audioCtx.currentTime);
        this.genGain.gain.setValueAtTime(parseFloat(volume) || 0.4, this.audioCtx.currentTime);

        this.genOsc.connect(this.genGain);
        this.genGain.connect(this.audioCtx.destination);
        this.genOsc.start();
    }

    updateCustomTone(freq, waveType, volume) {
        if (!this.genOsc) return;
        if (freq) this.genOsc.frequency.setValueAtTime(parseFloat(freq), this.audioCtx.currentTime);
        if (waveType) this.genOsc.type = waveType;
        if (volume && this.genGain) this.genGain.gain.setValueAtTime(parseFloat(volume), this.audioCtx.currentTime);
    }

    stopCustomTone() {
        if (this.genOsc) {
            try { this.genOsc.stop(); this.genOsc.disconnect(); } catch (e) {}
            this.genOsc = null;
        }
    }

    async exportToneWav(freq = 432, waveType = 'sine', durationSec = 5, volume = 0.5) {
        const sampleRate = 44100;
        const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, sampleRate * durationSec, sampleRate);

        const osc = offlineCtx.createOscillator();
        const gainNode = offlineCtx.createGain();

        osc.type = waveType;
        osc.frequency.setValueAtTime(parseFloat(freq) || 432, offlineCtx.currentTime);
        gainNode.gain.setValueAtTime(parseFloat(volume) || 0.5, offlineCtx.currentTime);

        osc.connect(gainNode);
        gainNode.connect(offlineCtx.destination);

        osc.start();
        osc.stop(durationSec);

        const renderedBuffer = await offlineCtx.startRendering();
        const wavBytes = this.encodeWavPCM(renderedBuffer);

        const blob = new Blob([wavBytes], { type: 'audio/wav' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NeuroSync_Frecuencia_${freq}Hz_${waveType.toUpperCase()}.wav`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    encodeWavPCM(audioBuffer) {
        const numChannels = 1;
        const sampleRate = audioBuffer.sampleRate;
        const channelData = audioBuffer.getChannelData(0);
        const numSamples = channelData.length;
        const byteRate = sampleRate * numChannels * 2;
        const blockAlign = numChannels * 2;

        const buffer = new ArrayBuffer(44 + numSamples * 2);
        const view = new DataView(buffer);

        const writeString = (offset, str) => {
            for (let i = 0; i < str.length; i++) {
                view.setUint8(offset + i, str.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + numSamples * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); // PCM
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, numSamples * 2, true);

        let offset = 44;
        for (let i = 0; i < numSamples; i++) {
            let sample = Math.max(-1, Math.min(1, channelData[i]));
            sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
            view.setInt16(offset, sample, true);
            offset += 2;
        }

        return view;
    }
}

window.neuroAudio = new NeuroAudioEngine();
