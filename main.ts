import { spawn } from 'bun';

const cpus = navigator.hardwareConcurrency;
const buns = Array(cpus);

for (let item = 0; item < cpus; item++) {
    buns[item] = spawn({
        cmd: ['bun', 'src/server.ts'],
        lazy: true,
        stdout: "inherit",
        stderr: "inherit",
        stdin: "inherit",
    });
}

function kill() {
    for (const bun of buns) {
        bun.kill();
    }
}

process.on("SIGINT", kill);
process.on("exit", kill);
