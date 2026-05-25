const socket = io();

let username = localStorage.getItem('username');

if(!username) {
    username = prompt('Enter username');
    localStorage.setItem('username', username);
}

socket.emit('join', {
    username: username
});

const chatBox = document.getElementById('chat-box');
const input = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const usersList = document.getElementById('users');
const typingDiv = document.getElementById('typing');

sendBtn.addEventListener('click', sendMessage);

input.addEventListener('keypress', () => {

    socket.emit('typing', {
        username: username
    });
});


function sendMessage() {

    const message = input.value;

    if(message.trim() === '') return;

    socket.emit('send_message', {
        username: username,
        message: message
    });

    input.value = '';
}

socket.on('receive_message', data => {

    const div = document.createElement('div');

    div.classList.add('message');

    div.innerHTML = `
        <div class="message-header">
            <strong>${data.username}</strong>
            <span>${data.time}</span>
        </div>

        <p>${data.message}</p>

        <button class="copy-btn">Copy</button>
    `;

    div.querySelector('.copy-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(data.message);
    });

    chatBox.appendChild(div);

    chatBox.scrollTop = chatBox.scrollHeight;

    saveHistory();
});
socket.on('system_message', data => {

    const div = document.createElement('div');

    div.classList.add('system-message');

    div.innerHTML = `
        <p>${data.message}</p>
        <span>${data.time}</span>
    `;

    chatBox.appendChild(div);
});

socket.on('user_list', users => {

    usersList.innerHTML = '';

    users.forEach(user => {

        const li = document.createElement('li');

        li.innerText = user;

        usersList.appendChild(li);
    });
});

socket.on('show_typing', data => {

    typingDiv.innerText = `${data.username} is typing...`;

    setTimeout(() => {
        typingDiv.innerText = '';
    }, 1000);
});

function saveHistory() {

    localStorage.setItem('chatHistory', chatBox.innerHTML);
}
window.onload = () => {

    const history = localStorage.getItem('chatHistory');

    if(history) {
        chatBox.innerHTML = history;
    }
}

const themeBtn = document.getElementById('theme-btn');

themeBtn.addEventListener('click', () => {

    document.body.classList.toggle('light-mode');
});