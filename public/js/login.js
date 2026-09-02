```js
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    message.textContent = "";

    try {

        const response = await fetch("/auth/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })

        });

        const data = await response.json();

        if (!response.ok) {

            message.textContent =
                data.message ||
                "Login failed.";

            return;

        }

        // Save JWT token
        localStorage.setItem(
            "token",
            data.token
        );

        // Save user information
        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        message.textContent =
            "Login successful!";

        // Go to dashboard
        setTimeout(() => {

            window.location.href =
                "/dashboard.html";

        }, 500);

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        message.textContent =
            "Something went wrong. Please try again.";

    }

});
```
