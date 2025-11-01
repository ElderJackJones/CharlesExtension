// Works in background script, service worker, or extension popup (with permissions)
async function getReferralCookies() {
  return new Promise((resolve, reject) => {
    chrome.cookies.getAll({ domain: "referralmanager.churchofjesuschrist.org" }, (cookies) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
      resolve(cookieHeader);
    });
  });
}

document.getElementById('fetchBtn').addEventListener('click', async () => {
  const button = document.getElementById('fetchBtn');
  const status = document.getElementById('status');
  
  button.disabled = true;
  button.textContent = 'Fetching token...';
  status.textContent = '';

  try {
    const response = await fetch('https://referralmanager.churchofjesuschrist.org/services/auth', {
      credentials: 'include'
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const data = await response.json();

    const cookieHeader = await getReferralCookies();
    data.cookies = cookieHeader;
    data.fetchedAt = new Date().toISOString();

    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));

    button.textContent = '✓ Copied!';
    button.className = 'success';
    status.textContent = 'Copied full token + cookies to clipboard!';
    status.className = 'show success';

    setTimeout(() => window.close(), 2000);

  } catch (error) {
    console.error(error);
    button.textContent = 'Try Again';
    button.disabled = false;
    button.className = 'error';
    status.textContent = `Error: ${error.message}`;
  }
});
