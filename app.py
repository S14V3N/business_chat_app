from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'

socketio = SocketIO(app)

online_users = set()


@app.route('/')
def home():
    return render_template('index.html')

@socketio.on('join')
def handle_join(data):

    username = data['username']

    online_users.add(username)

    emit('user_list', list(online_users), broadcast=True)

    emit('system_message', {
        'message': f'{username} joined the chat',
        'time': datetime.now().strftime('%H:%M')
    }, broadcast=True)


@socketio.on('send_message')
def handle_message(data):

    emit('receive_message', {
        'username': data['username'],
        'message': data['message'],
        'time': datetime.now().strftime('%H:%M')
    }, broadcast=True)


@socketio.on('typing')
def handle_typing(data):

    emit('show_typing', data, broadcast=True, include_self=False)


if __name__ == '__main__':
    socketio.run(app)