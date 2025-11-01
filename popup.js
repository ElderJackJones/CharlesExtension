document.getElementById('fetchBtn').addEventListener('click', async () => {
  const button = document.getElementById('fetchBtn');
  const status = document.getElementById('status');
  
  // Disable button and show loading state
  button.disabled = true;
  button.textContent = 'Fetching token...';
  status.className = '';
  status.textContent = '';
  
  try {
    // Fetch the auth token using the browser's existing session
    const response = await fetch('https://referralmanager.churchofjesuschrist.org/services/auth');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    data.cookies = document.cookie
    // Copy to clipboard
    await navigator.clipboard.writeText(JSON.stringify(data));
    
    // Show success
    button.textContent = '✓ Copied to Clipboard!';
    button.className = 'success';
    status.textContent = 'Token copied! Paste it into the Charles app (Ctrl+V)';
    status.className = 'show success';
    
    // Auto-close after 2 seconds
    setTimeout(() => {
      window.close();
    }, 2000);
    
  } catch (error) {
    console.error('Error fetching token:', error);
    
    button.textContent = 'Try Again';
    button.disabled = false;
    button.className = 'error';
    
    status.textContent = `Error: ${error.message}. Make sure you're logged into churchofjesuschrist.org first.`;
    status.className = 'show error';
  }
});