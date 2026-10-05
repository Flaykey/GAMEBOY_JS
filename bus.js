import { cpu } from "./cpu.js";
import { ppu } from "./ppu.js";
import { loop } from "./app.js";
export const memory = new Uint8Array(0x10000);
let serialOutput = "";

export function write(address, data) {
    data &= 0xFF;
    cpu.timer();
    if(address < 0){
        address = 0x10000 + address;
    }
    if(address === 0xFF04) data = 0;
    if (address === 0xFF01) {
        serialOutput += String.fromCharCode(data);
        // console.log(serialOutput);
    }

    memory[address] = data;

    // ppu.step(4);
}

export function reset(){
    memory.fill(0);
}

export function getSerialOutput() {
    return serialOutput;
}
export function read(address){

    ppu.step(4);
    cpu.timer();
    if(address ===  0xFF44) return 0x90;
    if(address >= 0x0000 && address <= 0xFFFF)
        return memory[address];

    if(address >= 0xC000)
    cpu.stopped = true;
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
        let opsOutput = "";
        
        // for(let i = 49100; i<=49500; i++)opsOutput += memory[i].toString(16) + " ";;
        // console.log(opsOutput)
        loop();

    }

    reader.onerror = function(){
        console.log("Error reading file");
    }

    reader.readAsArrayBuffer(file)
})