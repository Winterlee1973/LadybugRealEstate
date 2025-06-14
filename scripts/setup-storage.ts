import { supabase } from '../client/src/lib/supabase';

async function setupStorage() {
  console.log('Setting up Supabase storage bucket and policies...');

  try {
    // Create the bucket if it doesn't exist
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    const userUploadsBucket = buckets.find(bucket => bucket.id === 'user-uploads');
    
    if (!userUploadsBucket) {
      console.log('Creating user-uploads bucket...');
      const { data, error } = await supabase.storage.createBucket('user-uploads', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });

      if (error) {
        console.error('Error creating bucket:', error);
        return;
      }

      console.log('Bucket created successfully:', data);
    } else {
      console.log('user-uploads bucket already exists');
    }

    // Test upload to verify bucket is accessible
    console.log('Testing bucket access...');
    const testFile = new Blob(['test'], { type: 'text/plain' });
    const testFileName = 'test-file.txt';
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-uploads')
      .upload(testFileName, testFile);

    if (uploadError) {
      console.error('Error testing upload:', uploadError);
    } else {
      console.log('Test upload successful:', uploadData);
      
      // Clean up test file
      await supabase.storage
        .from('user-uploads')
        .remove([testFileName]);
    }

    console.log('Storage setup completed successfully!');
  } catch (error) {
    console.error('Error setting up storage:', error);
  }
}

setupStorage();