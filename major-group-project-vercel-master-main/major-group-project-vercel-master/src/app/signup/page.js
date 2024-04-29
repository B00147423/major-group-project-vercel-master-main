"use client";
// SignUpModal.js
import React, { useState } from 'react';
import '../css/signupform.css'; // Adjust the path to your CSS file
import LoginModal from '../login/page';

export default function SignUpModal({ toggleModal }) {
  // Function to generate an array of numbers in a range
const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);
const [errorMessage, setErrorMessage] = useState('');
const [passwordError, setPasswordError] = useState(''); // Separate state for password error

    async function runDBCallAsync(url, formData) {
        try {
          const res = await fetch(url, {
            method: 'POST', // Use POST method
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });
      
          // Check if the HTTP status code is OK (200-299)
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
      
          // Try to parse the response as JSON
          const data = await res.json();
      
          if (data.data === "valid") {
            console.log("Registration Successful!");
                // save a little cookie to say we are authenticated
                document.cookie = 'username=' + username;
          } else {
            console.log("Error: Registration unsuccessful");
            setErrorMessage("Registration unsuccessful"); // Set the error message
          }
        } catch (error) {
          // If an error occurs, log it to the console
          console.error("Error during fetch: ", error);
          setErrorMessage(error.message);
        }
      }
    
      const handleSubmit = (event) => {
        event.preventDefault();
        setErrorMessage(''); // Clear any existing error messages
        setPasswordError(''); // Clear any existing password error messages

         // Assuming 'event.currentTarget' is your form element
      if (!event.currentTarget.checkValidity()) {
        // If form is not valid, the browser will display the error messages
        return;
      }
      
        const data = new FormData(event.currentTarget);
      
        let username = data.get('username');
        let email = data.get('email');
        let pass = data.get('pass');
        let repeatPass = data.get('repeatPass');
        let code = data.get('code');
        let studentyear = data.get('year');
      
        // Check if the passwords match
        if (pass !== repeatPass) {
          setPasswordError("Passwords do not match.");
          return;
        }
      
          else{
            // Run the DB call asynchronously
          runDBCallAsync(`/api/register?&username=${username}&email=${email}&pass=${pass}&code=${code}&year=${studentyear}`);
            window.location.href = '/'; // Redirect to dashboard
              
          };
      };
      
  return (
    <div className="modal-background">
      <div className="modal-container">
        <button onClick={toggleModal} className="close-modal">X</button>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Username:
            <input type="text" name="username" id="username" className="inputField" required/>
          </label>
          <br />
          <label>
            Email:
            <input type="email" name="email" id="email"  className="inputField" required/>
          </label>
          <br />
          <label>
    Password:
    <input type="password" name="pass" id="pass" className="inputField" 
           pattern=".{8,}" title="Password must be at least 8 characters long" required/>
  </label>
          <br />
          <label>
            Repeat Password:
            <input type="password" name="repeatPass" id="repeatPass" className="inputField" required/>
            {passwordError && <div className="error-message">{passwordError}</div>}
          </label>
          <br />
          <label>
            Course Code:
            <input type="text" name="code" id="code" className="inputField" required/>
          </label>
          <br />
          <label>
  Year:
  <select name="year" id="year" className="inputField" required>
    <option value="">Select Year</option>
    <option value="1">Year 1</option>
    <option value="2">Year 2</option>
    <option value="3">Year 3</option>
    <option value="4">Year 4</option>
  </select>
</label>
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
};