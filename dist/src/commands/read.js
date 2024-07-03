import { Arg, Command } from "./lib/command.js";
import { stdout, stderr } from "process";
import { getDevice } from "./util.js";
const cmd = new Command("Read a file from device", {
    action: async (options, args, env) => {
        const port = options["port"];
        const baudrate = options["baudrate"];
        const socket = options["socket"];
        const path = args["path"];
        const device = await getDevice(port, baudrate, socket, env);
        await device.controller.lock().catch((err) => {
            stderr.write("Error locking device: " + err + "\n");
            throw 1;
        });
        const data = await device.uploader.readFile(path).catch((err) => {
            stderr.write("Error: " + err + "\n");
            throw 1;
        });
        await device.controller.unlock().catch((err) => {
            stderr.write("Error unlocking device: " + err + "\n");
            throw 1;
        });
        stdout.write(data);
    },
    args: [
        new Arg("path", "File to read", { required: true }),
    ],
    chainable: true
});
export default cmd;
//# sourceMappingURL=read.js.map