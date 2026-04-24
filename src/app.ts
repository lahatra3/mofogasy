import { PassThrough, Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { FileReader } from './readers/file_reader';
import { JsonParser } from './processors/json_parser';
import { JsonStringifier } from './processors/json_stringifier';
import { BASE_URL, PASSWORD, USERNAME } from './config/environment';

export async function app(path: string): Promise<PassThrough> {
    const fileReader = new FileReader(USERNAME, PASSWORD, BASE_URL);
    const reader = await fileReader.get(path);

    const output = new PassThrough();
    
    const jsonParser = new JsonParser();
    const jsonStringifier = new JsonStringifier();

    (async () => {
        try {
            await pipeline(
                reader as Readable,
                jsonParser,
                jsonStringifier,
                output
            );
        } catch (error) {
            output.destroy(error as Error);
        }
    })();
    
    return output;
}