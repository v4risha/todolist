import { useEffect, useMemo, useState } from "react";
import "./App.css";

const TASKS_KEY = "todo-10-app";
const THEME_KEY = "todo-theme";

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(TASKS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    return savedTheme || "light";
  });

  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editingDate, setEditingDate] = useState("");

  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 2200);
    return () => clearTimeout(timer);
  }, [message]);

  const today = new Date().toISOString().split("T")[0];

  const sortedTasks = useMemo(() => {
    let list = [...tasks];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((task) => task.text.toLowerCase().includes(q));
    }

    if (filter === "active") {
      list = list.filter((task) => !task.completed);
    }

    if (filter === "completed") {
      list = list.filter((task) => task.completed);
    }

    if (filter === "today") {
      list = list.filter((task) => task.dueDate === today);
    }

    list.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed - b.completed;
      }

      if (a.dueDate && b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }

      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;

      return b.id - a.id;
    });

    return list;
  }, [tasks, search, filter, today]);

  const addTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      id: Date.now(),
      text: title.trim(),
      dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setTitle("");
    setDueDate("");
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    setMessage("Task deleted");
  };

  const clearCompleted = () => {
    const count = tasks.filter((task) => task.completed).length;

    if (!count) {
      setMessage("No completed tasks to clear");
      return;
    }

    setTasks((prev) => prev.filter((task) => !task.completed));
    setMessage(`Cleared ${count} completed task${count > 1 ? "s" : ""}`);
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditingText(task.text);
    setEditingDate(task.dueDate || "");
  };

  const saveEdit = (id) => {
    if (!editingText.trim()) return;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              text: editingText.trim(),
              dueDate: editingDate,
            }
          : task
      )
    );

    setEditingId(null);
    setEditingText("");
    setEditingDate("");
    setMessage("Task updated");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
    setEditingDate("");
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const remaining = total - completed;

  const isOverdue = (task) =>
    !task.completed && task.dueDate && task.dueDate < today;

  const formatDate = (date) => {
    if (!date) return "No date";
    const d = new Date(date + "T00:00:00");
    return d.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="page">
      <div className="app">
        <header className="header">
          <div>
            <h1>Tasks</h1>
            <p>A clear, focused to-do list for everyday use.</p>
          </div>

          <div className="header-right">
            <button className="theme-toggle" type="button" onClick={toggleTheme}>
              {theme === "light" ? "Dark mode" : "Light mode"}
            </button>

            <div className="stats">
              <div className="stat-box">
                <span>Total</span>
                <strong>{total}</strong>
              </div>
              <div className="stat-box">
                <span>Remaining</span>
                <strong>{remaining}</strong>
              </div>
              <div className="stat-box">
                <span>Completed</span>
                <strong>{completed}</strong>
              </div>
            </div>
          </div>
        </header>

        <form className="task-form" onSubmit={addTask}>
          <input
            type="text"
            placeholder="Add a task"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <button type="submit">Add task</button>
        </form>

        <section className="toolbar">
          <input
            className="search-input"
            type="text"
            placeholder="Search tasks"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="filters">
            <button
              className={filter === "all" ? "filter active" : "filter"}
              onClick={() => setFilter("all")}
              type="button"
            >
              All
            </button>
            <button
              className={filter === "active" ? "filter active" : "filter"}
              onClick={() => setFilter("active")}
              type="button"
            >
              Active
            </button>
            <button
              className={filter === "completed" ? "filter active" : "filter"}
              onClick={() => setFilter("completed")}
              type="button"
            >
              Completed
            </button>
            <button
              className={filter === "today" ? "filter active" : "filter"}
              onClick={() => setFilter("today")}
              type="button"
            >
              Today
            </button>
          </div>

          <button className="clear-btn" onClick={clearCompleted} type="button">
            Clear completed
          </button>
        </section>

        <section className="list">
          {sortedTasks.length === 0 ? (
            <div className="empty-state">
              <h2>No tasks found</h2>
              <p>Add a task or try a different filter.</p>
            </div>
          ) : (
            sortedTasks.map((task) => (
              <div
                key={task.id}
                className={`task-card ${task.completed ? "completed" : ""}`}
              >
                {editingId === task.id ? (
                  <div className="edit-row">
                    <input
                      className="edit-input"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(task.id);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      autoFocus
                    />
                    <input
                      className="edit-date"
                      type="date"
                      value={editingDate}
                      onChange={(e) => setEditingDate(e.target.value)}
                    />
                    <button
                      className="small-btn dark"
                      type="button"
                      onClick={() => saveEdit(task.id)}
                    >
                      Save
                    </button>
                    <button
                      className="small-btn light"
                      type="button"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <label className="task-main">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                      />

                      <div className="task-content">
                        <div className="task-top">
                          <h3>{task.text}</h3>

                          {task.dueDate && (
                            <span
                              className={
                                isOverdue(task) ? "date-tag overdue" : "date-tag"
                              }
                            >
                              {isOverdue(task)
                                ? `Overdue · ${formatDate(task.dueDate)}`
                                : formatDate(task.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </label>

                    <div className="task-actions">
                      <button
                        className="small-btn light"
                        type="button"
                        onClick={() => startEdit(task)}
                      >
                        Edit
                      </button>
                      <button
                        className="small-btn dark"
                        type="button"
                        onClick={() => deleteTask(task.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </section>

        {message && <div className="message">{message}</div>}
      </div>
    </div>
  );
}

export default App;