const fetchOpts = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: '9999999999', isSignup: false }) };
async function test() {
  for(let i=1; i<=6; i++) {
    const res = await fetch('http://localhost:5000/api/auth/request-otp', fetchOpts);
    const data = await res.json();
    console.log(`Request ${i}:`, res.status, data);
  }
}
test();
