const supabase = require('./supabase');

const setupStorage = async () => {
    try {
        console.log('📦 Checking Supabase Storage configuration...');

        // 1. Check if 'apks' bucket exists
        const { data: buckets, error: getError } = await supabase.storage.listBuckets();

        if (getError) {
            console.error('❌ Failed to list buckets:', getError.message);
            return;
        }

        const bucketExists = buckets.find(b => b.name === 'apks');

        if (!bucketExists) {
            console.log('🚀 Creating "apks" bucket...');
            const { error: createError } = await supabase.storage.createBucket('apks', {
                public: true,
                fileSizeLimit: 125829120, // 120MB
                allowedMimeTypes: ['application/vnd.android.package-archive', 'application/octet-stream']
            });

            if (createError) {
                console.error('❌ Failed to create bucket:', createError.message);
                console.log('💡 Please create a public bucket named "apks" manually in the Supabase Dashboard.');
            } else {
                console.log('✅ "apks" bucket created successfully!');
            }
        } else {
            console.log('✅ "apks" bucket already exists.');
        }
    } catch (err) {
        console.error('⚠️ Storage setup error:', err.message);
    }
};

module.exports = setupStorage;
