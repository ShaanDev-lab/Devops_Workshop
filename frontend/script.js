document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');

    async function fetchTasks() {
        try {
            const response = await fetch('/api/tasks');
            if (!response.ok) throw new Error('Failed to fetch tasks');
            const tasks = await response.json();
            renderTasks(tasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }

    function renderTasks(tasks) {
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = task.completed ? 'completed' : '';
            li.innerHTML = `
                <span class="task-title">${escapeHtml(task.title)}</span>
                <div class="task-actions">
                    <button class="toggle-btn" data-id="${task.id}">
                        ${task.completed ? 'Undo' : 'Done'}
                    </button>
                    <button class="delete-btn" data-id="${task.id}">Delete</button>
                </div>
            `;
            taskList.appendChild(li);
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = taskInput.value.trim();
        if (!title) return;

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title }),
            });
            if (!response.ok) throw new Error('Failed to create task');

            taskInput.value = '';
            fetchTasks();
        } catch (error) {
            console.error('Error creating task:', error);
        }
    });

    taskList.addEventListener('click', async (e) => {
        const target = e.target;
        const li = target.closest('li');

        if (!li) return;

        if (target.classList.contains('toggle-btn')) {
            const id = parseInt(target.dataset.id, 10);
            try {
                const response = await fetch(`/api/tasks/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ completed: !li.classList.contains('completed') }),
                });
                if (!response.ok) throw new Error('Failed to update task');
                fetchTasks();
            } catch (error) {
                console.error('Error updating task:', error);
            }
        }

        if (target.classList.contains('delete-btn')) {
            const id = parseInt(target.dataset.id, 10);
            if (confirm('Are you sure you want to delete this task?')) {
                try {
                    const response = await fetch(`/api/tasks/${id}`, {
                        method: 'DELETE',
                    });
                    if (!response.ok) throw new Error('Failed to delete task');
                    fetchTasks();
                } catch (error) {
                    console.error('Error deleting task:', error);
                }
            }
        }
    });

    fetchTasks();
});
