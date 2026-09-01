const API_URL = "/books";
const USERS_URL = "/users";
const AUTH_URL = "/auth";

const booksContainer = document.getElementById("booksContainer");
const usersContainer = document.getElementById("usersContainer");
const bookModal = document.getElementById("bookModal");
const userModal = document.getElementById("userModal");
const loginModal = document.getElementById("loginModal");
const bookForm = document.getElementById("bookForm");
const userForm = document.getElementById("userForm");
const loginForm = document.getElementById("loginForm");
const titleInput = document.getElementById("title");
const priceInput = document.getElementById("price");
const authorInput = document.getElementById("author");
const bookIdInput = document.getElementById("bookId");
const modalTitle = document.getElementById("modalTitle");
const userIdInput = document.getElementById("userId");
const userModalTitle = document.getElementById("userModalTitle");
const addBookBtn = document.getElementById("addBookBtn");
const addUserBtn = document.getElementById("addUserBtn");
const loginNav = document.getElementById("loginNav");
const registerNav = document.getElementById("registerNav");
const logoutNav = document.getElementById("logoutNav");
const userInfo = document.getElementById("userInfo");

function getToken() {
    return localStorage.getItem("token");
}

function isLoggedIn() {
    return !!getToken();
}

function getCurrentUser() {
    const token = getToken();

    if (!token) return null;

    try {
        const payload = JSON.parse(
            atob(
                token
                    .split(".")[1]
                    .replace(/-/g, "+")
                    .replace(/_/g, "/")
            )
        );

        return payload;
    } catch (error) {
        console.error("Invalid token");
        return null;
    }
}

function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === "admin";
}

function updateAuthUI() {
    const user = getCurrentUser();

    if (user) {
        loginNav.style.display = "none";
        registerNav.style.display = "none";
        logoutNav.style.display = "inline";
        userInfo.style.display = "inline";
        userInfo.textContent = `${user.role === "admin" ? "👑" : "👤"} ${user.role}`;
    } else {
        loginNav.style.display = "inline";
        registerNav.style.display = "inline";
        logoutNav.style.display = "none";
        userInfo.style.display = "none";
        userInfo.textContent = "";
    }

    if (addBookBtn) {
        addBookBtn.style.display = isLoggedIn() ? "block" : "none";
    }
}

function getAuthHeaders() {
    const token = getToken();
    const headers = { "Content-Type": "application/json" };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

async function getBooks() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch books");
        }

        const books = await response.json();
        displayBooks(books);
    } catch (error) {
        booksContainer.innerHTML = `
            <div class="loading">Failed to load books.</div>
        `;
        console.error(error);
    }
}

function displayBooks(books) {
    const safeBooks = Array.isArray(books) ? books : [];

    if (safeBooks.length === 0) {
        booksContainer.innerHTML = `
            <div class="loading">No books found.</div>
        `;
        return;
    }

    booksContainer.innerHTML = safeBooks
        .map((book) => {
            const authorName = book.author || "Unknown Author";
            const editButton = isLoggedIn()
                ? `<button class="edit-btn" onclick="editBook('${book._id}')">Edit</button>`
                : "";

            const deleteButton = isAdmin()
                ? `<button class="delete-btn" onclick="deleteBook('${book._id}')">Delete</button>`
                : "";

            return `
                <div class="book-card">
                    <div class="book-icon">📖</div>
                    <h3>${escapeHTML(book.title)}</h3>
                    <p class="author">👤 ${escapeHTML(authorName)}</p>
                    <div class="price">$${book.price}</div>
                    <div class="card-actions">
                        ${editButton}
                        ${deleteButton}
                    </div>
                </div>
            `;
        })
        .join("");
}

async function getUsers() {
    try {
        const response = await fetch(USERS_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch users");
        }

        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        usersContainer.innerHTML = `
            <div class="loading">Failed to load users.</div>
        `;
        console.error(error);
    }
}

function displayUsers(users) {
    const safeUsers = Array.isArray(users) ? users : [];

    if (safeUsers.length === 0) {
        usersContainer.innerHTML = `
            <div class="loading">No users found.</div>
        `;
        return;
    }

    usersContainer.innerHTML = safeUsers
        .map((user) => {
            const role = user.role || "user";

            return `
                <div class="user-card">
                    <div class="user-icon">${role === "admin" ? "👑" : "👤"}</div>
                    <h3>${escapeHTML(user.name)}</h3>
                    <p class="user-email">${escapeHTML(user.email)}</p>
                    <span class="role">${escapeHTML(role)}</span>
                    <div class="card-actions">
                        <button class="edit-btn" onclick="editUser('${user._id}')">Edit</button>
                        <button class="delete-btn" onclick="deleteUser('${user._id}')">Delete</button>
                    </div>
                </div>
            `;
        })
        .join("");
}

function openAddModal() {
    if (!isLoggedIn()) {
        alert("Please login first.");
        openLoginModal();
        return;
    }

    modalTitle.textContent = "Add New Book";
    bookForm.reset();
    bookIdInput.value = "";
    bookModal.classList.add("active");
}

function closeModal() {
    bookModal.classList.remove("active");
}

function openUserModal() {
    userModalTitle.textContent = "Create Account";
    const submitButton = userForm.querySelector("button[type='submit']");

    if (submitButton) {
        submitButton.textContent = "Create Account";
    }

    userForm.reset();
    userIdInput.value = "";
    userModal.classList.add("active");
}

function closeUserModal() {
    userModal.classList.remove("active");
}

function openLoginModal() {
    loginForm.reset();
    loginModal.classList.add("active");
}

function closeLoginModal() {
    loginModal.classList.remove("active");
}

userForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const userId = userIdInput.value;
    const isEdit = Boolean(userId);
    const name = document.getElementById("userName").value.trim();
    const email = document.getElementById("userEmail").value.trim();
    const password = document.getElementById("userPassword").value.trim();

    if (!name || !email || (!isEdit && !password)) {
        alert(isEdit ? "Name, email and password are required for updates." : "Name, email and password are required.");
        return;
    }

    const userData = { name, email };
    if (password) userData.password = password;

    try {
        const url = isEdit ? `${USERS_URL}/${userId}` : `${AUTH_URL}/register`;
        const method = isEdit ? "PUT" : "POST";

        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || (isEdit ? "Update failed" : "Registration failed"));
        }

        if (isEdit) {
            alert("User updated successfully!");
            closeUserModal();
            await getUsers();
        } else {
            alert("Account created successfully! Please login.");
            closeUserModal();
            openLoginModal();
            await getUsers();
        }
    } catch (error) {
        alert(error.message);
        console.error(error);
    }
});

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const loginData = {
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value
    };

    try {
        const response = await fetch(`${AUTH_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Login failed");
        }

        localStorage.setItem("token", data.token);
        closeLoginModal();
        updateAuthUI();
        await getBooks();
        await getUsers();
        alert("Login successful!");
    } catch (error) {
        alert(error.message);
        console.error(error);
    }
});

logoutNav.addEventListener("click", function (event) {
    event.preventDefault();
    localStorage.removeItem("token");
    updateAuthUI();
    getBooks();
    getUsers();
    alert("Logged out successfully.");
});

loginNav.addEventListener("click", function (event) {
    event.preventDefault();
    openLoginModal();
});

registerNav.addEventListener("click", function (event) {
    event.preventDefault();
    openUserModal();
});

if (addUserBtn) {
    addUserBtn.addEventListener("click", openUserModal);
}

bookForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!isLoggedIn()) {
        alert("Please login first.");
        closeModal();
        openLoginModal();
        return;
    }

    const bookId = bookIdInput.value;
    const bookData = {
        title: titleInput.value.trim(),
        price: Number(priceInput.value),
        author: authorInput.value.trim()
    };

    if (!bookData.title || !bookData.author || Number.isNaN(bookData.price) || bookData.price < 1) {
        alert("Please enter a valid title, author and price.");
        return;
    }

    try {
        const response = await fetch(bookId ? `${API_URL}/${bookId}` : API_URL, {
            method: bookId ? "PUT" : "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(bookData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Request failed");
        }

        alert(bookId ? "Book updated successfully!" : "Book created successfully!");
        closeModal();
        await getBooks();
    } catch (error) {
        alert(error.message);
        console.error(error);
    }
});

async function editBook(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const book = await response.json();

        if (!response.ok) {
            throw new Error(book.message || "Book not found");
        }

        modalTitle.textContent = "Edit Book";
        bookIdInput.value = book._id;
        titleInput.value = book.title;
        priceInput.value = book.price;
        authorInput.value = book.author || "";
        bookModal.classList.add("active");
    } catch (error) {
        alert(error.message);
        console.error(error);
    }
}

async function deleteBook(id) {
    if (!isAdmin()) {
        alert("Only admins can delete books.");
        return;
    }

    const confirmed = confirm("Are you sure you want to delete this book?");
    if (!confirmed) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        let data = {};
        if (response.status !== 204) {
            data = await response.json();
        }

        if (!response.ok) {
            throw new Error(data.message || "Failed to delete book");
        }

        alert("Book deleted successfully!");
        await getBooks();
    } catch (error) {
        alert(error.message);
        console.error(error);
    }
}

async function editUser(id) {
    try {
        const response = await fetch(`${USERS_URL}/${id}`);
        const user = await response.json();

        if (!response.ok) {
            throw new Error(user.message || "User not found");
        }

        userModalTitle.textContent = "Edit User";
        const submitButton = userForm.querySelector("button[type='submit']");
        if (submitButton) {
            submitButton.textContent = "Save Changes";
        }

        userIdInput.value = user._id;
        document.getElementById("userName").value = user.name;
        document.getElementById("userEmail").value = user.email;
        document.getElementById("userPassword").value = "";
        userModal.classList.add("active");
    } catch (error) {
        alert(error.message);
        console.error(error);
    }
}

async function deleteUser(id) {
    const confirmed = confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
        const response = await fetch(`${USERS_URL}/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        const data = response.status === 204 ? {} : await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to delete user");
        }

        alert("User deleted successfully!");
        await getUsers();
        await getBooks();
    } catch (error) {
        alert(error.message);
        console.error(error);
    }
}

bookModal.addEventListener("click", function (event) {
    if (event.target === bookModal) {
        closeModal();
    }
});

userModal.addEventListener("click", function (event) {
    if (event.target === userModal) {
        closeUserModal();
    }
});

loginModal.addEventListener("click", function (event) {
    if (event.target === loginModal) {
        closeLoginModal();
    }
});

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}

updateAuthUI();
getBooks();
getUsers();
