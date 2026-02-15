console.log('Master System Initializing...');

const ROOM = 'Ritual_Room_777';
const SUPABASE_URL = 'https://eusqhncaalxcdkpfqgbd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1c3FobmNhYWx4Y2RrcGZxZ2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNzEyNjcsImV4cCI6MjA4Njc0NzI2N30.lYWeqibGAldOXeubtdiYEF8UJESUeFjLqzwh14WYNRU';

let currentMode = 'reception';

window.updateSystem = () => {
    const role = window.participantRole;
    const receptionIframe = document.getElementById('reception-iframe');

    // RECEPTION SETUP
    if (role === 'mike') {
        // Mike gets the FULL Director Panel he liked
        receptionIframe.src = `https://vdo.ninja/?director=${ROOM}&push=MikePort&view=TonyPort,CourtPort&cleanviewer=1`;
    } else {
        // Tony and Court get the Clean Room Scene
        const pushId = (role === 'tony') ? 'TonyPort' : 'CourtPort';
        receptionIframe.src = `https://vdo.ninja/?room=${ROOM}&push=${pushId}&cleanviewer=1&transparent=1&autoplay=1&autostart=1`;
    }

    // RITUAL SETUP (The Orbs wait in the background)
    document.getElementById('tony-orb').innerHTML = `<iframe src="https://vdo.ninja/?view=TonyPort&room=${ROOM}&autoplay=1&autostart=1&cleanviewer=1&mute=1"></iframe>`;
    document.getElementById('court-orb').innerHTML = `<iframe src="https://vdo.ninja/?view=CourtPort&room=${ROOM}&autoplay=1&autostart=1&cleanviewer=1&mute=1"></iframe>`;
    document.getElementById('mike-orb').innerHTML = `<iframe src="https://vdo.ninja/?view=MikePort&room=${ROOM}&autoplay=1&autostart=1&cleanviewer=1&mute=1"></iframe>`;
};

// --- Remote Control ---
const initRemoteControl = () => {
    if (typeof window.supabase === 'undefined') return setTimeout(initRemoteControl, 500);
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const channel = supabase.channel('common_space_ritual');

    channel.on('broadcast', { event: 'command' }, (payload) => {
        const { type, mode, target, state, text } = payload.payload;

        if (type === 'SET_MODE') {
            document.body.className = `mode-${mode}`;
        }
        if (type === 'OPEN_CURTAIN') {
            document.getElementById('curtain').style.opacity = '0';
        }
        if (type === 'CLOSE_CURTAIN') {
            document.getElementById('curtain').style.opacity = '1';
        }
        if (type === 'ACTIVATE_OMEN') {
            document.getElementById('omen-text').textContent = text;
            document.getElementById('omen-container').style.opacity = '1';
        }
        if (type === 'CLEAR_OMEN') {
            document.getElementById('omen-container').style.opacity = '0';
        }
        if (type === 'MUTE_CONTROL') {
            // Muting is now handled by Mike in the Director Panel!
            // But we can add a fallback here if needed.
        }
    }).subscribe();
};

initRemoteControl();
