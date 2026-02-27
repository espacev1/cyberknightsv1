const AdmZip = require('adm-zip');
const xml2js = require('xml2js');

/**
 * Extract and parse AndroidManifest.xml from APK buffer
 * APK files are ZIP archives containing the manifest
 */
async function extractManifest(apkBuffer) {
    try {
        const zip = new AdmZip(apkBuffer);
        const entries = zip.getEntries();

        let manifestEntry = null;
        const allFiles = [];

        for (const entry of entries) {
            allFiles.push(entry.entryName);
            if (entry.entryName === 'AndroidManifest.xml') {
                manifestEntry = entry;
            }
        }

        if (!manifestEntry) {
            // Try binary XML — in real APKs, AndroidManifest.xml is compiled binary XML
            // For demo, we'll extract what we can and parse text-based content
            return {
                permissions: [],
                activities: [],
                services: [],
                receivers: [],
                packageName: 'unknown',
                allFiles,
                raw: null
            };
        }

        const manifestContent = manifestEntry.getData().toString('utf8');

        // Try to parse as XML
        try {
            const parser = new xml2js.Parser({ explicitArray: false });
            const result = await parser.parseStringPromise(manifestContent);

            const manifest = result.manifest || result;
            const permissions = [];

            // Extract uses-permission
            if (manifest['uses-permission']) {
                const perms = Array.isArray(manifest['uses-permission'])
                    ? manifest['uses-permission']
                    : [manifest['uses-permission']];

                for (const perm of perms) {
                    const name = perm?.$ ? perm.$['android:name'] : perm;
                    if (name) permissions.push(name);
                }
            }

            // Extract activities
            const activities = [];
            const app = manifest.application || {};
            if (app.activity) {
                const acts = Array.isArray(app.activity) ? app.activity : [app.activity];
                activities.push(...acts.map(a => a?.$?.['android:name'] || 'unknown'));
            }

            // Extract services
            const services = [];
            if (app.service) {
                const svcs = Array.isArray(app.service) ? app.service : [app.service];
                services.push(...svcs.map(s => s?.$?.['android:name'] || 'unknown'));
            }

            // Extract receivers
            const receivers = [];
            if (app.receiver) {
                const rcvs = Array.isArray(app.receiver) ? app.receiver : [app.receiver];
                receivers.push(...rcvs.map(r => r?.$?.['android:name'] || 'unknown'));
            }

            return {
                permissions,
                activities,
                services,
                receivers,
                packageName: manifest?.$?.package || 'unknown',
                allFiles,
                raw: manifestContent
            };
        } catch {
            // Binary XML — extract permissions via regex patterns from raw content
            const permissions = extractPermissionsFromBinary(manifestEntry.getData());
            return {
                permissions,
                activities: [],
                services: [],
                receivers: [],
                packageName: 'unknown',
                allFiles,
                raw: null // Don't send binary as string
            };
        }
    } catch (err) {
        console.error('Manifest extraction error:', err.message);
        return {
            permissions: [],
            activities: [],
            services: [],
            receivers: [],
            packageName: 'unknown',
            allFiles: [],
            raw: null,
            error: err.message
        };
    }
}

function extractPermissionsFromBinary(buffer) {
    const content = buffer.toString('ascii'); // Better for binary
    const permissions = [];
    const permPattern = /android\.permission\.[A-Z_]+/g;
    const matches = content.match(permPattern);
    if (matches) {
        permissions.push(...new Set(matches));
    }
    return permissions;
}

/**
 * Extract all text content from APK for URL and API scanning
 */
function extractTextContent(apkBuffer) {
    try {
        const zip = new AdmZip(apkBuffer);
        const entries = zip.getEntries();
        const contentChunks = [];
        const MAX_FILE_SIZE = 1024 * 1024; // 1MB per file limit

        for (const entry of entries) {
            if (entry.isDirectory) continue;

            const name = entry.entryName.toLowerCase();
            // Scan DEX files, XML files, and other text-ish content
            if (name.endsWith('.dex') || name.endsWith('.xml') ||
                name.endsWith('.txt') || name.endsWith('.json') ||
                name.endsWith('.properties') || name.endsWith('.js') ||
                name.endsWith('.html')) {

                try {
                    const data = entry.getData();
                    if (data.length > MAX_FILE_SIZE) {
                        contentChunks.push(data.slice(0, MAX_FILE_SIZE).toString('utf8'));
                    } else {
                        contentChunks.push(data.toString('utf8'));
                    }
                } catch {
                    // Skip binary content that can't be read as text
                }
            }
        }

        return contentChunks.join('\n');
    } catch (err) {
        console.error('Text extraction error:', err.message);
        return '';
    }
}

module.exports = { extractManifest, extractTextContent };
