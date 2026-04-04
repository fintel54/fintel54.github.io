class Todo {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    this.term = "";
    this.listEl = document.getElementById("todo-list");
  }

  save() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
  }

  formatDate(dateStr) {
    if (!dateStr) return "";
    return dateStr.replace("T", " ");
  }

  add(text, date) {
    if (text.length < 3 || text.length > 255) return;

    if (date) {
      const now = new Date();
      if (new Date(date) <= now) return;
    }

    this.tasks.push({ text, date });
    this.save();
    this.draw();
  }

  remove(index) {
    this.tasks.splice(index, 1);
    this.save();
    this.draw();
  }

  edit(index, newText, newDate) {
    if (newText.length < 3 || newText.length > 255) return;

    if (newDate) {
      const now = new Date();
      if (new Date(newDate) <= now) return;
    }

    this.tasks[index].text = newText;
    this.tasks[index].date = newDate;

    this.save();
    this.draw();
  }

  get filteredTasks() {
    if (this.term.length < 2) return this.tasks;

    return this.tasks.filter(t =>
      t.text.toLowerCase().includes(this.term.toLowerCase())
    );
  }

  highlight(text) {
    if (this.term.length < 2) return text;

    const regex = new RegExp(`(${this.term})`, "gi");
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  draw() {
    this.listEl.innerHTML = "";

    this.filteredTasks.forEach(task => {
      const realIndex = this.tasks.indexOf(task); // 🔥 ważne przy filtrowaniu

      const li = document.createElement("li");

      li.innerHTML = `
                <span class="task-text">${this.highlight(task.text)}</span>
                ${task.date ? `<small> (${this.formatDate(task.date)})</small>` : ""}
                <button class="delete">🗑</button>
            `;

      // ===== USUWANIE =====
      li.querySelector(".delete").addEventListener("click", (e) => {
        e.stopPropagation();
        this.remove(realIndex);
      });

      // ===== EDYCJA =====
      li.addEventListener("click", () => {
        const textInput = document.createElement("input");
        textInput.value = task.text;

        const dateInput = document.createElement("input");
        dateInput.type = "datetime-local";
        dateInput.value = task.date || "";

        li.innerHTML = "";
        li.appendChild(textInput);
        li.appendChild(dateInput);

        textInput.focus();

        let insideClick = false;

        li.addEventListener("mousedown", () => {
          insideClick = true;
        });

        document.addEventListener("mousedown", () => {
          insideClick = false;
        });

        const trySave = () => {
          setTimeout(() => {
            if (!insideClick && !li.contains(document.activeElement)) {
              this.edit(realIndex, textInput.value, dateInput.value);
            }
          }, 150);
        };

        textInput.addEventListener("blur", trySave);
        dateInput.addEventListener("blur", trySave);
      });

      this.listEl.appendChild(li);
    });
  }
}

// ===== INIT =====
const todo = new Todo();
document.todo = todo;

todo.draw();

// ===== EVENTY =====

// dodawanie
document.getElementById("add-btn").addEventListener("click", () => {
  const text = document.getElementById("task-input").value;
  const date = document.getElementById("date-input").value;

  todo.add(text, date);

  document.getElementById("task-input").value = "";
  document.getElementById("date-input").value = "";
});

// wyszukiwarka
document.getElementById("search").addEventListener("input", (e) => {
  todo.term = e.target.value;
  todo.draw();
});
