async function getReferralCookies() {
  const domains = [
    "https://referralmanager.churchofjesuschrist.org",
    "https://id.churchofjesuschrist.org",
    "https://op.churchofjesuschrist.org",
    "https://churchofjesuschrist.org"
  ];

  let allCookies = [];
  for (const domain of domains) {
    const cookies = await chrome.cookies.getAll({ url: domain });
    allCookies.push(...cookies);
  }

  return allCookies.map(c => `${c.name}=${c.value}`).join("; ");
}

// Check if a local port is open using /health
async function checkPort(port) {
  try {
    const res = await fetch(`http://localhost:${port}/health`);
    if (!res.ok) throw new Error(`Port ${port} health check failed`);
    const data = await res.json();
    if (data.status === 'ok') return true;
  } catch {}
  return false;
}

// Find first open port
async function findOpenPort() {
  for (let port = 53102; port <= 53105; port++) {
    if (await checkPort(port)) return port;
  }
  throw new Error("No open port found in range 53102–53105");
}

document.getElementById('fetchBtn').addEventListener('click', async () => {
  const button = document.getElementById('fetchBtn');
  const status = document.getElementById('status');
  
  button.disabled = true;
  button.textContent = 'Fetching token...';
  status.textContent = '';
  status.className = '';

  try {
    // Fetch remote data
    const response = await fetch('https://referralmanager.churchofjesuschrist.org/services/auth', {
      credentials: 'include'
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const data = await response.json();

    // Append cookies
    data.cookies = await getReferralCookies();

    // Find open local port
    const openPort = await findOpenPort();

    // Send data to local /auth endpoint
    const localResponse = await fetch(`http://localhost:${openPort}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!localResponse.ok) throw new Error(`Failed to POST to local /auth on port ${openPort}`);

    button.textContent = '✓ Sent!';
    button.className = 'success';
    status.textContent = `Data sent to Charles app successfully!`;
    status.className = 'show success';

  } catch (error) {
    console.error(error);
    button.textContent = 'Try Again';
    button.disabled = false;
    button.className = 'error';
    status.textContent = `Error: ${error.message}`;
    status.className = 'show error';
  }
});
