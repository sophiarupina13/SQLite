function getCookie(name) {
  const cookieString = document.cookie;
  const nameString = `${name}=`;
  const parts = cookieString.split('; ').find(row => row.startsWith(nameString));
  return parts ? parts.substring(nameString.length) : null;
}

document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('.form');
  
  //const sessionId = getCookie('session_id');
  const name = decodeURIComponent(getCookie('name'));

  if (name) {
    const sectionForm = document.querySelector('.section-form');
    sectionForm.style.display = 'flex';
    sectionForm.style.flexDirection = 'column';
    sectionForm.style.alignItems = 'start';

    document.querySelectorAll('td:nth-child(5)').forEach(td => {
      td.innerHTML = '';
  
      const editButton = document.createElement('button');
      editButton.textContent = 'Редактировать';
      editButton.classList.add('edit-btn');
  
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Удалить';
      deleteButton.classList.add('delete-btn');
  
      td.appendChild(editButton);
      td.appendChild(deleteButton);
  });
  }

  form.addEventListener('submit', function(event) {
    event.preventDefault(); 

    const comment = document.getElementById('input__comment').value;

    fetch('/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, comment })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Ошибка сети');
      }
      return response.json(); 
    })
    .then(data => {
      console.log('Данные успешно отправлены:', data);
    })
    .catch(error => {
      console.error('Ошибка при отправке данных:', error);
    });
  });
});
