document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const name = document.getElementById('input__name').value;
  const password = document.getElementById('input__password').value;

  fetch('/login', {
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
    return response.json();
  })
  .then(data => {
    console.log('Success:', data);
    const greeting = document.getElementById('greeting');
    greeting.textContent = `Здравствуйте, ${data.name}!`;
    greeting.style.display = 'block'; 
    setTimeout(() => {
      window.location.href = '/homepage';
    }, 3000); 
  })
  .catch(error => {
    console.error('Error:', error);
  });
});

