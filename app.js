import { cpu } from "./cpu.js";
import { getSerialOutput } from "./bus.js";
import { ppu } from "./ppu.js";

const cpuDisplay = document.querySelector("#cpu");
const serialDisplay = document.querySelector("#serial");
console.log(String.fromCharCode(0x05));
export function loop() {
    cpuDisplay.textContent =
        JSON.stringify(cpu, null, 2);
    serialDisplay.textContent = getSerialOutput();
    for (let i = 0; i < 1000000; i++) {
        cpu.run();
    }

    ppu.renderFrame();

    if (!cpu.stopped){}
        requestAnimationFrame(loop);
}

requestAnimationFrame(loop);