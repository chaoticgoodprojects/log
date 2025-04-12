// Author to GIF mapping
const authorGifs = {
  "adam": "images/gifs/adam.gif",
  "jules": "images/gifs/jules.gif",
  "casey": "images/gifs/casey.gif",
  "anonymous": "images/gifs/default.gif"
};

// For the public changelog page
if (document.getElementById('changelog')) {
  fetch('/api/posts')
    .then(res => res.json())
    .then(posts => {
      const changelogContainer = document.getElementById('changelog');
      const listContainer = document.getElementById('post-list');

      posts.forEach((post, index) => {
        const postId = `post-${index}`;
        const formattedDate = new Date(post.timestamp).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "long",
          year: "numeric"
        });

        const author = post.author?.toLowerCase() || "anonymous";
        const gifSrc = authorGifs[author] || authorGifs["anonymous"];

        // Create full post wrapper
        const postEl = document.createElement('div');
        postEl.classList.add('post');
        postEl.id = postId;

        postEl.innerHTML = `
          <div class="post-header">
            ¶ ${post.title} · ${formattedDate} · ${post.author || "anonymous"}
          </div>
          <div class="post-body">
            <div class="post-content">
              <p>${post.content}</p>
            </div>
            <img class="author-gif" src="${gifSrc}" alt="${author}" />
          </div>
        `;
        changelogContainer.appendChild(postEl);

        // Add bulleted sidebar link
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${postId}`;
        link.textContent = `${post.title} (${formattedDate})`;
        li.appendChild(link);
        listContainer.appendChild(li);
      });
    });
}

// For the admin post form
const form = document.getElementById('postForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const author = document.getElementById('author')?.value || "anonymous";

    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, author })
    });

    alert('Post published!');
    form.reset();
  });
}
