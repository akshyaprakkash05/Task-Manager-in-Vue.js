const { createApp } = Vue;

createApp({
  data() {
    return {
      tasks: JSON.parse(localStorage.getItem("tasks") || "[]"),
      taskInput: '',
      projectInput: '',
      searchInput: '',
      commonCountdown: 25 * 60,
      commonInterval: null
    };
  },
  computed: {
    formattedCommonTime() {
      const min = Math.floor(this.commonCountdown / 60);
      const sec = this.commonCountdown % 60;
      return `${this.pad(min)}:${this.pad(sec)}`;
    },
    filteredTasks() {
      const keyword = this.searchInput.toLowerCase();
      return this.tasks.filter(task => task.name.toLowerCase().includes(keyword));
    },
    groupedTasks() {
      const grouped = {};
      this.filteredTasks.forEach(task => {
        if (!grouped[task.date]) grouped[task.date] = [];
        grouped[task.date].push(task);
      });
      return grouped;
    }
  },
  methods: {
    pad(n) {
      return n < 10 ? "0" + n : String(n);
    },
    formatDate(dateStr) {
      const today = new Date();
      const inputDate = new Date(dateStr);
      const diff = today.getDate() - inputDate.getDate();
      if (diff === 0) return "Today";
      if (diff === 1) return "Yesterday";
      return inputDate.toDateString();
    },
    formatTime(date) {
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "pm" : "am";
      hours = hours % 12 || 12;
      const mins = minutes < 10 ? "0" + minutes : minutes;
      return `${hours}:${mins}${ampm}`;
    },
    saveTasks() {
      localStorage.setItem("tasks", JSON.stringify(this.tasks));
    },
    addTask() {
      const name = this.taskInput.trim();
      const project = this.projectInput.trim();
      if (name !== "") {
        this.tasks.push({
          id: Date.now(),
          name,
          project,
          time: 0,
          completed: false,
          intervalId: null,
          startTime: null,
          endTime: null,
          date: new Date().toISOString().split("T")[0]
        });
        this.taskInput = "";
        this.projectInput = "";
        this.saveTasks();
      }
    },
    startTaskTimer(taskId) {
      const task = this.tasks.find(t => t.id === taskId);
      if (!task || task.intervalId !== null) return;
      task.startTime = this.formatTime(new Date());
      task.intervalId = setInterval(() => {
        task.time++;
        this.saveTasks();
      }, 1000);
    },
    stopTaskTimer(taskId) {
      const task = this.tasks.find(t => t.id === taskId);
      if (task && task.intervalId !== null) {
        clearInterval(task.intervalId);
        task.intervalId = null;
        task.endTime = this.formatTime(new Date());
        this.saveTasks();
      }
    },
    deleteTask(taskId) {
      const index = this.tasks.findIndex(t => t.id === taskId);
      if (index !== -1) {
        this.stopTaskTimer(taskId);
        this.tasks.splice(index, 1);
        this.saveTasks();
      }
    },
    startCommonTimer() {
      if (this.commonInterval) return;
      this.commonInterval = setInterval(() => {
        if (this.commonCountdown > 0) {
          this.commonCountdown--;
        } else {
          clearInterval(this.commonInterval);
          this.commonInterval = null;
          alert("⏰ Time's up!");
        }
      }, 1000);
    },
    stopCommonTimer() {
      clearInterval(this.commonInterval);
      this.commonInterval = null;
    },
    resetCommonTimer() {
      this.commonCountdown = 25 * 60;
      this.stopCommonTimer();
    }
  }
}).mount("#app");

