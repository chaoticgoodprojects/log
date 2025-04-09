// For the public changelog page
if (document.getElementById('changelog')) {
  fetch('/api/posts')
    .then(res => res.json())
    .then(posts => {
      const container = document.getElementById('changelog');
      container.innerHTML = posts.map(post => `
        <div class="post">
          <h2>${post.title}</h2>
          <p>${post.content}</p>
          <small>${new Date(post.timestamp).toLocaleString()}</small>
        </div>
      `).join('');
    });
}

// For the admin post form
const form = document.getElementById('postForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    });

    alert('Post published!');
    form.reset();
  });
}
