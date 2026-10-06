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
    }
    step(cycle){
        this.mode_cycle += cycle;
        this.LCDC = memory[0XFF40];
        if(this.mode === 2){
            this.oam_Mode();
        }
        else if(this.mode === 3){
            this.drawMode();
        }
        else if(this.mode === 0){
            this.h_blank();
        }
        else if(this.mode === 1){
            this.v_blank();
        }

        // if(this.get_LY() === 144){
        //     this.render_frame();
        // }
    }
    oam_Mode(){
        if(this.mode_cycle >= 80){
            this.mode_cycle -= 80;
            this.mode = 3;
        }

    }
    drawMode(){

        let win_tile_map;
        let back_tile_map;
        let tile_data_area;
        if(this.LCDC & (1 << 6)) win_tile_map = 0x9C00
        else win_tile_map = 0x9800;
        if(this.LCDC & (1 << 3)) back_tile_map = 0x9C00;
        else back_tile_map = 0x9800;
        if(this.LCDC & (1 << 4)) tile_data_area = 0x8000;
        else tile_data_area = 0X8800;

        let bgX = (this.x + this.get_SCX()) & 0xFF;
        let bgY = (this.get_LY() + this.get_SCY()) & 0xFF;

        let tileX = Math.floor(bgX / 8);
        let tileY = Math.floor(bgY / 8);

        
        let tile = tileX + tileY * 32;
        let bit = 7 - (bgX % 8);
        let row = bgY % 8;
        
        let win_tile_id;
        let back_tile_id;

        win_tile_id = memory[win_tile_map + tile]
        back_tile_id = memory[back_tile_map + tile]

        if(!(this.LCDC & (1<<4))){
            win_tile_id -= 0x100;
            back_tile_id -= 0x100;
        }
        let tileAddress = tile_data_area + back_tile_id * 16;
        let rowAddress = tileAddress + row * 2;

        let back_pixel_low = memory[rowAddress]
        let back_pixel_high = memory[rowAddress + 1]

        let win_pixel_low = memory[tile_data_area + win_tile_id * 16]
        let win_pixel_high = memory[tile_data_area + win_tile_id * 16 + 1]

        let back_pixel_color = ((back_pixel_low >> bit) & 1) | (((back_pixel_high >> bit) & 1) << 1);
        let win_pixel_color = (win_pixel_low >> bit) | (win_pixel_high >> (bit - 1));

        this.frameBuffer[this.x + 160 * this.get_LY()] = back_pixel_color;

        this.x += 1;
        if(this.x >= 160){
            this.x = 0;
            memory[0xFF44] += 1;
            this.mode = 0;
        }


    }
    h_blank(){
        if(this.mode_cycle >= 87){
            this.mode_cycle -= 87;
            if(this.get_LY() < 144) this.mode = 2;
            else this.mode = 1;
        }
    }
    v_blank(){
        if(this.mode_cycle >= 4560){
            this.mode_cycle -= 4560;
            this.mode = 2;
            this.render_frame();
        }
    }
    render_frame(){   
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