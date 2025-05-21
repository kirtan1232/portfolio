const FrequencyBars = function (selector) {
  this.$canvas = document.querySelector(selector);
  this.$canvas.width = document.body.clientWidth;
  this.$canvas.height = document.body.clientHeight / 2;
  this.canvasContext = this.$canvas.getContext("2d");
};

FrequencyBars.prototype.update = function (data) {
  const length = 64;
  const width = this.$canvas.width / length - 0.5;
  this.canvasContext.clearRect(0, 0, this.$canvas.width, this.$canvas.height);
  
  // Get the current theme's note background color
  const noteBg = getComputedStyle(document.documentElement)
    .getPropertyValue('--note-bg').trim() || '#ecf0f1';
  
  for (var i = 0; i < length; i += 1) {
    this.canvasContext.fillStyle = noteBg;
    this.canvasContext.fillRect(
      i * (width + 0.5),
      this.$canvas.height - data[i],
      width,
      data[i]
    );
  }
};