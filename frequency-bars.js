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
  
  const styles = getComputedStyle(document.documentElement);
  const noteBg = styles.getPropertyValue('--note-bg').trim() || '#ecf0f1';
  const activeColor = styles.getPropertyValue('--active-color').trim() || '#e74c3c';
  
  for (var i = 0; i < length; i += 1) {
    const isActiveBar = data[i] > this.$canvas.height * 0.7;
    this.canvasContext.fillStyle = isActiveBar ? activeColor : noteBg;
    this.canvasContext.fillRect(
      i * (width + 0.5),
      this.$canvas.height - data[i],
      width,
      data[i]
    );
  }
};