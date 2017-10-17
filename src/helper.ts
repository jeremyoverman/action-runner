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
 * Create a log message. To be used internally.
 * 
 * @param header The header of the log
 * @param message The log message
 */
function create (header: string | null, message: string): string {
    let log: string = '\n';

    message = trimLiteralSpaces(message);

    if (header) log += `${header}\n${'='.repeat(header.length)}\n\n`;

    log += message;

    return log;
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
    if (!split[split.length - 1].trim().length) split.pop();
    if (!split[split.length - 1].trim().length) split.pop();

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
 * @param message the log message
 */
export function info (header: string | null, message: string): void {
    let log = create(header, message);
    console.log(log);
}

/**
 * Log an error with a header
 * 
 * @param header the header of the log
 * @param message the log message
 */
export function error (header: string | null, message: string): void {
    let log = create(header, message);
    console.error(log);
}

/**
 * Log a warning with a header
 * 
 * @param header the header of the log
 * @param message the log message
 */
export function warn (header: string | null, message: string): void {
    let log = create(header, message);
    console.warn(log);
}
