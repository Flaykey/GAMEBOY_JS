import { cpu } from "./cpu.js";

const cpuDisplay = document.querySelector("#cpu");
const serialDisplay = document.querySelector("#serial");
const CLK_CYCLE_PER_FRAME = 174764 / 6;

export function loop() {
        while(cpu.current_clk < CLK_CYCLE_PER_FRAME ){
            //699056
            cpu.run();
        }
        cpu.current_clk -= CLK_CYCLE_PER_FRAME;

    if (!cpu.stopped){
        requestAnimationFrame(loop);
    }
}
