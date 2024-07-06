document.getElementById('signupForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const name = document.getElementById('input__name').value;
  const password = document.getElementById('input__password').value;

  fetch('/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, password })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.text();
  })
  .then(data => {
    console.log('Success:', data);
    window.location.href = '/login/index.html'; 
  })
  .catch(error => {
    console.error('Error:', error);
  });
});
