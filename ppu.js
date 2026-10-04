import { memory } from "./bus.js";

const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

ctx.scale(3, 3);

const DMG_PALETTE = [
    "#9bbc0f",
    "#8bac0f",
    "#306230",
    "#0f380f"
];

// Offscreen canvas
const buffer = document.createElement("canvas");
buffer.width = 160;
buffer.height = 144;

const bufferCtx = buffer.getContext("2d");

class PPU {
    constructor() {
        this.mode = 2;
        this.modeClock = 0;
        this.LY = 0;
    }

    step(cycles) {
        this.modeClock += cycles;

        // For now, just update timing.
        // Rendering will happen separately.
    }

    renderFrame() {
        const SCX = memory[0xFF43];
        const SCY = memory[0xFF42];

        for (let y = 0; y < 144; y++) {

            for (let x = 0; x < 160; x++) {

                // Position in the 256x256 background
                const bgX = (SCX + x) & 0xFF;
                const bgY = (SCY + y) & 0xFF;

                // Which tile?
                const tileX = Math.floor(bgX / 8);
                const tileY = Math.floor(bgY / 8);

                // Tile map starts at 0x9800
                const tileMapAddress =
                    0x9C00 + tileY * 32 + tileX;

                const tileId = memory[tileMapAddress];

                // Tile data starts at 0x8000
                // Each tile is 16 bytes
                const tileAddress =
                    0x8000 + tileId * 16;

                // Which row inside the tile?
                const tileRow = bgY % 8;

                // Each tile row uses 2 bytes
                const low =
                    memory[tileAddress + tileRow * 2];

                const high =
                    memory[tileAddress + tileRow * 2 + 1];

                // Which pixel inside the row?
                const bit = 7 - (bgX % 8);

                const lowBit = (low >> bit) & 1;
                const highBit = (high >> bit) & 1;

                const color =
                    (highBit << 1) | lowBit;

                bufferCtx.fillStyle = DMG_PALETTE[color];
                bufferCtx.fillRect(x, y, 1, 1);
            }
        }

        // Copy complete frame to visible canvas
        ctx.drawImage(buffer, 0, 0);
    }

    get_LCDC() {
        return memory[0xFF40];
    }

    get_SCY() {
        return memory[0xFF42];
    }

    get_SCX() {
        return memory[0xFF43];
    }

    get_LY() {
        return memory[0xFF44];
    }
}

export const ppu = new PPU();