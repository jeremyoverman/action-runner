const SRError = require('@semantic-release/error');

module.exports = function (pluginConfig, config, callback) {
    if (config.env.CI === 'SEMAPHORE') {
        callback(null);
    } else {
        callback(new SRError('Not running on Semaphore, won\'t be published.'));
    }
}