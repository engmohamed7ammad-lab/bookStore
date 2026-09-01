// =================================================
// ================= AUTH ==========================
// =================================================

const token = localStorage.getItem("token");
const userData = localStorage.getItem("user");


// Check login

if (!token || !userData) {

    window.location.href = "index.html";

}


// Get user data

const user = JSON.parse(userData);


// =================================================
// ================= ELEMENTS ======================
// =================================================

// User info

const userName =
    document.getElementById("userName");

const userEmail =
    document.getElementById("userEmail");

const userRole =
    document.getElementById("userRole");


// Dashboard

const booksContainer =
    document.getElementById("booksContainer");

const logoutBtn =
    document.getElementById("logoutBtn");


// Admin

const adminPanel =
    document.getElementById("adminPanel");

const addBookBtn =
    document.getElementById("addBookBtn");


// Users

const usersSection =
    document.getElementById("usersSection");

const usersContainer =
    document.getElementById("usersContainer");

const refreshUsersBtn =
    document.getElementById("refreshUsersBtn");


// =================================================
// ================= BOOK MODAL ====================
// =================================================

const bookModal =
    document.getElementById("bookModal");

const modalTitle =
    document.getElementById("modalTitle");

const closeModalBtn =
    document.getElementById("closeModalBtn");

const bookForm =
    document.getElementById("bookForm");

const cancelBookBtn =
    document.getElementById("cancelBookBtn");

const bookMessage =
    document.getElementById("bookMessage");


// =================================================
// ================= DELETE MODAL ==================
// =================================================

const deleteModal =
    document.getElementById("deleteModal");

const closeDeleteModalBtn =
    document.getElementById(
        "closeDeleteModalBtn"
    );

const confirmDeleteBtn =
    document.getElementById(
        "confirmDeleteBtn"
    );

const cancelDeleteBtn =
    document.getElementById(
        "cancelDeleteBtn"
    );

const deleteMessage =
    document.getElementById(
        "deleteMessage"
    );


// =================================================
// ================= STATE =========================
// =================================================

let editingBookId = null;

let deletingBookId = null;


// =================================================
// ================= USER INFO ======================
// =================================================

userName.textContent =
    user.name;

userEmail.textContent =
    user.email;

userRole.textContent =
    user.role;


// =================================================
// ================= ADMIN CHECK ====================
// =================================================

if (user.role !== "admin") {

    adminPanel.style.display =
        "none";

    usersSection.style.display =
        "none";

}


// =================================================
// ================= GET BOOKS ======================
// =================================================

async function getBooks() {

    try {

        const response =
            await fetch(
                "/books",
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        // Token expired

        if (response.status === 401) {

            logout();

            return;

        }


        // Other errors

        if (!response.ok) {

            booksContainer.textContent =
                data.message ||
                "Failed to load books";

            return;

        }


        displayBooks(data);


    } catch (error) {

        console.error(
            "Get books error:",
            error
        );

        booksContainer.textContent =
            "Something went wrong.";

    }

}


// =================================================
// ================= DISPLAY BOOKS ==================
// =================================================

function displayBooks(books) {

    booksContainer.innerHTML = "";


    // No books

    if (
        !Array.isArray(books) ||
        books.length === 0
    ) {

        booksContainer.textContent =
            "No books available.";

        return;

    }


    books.forEach((book) => {

        // ================= CARD =================

        const bookCard =
            document.createElement(
                "div"
            );

        bookCard.className =
            "book-card";


        // ================= TITLE ================

        const title =
            document.createElement(
                "h3"
            );

        title.textContent =
            book.title;


        // ================= PRICE ================

        const price =
            document.createElement(
                "p"
            );

        price.innerHTML =
            `Price: <strong>$${book.price}</strong>`;


        // ================= AUTHOR ===============

        const author =
            document.createElement(
                "p"
            );

        author.textContent =
            `Author: ${book.author}`;


        // Add information

        bookCard.appendChild(title);

        bookCard.appendChild(price);

        bookCard.appendChild(author);


        // =================================================
        // ================= ADMIN ACTIONS ==================
        // =================================================

        if (user.role === "admin") {

            const actions =
                document.createElement(
                    "div"
                );

            actions.className =
                "book-actions";


            // ================= EDIT ================

            const editButton =
                document.createElement(
                    "button"
                );

            editButton.textContent =
                "Edit";

            editButton.className =
                "edit-btn";


            editButton.addEventListener(
                "click",
                () => {

                    editBook(book._id);

                }
            );


            // ================= DELETE ==============

            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.textContent =
                "Delete";

            deleteButton.className =
                "delete-btn";


            deleteButton.addEventListener(
                "click",
                () => {

                    openDeleteModal(
                        book._id
                    );

                }
            );


            // Add buttons

            actions.appendChild(
                editButton
            );

            actions.appendChild(
                deleteButton
            );


            bookCard.appendChild(
                actions
            );

        }


        booksContainer.appendChild(
            bookCard
        );

    });

}


// =================================================
// ================= OPEN ADD MODAL ================
// =================================================

addBookBtn.addEventListener(
    "click",
    () => {

        editingBookId = null;

        modalTitle.textContent =
            "Add New Book";

        bookForm.reset();

        bookMessage.textContent =
            "";

        bookModal.style.display =
            "flex";

    }
);


// =================================================
// ================= CLOSE BOOK MODAL ==============
// =================================================

function closeBookModal() {

    bookModal.style.display =
        "none";

    bookForm.reset();

    bookMessage.textContent =
        "";

    editingBookId = null;

}


// Close button

closeModalBtn.addEventListener(
    "click",
    closeBookModal
);


// Cancel button

cancelBookBtn.addEventListener(
    "click",
    closeBookModal
);


// Click outside

bookModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            bookModal
        ) {

            closeBookModal();

        }

    }
);


// =================================================
// ================= SAVE BOOK ======================
// =================================================

bookForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        // Get title

        const title =
            document
                .getElementById(
                    "bookTitle"
                )
                .value
                .trim();


        // Get price

        const price =
            Number(
                document
                    .getElementById(
                        "bookPrice"
                    )
                    .value
            );


        // Get author

        const author =
            document
                .getElementById(
                    "bookAuthor"
                )
                .value
                .trim();


        // =================================================
        // ================= VALIDATION ====================
        // =================================================

        if (
            !title ||
            !author ||
            !price
        ) {

            bookMessage.textContent =
                "Please fill in all fields.";

            return;

        }


        try {

            let response;


            // =================================================
            // ================= EDIT =========================
            // =================================================

            if (editingBookId) {

                response =
                    await fetch(
                        `/books/${editingBookId}`,
                        {

                            method: "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`

                            },

                            body:
                                JSON.stringify({
                                    title,
                                    price,
                                    author
                                })

                        }
                    );

            }


            // =================================================
            // ================= ADD ==========================
            // =================================================

            else {

                response =
                    await fetch(
                        "/books",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`

                            },

                            body:
                                JSON.stringify({
                                    title,
                                    price,
                                    author
                                })

                        }
                    );

            }


            const data =
                await response.json();


            // Authentication

            if (
                response.status === 401
            ) {

                logout();

                return;

            }


            // Authorization

            if (
                response.status === 403
            ) {

                bookMessage.textContent =
                    "Access denied.";

                return;

            }


            // Other errors

            if (!response.ok) {

                if (data.errors) {

                    bookMessage.textContent =
                        data.errors.join(
                            " | "
                        );

                } else {

                    bookMessage.textContent =
                        data.message ||
                        "Operation failed";

                }

                return;

            }


            // Success

            closeBookModal();

            await getBooks();


        } catch (error) {

            console.error(
                "Save book error:",
                error
            );

            bookMessage.textContent =
                "Something went wrong.";

        }

    }
);


// =================================================
// ================= EDIT BOOK ======================
// =================================================

async function editBook(id) {

    try {

        const response =
            await fetch(
                `/books/${id}`,
                {

                    method: "GET",

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }
            );


        const book =
            await response.json();


        // Token expired

        if (
            response.status === 401
        ) {

            logout();

            return;

        }


        // Error

        if (!response.ok) {

            alert(
                book.message ||
                "Failed to get book"
            );

            return;

        }


        // Save ID

        editingBookId = id;


        // Modal title

        modalTitle.textContent =
            "Edit Book";


        // Fill title

        document
            .getElementById(
                "bookTitle"
            )
            .value =
            book.title;


        // Fill price

        document
            .getElementById(
                "bookPrice"
            )
            .value =
            book.price;


        // Fill author

        document
            .getElementById(
                "bookAuthor"
            )
            .value =
            book.author;


        bookMessage.textContent =
            "";


        // Open modal

        bookModal.style.display =
            "flex";


    } catch (error) {

        console.error(
            "Edit book error:",
            error
        );

        alert(
            "Something went wrong."
        );

    }

}


// =================================================
// ================= DELETE MODAL ==================
// =================================================

function openDeleteModal(id) {

    deletingBookId = id;

    deleteMessage.textContent =
        "";

    deleteModal.style.display =
        "flex";

}


// =================================================
// ================= CLOSE DELETE MODAL ============
// =================================================

function closeDeleteModal() {

    deleteModal.style.display =
        "none";

    deletingBookId = null;

    deleteMessage.textContent =
        "";

}


// Close button

closeDeleteModalBtn.addEventListener(
    "click",
    closeDeleteModal
);


// Cancel button

cancelDeleteBtn.addEventListener(
    "click",
    closeDeleteModal
);


// Click outside

deleteModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            deleteModal
        ) {

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

            // Disable button

            confirmDeleteBtn.disabled =
                true;

            confirmDeleteBtn.textContent =
                "Deleting...";


            // Delete request

            const response =
                await fetch(
                    `/books/${deletingBookId}`,
                    {

                        method: "DELETE",

                        headers: {

                            Authorization:
                                `Bearer ${token}`

                        }

                    }
                );


            const data =
                await response.json();


            // Authentication

            if (
                response.status === 401
            ) {

                logout();

                return;

            }


            // Authorization

            if (
                response.status === 403
            ) {

                deleteMessage.textContent =
                    "Access denied.";

                return;

            }


            // Other errors

            if (!response.ok) {

                deleteMessage.textContent =
                    data.message ||
                    "Failed to delete book";

                return;

            }


            // Success

            closeDeleteModal();

            await getBooks();


        } catch (error) {

            console.error(
                "Delete book error:",
                error
            );

            deleteMessage.textContent =
                "Something went wrong.";

        }


        finally {

            confirmDeleteBtn.disabled =
                false;

            confirmDeleteBtn.textContent =
                "Delete";

        }

    }
);


// =================================================
// ================= GET USERS ======================
// =================================================

async function getUsers() {

    // Only admin

    if (user.role !== "admin") {

        return;

    }


    try {

        usersContainer.textContent =
            "Loading users...";


        const response =
            await fetch(
                "/users",
                {

                    method: "GET",

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }
            );


        const data =
            await response.json();


        // Authentication

        if (
            response.status === 401
        ) {

            logout();

            return;

        }


        // Authorization

        if (
            response.status === 403
        ) {

            usersContainer.textContent =
                "Access denied.";

            return;

        }


        // Other errors

        if (!response.ok) {

            usersContainer.textContent =
                data.message ||
                "Failed to load users";

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
// ================= DISPLAY USERS ==================
// =================================================

function displayUsers(users) {

    usersContainer.innerHTML =
        "";


    // No users

    if (
        !Array.isArray(users) ||
        users.length === 0
    ) {

        usersContainer.textContent =
            "No users found.";

        return;

    }


    // Create table

    const table =
        document.createElement(
            "table"
        );

    table.className =
        "users-table";


    // =================================================
    // ================= THEAD =========================
    // =================================================

    const thead =
        document.createElement(
            "thead"
        );


    const headerRow =
        document.createElement(
            "tr"
        );


    const headers = [
        "Name",
        "Email",
        "Role",
        "Actions"
    ];


    headers.forEach(
        (header) => {

            const th =
                document.createElement(
                    "th"
                );

            th.textContent =
                header;

            headerRow.appendChild(
                th
            );

        }
    );


    thead.appendChild(
        headerRow
    );


    // =================================================
    // ================= TBODY =========================
    // =================================================

    const tbody =
        document.createElement(
            "tbody"
        );


    users.forEach(
        (currentUser) => {

            const row =
                document.createElement(
                    "tr"
                );


            // ================= NAME =================

            const nameCell =
                document.createElement(
                    "td"
                );

            nameCell.textContent =
                currentUser.name;


            // ================= EMAIL ================

            const emailCell =
                document.createElement(
                    "td"
                );

            emailCell.textContent =
                currentUser.email;


            // ================= ROLE =================

            const roleCell =
                document.createElement(
                    "td"
                );


            const role =
                document.createElement(
                    "span"
                );

            role.className =
                "user-role";

            role.textContent =
                currentUser.role;


            roleCell.appendChild(
                role
            );


            // ================= ACTIONS ==============

            const actionsCell =
                document.createElement(
                    "td"
                );


            const actions =
                document.createElement(
                    "div"
                );

            actions.className =
                "user-actions";


            // ================= EDIT =================

            const editButton =
                document.createElement(
                    "button"
                );

            editButton.textContent =
                "Edit";

            editButton.className =
                "user-edit-btn";


            editButton.addEventListener(
                "click",
                () => {

                    editUser(
                        currentUser
                    );

                }
            );


            // ================= DELETE ==============

            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.textContent =
                "Delete";

            deleteButton.className =
                "user-delete-btn";


            deleteButton.addEventListener(
                "click",
                () => {

                    deleteUser(
                        currentUser._id
                    );

                }
            );


            // Add buttons

            actions.appendChild(
                editButton
            );

            actions.appendChild(
                deleteButton
            );


            actionsCell.appendChild(
                actions
            );


            // Add cells

            row.appendChild(
                nameCell
            );

            row.appendChild(
                emailCell
            );

            row.appendChild(
                roleCell
            );

            row.appendChild(
                actionsCell
            );


            tbody.appendChild(
                row
            );

        }
    );


    // Add table

    table.appendChild(
        thead
    );

    table.appendChild(
        tbody
    );


    usersContainer.appendChild(
        table
    );

}


// =================================================
// ================= EDIT USER ======================
// =================================================

async function editUser(currentUser) {

    // Name

    const newName =
        prompt(
            "Enter new name:",
            currentUser.name
        );


    if (newName === null) {

        return;

    }


    // Email

    const newEmail =
        prompt(
            "Enter new email:",
            currentUser.email
        );


    if (newEmail === null) {

        return;

    }


    // Password

    const newPassword =
        prompt(
            "Enter new password or leave empty:",
            ""
        );


    if (newPassword === null) {

        return;

    }


    try {

        const updateData = {

            name:
                newName.trim(),

            email:
                newEmail.trim()

        };


        // Update password only
        // if entered

        if (
            newPassword.trim()
        ) {

            updateData.password =
                newPassword.trim();

        }


        const response =
            await fetch(
                `/users/${currentUser._id}`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify(
                            updateData
                        )

                }
            );


        const data =
            await response.json();


        // Authentication

        if (
            response.status === 401
        ) {

            logout();

            return;

        }


        // Authorization

        if (
            response.status === 403
        ) {

            alert(
                "Access denied."
            );

            return;

        }


        // Other errors

        if (!response.ok) {

            alert(
                data.message ||
                "Failed to update user"
            );

            return;

        }


        // Success

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
// ================= DELETE USER ====================
// =================================================

async function deleteUser(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this user?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `/users/${id}`,
                {

                    method: "DELETE",

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }
            );


        const data =
            await response.json();


        // Authentication

        if (
            response.status === 401
        ) {

            logout();

            return;

        }


        // Authorization

        if (
            response.status === 403
        ) {

            alert(
                "Access denied."
            );

            return;

        }


        // Other errors

        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete user"
            );

            return;

        }


        // Success

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
// ================= REFRESH USERS ==================
// =================================================

refreshUsersBtn.addEventListener(
    "click",
    getUsers
);


// =================================================
// ================= LOGOUT ========================
// =================================================

function logout() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );


    window.location.href =
        "index.html";

}


// Logout button

logoutBtn.addEventListener(
    "click",
    logout
);


// =================================================
// ================= START ==========================
// =================================================

getBooks();


if (user.role === "admin") {

    getUsers();

}