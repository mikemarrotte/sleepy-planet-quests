console.log('The Vessel is breathing...');

const vessel = document.getElementById('vessel');
const curtain = document.getElementById('curtain');
const omen = document.getElementById('omen-container');
const omenText = document.getElementById('omen-text');
const tonyOrb = document.getElementById('tony-orb');
const courtOrb = document.getElementById('court-orb');
const mikeOrb = document.getElementById('mike-orb'); // Mike now has an orb too!

// --- Configuration ---
const ROOM = 'Ritual_Room_777';
const SUPABASE_URL = 'https://eusqhncaalxcdkpfqgbd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1c3FobmNhYWx4Y2RrcGZxZ2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNzEyNjcsImV4cCI6MjA4Njc0NzI2N30.lYWeqibGAldOXeubtdiYEF8UJESUeFjLqzwh14WYNRU';

// --- State ---
let currentMuteCourt = false;
let currentMuteTony = false;
let currentMode = 'reception'; // 'reception' or 'portal'

// --- VDO.Ninja Helper ---
const getVdoUrl = (role, isSelf) => {
    let url = `https://vdo.ninja/?room=${ROOM}&cleanviewer=1&transparent=1&autoplay=1&autostart=1`;

    if (isSelf) {
        // I am pushing my own camera
        const pushId = (role === 'tony') ? 'TonyPort' : (role === 'court' ? 'CourtPort' : 'MikePort');
        url += `&push=${pushId}`;

        // Remote Mute Logic: If Mike mutes me, I push as muted
        if (role === 'court' && currentMuteCourt) url += `&mute=1`;
        if (role === 'tony' && currentMuteTony) url += `&mute=1`;

        url += `&view=none`; // Don't view anything in this specific iframe
    } else {
        // I am viewing someone else
        const viewId = (role === 'tony') ? 'TonyPort' : (role === 'court' ? 'CourtPort' : 'MikePort');
        url += `&view=${viewId}`;
    }

    return url;
};

const updateAllFeeds = () => {
    const myRole = window.participantRole;
    if (!myRole) return;

    // 1. My own camera (often invisible or small)
    const myIframe = document.getElementById('my-camera-feed');
    if (myIframe) myIframe.src = getVdoUrl(myRole, true);

    // 2. The Orbs (Viewing others)
    if (tonyOrb) {
        tonyOrb.innerHTML = `<iframe src="${getVdoUrl('tony', false)}" allow="autoplay;camera;microphone;fullscreen"></iframe>`;
    }
    if (courtOrb) {
        courtOrb.innerHTML = `<iframe src="${getVdoUrl('court', false)}" allow="autoplay;camera;microphone;fullscreen"></iframe>`;
    }
    if (mikeOrb) {
        mikeOrb.innerHTML = `<iframe src="${getVdoUrl('mike', false)}" allow="autoplay;camera;microphone;fullscreen"></iframe>`;
    }
};

// --- Remote Control ---
let supabase;
let ritualChannel;

const initRemoteControl = () => {
    if (typeof window.supabase === 'undefined') return setTimeout(initRemoteControl, 500);

    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    ritualChannel = supabase.channel('common_space_ritual');

    ritualChannel.on('broadcast', { event: 'command' }, (payload) => {
        handleRitualCommand(payload.payload);
    }).subscribe();
};

function handleRitualCommand(data) {
    if (!data) return;
    const { type, mode, target, state, text } = data;
    console.log('Command Received:', type, data);

    switch (type) {
        case 'SET_MODE':
            currentMode = mode;
            document.body.className = `mode-${mode}`;
            break;

        case 'MUTE_CONTROL':
            if (target === 'court') currentMuteCourt = state;
            if (target === 'tony') currentMuteTony = state;
            // We refresh our OWN camera if we were the target
            if (window.participantRole === target) {
                const myIframe = document.getElementById('my-camera-feed');
                if (myIframe) myIframe.src = getVdoUrl(target, true);
            }
            break;

        case 'OPEN_CURTAIN':
            curtain.style.transform = 'translateY(-100%)';
            curtain.style.opacity = '0';
            break;

        case 'CLOSE_CURTAIN':
            curtain.style.transform = 'translateY(0)';
            curtain.style.opacity = '1';
            break;

        case 'ACTIVATE_OMEN':
            if (omenText) omenText.textContent = text;
            omen.style.opacity = '1';
            break;

        case 'CLEAR_OMEN':
            omen.style.opacity = '0';
            break;
    }
}

// --- Initialization ---
window.enterRitual = function () {
    document.getElementById('arrival-mask').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('arrival-mask').style.display = 'none';
        updateAllFeeds();
    }, 1500);
}

// Initialize Logic
initRemoteControl();
