function parseCommand(text, prefixLength) {
    const state = {
        tags: {},
        parts: [],
        quoting: false,
        buffer: '',
        currentTag: undefined
    };

    for (const c of [...text]) {
        if (c === '"') {
            state.quoting = !state.quoting;
            tryPushBuffer(state);
        } else if (c === ' ' && !state.quoting) {
            tryPushBuffer(state);
        } else if (c === ':' && !state.quoting) {
            if (state.buffer.length === 0) continue;

            state.currentTag = state.buffer;
            state.buffer = '';
        } else state.buffer += c;
    }

    tryPushBuffer(state);

    return {
        name: state.parts[0].substring(prefixLength),
        positionalArguments: state.parts.slice(1),
        namedArguments: state.tags
    };
}

function tryPushBuffer(state) {
    if (state.buffer.length === 0) return;
    
    if (state.currentTag !== undefined) {
        state.tags[state.currentTag] = state.buffer;
        state.currentTag = undefined;
    } else {
        state.parts.push(state.buffer);
    }

    state.buffer = '';
}

module.exports = {
    parseCommand
};