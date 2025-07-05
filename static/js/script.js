// static/js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Function to append a message to the chat box
    function appendMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        // Add specific class for user or bot messages for styling
        if (sender === 'user') {
            messageElement.classList.add('user-message');
            messageElement.textContent = `You: ${message}`;
        } else {
            messageElement.classList.add('bot-message');
            messageElement.textContent = `Bot: ${message}`;
        }
        chatBox.appendChild(messageElement); // Add message to the chat box
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom to show latest message
    }

    // Function to send a message to the Flask backend
    async function sendMessage() {
        const message = userInput.value.trim(); // Get user input, remove leading/trailing whitespace
        if (message === '') {
            return; // Don't send empty messages
        }

        appendMessage('user', message); // Display user's message immediately
        userInput.value = ''; // Clear the input field

        try {
            // Send message to Flask backend via POST request
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Indicate JSON body
                },
                body: JSON.stringify({ message: message }) // Send message as JSON
            });

            if (!response.ok) { // Check if the HTTP response was successful (e.g., 200 OK)
                // If response is not OK, throw an error to be caught by the catch block
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json(); // Parse the JSON response from the bot
            appendMessage('bot', data.response); // Display bot's response
        } catch (error) {
            console.error('Error sending message:', error);
            appendMessage('bot', 'Sorry, something went wrong. Please try again.'); // Display user-friendly error
        }
    }

    // Event listener for the Send button click
    sendButton.addEventListener('click', sendMessage);

    // Event listener for the Enter key press in the input field
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Initial greeting from the bot when the page loads
    appendMessage('bot', 'Hello! How can I help you today?');
});