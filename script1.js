const API_URL = 'http://localhost:3000';

let authToken = null;
let editingTodoId = null; // Stores the ID of the todo being edited

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
        alert('Registration successful');
    } else {
        alert(data.error);
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
        authToken = data.token;
        document.cookie = `authToken=${authToken}`;
        document.getElementById('auth').style.display = 'none';
        document.getElementById('todoApp').style.display = 'block';
        loadTodos();
    } else {
        alert(data.error);
    }
});

document.getElementById('todoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('todoTitle').value;
    const description = document.getElementById('todoDescription').value;
    const completed = document.querySelector('input[name="completed"]:checked')?.value || "false";

    if (editingTodoId) {
       
        editTodo(editingTodoId, title, description, completed);
    } else {
        const response = await fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({ title, description, completed }),
        });

        const data = await response.json();
        if (response.ok) {
            addTodoToDOM(data);
        } else {
            alert('Failed to create todo');
        }
    }

    document.getElementById('todoForm').reset();
    editingTodoId = null;
});

async function loadTodos() {
    const response = await fetch(`${API_URL}/todos`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    });

    const data = await response.json();
    if (response.ok) {
        document.getElementById('todoList').innerHTML = '';
        data.forEach(todo => addTodoToDOM(todo));
    } else {
        alert('Failed to load todos');
    }
}

function addTodoToDOM(todo) {
    const li = document.createElement('li');
    li.innerHTML = `
        <div>
            <strong>${todo.title}</strong>
            <p>${todo.description}</p>
            <p><strong>Completed:</strong> ${todo.completed}</p>
        </div>
        <button onclick="populateTodoForm(${todo.id})">Edit</button>
        <button onclick="deleteTodo(${todo.id})">Delete</button>
    `;
    document.getElementById('todoList').appendChild(li);
}

async function deleteTodo(id) {
    const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    });

    if (response.ok) {
        loadTodos();
    } else {
        alert('Failed to delete todo');
    }
}

async function populateTodoForm(id) {
    const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    });

    const data = await response.json();
    if (response.ok) {
        document.getElementById('todoTitle').value = data.title;
        document.getElementById('todoDescription').value = data.description;
       
        document.querySelector(`input[name="completed"][value="${data.completed}"]`).checked = true;
        editingTodoId = id;
        
    } else {
        alert('Failed to load todo');
    }
}

async function editTodo(id, title, description, completed) {
   // alert("edit");
    const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ title, description, completed }),
    });

    if (response.ok) {
        loadTodos();
        document.getElementById('todoForm').reset();
        editingTodoId = null;
    } else {
        alert('Failed to update todo');
    }
}