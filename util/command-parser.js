function parseCommand(text, prefixLength) {
    const [prefixedCommand, args] = splitIntoParts(text);

    const command = prefixedCommand.slice(prefixLength);
    const namedArgs = {};
    const positionalArgs = [];
    let lastArgWasTag = false;
    let lastTag;

    for (const arg of args) {
        if (lastArgWasTag) {
            if (arg.startsWith('-')) {
                if (lastArgWasTag) {
                    
                }
            }
        }
    }
}

function splitIntoParts(text) {
    const parts = [];
    let quoting = false;
    let buffer = '';

    for (const c of [...text]) {
        if (c === '"') {
            quoting = !quoting;
            buffer = tryPushBuffer(buffer, parts);
        } else if (c === ' ') {
            if (quoting) {
                buffer += c;
            } else {
                buffer = tryPushBuffer(buffer, parts);
            }
        } else buffer += c;
    }

    tryPushBuffer(buffer, parts);
}

function tryPushBuffer(buffer, parts) {
    if (buffer.length !== 0) parts.push(buffer);
    return '';
}