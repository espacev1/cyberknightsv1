try {
    const app = require('./api/index.js');
    console.log('App imported successfully');
} catch (err) {
    console.error('Import failed:', err);
}
