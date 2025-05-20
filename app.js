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
  
  // Guitar standard tuning notes (EADGBE)
  this.guitarStrings = {
    "E2": { value: 16 * 12 + 4, octave: 2, name: "E", frequency: 82.41 },  // Low E (6th string)
    "A2": { value: 17 * 12 + 9, octave: 2, name: "A", frequency: 110.00 }, // A (5th string)
    "D3": { value: 18 * 12 + 2, octave: 3, name: "D", frequency: 146.83 }, // D (4th string)
    "G3": { value: 19 * 12 + 7, octave: 3, name: "G", frequency: 196.00 }, // G (3rd string)
    "B3": { value: 20 * 12 + 11, octave: 3, name: "B", frequency: 246.94 }, // B (2nd string)
    "E4": { value: 21 * 12 + 4, octave: 4, name: "E", frequency: 329.63 }  // High E (1st string)
  };
  
  this.currentString = null;
  this.successSound = document.getElementById("successSound");
  this.successSound = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");
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
        
        // Check if current guitar string is in tune
        if (self.currentString) {
          const targetNote = self.guitarStrings[self.currentString];
          if (note.name === targetNote.name && 
              note.octave === targetNote.octave && 
              Math.abs(note.cents) < 10) {
            self.playSuccessSound();
            self.highlightString(self.currentString, false);
            self.currentString = null;
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

  // Add guitar string button handlers
  document.querySelectorAll('.guitar-string').forEach(button => {
    button.addEventListener('click', function() {
      const noteId = this.dataset.note;
      const targetNote = self.guitarStrings[noteId];
      
      // Highlight the selected string
      self.highlightString(noteId, true);
      
      // Set current string to check against
      self.currentString = noteId;
      
      // Show the target note
      self.update(targetNote);
      
    
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
    // Fallback to simple beep
    console.log("\x07"); // ASCII bell character
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