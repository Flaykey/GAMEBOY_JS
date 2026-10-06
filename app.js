import { cpu } from "./cpu.js";
import { bind } from "./opcode.js";

import { getSerialOutput, memory } from "./bus.js";
import { ppu } from "./ppu.js";
import { reset } from "./bus.js";
import { opcodeTable } from "./opcode.js";


async function run_tests(test_num) {
    const path = `./v1/${test_num.toString(16).padStart(2, "0")}.json`;

    const res = await fetch(path);

    if (!res.ok)
        throw new Error(`Failed to load ${path}: ${res.status}`);

    const data = await res.json();

    for (const test of data) {
        reset();

        const initial = test.initial;
        const final = test.final;
        const cycles = test.cycles.length;

        const c = initial.cpu;

        cpu.A  = parseInt(c.a, 16);
        cpu.B  = parseInt(c.b, 16);
        cpu.C  = parseInt(c.c, 16);
        cpu.D  = parseInt(c.d, 16);
        cpu.E  = parseInt(c.e, 16);
        cpu.F  = parseInt(c.f, 16);
        cpu.H  = parseInt(c.h, 16);
        cpu.L  = parseInt(c.l, 16);
        cpu.PC = parseInt(c.pc, 16);
        cpu.SP = parseInt(c.sp, 16);
        cpu.IME = false;
        cpu.is_halted = false;
        cpu.stopped = false

        // Load initial RAM
        for (const point of initial.ram) {
            memory[parseInt(point[0], 16)] =
                parseInt(point[1], 16);
                
        }
        

        // Execute exactly one instruction
        cpu.run();

        // Check final RAM
        for (const point of final.ram) {
            const address = parseInt(point[0], 16);
            const expected = parseInt(point[1], 16);

            if (memory[address] !== expected) {
                
                console.log(point,cpu)
                throw new Error(
                    `TEST: ${test.name} Failed! ` +
                    `RAM[${point[0]}] expected ${point[1]}, ` +
                    `got ${memory[address].toString(16)}`
                );
            }
        }
    }

    console.log(
        `PASSED TEST: ${test_num.toString(16).padStart(2, "0")}`
    );
}

async function run_all_tests() {
    for (let test_num = 0x00; test_num <= 0xFE; test_num++) {
        if(test_num === 0xd3) continue;
        if(test_num === 0xdb) continue;
        if(test_num === 0xdd) continue;
        if(test_num === 0xe3) continue;
        if(test_num === 0xe4) continue;
        if(test_num === 0xeb) continue;
        if(test_num === 0xec) continue;
        if(test_num === 0xed) continue;
        if(test_num === 0xf4) continue;
        if(test_num === 0xfc) continue;
        if(test_num === 0xfd) continue;

        await run_tests(test_num);
    }

    console.log("ALL TESTS FINISHED");
}

// run_all_tests();



const cpuDisplay = document.querySelector("#cpu");
const serialDisplay = document.querySelector("#serial");
const CLK_CYCLE_PER_FRAME = 174764;

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

// requestAnimationFrame(loop);