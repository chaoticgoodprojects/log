// ✅ admin.js with Quill rich text support

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("postForm");
  const titleInput = document.getElementById("title");
  const authorInput = document.getElementById("author");
  const statusInput = document.getElementById("status");
  const manageSection = document.getElementById("manage-posts");
  const manageList = document.getElementById("post-list");
  const toggleBtn = document.getElementById("toggle-manage");

const quill = new Quill("#editor", {
  theme: "snow",
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'header': 1 }, { 'header': 2 }],
      ['link', 'code-block'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ]
  }
});


  let editingIndex = null;
  let originalTimestamp = null;
  let originalStatus = null;

  if (!form || !titleInput || !authorInput || !statusInput || !manageSection || !manageList || !toggleBtn) {
    console.warn("Some admin elements are missing.");
    return;
  }

  function loadPostList() {
    console.log("loadPostList() called");
    fetch("/api/posts")
      .then(res => res.json())
      .then(posts => {
        console.log("Post order debug:");

        manageList.innerHTML = "";

        posts.forEach((post, index) => post.id = index); // assign IDs BEFORE sort

        posts
          .sort((a, b) => b.timestamp - a.timestamp)
          .forEach(post => {
            console.log(`${post.title} — ${post.status} — ${new Date(post.timestamp).toLocaleString()}`);

            const date = new Date(post.timestamp).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "long",
              year: "numeric"
            });

            const item = document.createElement("li");
            item.innerHTML = `
              <strong>${post.title}</strong> · ${post.author || "anonymous"} · ${date}
              ${post.status === "draft" ? "<span class='draft-label'>(draft)</span>" : ""}
              <button data-edit="${post.id}">edit</button>
              <button data-delete="${post.id}">delete</button>
            `;

            manageList.appendChild(item);
          });
      });
  }

  toggleBtn.addEventListener("click", () => {
    const isOpen = manageSection.style.display === "block";
    manageSection.style.display = isOpen ? "none" : "block";
    toggleBtn.textContent = isOpen ? "manage posts" : "hide";
  });

  manageList.addEventListener("click", (e) => {
    const editId = e.target.getAttribute("data-edit");
    const deleteId = e.target.getAttribute("data-delete");

    if (editId !== null) {
      fetch("/api/posts")
        .then(res => res.json())
        .then(posts => {
          const post = posts[parseInt(editId)];
          if (!post) return;
          editingIndex = parseInt(editId);
          originalTimestamp = post.timestamp;
          originalStatus = post.status;
          titleInput.value = post.title;
          quill.root.innerHTML = post.content;
          authorInput.value = post.author;
          statusInput.value = post.status || "published";
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    if (deleteId !== null) {
      if (confirm("Delete this post?")) {
        fetch(`/api/posts/${deleteId}`, { method: "DELETE" })
          .then(() => {
            loadPostList();
          });
      }
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const title = titleInput.value;
      const content = quill.root.innerHTML;
      const author = authorInput.value || "anonymous";
      const status = statusInput.value || "published";

      const payload = { title, content, author, status };

      if (editingIndex !== null) {
        if (originalStatus === "draft" && status === "published") {
          payload.timestamp = Date.now();
        } else {
          payload.timestamp = originalTimestamp;
        }

        await fetch(`/api/posts/${editingIndex}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        editingIndex = null;
        originalTimestamp = null;
        originalStatus = null;
      } else {
        payload.timestamp = Date.now();
        await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      form.reset();
      quill.setText("");
      alert("Post saved!");
      loadPostList();
    } catch (err) {
      console.error("Error saving post:", err);
    }
  });

  manageSection.style.display = "none";
  loadPostList();
});
