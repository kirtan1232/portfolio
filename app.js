const Application = function () {
  this.initA4();
  this.tuner = new Tuner(this.a4);
  this.notes = new Notes(".notes", this.tuner);
  this.meter = new Meter(".meter");
  this.frequencyBars = new FrequencyBars(".frequency-bars");
  this.update({
    name: "A",
    frequency: this.a4,
    octave: 4,
    value: 69,
    cents: 0,
  });
  
  this.guitarStrings = {
    "E2": { value: 16 * 12 + 4, octave: 2, name: "E", frequency: 82.41 },
    "A2": { value: 17 * 12 + 9, octave: 2, name: "A", frequency: 110.00 },
    "D3": { value: 18 * 12 + 2, octave: 3, name: "D", frequency: 146.83 },
    "G3": { value: 19 * 12 + 7, octave: 3, name: "G", frequency: 196.00 },
    "B3": { value: 20 * 12 + 11, octave: 3, name: "B", frequency: 246.94 },
    "E4": { value: 21 * 12 + 4, octave: 4, name: "E", frequency: 329.63 }
  };
  
  this.currentString = null;
  this.successSound = new Audio("success.mp3");
  this.initTheme();
};

Application.prototype.initTheme = function() {
  this.themeToggle = document.querySelector('.theme-toggle');
  this.currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', this.currentTheme);
  this.themeToggle.textContent = this.currentTheme === 'light' ? '🌓' : '☀️';
  this.themeToggle.addEventListener('click', () => {
    this.toggleTheme();
  });
};

Application.prototype.toggleTheme = function() {
  this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', this.currentTheme);
  localStorage.setItem('theme', this.currentTheme);
  this.themeToggle.textContent = this.currentTheme === 'light' ? '🌓' : '☀️';
  this.frequencyBars.update(this.frequencyData || new Uint8Array(0));
};

Application.prototype.initA4 = function () {
  this.$a4 = document.querySelector(".a4 span");
  this.a4 = parseInt(localStorage.getItem("a4")) || 440;
  this.$a4.innerHTML = this.a4;
};

Application.prototype.start = function () {
  const self = this;

  this.tuner.onNoteDetected = function (note) {
    if (self.notes.isAutoMode) {
      if (self.lastNote === note.name) {
        self.update(note);
        
        if (self.currentString) {
          const targetNote = self.guitarStrings[self.currentString];
          if (note.name === targetNote.name && 
              note.octave === targetNote.octave && 
              Math.abs(note.cents) < 10) {
            self.playSuccessSound();
          }
        }
      } else {
        self.lastNote = note.name;
      }
    }
  };

  swal.fire("Welcome to Guitar Tuner!").then(function () {
    self.tuner.init();
    self.frequencyData = new Uint8Array(self.tuner.analyser.frequencyBinCount);
  });

  this.$a4.addEventListener("click", function () {
    swal
      .fire({ input: "number", inputValue: self.a4 })
      .then(function ({ value: a4 }) {
        if (!parseInt(a4) || a4 === self.a4) {
          return;
        }
        self.a4 = a4;
        self.$a4.innerHTML = a4;
        self.tuner.middleA = a4;
        self.notes.createNotes();
        self.update({
          name: "A",
          frequency: self.a4,
          octave: 4,
          value: 69,
          cents: 0,
        });
        localStorage.setItem("a4", a4);
      });
  });

  document.querySelectorAll('.guitar-string').forEach(button => {
    button.addEventListener('click', function() {
      const noteId = this.dataset.note;
      if (self.currentString === noteId) {
        // Toggle off if clicking the same string
        self.currentString = null;
        this.classList.remove('active');
      } else {
        const targetNote = self.guitarStrings[noteId];
        self.highlightString(noteId, true);
        self.currentString = noteId;
        self.update(targetNote);
      }
    });
  });

  this.updateFrequencyBars();

  document.querySelector(".auto input").addEventListener("change", () => {
    this.notes.toggleAutoMode();
    if (!this.notes.isAutoMode) {
      this.currentString = null;
      document.querySelectorAll('.guitar-string').forEach(btn => {
        btn.classList.remove('active');
      });
    }
  });
};

Application.prototype.highlightString = function(noteId, active) {
  document.querySelectorAll('.guitar-string').forEach(btn => {
    btn.classList.remove('active');
  });
  if (active) {
    document.querySelector(`.guitar-string[data-note="${noteId}"]`).classList.add('active');
  }
};

Application.prototype.playSuccessSound = function() {
  try {
    this.successSound.currentTime = 0;
    this.successSound.play().catch(() => {});
  } catch (e) {
    console.log("\x07");
  }
};

Application.prototype.updateFrequencyBars = function () {
  if (this.tuner.analyser) {
    this.tuner.analyser.getByteFrequencyData(this.frequencyData);
    this.frequencyBars.update(this.frequencyData);
  }
  requestAnimationFrame(this.updateFrequencyBars.bind(this));
};

Application.prototype.update = function (note) {
  this.notes.update(note);
  this.meter.update((note.cents / 50) * 45);
};

const app = new Application();
app.start();