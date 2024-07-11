let socket = io();

function scrollToBottom() {
  let messages = document.querySelector('#messages').lastElementChild;
  messages.scrollIntoView();
}

function removeUser(userIdToRemove) {
  socket.emit('removeUser', userIdToRemove);
}

socket.on('connect', function() {
  let searchQuery = window.location.search.substring(1);
  let params = JSON.parse('{"' + decodeURI(searchQuery).replace(/&/g, '","').replace(/\+/g, ' ').replace(/=/g,'":"') + '"}');

  socket.emit('join', params, function(err) {
    if(err){
      alert(err);
      window.location.href = '/';
    }else {
      console.log('No Error');
    }
  })
});

socket.on('disconnect', function() {
  console.log('disconnected from server.');
});

socket.on('updateRoomsList', function (rooms) {
  let roomsList = document.querySelector('#rooms');

  if(rooms.length === 0) {
    console.log('here')
    let span = document.createElement('span');
    span.innerHTML = "No Rooms available now"
    roomsList.appendChild(span);
  }
  rooms.forEach(function (room) {
    let div = document.createElement('div');
    div.classList.add('room');

    let span = document.createElement('span');
    span.innerHTML = room.room;

    let button = document.createElement('button');
    button.innerHTML = 'Connect';
    button.onclick = function() {
      let name = prompt("Enter your display name:");
      if (name) {
        window.location.href = `/chat.html?name=${encodeURIComponent(name)}&room=${encodeURIComponent(room.room)}`;
      }
    };

    div.appendChild(span);
    div.appendChild(button);
    roomsList.appendChild(div);
  });
});

socket.on('userRemoved', function(data) {
  alert(data.message);
  window.location.href = data.redirect; 
});



socket.on('updateUsersList', function(users) {
  let ol = document.createElement('ol');
  users.forEach(function(user) {
    let li = document.createElement('li');
    li.textContent = user.name;

    if (user.roomsOwner && user.id === socket.id) {
      li.textContent += ' (Room Owner)';
    } else if (!user.roomsOwner && user.id !== socket.id) {
      let button = document.createElement('button');
      button.innerHTML = 'Delete';
      button.onclick = function() {
        removeUser(user.id);
      };
      li.appendChild(button);
    }

    ol.appendChild(li);
  });

  let usersList = document.querySelector('#users');
  usersList.innerHTML = "";
  usersList.appendChild(ol);
});

socket.on('newMessage', function(message) {
  const formattedTime = moment(message.createdAt).format('LT');
  const template = document.querySelector('#message-template').innerHTML;
  const html = Mustache.render(template, {
    from: message.from,
    text: message.text,
    createdAt: formattedTime
  });

  const div = document.createElement('div');
  div.innerHTML = html

  document.querySelector('#messages').appendChild(div);
  scrollToBottom();
});

socket.on('newLocationMessage', function(message) {
  const formattedTime = moment(message.createdAt).format('LT');
  console.log("newLocationMessage", message);

  const template = document.querySelector('#location-message-template').innerHTML;
  const html = Mustache.render(template, {
    from: message.from,
    url: message.url,
    createdAt: formattedTime
  });

  const div = document.createElement('div');
  div.innerHTML = html

  document.querySelector('#messages').appendChild(div);
  scrollToBottom();
});

document.querySelector('#submit-btn').addEventListener('click', function(e) {
  e.preventDefault();

  socket.emit("createMessage", {
    text: document.querySelector('input[name="message"]').value
  }, function() {
    document.querySelector('input[name="message"]').value = '';
  })
})

document.querySelector('#send-location').addEventListener('click', function(e) {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser.')
  }

  navigator.geolocation.getCurrentPosition(function(position) {
    socket.emit('createLocationMessage', {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    })
  }, function() {
    alert('Unable to fetch location.')
  })
});