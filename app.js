console.log('The Vessel is breathing...');

const curtain = document.getElementById('curtain');
const omen = document.getElementById('omen-container');
const omenText = document.getElementById('omen-text');
const tonyOrb = document.getElementById('tony-orb');
const courtOrb = document.getElementById('court-orb');

// VDO.Ninja Integration
const getStreamUrl = (streamID, room = '', password = '') => {
    let baseUrl = 'https://vdo.ninja/?';
    if (room) baseUrl += `room=${room}&`;
    if (password) baseUrl += `password=${password}&`;

    // Using cleanviewer=1, transparent=1, and autostart=1 to bypass landing pages
    return `${baseUrl}view=${streamID}&cleanviewer=1&transparent=1&autoplay=1&autostart=1&mute=1&bitrate=3000&quality=0&scale=100&centered=1&nonav=1&nochat=1&pip=0&showdirector=0`;
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
const SUPABASE_KEY = 'sb_publishable_6eGLT3B0T94gjmvEA9R0jQ_dDGpHZNl';

// Initialize Supabase Client (assuming CDN is loaded in HTML)
let supabase;
let ritualChannel;

const initRemoteControl = () => {
    if (typeof supabase === 'undefined' && typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        ritualChannel = supabase.channel('common_space_ritual');

        ritualChannel
            .on('broadcast', { event: 'command' }, (payload) => {
                handleRitualCommand(payload.payload);
            })
            .subscribe((status) => {
                console.log('Supabase Sync Status:', status);
            });
    }
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
    const { type, text, tony, court, room, pass } = data;
    console.log('Received Command:', type);

    switch (type) {
        case 'UPDATE_STREAMS':
            currentTonyId = tony;
            currentCourtId = court;
            currentRoom = room;
            currentPass = pass;
            updateIndividualStreams(tony, court, room, pass);
            break;
        case 'REFRESH_FEEDS':
            updateIndividualStreams(currentTonyId, currentCourtId, currentRoom, currentPass);
            break;
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
    if (tonySid) {
        tonyOrb.innerHTML = `<iframe src="${getStreamUrl(tonySid, room, pass)}" allow="autoplay;camera;microphone;fullscreen;picture-in-picture"></iframe>`;
    }
    if (courtSid) {
        courtOrb.innerHTML = `<iframe src="${getStreamUrl(courtSid, room, pass)}" allow="autoplay;camera;microphone;fullscreen;picture-in-picture"></iframe>`;
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
initStreams();
initRemoteControl();

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
