console.log('The Vessel is breathing...');

const curtain = document.getElementById('curtain');
const omen = document.getElementById('omen-container');
const omenText = document.getElementById('omen-text');
const tonyOrb = document.getElementById('tony-orb');
const courtOrb = document.getElementById('court-orb');

// VDO.Ninja Integration
const getStreamUrl = (viewID, pushID = '', room = '', password = '') => {
    let baseUrl = 'https://vdo.ninja/?';
    if (room) baseUrl += `room=${room}&`;
    if (password) baseUrl += `password=${password}&`;
    if (pushID) baseUrl += `push=${pushID}&`;
    if (viewID) baseUrl += `view=${viewID}&`;

    // Using cleanviewer=1, transparent=1, and autostart=1 to bypass landing pages
    return `${baseUrl}cleanviewer=1&transparent=1&autoplay=1&autostart=1&mute=1&bitrate=3000&quality=0&scale=100&centered=1&nonav=1&nochat=1&pip=0&showdirector=0`;
};

const initStreams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    let tonySID = urlParams.get('tony');
    let courtSID = urlParams.get('court');

    // If we are on a personalized path (determined by window.participantRole)
    // we can use it to determine which stream to look for if not provided in URL
    if (window.participantRole === 'tony' && !tonySID) {
        console.log('Tony context detected...');
    } else if (window.participantRole === 'court' && !courtSID) {
        console.log('Court context detected...');
    }

    if (tonySID || courtSID) {
        updateIndividualStreams(tonySID, courtSID);
    }
};

// --- Whispering Wire: Remote Real-time Control (Supabase) ---
const SUPABASE_URL = 'https://eusqhncaalxcdkpfqgbd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1c3FobmNhYWx4Y2RrcGZxZ2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNzEyNjcsImV4cCI6MjA4Njc0NzI2N30.lYWeqibGAldOXeubtdiYEF8UJESUeFjLqzwh14WYNRU';

// Initialize Supabase Client (assuming CDN is loaded in HTML)
let supabase;
let ritualChannel;

const initRemoteControl = () => {
    let attempts = 0;
    const maxAttempts = 20;
    const debugStatus = document.getElementById('debug-status');

    const tryConnect = () => {
        if (typeof window.supabase !== 'undefined') {
            try {
                if (debugStatus) debugStatus.textContent = 'SYNC: CONNECTING...';

                supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
                ritualChannel = supabase.channel('common_space_ritual', {
                    config: { broadcast: { ack: true } }
                });

                ritualChannel
                    .on('broadcast', { event: 'command' }, (payload) => {
                        handleRitualCommand(payload.payload);
                    })
                    .subscribe((status) => {
                        console.log('Supabase Sync Status:', status);
                        const statusLight = document.getElementById('sync-status');

                        if (statusLight) {
                            statusLight.style.background = status === 'SUBSCRIBED' ? '#4a5e4a' : '#5e4a4a';
                        }
                        if (debugStatus) {
                            debugStatus.textContent = `SYNC: ${status}`;
                            debugStatus.style.color = status === 'SUBSCRIBED' ? '#4a5e4a' : '#5e4a4a';
                        }
                    });
            } catch (err) {
                if (debugStatus) debugStatus.textContent = `SYNC ERROR: ${err.message}`;
                console.error('Supabase Init Error:', err);
            }
        } else if (attempts < maxAttempts) {
            attempts++;
            if (debugStatus) debugStatus.textContent = `SYNC: LOADING SDK (${attempts}/${maxAttempts})...`;
            setTimeout(tryConnect, 500);
        } else {
            if (debugStatus) {
                debugStatus.textContent = 'SYNC ERROR: SDK NOT LOADED';
                debugStatus.style.color = '#ff0000';
            }
        }
    };

    tryConnect();
};

// Fallback for local testing if needed
const localChannel = new BroadcastChannel('common_space_ritual');
localChannel.onmessage = (event) => handleRitualCommand(event.data);

// State tracking for refreshing feeds
let currentTonyId = '';
let currentCourtId = '';
let currentRoom = '';
let currentPass = '';

function handleRitualCommand(data) {
    if (!data) return;
    const { type, text, tony, court, room, pass } = data;
    console.log('Received Command:', type);

    switch (type) {
        case 'UPDATE_STREAMS':
            currentTonyId = tony || currentTonyId;
            currentCourtId = court || currentCourtId;
            currentRoom = room || currentRoom;
            currentPass = pass || currentPass;
            updateIndividualStreams(currentTonyId, currentCourtId, currentRoom, currentPass);
            break;
        case 'REFRESH_FEEDS':
            updateIndividualStreams(currentTonyId, currentCourtId, currentRoom, currentPass);
            break;
        // ... (rest of cases remain same)
        case 'START_AMBIENT':
            window.ghost.startAmbient();
            break;
        case 'STOP_AMBIENT':
            window.ghost.stopAmbient();
            break;
        case 'OPEN_CURTAIN':
            window.ghost.openCurtain();
            break;
        case 'CLOSE_CURTAIN':
            window.ghost.closeCurtain();
            break;
        case 'ACTIVATE_OMEN':
            window.ghost.activateOmen(text);
            break;
        case 'CLEAR_OMEN':
            window.ghost.clearOmen();
            break;
    }
}

const updateIndividualStreams = (tonySid, courtSid, room = '', pass = '') => {
    const role = window.participantRole || '';

    if (tonySid) {
        // If I am Tony, I PUSH my camera to TonyPort. If I am NOT Tony, I VIEW TonyPort.
        const pushID = (role === 'tony') ? tonySid : '';
        const viewID = (role !== 'tony') ? tonySid : tonySid; // Tony sees himself too for presence
        tonyOrb.innerHTML = `<iframe src="${getStreamUrl(viewID, pushID, room, pass)}" allow="autoplay;camera;microphone;fullscreen;picture-in-picture"></iframe>`;
    }

    if (courtSid) {
        // If I am Court, I PUSH my camera to CourtPort. If I am NOT Court, I VIEW CourtPort.
        const pushID = (role === 'court') ? courtSid : '';
        const viewID = (role !== 'court') ? courtSid : courtSid; // Court sees herself too for presence
        courtOrb.innerHTML = `<iframe src="${getStreamUrl(viewID, pushID, room, pass)}" allow="autoplay;camera;microphone;fullscreen;picture-in-picture"></iframe>`;
    }
};

// --- Layer 1: Ambient Audio (Spectral Drone) ---
let audioCtx;
let droneOsc;
let droneGain;

const initAudio = () => {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
};

const createSpectralDrone = () => {
    initAudio();

    // Create a low-frequency drone (The Petrichor/Desert Wind)
    droneOsc = audioCtx.createOscillator();
    droneGain = audioCtx.createGain();
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();

    droneOsc.type = 'brown'; // Brown noise is deep and loamy
    // Browser might not support 'brown' on Oscillator, we'll use a low sine + modulation
    droneOsc.type = 'sine';
    droneOsc.frequency.setValueAtTime(60, audioCtx.currentTime);

    lfo.frequency.setValueAtTime(0.5, audioCtx.currentTime);
    lfoGain.gain.setValueAtTime(20, audioCtx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(droneOsc.frequency);

    droneGain.gain.setValueAtTime(0, audioCtx.currentTime);
    droneGain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 4);

    droneOsc.connect(droneGain);
    droneGain.connect(audioCtx.destination);

    droneOsc.start();
    lfo.start();
};

// Update Ghost Commands with actual logic
// Update Ghost Commands with actual logic
window.ghost = {
    startAmbient: () => {
        console.log('Ambient audio initiated...');
        if (!audioCtx) {
            createSpectralDrone();
        }
    },
    stopAmbient: () => {
        console.log('Stopping ambient audio...');
        if (droneGain) {
            droneGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2);
            setTimeout(() => {
                if (droneOsc) droneOsc.stop();
                audioCtx = null; // Reset context to allow restart
            }, 2100);
        }
    },
    openCurtain: () => {
        console.log('Opening the curtain...');
        curtain.style.opacity = '0';
        if ("vibrate" in navigator) {
            navigator.vibrate([100, 50, 100]);
        }
    },
    closeCurtain: () => {
        console.log('Closing the curtain...');
        curtain.style.opacity = '1';
    },
    activateOmen: (text) => {
        console.log('Activating Omen:', text);
        omenText.textContent = text || "What is the engine of your imagination?";
        omen.style.opacity = '1';
    },
    clearOmen: () => {
        console.log('Clearing Omen...');
        omen.style.opacity = '0';
    }
};

// Initialize
try {
    initStreams();
    initRemoteControl();
} catch (e) {
    const debugStatus = document.getElementById('debug-status');
    if (debugStatus) debugStatus.textContent = `FATAL ERROR: ${e.message}`;
}

// Audio context requires a user gesture in the PORTAL window
document.body.addEventListener('click', () => {
    if (!audioCtx) {
        initAudio();
        console.log('Audio Context initialized via gesture.');
    }
}, { once: true });

// --- Alchemist's Lens: Turbulence Animation ---
const turbulence = document.querySelector('#orb-turbulence feTurbulence');
let freq = 0.015;
let step = 0.0001;

function animateTurbulence() {
    if (!turbulence) return;
    freq += step;
    if (freq > 0.018 || freq < 0.012) step = -step;
    turbulence.setAttribute('baseFrequency', freq);
    requestAnimationFrame(animateTurbulence);
}
// Start the ripple
animateTurbulence();

// For now, allow trigger via console or keyboard for developer
document.addEventListener('keydown', (e) => {
    if (e.key === 'o') window.ghost.openCurtain();
    if (e.key === 'c') window.ghost.closeCurtain();
});
