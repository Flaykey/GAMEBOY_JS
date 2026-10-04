import {read, write} from '/bus.js'

import { opcodeTable, bind } from './opcode.js';
import { ppu } from './ppu.js';


export const Z = 1 << 7;
export const N = 1 << 6;
export const H = 1 << 5;
export const C = 1 << 4;




export class CPU{
    constructor(){
        this.A = 0x01; this.F = 0xB0;
        this.B = 0x00; this.C = 0x13;
        this.D = 0x00; this.E = 0xD8;
        this.H = 0x01; this.L = 0x4D;
        this.SP = 0xFFFE;
        this.PC = 0x100;

        this.IME = false;
        this.is_halted = false;

        this.stopped = true;
        bind();
        console.log(opcodeTable);
    }

    fetch(){
        let data =  read(this.PC);
        this.PC++;
        // console.log(data.toString(16).toUpperCase());
        return data;
    }
    
    execute(opcode){
        if(opcodeTable[opcode] === undefined) console.log(opcode)
        opcodeTable[opcode](opcode);
        
    }
    
    run(){
        if(this.stopped) return;
        // console.log("PC: " + cpu.PC.toString(16).toUpperCase());
        let opcode = this.fetch();

        // console.log(cpu.PC,opcodeTable[opcode].name , opcode);

        cpu.F &= 0xF0;
        this.execute(opcode);
    }
    internal_delay(){
        ppu.step(4)
    }

    getReg(opcode){
        let mask = opcode & 0x07;
        switch(mask){
            case 0x0:
                return this.B;
            case 0x1:
                return this.C;
            case 0x2:
                return this.D;
            case 0x3:
                return this.E;
            case 0x4:
                return this.H;
            case 0x5:
                return this.L;
            case 0x6:
                let addr = (this.H << 8 | this.L) & 0xFFFF;
                return read(addr)
            case 0x7:
                return this.A;
            
            
        }
    }


    setReg(opcode,data){
        let mask = (opcode & 0xF8) % 0x40;
        switch(mask){
            case 0x00:
                this.B = data;
                return;
            case 0x08:
                this.C = data;
                return;
            case 0x10:
                this.D = data;
                return;
            case 0x18:
                this.E = data;
                return;
            case 0x20:
                this.H = data;
                return;
            case 0x28:
                this.L = data;
                return;
            case 0x30:
                let addr = (this.H << 8 | this.L) & 0xFFFF;
                write(addr,data)
                return;
            case 0x38:
                this.A = data;
                return;

        }
    }

    setZeroFlag(val){
        if(val == true){
            this.F |= Z;
        }
        else{
            this.F &= ~Z;
        }
    }
    setSubtractFlag(val){
        if(val == true){
            this.F |= N;
        }
        else{
            this.F &= ~N;
        }
    }
    setHalfCarryFlag(val){
        if(val == true){
            this.F |= H;
        }
        else{
            this.F &= ~H;
        }
    }
    setCarryFlag(val){
        if(val == true){
            this.F |= C;
        }
        else{
            this.F &= ~C;
        }
    }

    getZeroFlag(){
        return (this.F & Z) >> 7;
    }
    getSubtractFlag(){
        return (this.F & N) >> 6;
    }
    getHalfCarryFlag(){
        return (this.F & H) >> 5;
    }
    getCarryFlag(){
        return (this.F & C) >> 4;
    }
}

export const cpu = new CPU();


