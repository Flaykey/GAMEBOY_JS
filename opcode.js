import { read, write } from "./bus.js";

export const opcodeTable = new Array(256);
const cb_opcodeTable = new Array(256);



export function bind() {
    opcodeTable[0x00] = NOP;
    opcodeTable[0x10] = STOP;
    opcodeTable[0xF3] = DI;
    opcodeTable[0xFB] = EI;

    for (let i = 0x40; i < 0x80; i++) {
        opcodeTable[i] = LD_r8_r8;
    }

    for (let i = 0x06; i < 0x40; i += 8) {
        opcodeTable[i] = LD_r8_u8;
    }
    for (let i = 0; i < 4; i++) {
        opcodeTable[(0x02 + 0xF * i) + i] = LD_M_A;
        opcodeTable[(0x0A + 0xF * i) + i] = LD_A_M;
    }
    opcodeTable[0x8] = LD_u16_SP;
    opcodeTable[0xE2] = LD_RC_A;
    opcodeTable[0xEA] = LD_u16_A;
    opcodeTable[0xF2] = LD_A_RC;
    opcodeTable[0xFA] = LD_A_u16;
    opcodeTable[0xE0] = LD_u8_A;
    opcodeTable[0xF0] = LD_A_u8;


    opcodeTable[0x76] = HALT;

    for (let i = 0x0; i < 0x8; i++) {
        opcodeTable[0x80 + i] = ADD_r8;
        opcodeTable[0x88 + i] = ADC_r8;
        opcodeTable[0x90 + i] = SUB_r8;
        opcodeTable[0x98 + i] = SBC_r8;
        opcodeTable[0xA0 + i] = AND_r8;
        opcodeTable[0xA8 + i] = XOR_r8;
        opcodeTable[0xB0 + i] = OR_r8;
        opcodeTable[0xB8 + i] = CP_r8;

    }

    opcodeTable[0xC6] = ADD_u8;
    opcodeTable[0xCE] = ADC_u8;
    opcodeTable[0xD6] = SUB_u8;
    opcodeTable[0xDE] = SBC_u8;
    opcodeTable[0xE6] = AND_u8;
    opcodeTable[0xEE] = XOR_u8;
    opcodeTable[0xF6] = OR_u8;
    opcodeTable[0xFE] = CP_u8;

    for (let i = 0x4; i < 0x40; i += 0x8) {
        opcodeTable[i] = INC_r8;
        opcodeTable[i + 1] = DEC_r8
    }

    for (let i = 0; i < 4; i++) {
        opcodeTable[0x03 + 0xF * i + i] = INC_r16;
        opcodeTable[0x0B + 0xF * i + i] = DEC_r16;
    }

    for (let i = 0; i < 4; i++) {
        opcodeTable[0x1 + 0x10 * i] = LD_r16_u16;
        opcodeTable[0x9 + 0x10 * i] = ADD_HL_r16;
    }
    opcodeTable[0xF9] = LD_r16_r16;

    for (let i = 0; i < 4; i++) {
        opcodeTable[0xC1 + i * 0xF + i] = POP;
        opcodeTable[0xC5 + i * 0xF + i] = PUSH;
    }

    for (let i = 0; i < 5; i++) {
        opcodeTable[0x18 + i * 0x8] = JR_CON_i8;
    }
    for (let i = 0; i < 4; i++) {
        opcodeTable[0xC2 + i * 0x8] = JP_CON_u16;
    }
    opcodeTable[0xC3] = JP_u16;
    opcodeTable[0xE9] = JP_HL;
    opcodeTable[0xC9] = RET;
    opcodeTable[0xD9] = RETI;
    for (let i = 0; i < 4; i++) {
        opcodeTable[0xC0 + i * 0x8] = RET_CON;
    }
    for (let i = 0; i < 4; i++) {
        opcodeTable[0xC4 + i * 8] = CALL_CON;
    }
    opcodeTable[0xCD] = CALL;

    for (let i = 0; i < 8; i++) {
        opcodeTable[0xC7 + i * 0x8] = RST;
    }

    opcodeTable[0xE8] = ADD_SP_i8;
    opcodeTable[0xF8] = LD_HL_SP_i8;

    opcodeTable[0x07] = RLCA;
    opcodeTable[0x0F] = RRCA;
    opcodeTable[0x17] = RLA;
    opcodeTable[0x1F] = RRA;

    opcodeTable[0x27] = DAA;
    opcodeTable[0x2F] = CPL;
    opcodeTable[0x37] = SCF;
    opcodeTable[0x3F] = CCF;


    opcodeTable[0xCB] = CB;
    for(let i =0; i < 8; i++){
        cb_opcodeTable[0x00 + i] = CB_RLC;
        cb_opcodeTable[0x08 + i] = CB_RRC;
        cb_opcodeTable[0x10 + i] = CB_RL;
        cb_opcodeTable[0x18 + i] = CB_RR;
        cb_opcodeTable[0x20 + i] = CB_SLA;
        cb_opcodeTable[0x28 + i] = CB_SRA;
        cb_opcodeTable[0x30 + i] = CB_SWAP;
        cb_opcodeTable[0x38 + i] = CB_SRL;
    }

    for(let i = 0x40; i <= 0x7F; i++){
        cb_opcodeTable[i] = CB_BIT;
    }
    for(let i = 0x80; i <= 0xBF; i++){
        cb_opcodeTable[i] = CB_RES;
    }
    for(let i = 0xC0; i <= 0xFF; i++){
        cb_opcodeTable[i] = CB_SET;
    }
}


function NOP(opcode,cpu) {

}

function STOP(opcode,cpu) {
    // cpu.stopped = true;
}
function HALT(opcode,cpu) {
    cpu.is_halted = true;
}
function DI(opcode,cpu) {
    cpu.IME = false;
} function EI(opcode,cpu) {

    cpu.interrupt_triggered = true;
}
//0x40 --- 0x7F
function LD_r8_r8(opcode,cpu) {
    let data = cpu.getReg(opcode);
    cpu.setReg(opcode, data);
}

function LD_r8_u8(opcode,cpu) {
    let data = cpu.fetch();
    cpu.setReg(opcode, data);
}

function LD_r16_u16(opcode,cpu) {
    let low = cpu.fetch();
    let high = cpu.fetch();

    if (opcode == 0x31) {
        cpu.SP = ((high << 8) | low) & 0XFFFF;
        return;
    }

    cpu.setReg(opcode + 0x8, low);
    cpu.setReg(opcode, high);

}

function LD_u16_SP(opcode,cpu) {
    let low = cpu.fetch();
    let high = cpu.fetch();
    let addr = ((high << 8) | low) & 0xFFFF;

    let splow = cpu.SP & 0xFF;
    let sphigh = (cpu.SP >> 8) & 0xFF;

    write(addr, splow);
    write(addr + 1, sphigh);



}

function LD_r16_r16(opcode,cpu) {
    cpu.SP = ((cpu.H << 8) | cpu.L) & 0xFFFF;
}

function LD_M_A(opcode,cpu) {
    // console.log(
    //     "LD_M_A",
    //     "opcode =", opcode.toString(16),
    //     "DE =", ((cpu.D << 8) | cpu.E).toString(16),
    //     "A =", cpu.A.toString(16)
    // );
    let high = ((opcode >> 4) * 2) & 0xF;
    let low = high + 1;
    let mask = ((opcode & 0xF0) >> 4 ) &0xF;
    if (mask == 2 || mask == 3) {
        let address = ((cpu.H << 8) | cpu.L) & 0xFFFF;
        write(address, cpu.A);

        if(mask === 2){
            address += 1;
        }
        else{
            address -= 1;
        }

        cpu.H = (address >> 8) & 0xFF;
        cpu.L = address & 0xFF;


        return;
    }

    let x = cpu.getReg(high);
    let y = cpu.getReg(low);

    let addr = ((x << 8) | y) & 0xFFFF;

    write(addr, cpu.A);
}

function LD_A_M(opcode,cpu) {

    if (opcode === 0x2A || opcode === 0x3A) {
        let address = ((cpu.H << 8) | cpu.L) & 0xFFFF;

        cpu.A = read(address);

        if (opcode === 0x2A) {
            address = (address + 1) & 0xFFFF; // HL+
        } else {
            address = (address - 1) & 0xFFFF; // HL-
        }

        cpu.H = (address >> 8) & 0xFF;
        cpu.L = address & 0xFF;

        return;
    }

    // Other LD A,(BC), LD A,(DE), etc.
    let high = (((opcode >> 4) - 0xC) * 2) & 0xF;
    let low = high + 1;

    let x = cpu.getReg(high);
    let y = cpu.getReg(low);

    let addr = ((x << 8) | y) & 0xFFFF;

    cpu.A = read(addr);
}

function LD_RC_A(opcode,cpu) {

    write(0xFF00 + cpu.C, cpu.A);

}
function LD_A_RC(opcode,cpu) {
    cpu.A = read(0xFF00 + cpu.C);
}
function LD_u16_A(opcode,cpu) {
    let low = cpu.fetch();
    let high = cpu.fetch();
    let addr = ((high << 8) | low) & 0xFFFF;

    write(addr, cpu.A);


}
function LD_A_u16(opcode,cpu) {
    let low = cpu.fetch();
    let high = cpu.fetch();
    let addr = ((high << 8) | low) & 0xFFFF;
    cpu.A = read(addr);
}

function LD_u8_A(opcode,cpu) {
    let x = cpu.fetch();
    write(0xFF00 + x, cpu.A);
}

function LD_A_u8(opcode,cpu) {
    let x = cpu.fetch();
    cpu.A = read(0xFF00 + x);
}


//0x80 --- 0x87
function ADD_r8(opcode,cpu) {
    let x = cpu.A;
    let y = cpu.getReg(opcode);

    let result = x + y;
    cpu.setZeroFlag((result & 0xFF) === 0)
    cpu.setCarryFlag((result > 0xFF));
    cpu.setSubtractFlag(false);
    cpu.setHalfCarryFlag(((x ^ y ^ result) & 0x10) !== 0);

    cpu.A = result & 0xFF;

}

function ADD_HL_r16(opcode,cpu) {
    let rr;
    if (opcode === 0x39) {
        rr = cpu.SP;
    } else {
        let high = ((opcode >> 4) * 2) & 0xF;
        rr = (cpu.getReg(high) << 8) | cpu.getReg(high + 1);
    }

    let hl = (cpu.H << 8) | cpu.L;
    let result = hl + rr;

    cpu.setSubtractFlag(false);
    cpu.setHalfCarryFlag(((hl & 0xFFF) + (rr & 0xFFF)) > 0xFFF);
    cpu.setCarryFlag(result > 0xFFFF);
    // Z is left unchanged

    cpu.internal_delay();
    cpu.H = (result >> 8) & 0xFF;
    cpu.L = (result    ) & 0xFF;

}

function ADD_SP_i8(opcode,cpu) {
    let i8 = cpu.fetch();
    let signed = i8 < 0x80 ? i8 : i8 - 0x100;
    cpu.setZeroFlag(false);
    cpu.setSubtractFlag(false);

    cpu.setHalfCarryFlag(((cpu.SP & 0xF) + (i8 & 0xF)) > 0xF);
    cpu.setCarryFlag(((cpu.SP & 0xFF) + i8) > 0xFF);
    cpu.internal_delay();
    cpu.internal_delay();
    cpu.SP = (cpu.SP + signed) & 0xFFFF;

}

function LD_HL_SP_i8(opcode,cpu) {
    let i8 = cpu.fetch();
    let signed = i8 < 0x80 ? i8 : i8 - 0x100;
    cpu.setZeroFlag(false);
    cpu.setSubtractFlag(false);

    cpu.setHalfCarryFlag(((cpu.SP & 0xF) + (i8 & 0xF)) > 0xF);
    cpu.setCarryFlag(((cpu.SP & 0xFF) + i8) > 0xFF);
    let result = (cpu.SP + signed) & 0xFFFF;

    cpu.internal_delay();
    cpu.H = (result >> 8) & 0xFF;
    cpu.L = (result) & 0xFF;

}

function POP(opcode,cpu) {
    if ((opcode & 0xF0) == 0xF0) {
        cpu.F = read(cpu.SP++) & 0xF0;
        cpu.A = read(cpu.SP++);
        return;
    }

    cpu.setReg(opcode + 0x8, read(cpu.SP++));
    cpu.setReg(opcode, read(cpu.SP++));
}

function PUSH(opcode,cpu) {
    cpu.internal_delay();
    let high = (((opcode >> 4) - 0xC) * 2) & 0xF;
    let low = high + 1;
    if ((opcode & 0xF0) == 0xF0) {
    high = 7; // A, because getReg(6) = (HL)
    }
    write(--cpu.SP, cpu.getReg(high));
    if ((opcode & 0xF0) == 0xF0) write(--cpu.SP, cpu.F);
    else write(--cpu.SP, cpu.getReg(low));

}
//0x88 --- 0x8F
function ADC_r8(opcode,cpu) {
    let x = cpu.A;
    let y = cpu.getReg(opcode);
    let carry = cpu.getCarryFlag()

    let result = x + y + carry;
    cpu.setZeroFlag((result & 0xFF) === 0)
    cpu.setSubtractFlag(false);
    cpu.setHalfCarryFlag(((x ^ y ^ result ^ carry) & 0x10) !== 0);
    cpu.setCarryFlag((result > 0xFF));

    cpu.A = result & 0xFF;

}
// 0X90 --- 0X97
function SUB_r8(opcode,cpu) {
    let x = cpu.A;
    let y = cpu.getReg(opcode);

    let result = x - y;
    cpu.setZeroFlag((result & 0xFF) === 0)
    cpu.setSubtractFlag(true);
    cpu.setHalfCarryFlag(((x ^ y ^ result) & 0x10) !== 0);
    cpu.setCarryFlag((x < y));

    cpu.A = result & 0xFF;

}

//0X98 --- 0X9F
function SBC_r8(opcode,cpu) {
    let x = cpu.A;
    let y = cpu.getReg(opcode);
    let carry = cpu.getCarryFlag()

    let result = x - y - carry;
    cpu.setZeroFlag((result & 0xFF) === 0)
    cpu.setSubtractFlag(true);
    cpu.setHalfCarryFlag((x & 0x0F) < ((y & 0x0F) + carry));
    cpu.setCarryFlag((x < (y + carry)));

    cpu.A = result & 0xFF;

}

//0XA0 --- 0XA7
function AND_r8(opcode,cpu) {
    let x = cpu.A;
    let y = cpu.getReg(opcode);

    let result = x & y;
    cpu.setZeroFlag((result & 0xFF) === 0)
    cpu.setSubtractFlag(false);
    cpu.setHalfCarryFlag(true);
    cpu.setCarryFlag(false);

    cpu.A = result & 0xFF;
}

//0XA8 --- 0XAF
function XOR_r8(opcode,cpu) {
    let x = cpu.A;
    let y = cpu.getReg(opcode);

    let result = x ^ y;
    cpu.setZeroFlag((result & 0xFF) === 0)
    cpu.setSubtractFlag(false);
    cpu.setHalfCarryFlag(false);
    cpu.setCarryFlag(false);

    cpu.A = result & 0xFF;
}

//0XB0 --- 0XB7
function OR_r8(opcode,cpu) {
    let x = cpu.A;
    let y = cpu.getReg(opcode);

    let result = x | y;
    cpu.setZeroFlag((result & 0xFF) === 0)
    cpu.setSubtractFlag(false);
    cpu.setHalfCarryFlag(false);
    cpu.setCarryFlag(false);

    cpu.A = result & 0xFF;
}

//0XB8 --- 0XBF
function CP_r8(opcode,cpu) {
    let x = cpu.A;
    let y = cpu.getReg(opcode);

    let result = x - y;
    cpu.setZeroFlag((result & 0xFF) === 0)
    cpu.setSubtractFlag(true);
    cpu.setHalfCarryFlag(((x ^ y ^ result) & 0x10) !== 0);
    cpu.setCarryFlag((x < y));

}

function ADD_u8(opcode,cpu) {
    let x = cpu.A;
    let y = cpu.fetch();

    let result = x + y;
    cpu.setZeroFlag((result & 0xFF) === 0)
    cpu.setCarryFlag((result > 0xFF));
    cpu.setSubtractFlag(false);
    cpu.setHalfCarryFlag(((x ^ y ^ result) & 0x10) !== 0);

    cpu.A = result & 0xFF;

}

function ADC_u8(opcode,cpu) {
    let x = cpu.A;
    let y = cpu.fetch();
    let carry = cpu.getCarryFlag()

    let result = x + y + carry;
    cpu.setZeroFlag((result & 0xFF) === 0)
    cpu.setSubtractFlag(false);
    cpu.setHalfCarryFlag(((x ^ y ^ result ^ carry) & 0x10) !== 0);
    cpu.setCarryFlag((result > 0xFF));

    cpu.A = result & 0xFF;

}
function SUB_u8(opcode,cpu) {
    let x = cpu.A;
    let y = cpu.fetch();

    let result = x - y;
    cpu.setZeroFlag((result & 0xFF) === 0)
    cpu.setSubtractFlag(true);
    cpu.setHalfCarryFlag(((x ^ y ^ result) & 0x10) !== 0);
    cpu.setCarryFlag((x < y));

    cpu.A = result & 0xFF;

}

function SBC_u8(opcode,cpu) {
    let x = cpu.A;
    let y = cpu.fetch();
    let carry = cpu.getCarryFlag()

    let result = x - y - carry;
    cpu.setZeroFlag((result & 0xFF) === 0)
    cpu.setSubtractFlag(true);
    cpu.setHalfCarryFlag((x & 0x0F) < ((y & 0x0F) + carry));
    cpu.setCarryFlag((x < (y + carry)));

    cpu.A = result & 0xFF;

}

function AND_u8(opcode,cpu) {
    let x = cpu.A;
    let y = cpu.fetch();

    let result = x & y;
    cpu.setZeroFlag((result & 0xFF) === 0)
    cpu.setSubtractFlag(false);
    cpu.setHalfCarryFlag(true);
    cpu.setCarryFlag(false);

    cpu.A = result & 0xFF;
}

function XOR_u8(opcode,cpu) {
    let x = cpu.A;
    let y = cpu.fetch();

    let result = x ^ y;
    cpu.setZeroFlag((result & 0xFF) === 0)
    cpu.setSubtractFlag(false);
    cpu.setHalfCarryFlag(false);
    cpu.setCarryFlag(false);

    cpu.A = result & 0xFF;
}

function OR_u8(opcode,cpu) {
    let x = cpu.A;
    let y = cpu.fetch();

    let result = x | y;
    cpu.setZeroFlag((result & 0xFF) === 0)
    cpu.setSubtractFlag(false);
    cpu.setHalfCarryFlag(false);
    cpu.setCarryFlag(false);

    cpu.A = result & 0xFF;
}

function CP_u8(opcode,cpu) {
    let x = cpu.A & 0xFF;
    let y = cpu.fetch();

    let result = x - y;
    cpu.setZeroFlag((result & 0xFF) === 0)
    cpu.setSubtractFlag(true);
    cpu.setHalfCarryFlag(((x ^ y ^ result) & 0x10) !== 0);
    cpu.setCarryFlag((x < y));

}

function INC_r8(opcode,cpu) {
    let x = 0;

    switch (opcode) {
        case 0x04:
            x = cpu.B;
            break;

        case 0x0C:
            x = cpu.C;
            break;

        case 0x14:
            x = cpu.D;
            break;

        case 0x1C:
            x = cpu.E;
            break;

        case 0x24:
            x = cpu.H;
            break;

        case 0x2C:
            x = cpu.L;
            break;

        case 0x34:
            let addr = (cpu.H << 8 | cpu.L) & 0xFFFF;
            x = read(addr);
            break;

        case 0x3C:
            x = cpu.A;
            break;
    }

    let result = (x + 1) & 0xFF;

    cpu.setZeroFlag((result & 0xFF) === 0)
    cpu.setSubtractFlag(false);
    cpu.setHalfCarryFlag(((x ^ 1 ^ result) & 0x10) !== 0);

    switch (opcode) {
        case 0x04: cpu.B = result; break;
        case 0x0C: cpu.C = result; break;
        case 0x14: cpu.D = result; break;
        case 0x1C: cpu.E = result; break;
        case 0x24: cpu.H = result; break;
        case 0x2C: cpu.L = result; break;
        case 0x34:
            let addr = ((cpu.H << 8 ) | cpu.L) & 0xFFFF;
            write(addr, result);
            break;
        case 0x3C: cpu.A = result; break;
    }
}
function DEC_r8(opcode,cpu) {
    let x = 0;

    switch (opcode) {
        case 0x05:
            x = cpu.B;
            break;

        case 0x0D:
            x = cpu.C;
            break;

        case 0x15:
            x = cpu.D;
            break;

        case 0x1D:
            x = cpu.E;
            break;

        case 0x25:
            x = cpu.H;
            break;

        case 0x2D:
            x = cpu.L;
            break;

        case 0x35: {
            let addr = ((cpu.H << 8) | cpu.L) & 0xFFFF;
            x = read(addr);
            break;
        }

        case 0x3D:
            x = cpu.A;
            break;
    }

    let result = (x - 1) & 0xFF;

    cpu.setZeroFlag((result & 0xFF) === 0)
    cpu.setSubtractFlag(true);
    cpu.setHalfCarryFlag((x & 0x0F) === 0);
    switch (opcode) {
        case 0x05:
            cpu.B = result;
            break;

        case 0x0D:
            cpu.C = result;
            break;

        case 0x15:
            cpu.D = result;
            break;

        case 0x1D:
            cpu.E = result;
            break;

        case 0x25:
            cpu.H = result;
            break;

        case 0x2D:
            cpu.L = result;
            break;

        case 0x35: {
            let addr = ((cpu.H << 8) | cpu.L) & 0xFFFF;
            write(addr, result);
            break;
        }

        case 0x3D:
            cpu.A = result;
            break;
    }

}

function INC_r16(opcode,cpu) {

    if (opcode == 0x33) {
        cpu.internal_delay();
        cpu.SP++;
        cpu.SP &= 0xFFFF;
        return;
    }

    let high = ((opcode >> 4) * 2) & 0xF;
    let low = high + 1;

    let x = cpu.getReg(high);
    x = x << 8;
    let y = cpu.getReg(low);

    let result = x + y;
    result++;
    result &= 0xFFFF;

    x = result >> 8;
    y = result & 0xFF;

    cpu.setReg(opcode + 0x8, y);
    cpu.internal_delay();
    cpu.setReg(opcode, x);

}

function DEC_r16(opcode,cpu) {
    if (opcode == 0x3B) {
        cpu.internal_delay();
        cpu.SP--;
        if(cpu.SP < 0){
            cpu.SP = 0X10000 + cpu.SP;
        }
        return;
    }
    let high = ((opcode >> 4) * 2) & 0xF;
    let low = high + 1;

    let x = cpu.getReg(high);
    x = x << 8;
    let y = cpu.getReg(low);

    let result = x + y;
    result--;
    result &= 0xFFFF;

    x = result >> 8;
    y = result & 0xFF;

    cpu.setReg(opcode, y);
    cpu.internal_delay();
    cpu.setReg(opcode - 0x8, x);

}

function JP_HL(opcode,cpu) {
    let high = cpu.H;
    let low = cpu.L;
    let addr = ((high << 8) | low) & 0xFFFF;

    cpu.PC = addr & 0xFFFF;
}

function JR_CON_i8(opcode,cpu) {
    let offset = cpu.fetch();
    let signedOffset = (offset < 0x80) ? offset : offset - 0x100;
    switch (opcode) {
        case 0x18:
            break;
        case 0x20:
            if (!cpu.getZeroFlag()) break;
            return;
        case 0x28:
            if (cpu.getZeroFlag()) break;
            return;
        case 0x30:
            if (!cpu.getCarryFlag()) break;
            return;
        case 0x38:
            if (cpu.getCarryFlag()) break;
            return;

    }
    cpu.internal_delay();
    // console.log(
    // "JR",
    // opcode.toString(16),
    // "PC:", cpu.PC.toString(16),
    // "Z:", cpu.getZeroFlag(),
    // "C:", cpu.getCarryFlag(),
    // "offset:", signedOffset
    // );  
    cpu.PC += signedOffset;
    cpu.PC &= 0xFFFF;


}

function JP_u16(opcode,cpu) {
    let low = cpu.fetch();
    let high = cpu.fetch();

    let addr = ((high << 8) | low) & 0xFFFF;

    cpu.PC = addr;
}

function JP_CON_u16(opcode,cpu) {
    let low = cpu.fetch();
    let high = cpu.fetch();
    let addr = ((high << 8) | low) & 0xFFFF;
    switch (opcode) {
        case 0xC2:
            if (!cpu.getZeroFlag()) break;
            return;
        case 0xCA:
            if (cpu.getZeroFlag()) break;
            return;
        case 0xD2:
            if (!cpu.getCarryFlag()) break;
            return;
        case 0xDA:
            if (cpu.getCarryFlag()) break;
            return;

    }
    cpu.PC = addr & 0xFFFF;
}

function RET(opcode,cpu) {
    let low = read(cpu.SP++);
    let high = read(cpu.SP++);
    let addr = ((high << 8) | low) & 0xFFFF;

    // console.log(
    //     "RET:",
    //     "from =", cpu.PC.toString(16),
    //     "to =", addr.toString(16),
    //     "SP =", cpu.SP.toString(16),
    //     "A =", cpu.A.toString(16),
    //     "F =", cpu.F.toString(16)
    // );

    cpu.internal_delay();
    cpu.PC = addr & 0xFFFF;

}

function RET_CON(opcode,cpu) {
    cpu.internal_delay();
    switch (opcode) {
        case 0xC0:
            if (!cpu.getZeroFlag()) break;
            return;
        case 0xC8:
            if (cpu.getZeroFlag()) break;
            return;
        case 0xD0:
            if (!cpu.getCarryFlag()) break;
            return;
        case 0xD8:
            if (cpu.getCarryFlag()) break;
            return;

    }
    RET(opcode,cpu);
}

function RETI(opcode,cpu) {
    RET(opcode,cpu);
    cpu.IME = true;
}

function CALL(opcode,cpu) {
    let low = cpu.fetch();
    let high = cpu.fetch();
    let addr = ((high << 8) | low) & 0xFFFF;
    // console.log(
    // "CALL A =", cpu.A.toString(16),
    // "SP =", cpu.SP.toString(16),
    // "return address should be", cpu.PC.toString(16)
    // );  
    let PC_LOW = cpu.PC & 0xFF;
    let PC_HIGH = (cpu.PC >> 8) & 0xFF;

    cpu.internal_delay();

    write(--cpu.SP, PC_HIGH);
    write(--cpu.SP, PC_LOW);

    cpu.PC = addr & 0xFFFF;

}

function CALL_CON(opcode,cpu) {
    let low = cpu.fetch();
    let high = cpu.fetch();
    let addr = ((high << 8) | low) & 0xFFFF;
    let PC_LOW = cpu.PC & 0xFF;
    let PC_HIGH = (cpu.PC >> 8) & 0xFF;


    switch (opcode) {
        case 0xC4:
            if (!cpu.getZeroFlag()) break;
            return;
        case 0xCC:
            if (cpu.getZeroFlag()) break;
            return;
        case 0xD4:
            if (!cpu.getCarryFlag()) break;
            return;
        case 0xDC:
            if (cpu.getCarryFlag()) break;
            return;

    }
    cpu.internal_delay();
    write(--cpu.SP, PC_HIGH);
    write(--cpu.SP, PC_LOW);

    cpu.PC = addr & 0xFFFF;
}

function RST(opcode,cpu) {
    // console.log("RST");
    let high = (cpu.PC >> 8) & 0xFF;
    let low = (cpu.PC) & 0xFF;

    write(--cpu.SP, high);
    write(--cpu.SP, low);
    let mask = opcode & 0xF8;
    cpu.PC = mask - 0xC0;
    cpu.PC &= 0xFFFF

}

function RLCA(opcode,cpu) {
    let carry = ((cpu.A & 0x80) >> 7) & 0xFF;

    cpu.setZeroFlag(0);
    cpu.setSubtractFlag(0)
    cpu.setHalfCarryFlag(0);
    cpu.setCarryFlag(carry);
    cpu.A = cpu.A << 1;
    cpu.A |= carry;
}
function RRCA(opcode,cpu) {
    let carry = (cpu.A & 0x01);

    cpu.setZeroFlag(0);
    cpu.setSubtractFlag(0)
    cpu.setHalfCarryFlag(0);
    cpu.setCarryFlag(carry);
    cpu.A = cpu.A >> 1;
    cpu.A |= (carry << 7) & 0xFF;
}

function RLA(opcode,cpu) {
    let b7 = ((cpu.A & 0x80) >> 7) & 0xFF;
    let carry = cpu.getCarryFlag();
    cpu.setZeroFlag(0);
    cpu.setSubtractFlag(0)
    cpu.setHalfCarryFlag(0);
    cpu.setCarryFlag(b7);
    cpu.A = (cpu.A << 1) | (carry & 0x01);
}

function RRA(opcode,cpu) {
    let b0 = (cpu.A & 0x01);
    let carry = cpu.getCarryFlag();
    cpu.setZeroFlag(0);
    cpu.setSubtractFlag(0)
    cpu.setHalfCarryFlag(0);
    cpu.setCarryFlag(b0);
    cpu.A = (cpu.A >> 1) | (carry << 7);
}

function DAA(opcode,cpu) {
    let a = cpu.A;
    let adjust = 0;

    if (!cpu.getSubtractFlag()) {
        // After ADD / ADC
        if (cpu.getCarryFlag() || a > 0x99) {
            adjust |= 0x60;
            cpu.setCarryFlag(1);
        }

        if (cpu.getHalfCarryFlag() || (a & 0x0F) > 0x09) {
            adjust |= 0x06;
        }

        a += adjust;
    } else {
        // After SUB / SBC
        if (cpu.getCarryFlag()) {
            adjust |= 0x60;
        }

        if (cpu.getHalfCarryFlag()) {
            adjust |= 0x06;
        }

        a -= adjust;
    }

    cpu.A = a & 0xFF;

    cpu.setZeroFlag(cpu.A === 0);
    cpu.setHalfCarryFlag(0);
}
    
function CPL(opcode,cpu){
    cpu.A = ~cpu.A &0xFF;
    cpu.setSubtractFlag(1);
    cpu.setHalfCarryFlag(1);
}
function SCF(opcode,cpu){
    cpu.setSubtractFlag(0);
    cpu.setHalfCarryFlag(0);
    cpu.setCarryFlag(1);
}
function CCF(opcode,cpu){
    let c = cpu.getCarryFlag();
    cpu.setSubtractFlag(0);
    cpu.setHalfCarryFlag(0);
    cpu.setCarryFlag(!c);
}

function CB(opcode,cpu) {
    let cb_opcode = cpu.fetch();
    cb_opcodeTable[cb_opcode](cb_opcode,cpu);
}

function CB_RLC(opcode,cpu){
    let id = opcode & 0x07;
    let x = cpu.getReg(id);
    let b7 = ((x & 0x80) >> 7) & 0xFF;
    x= x << 1;
    x |= b7;
    cpu.setZeroFlag((x===0));
    cpu.setSubtractFlag(0)
    cpu.setHalfCarryFlag(0);
    cpu.setCarryFlag(b7);
    cpu.setReg(id * 0x08,x);

}
function CB_RRC(opcode,cpu){
    let id = opcode & 0x07;
    let x = cpu.getReg(id);
    let b0 = (x & 0x01);
    x = x >> 1;
    x |= (b0 << 7) & 0xFF;
    cpu.setZeroFlag((x===0));
    cpu.setSubtractFlag(0)
    cpu.setHalfCarryFlag(0);
    cpu.setCarryFlag(b0);
    cpu.setReg(id * 0x08,x);
}
function CB_RL(opcode,cpu){
    let id = opcode & 0x07;
    let x = cpu.getReg(id);
    let b7 = (x >> 7);
    let carry = cpu.getCarryFlag();
    x = (x<<1) | (carry);
    x &= 0xFF;
    cpu.setZeroFlag((x===0));
    cpu.setSubtractFlag(0)
    cpu.setHalfCarryFlag(0);
    cpu.setCarryFlag(b7);
    cpu.setReg(id * 0x08,x);

}
function CB_RR(opcode,cpu){
    let id = opcode & 0x07;
    let x = cpu.getReg(id);
    let b0 = x & 0x01;
    let carry = cpu.getCarryFlag();
    x = ( x >> 1)| ((carry << 7)& 0x80 );
    cpu.setZeroFlag((x===0));
    cpu.setSubtractFlag(0)
    cpu.setHalfCarryFlag(0);
    cpu.setCarryFlag(b0);
    cpu.setReg(id * 0x08,x);
}
function CB_SLA(opcode,cpu){
    let id = opcode & 0x07;
    let x = cpu.getReg(id);
    let b7 = (x >> 7);
    x = (x << 1) & 0xFF;
    cpu.setZeroFlag((x===0));
    cpu.setSubtractFlag(0)
    cpu.setHalfCarryFlag(0);
    cpu.setCarryFlag(b7);
    cpu.setReg(id * 0x08,x);

}
function CB_SRA(opcode,cpu){
    let id = opcode & 0x07;
    let x = cpu.getReg(id);
    let b7 = (x & 0x80);
    let b0 = x & 0x01;
    x = (x >> 1) | b7;
    cpu.setZeroFlag((x===0));
    cpu.setSubtractFlag(0)
    cpu.setHalfCarryFlag(0);
    cpu.setCarryFlag(b0);
    cpu.setReg(id * 0x08,x);


}
function CB_SWAP(opcode,cpu){
    let id = opcode & 0x07;
    let x = cpu.getReg(id);

    let low = x & 0x0F;
    let high = x &0xF0;
    x = (high >> 4 ) | ( low << 4);
    cpu.setZeroFlag((x===0));
    cpu.setSubtractFlag(0)
    cpu.setHalfCarryFlag(0);
    cpu.setCarryFlag(0);
    cpu.setReg(id * 0x08,x);
}
function CB_SRL(opcode,cpu){
    let id = opcode & 0x07;
    let x = cpu.getReg(id);
    let b0 = x & 0x01;
    x = x >> 1;
    cpu.setZeroFlag((x===0));
    cpu.setSubtractFlag(0)
    cpu.setHalfCarryFlag(0);
    cpu.setCarryFlag(b0);
    cpu.setReg(id * 0x08,x);
}
function CB_BIT(opcode,cpu){

    let id = opcode & 0x07;
    let x = cpu.getReg(id);
    let mask = opcode & 0xF8;
    mask = mask % 0x40;
    let bit = mask / 0x08;

    if( ((x >> bit) & 0x01) === 0 ) 
        cpu.setZeroFlag(1);
    else 
        cpu.setZeroFlag(0);

    cpu.setSubtractFlag(0)
    cpu.setHalfCarryFlag(1);


}
function CB_RES(opcode,cpu){
    let id = opcode & 0x07;
    let x = cpu.getReg(id);
    let mask = opcode & 0xF8;
    mask = mask % 0x40;
    let bit = mask / 0x08;

    x = x & (~(1 << bit));
    cpu.setReg(id * 0x08, x);
}
function CB_SET(opcode,cpu){
    let id = opcode & 0x07;
    let x = cpu.getReg(id);
    let mask = opcode & 0xF8;
    mask = mask % 0x40;
    let bit = mask / 0x08;

    x = x | ((1 << bit));
    cpu.setReg(id * 0x08, x);
}