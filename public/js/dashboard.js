// =================================================
// ================= AUTH ==========================
// =================================================

const token = localStorage.getItem("token");
const userData = localStorage.getItem("user");


if (!token || !userData) {

    window.location.href = "/";

    throw new Error("User is not authenticated");

}


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


// Book Modal

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


// Delete Book Modal

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


// User Modal

const userModal =
    document.getElementById("userModal");

const closeUserModalBtn =
    document.getElementById(
        "closeUserModalBtn"
    );

const userForm =
    document.getElementById("userForm");

const cancelUserBtn =
    document.getElementById(
        "cancelUserBtn"
    );

const userEditName =
    document.getElementById(
        "userEditName"
    );

const userEditEmail =
    document.getElementById(
        "userEditEmail"
    );

const userEditPassword =
    document.getElementById(
        "userEditPassword"
    );

const userEditRole =
    document.getElementById(
        "userEditRole"
    );

const userMessage =
    document.getElementById(
        "userMessage"
    );


// Delete User Modal

const deleteUserModal =
    document.getElementById(
        "deleteUserModal"
    );

const closeDeleteUserModalBtn =
    document.getElementById(
        "closeDeleteUserModalBtn"
    );

const confirmDeleteUserBtn =
    document.getElementById(
        "confirmDeleteUserBtn"
    );

const cancelDeleteUserBtn =
    document.getElementById(
        "cancelDeleteUserBtn"
    );

const deleteUserMessage =
    document.getElementById(
        "deleteUserMessage"
    );

const deleteUserText =
    document.getElementById(
        "deleteUserText"
    );


// =================================================
// ================= STATE =========================
// =================================================

let editingBookId = null;

let deletingBookId = null;

let editingUserId = null;

let deletingUserId = null;


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
// ================= LOGOUT ========================
// =================================================

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href = "/";

}


logoutBtn.addEventListener(
    "click",
    logout
);


// =================================================
// ================= GET BOOKS ======================
// =================================================

async function getBooks() {

    try {

        const response =
            await fetch("/books", {

                method: "GET",

                headers: {

                    Authorization:
                        `Bearer ${token}`

                }

            });


        const data =
            await response.json();


        if (response.status === 401) {

            logout();

            return;

        }


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


    if (
        !Array.isArray(books) ||
        books.length === 0
    ) {

        booksContainer.textContent =
            "No books available.";

        return;

    }


    books.forEach(book => {

        const card =
            document.createElement("div");

        card.className =
            "book-card";


        const title =
            document.createElement("h3");

        title.textContent =
            book.title;


        const price =
            document.createElement("p");

        price.innerHTML =
            `Price: <strong>$${book.price}</strong>`;


        const author =
            document.createElement("p");

        author.textContent =
            `Author: ${book.author}`;


        card.appendChild(title);

        card.appendChild(price);

        card.appendChild(author);


        if (user.role === "admin") {

            const actions =
                document.createElement("div");

            actions.className =
                "book-actions";


            const editButton =
                document.createElement("button");

            editButton.textContent =
                "Edit";

            editButton.className =
                "edit-btn";


            editButton.addEventListener(
                "click",
                () => editBook(book._id)
            );


            const deleteButton =
                document.createElement("button");

            deleteButton.textContent =
                "Delete";

            deleteButton.className =
                "delete-btn";


            deleteButton.addEventListener(
                "click",
                () =>
                    openDeleteModal(book._id)
            );


            actions.appendChild(editButton);

            actions.appendChild(deleteButton);

            card.appendChild(actions);

        }


        booksContainer.appendChild(card);

    });

}


// =================================================
// ================= ADD BOOK =======================
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
    event => {

        if (event.target === bookModal) {

            closeBookModal();

        }

    }
);


// =================================================
// ================= SAVE BOOK ======================
// =================================================

bookForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const title =
            document
                .getElementById("bookTitle")
                .value
                .trim();


        const price =
            Number(
                document
                    .getElementById("bookPrice")
                    .value
            );


        const author =
            document
                .getElementById("bookAuthor")
                .value
                .trim();


        if (!title || !author || price < 1) {

            bookMessage.textContent =
                "Please fill in all fields correctly.";

            return;

        }


        try {

            let response;


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

            } else {

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


            if (response.status === 401) {

                logout();

                return;

            }


            if (response.status === 403) {

                bookMessage.textContent =
                    "Access denied.";

                return;

            }


            if (!response.ok) {

                bookMessage.textContent =
                    data.errors
                        ? data.errors.join(" | ")
                        : data.message ||
                          "Operation failed";

                return;

            }


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


        if (response.status === 401) {

            logout();

            return;

        }


        if (!response.ok) {

            alert(
                book.message ||
                "Failed to get book"
            );

            return;

        }


        editingBookId =
            id;


        modalTitle.textContent =
            "Edit Book";


        document
            .getElementById("bookTitle")
            .value =
            book.title;


        document
            .getElementById("bookPrice")
            .value =
            book.price;


        document
            .getElementById("bookAuthor")
            .value =
            book.author;


        bookMessage.textContent =
            "";


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
// ================= DELETE BOOK ====================
// =================================================

function openDeleteModal(id) {

    deletingBookId =
        id;

    deleteMessage.textContent =
        "";

    deleteModal.style.display =
        "flex";

}


function closeDeleteModal() {

    deleteModal.style.display =
        "none";

    deletingBookId =
        null;

    deleteMessage.textContent =
        "";

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
    event => {

        if (event.target === deleteModal) {

            closeDeleteModal();

        }

    }
);


// =================================================
// ================= CONFIRM DELETE BOOK ===========
// =================================================

confirmDeleteBtn.addEventListener(
    "click",
    async () => {

        if (!deletingBookId) {

            return;

        }


        try {

            confirmDeleteBtn.disabled =
                true;

            confirmDeleteBtn.textContent =
                "Deleting...";


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


            if (response.status === 401) {

                logout();

                return;

            }


            if (response.status === 403) {

                deleteMessage.textContent =
                    "Access denied.";

                return;

            }


            if (!response.ok) {

                deleteMessage.textContent =
                    data.message ||
                    "Failed to delete book";

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


        if (response.status === 401) {

            logout();

            return;

        }


        if (response.status === 403) {

            usersContainer.textContent =
                "Access denied.";

            return;

        }


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

    usersContainer.innerHTML = "";


    if (
        !Array.isArray(users) ||
        users.length === 0
    ) {

        usersContainer.textContent =
            "No users found.";

        return;

    }


    const table =
        document.createElement("table");

    table.className =
        "users-table";


    const thead =
        document.createElement("thead");


    const headerRow =
        document.createElement("tr");


    [
        "Name",
        "Email",
        "Role",
        "Actions"
    ].forEach(header => {

        const th =
            document.createElement("th");

        th.textContent =
            header;

        headerRow.appendChild(th);

    });


    thead.appendChild(headerRow);


    const tbody =
        document.createElement("tbody");


    users.forEach(currentUser => {

        const row =
            document.createElement("tr");


        // Current logged-in user

        if (
            currentUser._id === user.id ||
            currentUser._id === user._id
        ) {

            row.classList.add(
                "current-user"
            );

        }


        // Name

        const nameCell =
            document.createElement("td");

        nameCell.textContent =
            currentUser.name;


        // Email

        const emailCell =
            document.createElement("td");

        emailCell.textContent =
            currentUser.email;


        // Role

        const roleCell =
            document.createElement("td");


        const role =
            document.createElement("span");

        role.className =
            "user-role";

        role.textContent =
            currentUser.role;


        roleCell.appendChild(role);


        // Actions

        const actionsCell =
            document.createElement("td");


        const actions =
            document.createElement("div");

        actions.className =
            "user-actions";


        // Edit button

        const editButton =
            document.createElement("button");

        editButton.textContent =
            "Edit";

        editButton.className =
            "user-edit-btn";


        editButton.addEventListener(
            "click",
            () =>
                openEditUserModal(
                    currentUser
                )
        );


        // Delete button

        const deleteButton =
            document.createElement("button");

        deleteButton.textContent =
            "Delete";

        deleteButton.className =
            "user-delete-btn";


        if (
            currentUser._id === user.id ||
            currentUser._id === user._id
        ) {

            deleteButton.style.display =
                "none";

        }


        deleteButton.addEventListener(
            "click",
            () =>
                openDeleteUserModal(
                    currentUser
                )
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
// ================= EDIT USER MODAL ================
// =================================================

function openEditUserModal(currentUser) {

    editingUserId =
        currentUser._id;


    userEditName.value =
        currentUser.name;


    userEditEmail.value =
        currentUser.email;


    userEditPassword.value =
        "";


    userEditRole.value =
        currentUser.role;


    userMessage.textContent =
        "";


    userModal.style.display =
        "flex";

}


function closeUserModal() {

    userModal.style.display =
        "none";

    userForm.reset();

    userMessage.textContent =
        "";

    editingUserId =
        null;

}


closeUserModalBtn.addEventListener(
    "click",
    closeUserModal
);


cancelUserBtn.addEventListener(
    "click",
    closeUserModal
);


userModal.addEventListener(
    "click",
    event => {

        if (event.target === userModal) {

            closeUserModal();

        }

    }
);


// =================================================
// ================= SAVE USER ======================
// =================================================

userForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        if (!editingUserId) {

            return;

        }


        const name =
            userEditName.value.trim();


        const email =
            userEditEmail.value.trim();


        const password =
            userEditPassword.value.trim();


        const role =
            userEditRole.value;


        if (!name || !email) {

            userMessage.textContent =
                "Name and email are required.";

            return;

        }


        const updateData = {

            name,
            email,
            role

        };


        if (password) {

            updateData.password =
                password;

        }


        try {

            const response =
                await fetch(
                    `/users/${editingUserId}`,
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


            if (response.status === 401) {

                logout();

                return;

            }


            if (response.status === 403) {

                userMessage.textContent =
                    "Access denied.";

                return;

            }


            if (!response.ok) {

                userMessage.textContent =
                    data.errors
                        ? data.errors.join(" | ")
                        : data.message ||
                          "Failed to update user";

                return;

            }


            closeUserModal();

            await getUsers();


        } catch (error) {

            console.error(
                "Update user error:",
                error
            );

            userMessage.textContent =
                "Something went wrong.";

        }

    }
);


// =================================================
// ================= DELETE USER MODAL ==============
// =================================================

function openDeleteUserModal(currentUser) {

    if (
        currentUser._id === user.id ||
        currentUser._id === user._id
    ) {

        return;

    }


    deletingUserId =
        currentUser._id;


    deleteUserText.textContent =
        `Are you sure you want to delete "${currentUser.name}"?`;


    deleteUserMessage.textContent =
        "";


    deleteUserModal.style.display =
        "flex";

}


function closeDeleteUserModal() {

    deleteUserModal.style.display =
        "none";

    deletingUserId =
        null;

    deleteUserMessage.textContent =
        "";

}


closeDeleteUserModalBtn.addEventListener(
    "click",
    closeDeleteUserModal
);


cancelDeleteUserBtn.addEventListener(
    "click",
    closeDeleteUserModal
);


deleteUserModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            deleteUserModal
        ) {

            closeDeleteUserModal();

        }

    }
);


// =================================================
// ================= CONFIRM DELETE USER ===========
// =================================================

confirmDeleteUserBtn.addEventListener(
    "click",
    async () => {

        if (!deletingUserId) {

            return;

        }


        try {

            confirmDeleteUserBtn.disabled =
                true;

            confirmDeleteUserBtn.textContent =
                "Deleting...";


            const response =
                await fetch(
                    `/users/${deletingUserId}`,
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


            if (response.status === 401) {

                logout();

                return;

            }


            if (response.status === 403) {

                deleteUserMessage.textContent =
                    "Access denied.";

                return;

            }


            if (!response.ok) {

                deleteUserMessage.textContent =
                    data.message ||
                    "Failed to delete user";

                return;

            }


            closeDeleteUserModal();

            await getUsers();


        } catch (error) {

            console.error(
                "Delete user error:",
                error
            );

            deleteUserMessage.textContent =
                "Something went wrong.";

        }


        finally {

            confirmDeleteUserBtn.disabled =
                false;

            confirmDeleteUserBtn.textContent =
                "Delete";

        }

    }
);


// =================================================
// ================= REFRESH USERS ==================
// =================================================

refreshUsersBtn.addEventListener(
    "click",
    getUsers
);


// =================================================
// ================= START ==========================
// =================================================

getBooks();


if (user.role === "admin") {

    getUsers();

}