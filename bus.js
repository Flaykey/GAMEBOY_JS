import { cpu } from "./cpu.js";
import { ppu } from "./ppu.js";
import { loop } from "./app.js";
export const memory = new Uint8Array(0x10000);

const joyPad = new Uint8Array(8);

addEventListener("blur", () => { joyPad.fill(0) });

document.addEventListener("keyup", function(e) {
    switch (e.code) {
        case 'ArrowRight': joyPad[0] = 0; break;
        case 'ArrowLeft':  joyPad[1] = 0; break;
        case 'ArrowUp':    joyPad[2] = 0; break;
        case 'ArrowDown':  joyPad[3] = 0; break;
        case 'KeyS':       joyPad[4] = 0; break;
        case 'KeyA':       joyPad[5] = 0; break;
        case 'KeyZ':       joyPad[6] = 0; break;
        case 'KeyX':       joyPad[7] = 0; break;
    }
});
document.addEventListener("keydown", function(e) {
    switch (e.code) {
        case 'ArrowRight': joyPad[0] = 1; break;
        case 'ArrowLeft':  joyPad[1] = 1; break;
        case 'ArrowUp':    joyPad[2] = 1; break;
        case 'ArrowDown':  joyPad[3] = 1; break;
        case 'KeyS':       joyPad[4] = 1; break;
        case 'KeyA':       joyPad[5] = 1; break;
        case 'KeyZ':       joyPad[6] = 1; break;
        case 'KeyX':       joyPad[7] = 1; break;
    }
});

export function write(address, data) {
    data &= 0xFF;
    address &= 0xFFFF;

    cpu.timer();
    ppu.step(4);

    if (address < 0x8000) return;            // ROM / future MBC registers

    switch (address) {
        case 0xFF00:
            memory[0xFF00] = data & 0x30;
            return;
        case 0xFF04:
            data = 0;                         // DIV resets on any write
            break;
        case 0xFF44:
            memory[0xFF44] = 0;               // LY resets on write
            return;
        case 0xFF46: {                        // OAM DMA
            const src = data << 8;
            for (let i = 0; i < 160; i++) memory[0xFE00 + i] = memory[src + i];
            break;
        }
    }
    memory[address] = data;
}

export function reset(){
    memory.fill(0);
}

export function read(address){

    cpu.timer();
    ppu.step(4);
    if (address === 0xFF41) return 0x80 | (memory[0xFF41] & 0x78) | ppu.mode;
    if (address === 0xFF00) {
        const sel = memory[0xFF00] & 0x30;
        let low = 0x0F;

        if (!(sel & 0x10)) {            // d-pad selected
            if (joyPad[0]) low &= ~0x01; // Right
            if (joyPad[1]) low &= ~0x02; // Left
            if (joyPad[2]) low &= ~0x04; // Up
            if (joyPad[3]) low &= ~0x08; // Down
        }
        if (!(sel & 0x20)) {            // buttons selected
            if (joyPad[4]) low &= ~0x01; // A
            if (joyPad[5]) low &= ~0x02; // B
            if (joyPad[6]) low &= ~0x04; // Select
            if (joyPad[7]) low &= ~0x08; // Start
        }
        return 0xC0 | sel | low;
    }
    if(address >= 0x0000 && address <= 0xFFFF)
        return memory[address];

    return 0;
}

const fileInput = document.querySelector("input");

fileInput.addEventListener('change',(e)=>{
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(){
        const content = new Uint8Array(reader.result);
        let i = 0;
        content.forEach(element => {
            memory[i] = element;
            i++;
        });
        cpu.stopped = false;
        loop();

    }

    reader.onerror = function(){
        console.log("Error reading file");
    }

    reader.readAsArrayBuffer(file)
})