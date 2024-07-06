document.getElementById('logoutButton').addEventListener('click', function() {
  fetch('/website/logout/index.html', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({}) 
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.text();
  })
  .then(data => {
    console.log('Success:', data);
    window.location.href = '/homepage';
  })
  .catch(error => {
    console.error('Error:', error);
  });
});