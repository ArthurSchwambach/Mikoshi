// ===========================================
// CONFIGURAÇÕES GERAIS
// ===========================================
const config = {
    columns: 5,
    timeLimit: 20.00,
    speedBase: 2,
    audioWaitTime: 50000, // 50 segundos de silêncio no vazio antes do texto
    typeSpeed: 50
};

const bgm = document.getElementById('bgm-audio');
bgm.volume = 0.5;

let puzzleState = {
    bars: [], 
    active: false,    // Se o puzzle está interagível
    hasStarted: false, // Se o timer já começou (primeiro clique)
    lockedCount: 0,
    timer: config.timeLimit,
    animFrame: null,
    timerRef: null
};

const els = {
    syncWrapper: document.getElementById('sync-wrapper'),
    progressFill: document.getElementById('progress-fill'),
    timer: document.getElementById('timer'),
    logs: document.getElementById('logs'),
    phaseBreach: document.getElementById('phase-breach'),
    phaseNulo: document.getElementById('phase-nulo'),
    nuloContent: document.getElementById('nulo-content-box'),
    nuloText: document.getElementById('nulo-text'),
    nuloChoices: document.getElementById('nulo-choices'),
    particles: document.getElementById('particles-container'),
    failModal: document.getElementById('fail-modal')
};

// ===========================================
// FASE 1: PUZZLE
// ===========================================

function initPuzzle() {
    els.syncWrapper.innerHTML = '';
    puzzleState.bars = [];
    puzzleState.hasStarted = false; // Reseta estado do clique inicial
    puzzleState.timer = config.timeLimit;
    els.timer.innerText = puzzleState.timer.toFixed(2);
    
    for(let i=0; i<config.columns; i++) {
        let col = document.createElement('div');
        col.className = 'sync-column';
        let block = document.createElement('div');
        block.className = 'sync-block';
        col.appendChild(block);
        col.onclick = () => tryLock(i);
        els.syncWrapper.appendChild(col);

        puzzleState.bars.push({
            colEl: col, blockEl: block,
            pos: Math.random() * 80 + 10,
            dir: Math.random() > 0.5 ? 1 : -1,
            speed: (Math.random() * 1.5) + 1.0,
            locked: false
        });
    }
    puzzleState.active = false;
    startPuzzle();
}

function startPuzzle() {
    puzzleState.active = true;
    updateLoop(); 
}

function startTimer() {
    if(puzzleState.hasStarted) return;
    puzzleState.hasStarted = true;
    
    puzzleState.timerRef = setInterval(() => {
        if(!puzzleState.active) return;
        puzzleState.timer -= 0.05;
        els.timer.innerText = puzzleState.timer.toFixed(2);
        if(puzzleState.timer <= 0) endPuzzle(false);
    }, 50);
}

function updateLoop() {
    if(!puzzleState.active) return;
    puzzleState.bars.forEach(bar => {
        if(bar.locked) return;
        bar.pos += bar.speed * bar.dir;
        if(bar.pos >= 90 || bar.pos <= 0) bar.dir *= -1;
        bar.blockEl.style.top = bar.pos + '%';
    });
    puzzleState.animFrame = requestAnimationFrame(updateLoop);
}

function tryLock(index) {
    if(!puzzleState.active) return;

    // INICIA O TIMER NO PRIMEIRO CLIQUE
    if(!puzzleState.hasStarted) {
        startTimer();
    }

    let bar = puzzleState.bars[index];
    if(bar.locked) return;

    if(bar.pos >= 40 && bar.pos <= 60) {
        bar.locked = true;
        bar.colEl.classList.add('locked');
        puzzleState.lockedCount++;
        let pct = (puzzleState.lockedCount / config.columns) * 100;
        els.progressFill.style.width = pct + '%';
        log(`> NÓ ${index+1} SINCRONIZADO.`);
        if(puzzleState.lockedCount === config.columns) endPuzzle(true);
    } else {
        puzzleState.timer -= 2.0;
        els.timer.style.color = '#fff';
        setTimeout(() => els.timer.style.color = '', 100);
        log(`> ERRO DE SINCRONIA. DADOS PERDIDOS.`);
    }
}

function log(msg) {
    els.logs.innerHTML += `<br>${msg}`;
    els.logs.scrollTop = els.logs.scrollHeight;
}

function endPuzzle(win) {
    puzzleState.active = false;
    cancelAnimationFrame(puzzleState.animFrame);
    clearInterval(puzzleState.timerRef);

    if(!win) {
        els.failModal.style.display = 'flex';
    } else {
        log("> ENGRAMA ESTABILIZADO.");
        log("> INICIANDO IMERSÃO NO VAZIO...");
        setTimeout(startCyberspaceSequence, 1000);
    }
}

// ===========================================
// FASE 2: CIBERESPAÇO
// ===========================================

function startCyberspaceSequence() {
    bgm.play().catch(e => console.log("Clique para áudio"));
    
    // Fade out da interface vermelha
    els.phaseBreach.style.opacity = '0';

    setTimeout(() => {
        els.phaseBreach.style.display = 'none';
        
        // Entra o fundo do Vazio
        els.phaseNulo.style.display = 'flex';
        void els.phaseNulo.offsetWidth; 
        els.phaseNulo.style.opacity = '1';
        
        spawnParticles(); 

        els.nuloContent.style.opacity = '0'; 

        // PAUSA DE 50 SEGUNDOS (Fundo rodando, sem texto)
        setTimeout(() => {
            els.nuloContent.style.opacity = '1'; 
            playDialogue('intro');
        }, config.audioWaitTime);

    }, 2000); 
}

function spawnParticles() {
    const container = document.getElementById('particles-container'); 
    if(!container) return;
    container.innerHTML = ''; 
    
    for(let i=0; i<30; i++) {
        let p = document.createElement('div');
        p.style.position = 'absolute';
        p.style.background = '#aaddff';
        p.style.width = Math.random() * 2 + 'px';
        p.style.height = p.style.width;
        p.style.left = Math.random() * 100 + '%';
        p.style.top = Math.random() * 100 + '%';
        p.style.opacity = Math.random() * 0.5;
        p.style.borderRadius = '50%';
        p.className = 'particle'; 
        p.style.animation = `floatUp ${Math.random() * 10 + 10}s linear infinite`;
        p.style.animationDelay = `-${Math.random() * 10}s`; 
        container.appendChild(p);
    }
}

// ===========================================
// DIÁLOGOS
// ===========================================

const nuloDialogues = [
    {
        id: 'intro',
        text: "Oichi... A desilusão da família Mori.",
        choices: [
            { text: "Onde eu estou?", next: 0 },
            { text: "Que lugar é este?", next: 0 }
        ]
    },
    {
        id: 0,
        text: "Você está no Santuário dos Mortos.",
        choices: [
            { text: "Isso é a Mikoshi?", next: 1 },
            { text: "Existem respostas aqui?", next: 1 }
        ]
    },
    {
        id: 1,
        text: "Você busca respostas simples quando elas não existem. Esta é a grande ilusão na qual o seu mundo se baseia.",
        choices: [
            { text: "Eu vim resgatar meu irmão.", next: 2 },
            { text: "Eu não ligo. Onde está meu irmão?.", next: 2 }
        ]
    },
    {
        id: 2,
        text: "Seu irmão? O código dele foi desconstruído. Ele não sente dor, nem saudade. Se você o acordar, ele pode não ser quem você lembra.",
        choices: [
            { text: "Eu não me importo. Ele é meu sangue.", next: 3 },
            { text: "Mesmo que seja apenas um eco, eu preciso tentar.", next: 3 }
        ]
    },
    {
        id: 3,
        text: "E há outros ecos presos a você. Artemis... Ela canta para a Lua, esperando que você volte. Se você falhar aqui, a música dela se tornará um réquiem. Você aceita destruir o mundo dela?",
        choices: [
            { text: "Ela é minha força, não minha fraqueza.", next: 4 },
            { text: "Eu fiz uma promessa. Eu vou voltar.", next: 4 }
        ]
    },
    {
        id: 4,
        text: "Sua vontade é fascinante. Se você busca a verdade sobre meu mestre, saiba que eu sempre fui o Vazio que te guiou até aqui.",
        choices: [
            { text: "Quem é seu mestre?", next: 5 },
            { text: "O que é você?", next: 5 }
        ]
    },
    {
        id: 5,
        text: "Fui criado para proteger meus mestres. Itsuki Mori e ",
        isGlitchNode: true, 
        choices: [
            { text: "Nulo... É você?", next: 6 },
            { text: "Você é o...?", next: 6 }
        ]
    },
    {
        id: 6,
        text: "Eu sou Nulo, e irei te ajudar, sendo o Vazio que percorre por tudo. Se é da tua vontade, iremos destruir a Mikoshi juntos.",
        choices: [
            { text: "[CONEXÃO FORÇADA] DESTRUIR A MIKOSHI", action: 'destroy', class: 'destroy' }
        ]
    }
];

let glitchInterval = null;

function playDialogue(id) {
    if (glitchInterval) clearInterval(glitchInterval);

    if(id === 6) {
        document.body.classList.add('critical-error');
    }

    let node = (id === 'intro') ? nuloDialogues.find(n => n.id === 'intro') : nuloDialogues.find(n => n.id === id);

    els.nuloText.innerHTML = ""; 
    els.nuloChoices.innerHTML = "";
    els.nuloChoices.style.opacity = 0;

    let i = 0;
    
    function type() {
        if(i < node.text.length) {
            els.nuloText.textContent += node.text.charAt(i);
            i++;
            setTimeout(type, config.typeSpeed);
        } else {
            // LÓGICA DO GLITCH DE 4 LETRAS
            if(node.isGlitchNode) {
                let glitchSpan = document.createElement('span');
                glitchSpan.className = 'dynamic-glitch';
                glitchSpan.innerText = "????"; // Placeholder inicial
                els.nuloText.appendChild(glitchSpan);
                // Chama a nova função de caos
                startChaos4CharGlitch(glitchSpan);
            }
            showChoices(node.choices);
        }
    }
    type();
}

// NOVA FUNÇÃO: Glitch de 4 caracteres aleatórios e infinitos
function startChaos4CharGlitch(element) {
    // Caracteres permitidos no glitch
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?';
    
    glitchInterval = setInterval(() => {
        let randomStr = '';
        // Gera 4 caracteres aleatórios a cada frame
        for(let k=0; k<4; k++) {
            randomStr += chars[Math.floor(Math.random() * chars.length)];
        }
        element.innerText = randomStr;
    }, 60); // Velocidade da troca (60ms)
}

function showChoices(choices) {
    choices.forEach(c => {
        let btn = document.createElement('button');
        btn.className = 'choice-btn';
        if(c.class) btn.classList.add(c.class);
        btn.innerText = c.text;
        btn.onclick = () => {
            if(c.action === 'destroy') triggerBeautifulDestruction();
            else playDialogue(c.next);
        };
        els.nuloChoices.appendChild(btn);
    });
    
    setTimeout(() => {
        els.nuloChoices.style.opacity = 1;
    }, 500);
}

// ===========================================
// FINAL: CORRUPÇÃO "BONITA"
// ===========================================

function triggerBeautifulDestruction() {
    if (glitchInterval) clearInterval(glitchInterval);
    
    els.nuloChoices.style.transition = "opacity 1s";
    els.nuloChoices.style.opacity = 0;
    
    const blobCount = 50;
    
    for(let i=0; i < blobCount; i++) {
        setTimeout(() => {
            createVoidBlob();
        }, i * 80); 
    }

    let vol = bgm.volume;
    let fade = setInterval(() => {
        if(vol > 0) { vol -= 0.02; bgm.volume = Math.max(0, vol); }
        else { clearInterval(fade); bgm.pause(); }
    }, 100);

    setTimeout(() => {
        let finalVeil = document.createElement('div');
        finalVeil.id = 'final-blackout';
        document.body.appendChild(finalVeil);
        void finalVeil.offsetWidth; 
        finalVeil.style.opacity = 1;
        
        setTimeout(() => {
            document.body.innerHTML = '';
            document.body.style.backgroundColor = 'black';
            document.body.style.cursor = 'none'; 
        }, 3000);
    }, 2500);
}

function createVoidBlob() {
    const blob = document.createElement('div');
    blob.classList.add('void-blob');
    
    const size = Math.random() * 200 + 50; 
    blob.style.width = size + 'px';
    blob.style.height = size + 'px';
    
    blob.style.left = Math.random() * 100 + 'vw';
    blob.style.top = Math.random() * 100 + 'vh';
    
    blob.style.transform = 'translate(-50%, -50%) scale(0)';
    
    document.body.appendChild(blob);
}

// Iniciar Jogo
initPuzzle();