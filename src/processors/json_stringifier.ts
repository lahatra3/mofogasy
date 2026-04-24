import type { TransformCallback } from 'node:stream';
import { Transform } from 'stream';

export class JsonStringifier extends Transform {
    constructor() {
        super({
            writableObjectMode: true
        });
    }

    override _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void {  
        try {
            this.push(JSON.stringify(chunk) + "\n");
            callback();
        } catch (error) {
            callback(error as Error);
        }
    }
}
