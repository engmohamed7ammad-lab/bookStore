// =================================================
// ================= AUTH ==========================
// =================================================

const token = localStorage.getItem("token");
const userData = localStorage.getItem("user");


// Check authentication
if (!token || !userData) {
    window.location.href = "/";
    throw new Error("User is not authenticated");
}


// Parse user data
let user;

try {
    user = JSON.parse(userData);
} catch (error) {
    console.error("Invalid user data:", error);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
    throw new Error("Invalid user data");
}


// Validate user object
if (!user || !user.id || !user.role) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
    throw new Error("Invalid user information");
}


// =================================================
// ================= ELEMENTS ======================
// =================================================

// User info
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userRole = document.getElementById("userRole");

// Dashboard
const booksContainer = document.getElementById("booksContainer");
const logoutBtn = document.getElementById("logoutBtn");

// Admin
const adminPanel = document.getElementById("adminPanel");
const addBookBtn = document.getElementById("addBookBtn");

// Users
const usersSection = document.getElementById("usersSection");
const usersContainer = document.getElementById("usersContainer");
const refreshUsersBtn = document.getElementById("refreshUsersBtn");

// Book Modal
const bookModal = document.getElementById("bookModal");
const modalTitle = document.getElementById("modalTitle");
const closeModalBtn = document.getElementById("closeModalBtn");
const bookForm = document.getElementById("bookForm");
const cancelBookBtn = document.getElementById("cancelBookBtn");
const bookMessage = document.getElementById("bookMessage");

const bookTitle = document.getElementById("bookTitle");
const bookPrice = document.getElementById("bookPrice");
const bookAuthor = document.getElementById("bookAuthor");

// Delete Modal
const deleteModal = document.getElementById("deleteModal");
const closeDeleteModalBtn =
    document.getElementById("closeDeleteModalBtn");

const confirmDeleteBtn =
    document.getElementById("confirmDeleteBtn");

const cancelDeleteBtn =
    document.getElementById("cancelDeleteBtn");

const deleteMessage =
    document.getElementById("deleteMessage");


// =================================================
// ================= STATE =========================
// =================================================

let editingBookId = null;
let deletingBookId = null;


// =================================================
// ================= USER INFO =====================
// =================================================

userName.textContent = user.name || "User";
userEmail.textContent = user.email || "No email";
userRole.textContent = user.role;


// =================================================
// ================= ADMIN CHECK ===================
// =================================================

const isAdmin = user.role === "admin";

if (!isAdmin) {
    adminPanel.style.display = "none";
    usersSection.style.display = "none";
}


// =================================================
// ================= GET BOOKS =====================
// =================================================

async function getBooks() {
    try {
        booksContainer.textContent = "Loading books...";

        const response = await fetch("/books", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        // Token expired / invalid
        if (response.status === 401) {
            logout();
            return;
        }

        if (!response.ok) {
            booksContainer.textContent =
                data.message || "Failed to load books.";
            return;
        }

        displayBooks(data);

    } catch (error) {
        console.error("Get books error:", error);

        booksContainer.textContent =
            "Something went wrong while loading books.";
    }
}


// =================================================
// ================= DISPLAY BOOKS =================
// =================================================

function displayBooks(books) {
    booksContainer.innerHTML = "";

    if (!Array.isArray(books) || books.length === 0) {
        booksContainer.textContent = "No books available.";
        return;
    }

    books.forEach((book) => {

        const bookCard = document.createElement("div");
        bookCard.className = "book-card";


        // ================= TITLE =================

        const title = document.createElement("h3");
        title.textContent = book.title || "Untitled";


        // ================= PRICE =================

        const price = document.createElement("p");

        const formattedPrice =
            Number(book.price).toFixed(2);

        price.innerHTML =
            `Price: <strong>$${formattedPrice}</strong>`;


        // ================= AUTHOR =================

        const author = document.createElement("p");

        let authorName = "Unknown";

        if (typeof book.author === "string") {
            authorName = book.author;
        } else if (
            book.author &&
            typeof book.author === "object"
        ) {
            authorName =
                book.author.name ||
                book.author.email ||
                "Unknown";
        }

        author.textContent =
            `Author: ${authorName}`;


        // ================= APPEND =================

        bookCard.appendChild(title);
        bookCard.appendChild(price);
        bookCard.appendChild(author);


        // =================================================
        // ================= ADMIN ACTIONS =================
        // =================================================

        if (isAdmin) {

            const actions =
                document.createElement("div");

            actions.className = "book-actions";


            // ================= EDIT =================

            const editButton =
                document.createElement("button");

            editButton.textContent = "Edit";
            editButton.className = "edit-btn";

            editButton.addEventListener(
                "click",
                () => editBook(book._id)
            );


            // ================= DELETE =================

            const deleteButton =
                document.createElement("button");

            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-btn";

            deleteButton.addEventListener(
                "click",
                () => openDeleteModal(book._id)
            );


            actions.appendChild(editButton);
            actions.appendChild(deleteButton);

            bookCard.appendChild(actions);
        }


        booksContainer.appendChild(bookCard);
    });
}


// =================================================
// ================= OPEN ADD MODAL ================
// =================================================

if (addBookBtn) {

    addBookBtn.addEventListener("click", () => {

        editingBookId = null;

        modalTitle.textContent = "Add New Book";

        bookForm.reset();

        bookMessage.textContent = "";

        bookModal.style.display = "flex";
    });
}


// =================================================
// ================= CLOSE BOOK MODAL ==============
// =================================================

function closeBookModal() {

    bookModal.style.display = "none";

    bookForm.reset();

    bookMessage.textContent = "";

    editingBookId = null;
}


closeModalBtn.addEventListener(
    "click",
    closeBookModal
);

cancelBookBtn.addEventListener(
    "click",
    closeBookModal
);


bookModal.addEventListener(
    "click",
    (event) => {

        if (event.target === bookModal) {
            closeBookModal();
        }
    }
);


// =================================================
// ================= SAVE BOOK =====================
// =================================================

bookForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const title = bookTitle.value.trim();
        const price = Number(bookPrice.value);
        const author = bookAuthor.value.trim();


        // ================= VALIDATION =============

        if (!title || !author) {
            bookMessage.textContent =
                "Please fill in all fields.";
            return;
        }

        if (title.length < 2) {
            bookMessage.textContent =
                "Title must contain at least 2 characters.";
            return;
        }

        if (!Number.isFinite(price) || price < 1) {
            bookMessage.textContent =
                "Price must be at least 1.";
            return;
        }


        try {

            const url = editingBookId
                ? `/books/${editingBookId}`
                : "/books";

            const method = editingBookId
                ? "PUT"
                : "POST";


            const response = await fetch(url, {
                method,

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify({
                    title,
                    price,
                    author
                })
            });


            const data = await response.json();


            // ================= AUTH ================

            if (response.status === 401) {
                logout();
                return;
            }


            // ================= ADMIN ===============

            if (response.status === 403) {
                bookMessage.textContent =
                    "Access denied. Admin only.";
                return;
            }


            // ================= ERROR ===============

            if (!response.ok) {

                if (data.errors) {

                    if (Array.isArray(data.errors)) {
                        bookMessage.textContent =
                            data.errors.join(" | ");
                    } else {
                        bookMessage.textContent =
                            data.errors;
                    }

                } else {
                    bookMessage.textContent =
                        data.message ||
                        "Operation failed.";
                }

                return;
            }


            // ================= SUCCESS =============

            closeBookModal();

            await getBooks();

        } catch (error) {

            console.error("Save book error:", error);

            bookMessage.textContent =
                "Something went wrong.";
        }
    }
);


// =================================================
// ================= EDIT BOOK =====================
// =================================================

async function editBook(id) {

    try {

        const response = await fetch(
            `/books/${id}`,
            {
                method: "GET",

                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );


        const book = await response.json();


        if (response.status === 401) {
            logout();
            return;
        }


        if (!response.ok) {

            alert(
                book.message ||
                "Failed to get book."
            );

            return;
        }


        editingBookId = id;

        modalTitle.textContent = "Edit Book";


        bookTitle.value = book.title || "";

        bookPrice.value = book.price || "";


        let authorName = "";

        if (typeof book.author === "string") {

            authorName = book.author;

        } else if (
            book.author &&
            typeof book.author === "object"
        ) {

            authorName =
                book.author.name ||
                book.author.email ||
                "";
        }


        bookAuthor.value = authorName;

        bookMessage.textContent = "";

        bookModal.style.display = "flex";


    } catch (error) {

        console.error("Edit book error:", error);

        alert("Something went wrong.");
    }
}


// =================================================
// ================= DELETE MODAL ==================
// =================================================

function openDeleteModal(id) {

    deletingBookId = id;

    deleteMessage.textContent = "";

    deleteModal.style.display = "flex";
}


function closeDeleteModal() {

    deleteModal.style.display = "none";

    deletingBookId = null;

    deleteMessage.textContent = "";
}


closeDeleteModalBtn.addEventListener(
    "click",
    closeDeleteModal
);

cancelDeleteBtn.addEventListener(
    "click",
    closeDeleteModal
);


deleteModal.addEventListener(
    "click",
    (event) => {

        if (event.target === deleteModal) {
            closeDeleteModal();
        }
    }
);


// =================================================
// ================= CONFIRM DELETE ===============
// =================================================

confirmDeleteBtn.addEventListener(
    "click",
    async () => {

        if (!deletingBookId) {
            return;
        }


        try {

            confirmDeleteBtn.disabled = true;

            confirmDeleteBtn.textContent =
                "Deleting...";


            const response = await fetch(
                `/books/${deletingBookId}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            const data = await response.json();


            if (response.status === 401) {
                logout();
                return;
            }


            if (response.status === 403) {

                deleteMessage.textContent =
                    "Access denied. Admin only.";

                return;
            }


            if (!response.ok) {

                deleteMessage.textContent =
                    data.message ||
                    "Failed to delete book.";

                return;
            }


            closeDeleteModal();

            await getBooks();


        } catch (error) {

            console.error(
                "Delete book error:",
                error
            );

            deleteMessage.textContent =
                "Something went wrong.";

        } finally {

            confirmDeleteBtn.disabled = false;

            confirmDeleteBtn.textContent =
                "Delete";
        }
    }
);


// =================================================
// ================= GET USERS =====================
// =================================================

async function getUsers() {

    if (!isAdmin) {
        return;
    }


    try {

        usersContainer.textContent =
            "Loading users...";


        const response = await fetch(
            "/users",
            {
                method: "GET",

                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );


        const data = await response.json();


        if (response.status === 401) {
            logout();
            return;
        }


        if (response.status === 403) {

            usersContainer.textContent =
                "Access denied. Admin only.";

            return;
        }


        if (!response.ok) {

            usersContainer.textContent =
                data.message ||
                "Failed to load users.";

            return;
        }


        displayUsers(data);


    } catch (error) {

        console.error(
            "Get users error:",
            error
        );

        usersContainer.textContent =
            "Something went wrong.";
    }
}


// =================================================
// ================= DISPLAY USERS =================
// =================================================

function displayUsers(users) {

    usersContainer.innerHTML = "";


    if (!Array.isArray(users) || users.length === 0) {

        usersContainer.textContent =
            "No users found.";

        return;
    }


    const table = document.createElement("table");

    table.className = "users-table";


    // ================= THEAD =====================

    const thead = document.createElement("thead");

    const headerRow = document.createElement("tr");

    const headers = [
        "Name",
        "Email",
        "Role",
        "Actions"
    ];


    headers.forEach((header) => {

        const th = document.createElement("th");

        th.textContent = header;

        headerRow.appendChild(th);
    });


    thead.appendChild(headerRow);


    // ================= TBODY =====================

    const tbody = document.createElement("tbody");


    users.forEach((currentUser) => {

        const row = document.createElement("tr");


        // ================= NAME =================

        const nameCell = document.createElement("td");

        nameCell.textContent =
            currentUser.name || "Unknown";


        // ================= EMAIL ================

        const emailCell = document.createElement("td");

        emailCell.textContent =
            currentUser.email || "Unknown";


        // ================= ROLE =================

        const roleCell = document.createElement("td");

        const role = document.createElement("span");

        role.className = "user-role";

        role.textContent =
            currentUser.role || "user";

        roleCell.appendChild(role);


        // ================= ACTIONS ==============

        const actionsCell = document.createElement("td");

        const actions = document.createElement("div");

        actions.className = "user-actions";


        // ================= EDIT =================

        const editButton =
            document.createElement("button");

        editButton.textContent = "Edit";

        editButton.className = "user-edit-btn";

        editButton.addEventListener(
            "click",
            () => editUser(currentUser)
        );


        // ================= DELETE ==============

        const deleteButton =
            document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.className = "user-delete-btn";


        // Prevent deleting yourself
        const isCurrentUser =
            String(currentUser._id) ===
            String(user.id);


        if (isCurrentUser) {

            deleteButton.disabled = true;

            deleteButton.title =
                "You cannot delete your own account";
        }


        deleteButton.addEventListener(
            "click",
            () => {

                if (isCurrentUser) {
                    return;
                }

                deleteUser(currentUser._id);
            }
        );


        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        actionsCell.appendChild(actions);


        row.appendChild(nameCell);
        row.appendChild(emailCell);
        row.appendChild(roleCell);
        row.appendChild(actionsCell);

        tbody.appendChild(row);
    });


    table.appendChild(thead);
    table.appendChild(tbody);

    usersContainer.appendChild(table);
}


// =================================================
// ================= EDIT USER =====================
// =================================================

async function editUser(currentUser) {

    const newName = prompt(
        "Enter new name:",
        currentUser.name || ""
    );


    if (newName === null) {
        return;
    }


    const newEmail = prompt(
        "Enter new email:",
        currentUser.email || ""
    );


    if (newEmail === null) {
        return;
    }


    const newPassword = prompt(
        "Enter new password or leave empty:",
        ""
    );


    if (newPassword === null) {
        return;
    }


    // ================= VALIDATION ================

    if (!newName.trim()) {

        alert("Name cannot be empty.");

        return;
    }


    if (!newEmail.trim()) {

        alert("Email cannot be empty.");

        return;
    }


    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailRegex.test(newEmail.trim())) {

        alert("Please enter a valid email.");

        return;
    }


    if (
        newPassword.trim() &&
        newPassword.trim().length < 6
    ) {

        alert(
            "Password must contain at least 6 characters."
        );

        return;
    }


    try {

        const updateData = {
            name: newName.trim(),
            email: newEmail.trim().toLowerCase()
        };


        if (newPassword.trim()) {

            updateData.password =
                newPassword.trim();
        }


        const response = await fetch(
            `/users/${currentUser._id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`
                },

                body: JSON.stringify(updateData)
            }
        );


        const data = await response.json();


        if (response.status === 401) {

            logout();

            return;
        }


        if (response.status === 403) {

            alert(
                "Access denied. Admin only."
            );

            return;
        }


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to update user."
            );

            return;
        }


        // If admin edited himself,
        // update localStorage

        if (
            String(currentUser._id) ===
            String(user.id)
        ) {

            user.name =
                updateData.name;

            user.email =
                updateData.email;


            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );


            userName.textContent =
                user.name;

            userEmail.textContent =
                user.email;
        }


        alert(
            "User updated successfully!"
        );


        await getUsers();


    } catch (error) {

        console.error(
            "Edit user error:",
            error
        );

        alert(
            "Something went wrong."
        );
    }
}


// =================================================
// ================= DELETE USER ===================
// =================================================

async function deleteUser(id) {

    // Extra protection
    if (String(id) === String(user.id)) {

        alert(
            "You cannot delete your own account."
        );

        return;
    }


    const confirmed = confirm(
        "Are you sure you want to delete this user?"
    );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `/users/${id}`,
            {
                method: "DELETE",

                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );


        const data = await response.json();


        if (response.status === 401) {

            logout();

            return;
        }


        if (response.status === 403) {

            alert(
                "Access denied. Admin only."
            );

            return;
        }


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete user."
            );

            return;
        }


        alert(
            "User deleted successfully!"
        );


        await getUsers();


    } catch (error) {

        console.error(
            "Delete user error:",
            error
        );

        alert(
            "Something went wrong."
        );
    }
}


// =================================================
// ================= REFRESH USERS =================
// =================================================

if (refreshUsersBtn) {

    refreshUsersBtn.addEventListener(
        "click",
        getUsers
    );
}


// =================================================
// ================= LOGOUT ========================
// =================================================

function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
}


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        logout
    );
}


// =================================================
// ================= START ==========================
// =================================================

getBooks();

if (isAdmin) {
    getUsers();
}   