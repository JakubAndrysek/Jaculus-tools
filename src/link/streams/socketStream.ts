import { Duplex } from "../stream.js"
import * as net from "net"


export class SocketStream implements Duplex {
    private callbacks: {
        "data"?: (data: Buffer) => void,
        "error"?: (err: any) => void,
        "end"?: () => void
    } = {}

    private socket: net.Socket

    constructor(host: string, port: number, openCallbacks: {
        "open"?: () => void,
        "error"?: (err: any) => void,
    } = {}) {
        this.socket = new net.Socket()
        this.socket.setTimeout(1000)

        this.socket.on("ready", () => {
            if (openCallbacks["open"]) {
                openCallbacks["open"]()
            }

            // change error handler to a normal one
            this.socket.on("error", (err: any) => {
                if (this.callbacks["error"]) {
                    this.callbacks["error"](err)
                }
            })
        })

        // consider all errors open errors before the socket is ready
        this.socket.on("error", (err: any) => {
            if (openCallbacks["error"]) {
                openCallbacks["error"](err)
            }
        })

        this.socket.on("data", (data: Buffer) => {
            if (this.callbacks["data"]) {
                this.callbacks["data"](data)
            }
        })

        this.socket.on("close", () => {
            if (this.callbacks["end"]) {
                this.callbacks["end"]()
            }
        })

        this.socket.connect(port, host)
    }


    public put(c: number): void {
        this.socket.write(Buffer.from([c]))
    }

    public write(buf: Buffer): void {
        let bufCopy = Buffer.from(buf)
        this.socket.write(bufCopy)
    }

    public onData(callback?: (data: Buffer) => void): void {
        this.callbacks["data"] = callback
    }

    public onEnd(callback?: () => void): void {
        this.callbacks["end"] = callback
    }

    public onError(callback?: (err: any) => void): void {
        this.callbacks["error"] = callback
    }

    public destroy(): void {
        this.socket.destroy()
    }
}
