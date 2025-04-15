<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Login / Create Account</title>
  <style>
    * {
      box-sizing: border-box;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    body {
      background: #f2f2f2;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }

    .form-container {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }

    h2 {
      text-align: center;
      margin-bottom: 1.5rem;
      color: #333;
    }

    form label {
      display: block;
      margin-top: 0.5rem;
    }

    form input {
      width: 100%;
      padding: 0.8rem;
      margin: 0.3rem 0;
      border: 1px solid #ccc;
      border-radius: 5px;
    }

    form button {
      width: 100%;
      padding: 0.8rem;
      margin-top: 1rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1rem;
    }

    form button:hover {
      background-color: #0056b3;
    }

    p {
      margin-top: 1rem;
      text-align: center;
    }

    a {
      color: #007bff;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    .hidden {
      display: none;
    }

    .error {
      color: red;
      font-size: 0.9rem;
      margin-top: 0.3rem;
    }
  </style>
</head>
<body>
  <div class="form-container">
    <!-- Login Form -->
    <div id="loginForm">
      <h2>Login</h2>
      <form action="/login" method="POST">
        <label for="login-username">Username</label>
        <input type="text" id="login-username" name="username" required />

        <label for="login-password">Password</label>
        <input type="password" id="login-password" name="password" required />

        <button type="submit">Login</button>
        <p>Don't have an account? <a href="#" onclick="toggleForms()">Create one</a></p>
      </form>
    </div>

    <!-- Create User Form -->
    <div id="createForm" class="hidden">
      <h2>Create New Account</h2>
      <form id="createAccountForm" action="/create-user" method="POST">
        <label for="create-username">Username</label>
        <input type="text" id="create-username" name="username" required />

        <label for="create-email">Email</label>
        <input type="email" id="create-email" name="email" required />

        <label for="create-password">Password</label>
        <input type="password" id="create-password" name="password" required />

        <label for="confirm-password">Confirm Password</label>
        <input type="password" id="confirm-password" name="confirm_password" required />

        <div id="errorMsg" class="error"></div>

        <button type="submit">Create Account</button>
        <p>Already have an account? <a href="#" onclick="toggleForms()">Login here</a></p>
      </form>
    </div>
  </div>

  <script>
    function toggleForms() {
      document.getElementById('loginForm').classList.toggle('hidden');
      document.getElementById('createForm').classList.toggle('hidden');
      document.getElementById('errorMsg').textContent = ''; // clear error when switching forms
    }

    document.getElementById('createAccountForm').addEventListener('submit', function(e) {
      const password = document.getElementById('create-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      const errorMsg = document.getElementById('errorMsg');

      if (password !== confirmPassword) {
        e.preventDefault();
        errorMsg.textContent = 'Passwords do not match.';
      }
    });
  </script>
</body>
</html>