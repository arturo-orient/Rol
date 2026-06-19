document.addEventListener('DOMContentLoaded', () => {
    initGrids();
    loadData();
    setupEventListeners();
});

// --- INIT GRIDS (HP & SAN) ---
function initGrids() {
    const hpGrid = document.getElementById('hp-grid');
    for (let i = 1; i <= 30; i++) {
        const div = document.createElement('div');
        div.className = 'num-box';
        div.textContent = i < 10 ? '0' + i : i;
        div.dataset.type = 'hp';
        div.dataset.val = i;
        hpGrid.appendChild(div);
    }

    const sanGrid = document.getElementById('san-grid');
    for (let i = 1; i <= 99; i++) {
        const div = document.createElement('div');
        div.className = 'num-box';
        div.textContent = i < 10 ? '0' + i : i;
        div.dataset.type = 'san';
        div.dataset.val = i;
        sanGrid.appendChild(div);
    }

    document.querySelectorAll('.num-box').forEach(box => {
        box.addEventListener('click', (e) => {
            const isCrossed = e.target.classList.contains('crossed');
            const type = e.target.dataset.type;
            document.querySelectorAll(`.num-box[data-type="${type}"]`).forEach(b => b.classList.remove('crossed'));
            if (!isCrossed) {
                e.target.classList.add('crossed');
            }
            saveData();
        });
    });
}

// --- DYNAMIC LISTS ---
function addDynamicRow(containerId, type, data = null) {
    const container = document.getElementById(containerId);
    const id = Date.now().toString() + Math.floor(Math.random()*1000);
    const row = document.createElement('div');
    
    if (type === 'weapon') {
        row.className = 'weapon-row';
        row.dataset.id = id;
        row.innerHTML = `
            <input type="text" class="dyn-w-name" placeholder="Arma" value="${data && data.name ? data.name : ''}">
            <input type="text" class="dyn-w-atk" placeholder="%" value="${data && data.atk ? data.atk : ''}" style="text-align:center;">
            <input type="text" class="dyn-w-par" placeholder="%" value="${data && data.par ? data.par : ''}" style="text-align:center;">
            <input type="text" class="dyn-w-dmg" placeholder="Daño" value="${data && data.dmg ? data.dmg : ''}" style="text-align:center;">
            <input type="text" class="dyn-w-eff" placeholder="Efecto" value="${data && data.eff ? data.eff : ''}">
            <button class="btn-remove no-print" onclick="removeRow(this)">X</button>
        `;
    } else if (type === 'inventory') {
        row.className = 'inv-row';
        row.dataset.id = id;
        row.innerHTML = `
            <input type="text" class="dyn-i-name" placeholder="Objeto" value="${data ? data.name : ''}">
            <input type="text" class="dyn-i-qty" placeholder="Cant/Peso" value="${data ? data.qty : ''}">
            <input type="text" class="dyn-i-desc" placeholder="Descripción" value="${data ? data.desc : ''}">
            <button class="btn-remove no-print" onclick="removeRow(this)">X</button>
        `;
    } else if (type === 'spell') {
        row.className = 'spell-item';
        row.dataset.id = id;
        row.innerHTML = `
            <div class="spell-row-top">
                <input type="text" class="dyn-sp-name" placeholder="Nombre" value="${data && data.name ? data.name : ''}">
                <input type="text" class="dyn-sp-mana" placeholder="Maná" value="${data && data.mana ? data.mana : ''}" style="text-align:center;">
                <input type="text" class="dyn-sp-eff" placeholder="Efecto" value="${data && data.eff ? data.eff : ''}">
                <button class="btn-remove no-print" onclick="removeRow(this)">X</button>
            </div>
            <textarea class="dyn-sp-desc" placeholder="Descripción detallada del hechizo o poder..." style="width: 100%; min-height: 50px; padding: 5px; font-family: inherit; overflow: hidden; resize: none;">${data && data.desc ? data.desc : ''}</textarea>
        `;
    } else if (type === 'skill') {
        row.className = 'skill-item';
        row.dataset.id = id;
        row.innerHTML = `
            <input type="text" class="dyn-s-name" placeholder="Habilidad" value="${data && data.name ? data.name : ''}">
            <input type="text" class="dyn-s-val" placeholder="%" value="${data && data.val ? data.val : ''}">
            <input type="checkbox" class="dyn-s-chk" ${data && data.chk ? 'checked' : ''}>
            <button class="btn-remove no-print" onclick="removeRow(this)">X</button>
        `;
    } else if (type === 'note') {
        row.className = 'note-item';
        row.dataset.id = id;
        row.innerHTML = `
            <div class="note-row-top">
                <input type="text" class="dyn-n-title" placeholder="Título de la nota..." value="${data && data.title ? data.title : ''}" style="font-weight: bold; font-size: 16px;">
                <button class="btn-remove no-print" onclick="removeRow(this)">X</button>
            </div>
            <textarea class="dyn-n-desc" placeholder="Contenido de la nota..." style="width: 100%; min-height: 80px; padding: 5px; font-family: inherit; overflow: hidden; resize: none;">${data && data.desc ? data.desc : ''}</textarea>
        `;
    }

    // Add event listeners to new inputs
    row.querySelectorAll('input, textarea').forEach(inp => {
        inp.addEventListener('input', saveData);
        inp.addEventListener('change', saveData);
        if (inp.tagName.toLowerCase() === 'textarea') {
            inp.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
            setTimeout(() => {
                inp.style.height = 'auto';
                inp.style.height = inp.scrollHeight + 'px';
            }, 10);
        }
    });

    container.appendChild(row);
    if(!data) saveData();
}

window.removeRow = function(btn) {
    const row = btn.closest('[data-id]');
    if (row) {
        row.remove();
    } else {
        btn.parentElement.remove();
    }
    saveData();
};

document.getElementById('btn-add-weapon').addEventListener('click', () => addDynamicRow('weapons-container', 'weapon'));
document.getElementById('btn-add-inventory').addEventListener('click', () => addDynamicRow('inventory-container', 'inventory'));
document.getElementById('btn-add-spell').addEventListener('click', () => addDynamicRow('spells-container', 'spell'));
document.getElementById('btn-add-note').addEventListener('click', () => addDynamicRow('notes-container', 'note'));

document.querySelectorAll('.btn-add-cat-skill').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetId = e.target.getAttribute('data-target');
        addDynamicRow(targetId, 'skill');
    });
});

// --- SAVE / LOAD SYSTEM ---
function setupEventListeners() {
    // Escuchar cambios en todos los inputs estáticos para autoguardar
    const staticInputs = document.querySelectorAll('.sheet input:not([class^="dyn-"]), .sheet textarea:not([class^="dyn-"])');
    staticInputs.forEach(input => {
        input.addEventListener('input', saveData);
        input.addEventListener('change', saveData);
        if (input.tagName.toLowerCase() === 'textarea') {
            input.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
            setTimeout(() => {
                input.style.height = 'auto';
                input.style.height = input.scrollHeight + 'px';
            }, 10);
        }
    });

    // Controles exportar/importar/borrar
    document.getElementById('btn-export').addEventListener('click', exportData);
    document.getElementById('btn-import-trigger').addEventListener('click', () => document.getElementById('file-import').click());
    document.getElementById('file-import').addEventListener('change', importData);
    document.getElementById('btn-clear').addEventListener('click', () => {
        if(confirm("¿Estás seguro de que quieres borrar todos los datos de la ficha?")) {
            localStorage.removeItem('stormbringer_sheet_data');
            location.reload();
        }
    });
}

function getSaveObject() {
    const data = {
        staticFields: {},
        hpCrossed: [],
        sanCrossed: [],
        weapons: [],
        inventory: [],
        spells: [],
        catSkills: [],
        notes: []
    };

    // Campos estáticos
    document.querySelectorAll('.sheet input:not([class^="dyn-"]), .sheet textarea').forEach(input => {
        if (input.type === 'checkbox') {
            data.staticFields[input.id] = input.checked;
        } else {
            data.staticFields[input.id] = input.value;
        }
    });

    // Grids
    document.querySelectorAll('.num-box.crossed[data-type="hp"]').forEach(b => data.hpCrossed.push(b.dataset.val));
    document.querySelectorAll('.num-box.crossed[data-type="san"]').forEach(b => data.sanCrossed.push(b.dataset.val));

    // Dynamic Lists
    document.querySelectorAll('.weapon-row').forEach(row => {
        data.weapons.push({
            name: row.querySelector('.dyn-w-name').value,
            atk: row.querySelector('.dyn-w-atk').value,
            par: row.querySelector('.dyn-w-par').value,
            dmg: row.querySelector('.dyn-w-dmg').value,
            eff: row.querySelector('.dyn-w-eff').value
        });
    });

    document.querySelectorAll('.inv-row').forEach(row => {
        data.inventory.push({
            name: row.querySelector('.dyn-i-name').value,
            qty: row.querySelector('.dyn-i-qty').value,
            desc: row.querySelector('.dyn-i-desc').value
        });
    });

    document.querySelectorAll('.spell-item').forEach(row => {
        data.spells.push({
            name: row.querySelector('.dyn-sp-name').value,
            mana: row.querySelector('.dyn-sp-mana').value,
            eff: row.querySelector('.dyn-sp-eff').value,
            desc: row.querySelector('.dyn-sp-desc').value
        });
    });

    document.querySelectorAll('.note-item').forEach(row => {
        data.notes.push({
            title: row.querySelector('.dyn-n-title').value,
            desc: row.querySelector('.dyn-n-desc').value
        });
    });

    document.querySelectorAll('.dyn-s-name').forEach(input => {
        const row = input.closest('.skill-item');
        const parentList = row.closest('.skill-list');
        if (parentList) {
            data.catSkills.push({
                parent: parentList.id,
                name: input.value,
                val: row.querySelector('.dyn-s-val').value,
                chk: row.querySelector('.dyn-s-chk').checked
            });
        }
    });

    return data;
}

function saveData() {
    const data = getSaveObject();
    localStorage.setItem('stormbringer_sheet_data', JSON.stringify(data));
}

function loadData() {
    const json = localStorage.getItem('stormbringer_sheet_data');
    if (!json) return;
    
    try {
        const data = JSON.parse(json);
        applyDataToUI(data);
    } catch(e) {
        console.error("Error loading data", e);
    }
}

function applyDataToUI(data) {
    if (!data) return;

    // Static fields
    if (data.staticFields) {
        for (const [id, value] of Object.entries(data.staticFields)) {
            const el = document.getElementById(id);
            if (el) {
                if (el.type === 'checkbox') el.checked = value;
                else el.value = value;
            }
        }
    }

    // Grids
    if (data.hpCrossed) {
        data.hpCrossed.forEach(val => {
            const el = document.querySelector(`.num-box[data-type="hp"][data-val="${val}"]`);
            if (el) el.classList.add('crossed');
        });
    }
    if (data.sanCrossed) {
        data.sanCrossed.forEach(val => {
            const el = document.querySelector(`.num-box[data-type="san"][data-val="${val}"]`);
            if (el) el.classList.add('crossed');
        });
    }

    // Dynamic lists (clear first)
    document.getElementById('weapons-container').innerHTML = '';
    if (data.weapons) data.weapons.forEach(w => addDynamicRow('weapons-container', 'weapon', w));

    document.getElementById('inventory-container').innerHTML = '';
    if (data.inventory) data.inventory.forEach(i => addDynamicRow('inventory-container', 'inventory', i));

    document.getElementById('spells-container').innerHTML = '';
    if (data.spells) data.spells.forEach(s => addDynamicRow('spells-container', 'spell', s));

    document.getElementById('notes-container').innerHTML = '';
    if (data.notes) data.notes.forEach(n => addDynamicRow('notes-container', 'note', n));

    // Clear dynamic skills first
    document.querySelectorAll('.skill-list .skill-item').forEach(item => {
        if (item.querySelector('.dyn-s-name')) {
            item.remove();
        }
    });

    if (data.catSkills) data.catSkills.forEach(s => addDynamicRow(s.parent, 'skill', s));
}

// --- EXPORT / IMPORT ---
function exportData() {
    const data = getSaveObject();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const nombre = document.getElementById('nombre').value || 'Personaje';
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `Stormbringer_${nombre}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            // reset UI before applying
            document.querySelectorAll('.num-box.crossed').forEach(b => b.classList.remove('crossed'));
            applyDataToUI(data);
            saveData();
            alert("Ficha importada correctamente.");
        } catch(err) {
            alert("Error al importar la ficha. El archivo puede estar corrupto.");
        }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset file input
}
