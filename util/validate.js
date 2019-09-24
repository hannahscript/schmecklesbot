function validate(...valuePatternPairs) {
    for (const {value, pattern} of valuePatternPairs) {
        if (!pattern.test(value)) return false;
    }

    return true;
}

module.exports = {
    validate
};