import { memory } from "./bus.js";

const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");


ctx.scale(3, 3);
ctx.imageSmoothingEnabled = false;

const DMG_PALETTE = [
    [155, 188, 15],
    [139, 172, 15],
    [48, 98, 48],
    [15, 56, 15]
];

class PPU {
    constructor(){
        this.mode_cycle = 0;
        this.mode = 2;
        this.LCDC = 0;
        this.frameBuffer = new Uint8Array(160 * 144);
        this.imageData = ctx.createImageData(160, 144)
        this.buffer = document.createElement("canvas");
        this.buffer.width = 160;
        this.buffer.height = 144;
        this.bufferCtx = this.buffer.getContext("2d");
        this.x = 0;
        this.sprite_buffer = new Uint8Array(10);
        this.oam_sprite_selection = 0; 
    }
    step(cycle){
        if (!(memory[0xFF40] & 0x80)) {
        this.mode_cycle = 0;
        this.mode = 0;
        this.x = 0;
        memory[0xFF44] = 0;
        return;
    }
        for(let i = 0; i < cycle; i++)
            {
            this.mode_cycle += 1;
            this.LCDC = memory[0XFF40];
            switch(this.mode){
            case 0:
                this.h_blank();
                break;

            case 1:
                this.v_blank();
                break;

            case 2:
                this.oam_Mode();
                break;

            case 3:
                this.drawMode();
                break;
            }
        }


        // if(this.get_LY() === 144){
        //     this.render_frame();
        // }
    }
    oam_Mode(){

        if(this.mode_cycle >= 80){
            this.mode_cycle -= 80;
            this.mode = 3;
            this.scanOAM();
        }


    }
    scanOAM(){
        const ly = this.get_LY();
        const size = (this.LCDC & (1 << 2)) ? 16 : 8;
        this.sprite_count = 0;

        for(let i = 0; i < 40 && this.sprite_count < 10; i++){
            const y = memory[0xFE00 + i * 4] - 16;
            if(ly >= y && ly < y + size){
                this.sprite_buffer[this.sprite_count++] = i;
            }
        }
    }
    drawMode(){
        if (this.x < 160) {
            const lcdc = this.LCDC;
            const ly = this.get_LY();
            const bgp = memory[0xFF47];

            const inWindow = (lcdc & 0x20) &&
                             ly >= this.get_WY() &&
                             this.x >= this.get_WX() - 7;

            // --- background / window pixel (raw color index 0-3) ---
            let rawBg = 0;
            if (lcdc & 0x01) {
                let mapBase, px, py;
                if (inWindow) {
                    mapBase = (lcdc & 0x40) ? 0x9C00 : 0x9800;
                    px = this.x - (this.get_WX() - 7);
                    py = ly - this.get_WY();
                } else {
                    mapBase = (lcdc & 0x08) ? 0x9C00 : 0x9800;
                    px = (this.x + this.get_SCX()) & 0xFF;
                    py = (ly + this.get_SCY()) & 0xFF;
                }

                const id = memory[mapBase + (py >> 3) * 32 + (px >> 3)];
                let addr;
                if (lcdc & 0x10) addr = 0x8000 + id * 16;
                else             addr = 0x9000 + (id < 128 ? id : id - 256) * 16;
                addr += (py & 7) * 2;

                const bit = 7 - (px & 7);
                rawBg = ((memory[addr] >> bit) & 1) | (((memory[addr + 1] >> bit) & 1) << 1);
            }

            let shade = (bgp >> (rawBg * 2)) & 3;

            // --- sprite pixel ---
            if (lcdc & 0x02) {
                const sp = this.spritePixel(this.x, ly);
                if (sp >= 0) {
                    const flags = sp >> 2;
                    const hidden = (flags & 0x80) && rawBg !== 0;   // behind BG colors 1-3
                    if (!hidden) {
                        const pal = memory[(flags & 0x10) ? 0xFF49 : 0xFF48];
                        shade = (pal >> ((sp & 3) * 2)) & 3;
                    }
                }
            }

            this.frameBuffer[this.x + 160 * ly] = shade;
            this.x += 1;
        }

        if (this.mode_cycle >= 172) {
            this.mode_cycle -= 172;
            this.x = 0;
            memory[0xFF44] += 1;
            this.mode = 0;
        }
    }
    spritePixel(x, ly){
    const size = (this.LCDC & 0x04) ? 16 : 8;
    let bestX = 256, result = -1;

    for (let k = 0; k < this.sprite_count; k++) {
        const base = 0xFE00 + this.sprite_buffer[k] * 4;
        const sx = memory[base + 1] - 8;
        if (x < sx || x >= sx + 8 || sx >= bestX) continue;

        const flags = memory[base + 3];
        let row = ly - (memory[base] - 16);
        if (flags & 0x40) row = size - 1 - row;            // Y flip

        let tile = memory[base + 2];
        if (size === 16) tile &= 0xFE;

        const addr = 0x8000 + tile * 16 + row * 2;          // sprites always use 0x8000
        const col = x - sx;
        const bit = (flags & 0x20) ? col : 7 - col;         // X flip

        const color = ((memory[addr] >> bit) & 1) | (((memory[addr + 1] >> bit) & 1) << 1);
        if (color === 0) continue;                          // transparent

            bestX = sx;
            result = (flags << 2) | color;
        }   
        return result;
    }
       h_blank(){
        if(this.mode_cycle >= 204){
            this.mode_cycle -= 204;

            if(this.get_LY() < 144)
                this.mode = 2;
            else{
                this.mode = 1;
                memory[0xFF0F] |= 1 << 0;
            }
        }
    }
    v_blank(){
        if((this.mode_cycle % 456) === 0) memory[0xFF44] += 1;
        if(this.mode_cycle >= 4560){
            this.mode_cycle -= 4560;
            this.render_frame();    
            this.mode = 2;
            memory[0xFF44] = 0;
            this.x = 0;
        }
    }
    render_frame(){  
        // console.log([...memory.slice(0x8000, 0x8040)].map(b => b.toString(16).padStart(2,"0")).join(" "));
        let data = this.imageData.data;

        for(let i = 0; i < 160 * 144; i++){
            let color = DMG_PALETTE[this.frameBuffer[i]];

            let p = i * 4;

            data[p]     = color[0];
            data[p + 1] = color[1];
            data[p + 2] = color[2];
            data[p + 3] = 255;
        }

        this.bufferCtx.putImageData(this.imageData, 0, 0);

        ctx.drawImage(this.buffer, 0, 0);

    }

    get_LY(){
        return memory[0xFF44];
    }
    get_SCX(){
        return memory[0xFF43];
    }
    get_SCY(){
        return memory[0xFF42];
    }
    get_WY(){
        return memory[0XFF4A];
    }
    get_WX(){
        return memory[0XFF4B];
    }
    }


export const ppu = new PPU();