// ✅ main.js — for the public changelog site

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("changelog")) return;

  const authorGifs = {
    "adam": "images/gifs/adam.gif",
    "will": "images/gifs/will.gif",
    "tim": "images/gifs/tim.gif",
    };

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  }

  fetch("/api/posts")
    .then((res) => res.json())
    .then((posts) => {
      const changelogContainer = document.getElementById("changelog");
      const listContainer = document.getElementById("post-list");

const publishedPosts = posts
  .filter((post) => post.status !== "draft")
  .sort((a, b) => b.timestamp - a.timestamp); // ✅ sort newest first

      if (publishedPosts.length === 0) {
        changelogContainer.innerHTML = "<p>No updates yet.</p>";
        return;
      }

      publishedPosts.forEach((post, index) => {
        const postId = `post-${index}`;
        const formattedDate = formatDate(post.timestamp);

        const author = post.author?.toLowerCase() || "anonymous";
        const gifSrc = authorGifs[author] || authorGifs["anonymous"];

        // Create post
        const postEl = document.createElement("div");
        postEl.classList.add("post");
        postEl.id = postId;
        postEl.innerHTML = `
          <div class="post-header">
            ¶ ${post.title} · ${formattedDate} · ${post.author || "anonymous"}
          </div>
          <div class="post-body">
            <div class="post-content">
              <div class="post-content">${post.content}</div>
            </div>
            <img class="author-gif" src="${gifSrc}" alt="${author}" />
          </div>
        `;

changelogContainer.appendChild(postEl);        // Add to sidebar
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#${postId}`;
        link.textContent = `${post.title} (${formattedDate})`;

        // Optional: smooth scroll
        link.addEventListener("click", (e) => {
          e.preventDefault();
          document.querySelector(link.getAttribute("href"))?.scrollIntoView({ behavior: "smooth" });
        });

        li.appendChild(link);
        listContainer.appendChild(li);
      });
    });
});
