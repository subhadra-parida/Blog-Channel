
document.addEventListener("DOMContentLoaded", function() {
    const postForm = document.getElementById('post-form');
    const postList = document.getElementById('post-list');
    const searchInput = document.getElementById('search');

    // Function to create a new post
    function createPost(title, content, category) {
        const post = {
            id: Date.now(),
            title,
            content,
            category,
            likes: 0,
            comments: [],
            edited: false
        };

        const posts = getPostsFromStorage();
        posts.push(post);
        savePostsToStorage(posts);
        displayPosts(posts);
    }

    // Function to save posts to local storage
    function savePostsToStorage(posts) {
        localStorage.setItem('posts', JSON.stringify(posts));
    }

    // Function to get posts from local storage
    function getPostsFromStorage() {
        return JSON.parse(localStorage.getItem('posts')) || [];
    }

    // Function to display posts
    function displayPosts(posts) {
        postList.innerHTML = '';
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <p class="category">${post.category}</p>
                <p class="content" contenteditable="false">${post.content}</p>
                <div class="post-actions">
                    <button class="edit-content">Edit-Blog</button>
                    <button class="delete-post">Delete-Blog</button>
                    <p class="likes">
                        <button class="like-button ${post.likes > 0 ? 'liked' : ''}">
                            <i class="fa fa-thumbs-up" style="font-size:28px"></i> ${post.likes} Likes
                        </button>
                    </p>
                    <button class="show-comment-box">
                        <i class='far fa-comment-dots' style='font-size:25px;color:black'></i>
                        <span class="comment-count">${post.comments.length}</span>
                    </button>
                </div>
                <div class="comment-section" style="display: none;">
                    <input type="text" class="comment-input" placeholder="Add a comment...">
                    <button class="add-comment">Comment</button>
                </div>
                <div class="comments" style="display: none;">
                    ${post.comments.map((comment, index) => `
                        <div class="comment">
                            <p class="comment-text" contenteditable="false">${comment}</p>
                            <button class="edit-comment" data-post-id="${post.id}" data-comment-index="${index}">Edit</button>
                            <button class="delete-comment" data-post-id="${post.id}" data-comment-index="${index}">Delete</button>
                        </div>
                    `).join('')}
                </div>
                ${post.edited ? '<p class="edited">Content was edited</p>' : ''}
            `;

            // Like button functionality
            postElement.querySelector('.like-button').addEventListener('click', function() {
                post.likes = post.likes === 0 ? 1 : 0;
                savePostsToStorage(posts);
                displayPosts(posts);
            });

            // Toggle comments visibility
            const commentButton = postElement.querySelector('.show-comment-box');
            const commentsContainer = postElement.querySelector('.comments');
            const commentSection = postElement.querySelector('.comment-section');
            commentButton.addEventListener('click', function() {
                const isVisible = commentsContainer.style.display === 'block';
                commentsContainer.style.display = isVisible ? 'none' : 'block';
                commentSection.style.display = isVisible ? 'none' : 'block';
            });

            // Add comment functionality
            postElement.querySelector('.add-comment').addEventListener('click', function() {
                const commentInput = postElement.querySelector('.comment-input');
                const comment = commentInput.value.trim();
                if (comment) {
                    post.comments.push(comment);
                    savePostsToStorage(posts);
                    displayPosts(posts);
                }
            });

            // Edit content functionality
            const editButton = postElement.querySelector('.edit-content');
            const contentElement = postElement.querySelector('.content');
            editButton.addEventListener('click', function() {
                if (contentElement.isContentEditable) {
                    contentElement.contentEditable = "false";
                    editButton.textContent = "Edit";
                    post.content = contentElement.textContent.trim();
                    post.edited = true;
                    savePostsToStorage(posts);
                    displayPosts(posts);
                } else {
                    contentElement.contentEditable = "true";
                    contentElement.focus();
                    editButton.textContent = "Save";
                }
            });

            // Delete post functionality
            const deleteButton = postElement.querySelector('.delete-post');
            deleteButton.addEventListener('click', function() {
                const confirmed = confirm("Are you sure you want to delete this post?");
                if (confirmed) {
                    const updatedPosts = posts.filter(p => p.id !== post.id);
                    savePostsToStorage(updatedPosts);
                    displayPosts(updatedPosts);
                }
            });

            // Edit comment functionality
            postElement.querySelectorAll('.edit-comment').forEach(button => {
                button.addEventListener('click', function() {
                    const commentIndex = button.getAttribute('data-comment-index');
                    const commentText = postElement.querySelector(`.comments .comment:nth-child(${parseInt(commentIndex) + 1}) .comment-text`);
                    if (commentText.isContentEditable) {
                        commentText.contentEditable = "false";
                        button.textContent = "Edit";
                        post.comments[commentIndex] = commentText.textContent.trim();
                        savePostsToStorage(posts);
                        displayPosts(posts);
                    } else {
                        commentText.contentEditable = "true";
                        commentText.focus();
                        button.textContent = "Save";
                    }
                });
            });

            // Delete comment functionality
            postElement.querySelectorAll('.delete-comment').forEach(button => {
                button.addEventListener('click', function() {
                    const commentIndex = button.getAttribute('data-comment-index');
                    post.comments.splice(commentIndex, 1);
                    savePostsToStorage(posts);
                    displayPosts(posts);
                });
            });

            postList.appendChild(postElement);
        });
    }

    // Form submission event
    postForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const category = document.getElementById('category').value;
        createPost(title, content, category);
        postForm.reset();
    });

    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchQuery = searchInput.value.toLowerCase();
        const posts = getPostsFromStorage();
        const filteredPosts = posts.filter(post =>
            post.title.toLowerCase().includes(searchQuery)
        );
        displayPosts(filteredPosts.length > 0 ? filteredPosts : []);
    });

    // Initial display of posts
    displayPosts(getPostsFromStorage());
});