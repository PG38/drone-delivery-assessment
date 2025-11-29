const BASE_URL = 'http://localhost:3000';

async function test() {
    console.log('--- Starting Tests ---');

    // 1. Register Admin
    console.log('\n1. Registering Admin...');
    let res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'password', type: 'admin' })
    });
    console.log('Status:', res.status, await res.json());

    // 2. Register Customer
    console.log('\n2. Registering Customer...');
    res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'customer', password: 'password', type: 'enduser' })
    });
    console.log('Status:', res.status, await res.json());

    // 3. Register Drone
    console.log('\n3. Registering Drone...');
    res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'drone1', password: 'password', type: 'drone' })
    });
    console.log('Status:', res.status, await res.json());

    // 4. Login as Customer
    console.log('\n4. Logging in as Customer...');
    res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'customer', password: 'password' })
    });
    const loginData = await res.json();
    console.log('Status:', res.status, loginData);
    const token = loginData.token;

    if (!token) {
        console.error('Login failed, stopping tests.');
        return;
    }

    // 5. Create Order
    console.log('\n5. Creating Order...');
    res = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ origin: 'A', destination: 'B' })
    });
    const orderData = await res.json();
    console.log('Status:', res.status, orderData);
    const orderId = orderData.orderId;

    // 6. Check Drone Status
    console.log('\n6. Checking Drone Status (should be BUSY)...');
    res = await fetch(`${BASE_URL}/drones`);
    const drones = await res.json();
    console.log('Drones:', drones);

    // 7. Complete Order
    if (orderId) {
        console.log(`\n7. Completing Order ${orderId}...`);
        res = await fetch(`${BASE_URL}/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'DELIVERED' })
        });
        console.log('Status:', res.status, await res.json());
    }

    // 8. Check Drone Status Again
    console.log('\n8. Checking Drone Status (should be IDLE)...');
    res = await fetch(`${BASE_URL}/drones`);
    console.log('Drones:', await res.json());

    console.log('\n--- Tests Completed ---');
}

test().catch(console.error);
