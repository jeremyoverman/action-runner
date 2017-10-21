import { messages, IMessage } from './lib/messages';
import { getConfig } from './config';

interface IDataObject {
    [key: string]: string;
}

/**
 * Convert an object to a 2D array
 * 
 * @param data an IDataObject object
 */
function objectToArray (data: IDataObject): string[][] {
    let array = [];

    for (let key in data) {
        array.push([key, data[key]]);
    }

    return array;
}

/**
 * Create a cleanly formatted table with a structure such as:
 * 
 * [
 *     ['cell 1', 'cell 2', 'cell 3'],
 *     ['cell 4', 'cell 5', 'cell 6']
 * ]
 * 
 * @param data An array of rows and columns of table cells
 */
export function tabular (data: string[][] | IDataObject): string {
    let space = 4;
    let table = '';
    let widths: number[] = [];

    data = !Array.isArray(data) ? objectToArray(data) : data;

    data.forEach((row, row_idx) => {
        row.forEach((col, col_idx) => {
            let column_width = col.length;

            if (widths[col_idx] < column_width || !widths[col_idx]) {
                widths[col_idx] = column_width;
            }
        });
    });

    data.forEach((row, row_idx) => {
        row.forEach((col, col_idx) => {
            let column_width = widths[col_idx];
            let spaces = column_width + space - col.length;

            table += col + ' '.repeat(spaces);
        });

        table += '\n';
    });

    return table.trim();
}

/**
 * Takes a string defined in a literal with tabbed formatting
 * and trims it without the tabbed formatting. Allows you to
 * create clean multi-line literals within source code.
 * 
 * @param literal the string to be trimmed
 */
export function trimLiteralSpaces (literal: string) {
    let final = '';
    let split = literal.split('\n');
    let smallest_indent: number = 1000;

    split = split.filter((line, idx) => {
        let next_line = split[idx + 1];

        return (line + next_line).trim() !== '';
    });

    if (split[0] === '') split.shift();

    while (split[split.length - 1]) {
        if (!split[split.length - 1].trim().length) split.pop();
        else break;
    }

    split.forEach((line, idx) => {
        line = line.replace(/\s*$/, '');
        let match = line.match(/^(\s*)/);

        if (match) {
            let len = match[1].length;

            if (len > 0 && len < smallest_indent) {
                smallest_indent = len;
            }
        }
    });

    split.forEach(line => {
        if (line.substr(0, smallest_indent).trim() === '') {
            final += line.substring(smallest_indent);
        } else {
            final += line;
        }

        final += '\n';
    });

    return final;
}

/**
 * Log a message with a header
 * 
 * @param header the header of the log
 * @param text the log message
 */
export function info (header: string | IMessage | null, text: string | IMessage, ...args: string[]): void {
    let log: string = '\n';

    if (typeof text === 'string') text = trimLiteralSpaces(text);
    else text = getMessage(text, ...args);

    if (header) {
        if (typeof header !== 'string') header = getMessage(header);

        log += `${header}\n${'='.repeat(header.length)}\n\n`;
    }

    log += text;

    console.log(log);
}

/**
 * Get a message from messges and fill it
 * 
 * @param message The string to be filled
 * @param args The arguments to be placed
 */
export function getMessage (message: IMessage, ...args: string[]) {
    let config = getConfig();
    let locale = config.locale;

    let text = message.text[locale] || message.text['en-us'];

    args.forEach((arg, idx) => {
        let regex = new RegExp(`\\{${idx}\\}`, 'g');
        text = text.replace(regex, arg);
    });

    return text;
}

export function getLogText (message: IMessage, ...args: string[]) {
    let text = getMessage(message, ...args);
    let id = message.id.toString();

    let code = 'AR' + '0'.repeat(4 - id.length) + id;

    text = `${code}: ${text}`;

    return text;
}

/**
 * Log an error with a header
 * 
 * @param header the header of the log
 * @param message the log message
 */
export function log (message: IMessage, ...args: string[]): void {
    let text = getLogText(message, ...args);

    console.log(text);
}

export function error (message: IMessage, ...args: string[]): void {
    let text = getLogText(message, ...args);

    console.error(text);
}

export { messages, IMessage } from './lib/messages';