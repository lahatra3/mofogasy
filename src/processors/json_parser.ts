import { Transform, type TransformCallback } from 'stream';

export class JsonParser extends Transform {
    private _leftover: string = '';
    private _headers: Array<string> = [];
    private _separator: string;

    constructor(csv_sep: string = ","){
        super({
            readableObjectMode: true
        });
        this._separator = csv_sep;
    }

    override _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void {
       try {
            const data = this._leftover + (typeof chunk === 'string' ? chunk : chunk.toString('utf8'));

            console.info("[Mofogasy]: 🏗️  parse csv to json...");

            let lines: Array<string> = data.split(/\r?\n/);
            this._leftover = lines.pop() ?? '';

            if (this._headers.length === 0) {
                this._headers = lines[0]!.split(this._separator).map(header => header.trim());
                console.info(`[Mofogasy]: headers={${this._headers}}`);
                lines = lines.slice(1);               
            }

            for(const line of lines) {
                if (!line) continue;

                const trimmed = line.trim();
                if (!trimmed) continue;

                const values = line.split(this._separator);
                if (values.length < this._headers.length) continue;

                const obj = this._headers.reduce((record, header, index) => {
                    record[header] = values[index]?.trim();
                    return record;
                }, {} as Record<string, unknown>);
                
                this.push(obj);
            }

            callback();
       } catch (error: unknown) {
            callback(error as Error);
       }
    }

    override _flush(callback: TransformCallback): void {
        try {
            if (this._leftover) {
                const trimmed = this._leftover.trim();

                if (!trimmed) {
                    return callback();
                }

                const values = trimmed.split(this._separator);
                if (values.length < this._headers.length) {
                    return callback();
                }

                const obj = this._headers.reduce((record, header, index) => {
                    record[header] = values[index]?.trim();
                    return record;
                }, {} as Record<string, unknown>);

                this.push(obj);
            }
            callback();
        } catch (error: unknown) {
            callback(error as Error);
        }
    }
}
