function Integer(arg) {
    if (!/^\d+$/.test(arg)) return {error: `Argument is not an integer`};
    return {value: +arg};
}

function Pattern(pattern) {
    return arg => {
        const match = arg.match(pattern);
        return match ? {value: match[1]} : {error: 'Pattern does not match'};
    };
}

function oneOf(...types) {
    return arg => {
        for (const type of types) {
            const result = type(arg);
            if (!result.error) {
                return result;
            }
        }

        return {error: true}; // TODO idk
    }
}

module.exports = {
    Integer,
    Pattern,
    oneOf
};