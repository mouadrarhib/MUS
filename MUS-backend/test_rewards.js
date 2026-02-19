const BASE_URL = 'http://localhost:5001/api';

// Helper to register/login
async function getAuthToken(email, password, name) {
  // Try login first
  let res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (res.ok) {
    const data = await res.json();
    console.log('Login response:', JSON.stringify(data, null, 2)); // Debug log
    return { token: data.data.token, user: data.data.user };
  }

  // If login fails, try register
  res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: name, email, password })
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Auth failed: ${error}`);
  }

  const data = await res.json();
  return { token: data.data.token, user: data.data.user };
}

// Helper to get user details (to check points)
async function getUserPoints(token, userId) {
  // We don't have a direct "get points" API, but we can check the profile or user details
  // Assuming GET /auth/me returns the current user details including points
  // OR we might need to check the DB directly if the API doesn't expose points yet.
  // But wait, GET /auth/me usually returns the user object. Let's try that.
  
  // Actually, to check SOMEONE ELSE'S points (the creator), we might need to login as them.
  // So we will login as the creator to check their points.
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!res.ok) throw new Error('Failed to get user details');
  const data = await res.json();
  return data.data.points; // Ensure the API returns 'points'
}

async function runTest() {
  try {
    console.log('--- Starting Rewards System Test ---');

    // 1. Setup Users
    const creatorEmail = `creator_${Date.now()}@test.com`;
    const downloaderEmail = `downloader_${Date.now()}@test.com`;
    const password = 'Password123!';

    console.log('1. Authenticating Users...');
    const creator = await getAuthToken(creatorEmail, password, 'Test Creator');
    const downloader = await getAuthToken(downloaderEmail, password, 'Test Downloader');
    console.log('   Users authenticated.');

    // 2. Create Resource (as Creator)
    console.log('2. Creating Resource...');
    const resourceRes = await fetch(`${BASE_URL}/resources`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${creator.token}`
      },
      body: JSON.stringify({
        title: 'Test Resource for Points',
        description: 'A resource to test the gamification system',
        resource_type_id: 1, // Assuming ID 1 exists
        status: 'published', // Publish immediately to be visible
        url: 'http://example.com/file.pdf'
      })
    });

    if (!resourceRes.ok) {
      console.log(await resourceRes.text());
      throw new Error('Failed to create resource');
    }

    const resourceData = await resourceRes.json();
    const resourceId = resourceData.data.id;
    console.log(`   Resource created (ID: ${resourceId})`);

    // 3. Check Initial Points
    let points = await getUserPoints(creator.token, creator.user.id);
    console.log(`3. Initial Creator Points: ${points} (Expected: 0)`);

    // 4. Download Resource (as Downloader)
    console.log('4. Downloading Resource...');
    const downloadRes = await fetch(`${BASE_URL}/resources/${resourceId}/download`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${downloader.token}` }
    });

    if (!downloadRes.ok) throw new Error('Download failed');
    const downloadData = await downloadRes.json();
    console.log(`   Download response: ${downloadData.message}`);

    // Check Points (+10 expected)
    points = await getUserPoints(creator.token, creator.user.id);
    console.log(`   Creator Points after Download: ${points} (Expected: 10)`);
    if (points !== 10) console.error('   ❌ FAIL: Points mismatch!');

    // 5. Favorite Resource (as Downloader)
    console.log('5. Favoriting Resource...');
    const favRes = await fetch(`${BASE_URL}/favorites/toggle`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${downloader.token}`
      },
      body: JSON.stringify({ resource_id: resourceId })
    });

    if (!favRes.ok) {
       // Maybe endpoint is different? trying POST /favorites
       const favRes2 = await fetch(`${BASE_URL}/favorites`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${downloader.token}`
          },
          body: JSON.stringify({ resource_id: resourceId })
       });
       if(!favRes2.ok) throw new Error('Favorite failed');
    }
    
    // Check Points (+2 expected -> Total 12)
    points = await getUserPoints(creator.token, creator.user.id);
    console.log(`   Creator Points after Favorite: ${points} (Expected: 12)`);
    if (points !== 12) console.error('   ❌ FAIL: Points mismatch!');

    // 6. Unfavorite Resource (as Downloader) - Assuming toggle removes it
    console.log('6. Unfavoriting Resource...');
     const unfavRes = await fetch(`${BASE_URL}/favorites/toggle`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${downloader.token}`
      },
      body: JSON.stringify({ resource_id: resourceId })
    });
    
    // If toggle didn't work (maybe it's a separate DELETE endpoint), try DELETE
    if (!unfavRes.ok) {
        const delFav = await fetch(`${BASE_URL}/favorites/${resourceId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${downloader.token}` }
        });
        if(!delFav.ok) throw new Error('Unfavorite failed');
    }

    // Check Points (-2 expected -> Total 10)
    points = await getUserPoints(creator.token, creator.user.id);
    console.log(`   Creator Points after Unfavorite: ${points} (Expected: 10)`);
    if (points !== 10) console.error('   ❌ FAIL: Points mismatch!');

    console.log('--- Test Completed ---');

  } catch (err) {
    console.error('TEST FAILED:', err);
  }
}

runTest();
