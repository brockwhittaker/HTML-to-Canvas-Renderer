var Sheet = function () {
  var $this = this;

  this.canvas = document.createElement("canvas");
  this.context = this.canvas.getContext("2d");

  this.canvas.width = 1700;
  this.canvas.height = 2200;

  document.body.appendChild(this.canvas);

  this.utils = {
    last: function (arr) {
      return arr[arr.length - 1];
    },

    getHeight: function (settings) {
      return settings["font-size"] * STYLE.meta.scale * (settings["line-height"] || 1);
    },

    findWrapPoints: function (text, width, max_width) {
      var strings = [],
          index = 0;

      var offset = 0,
          x = 0;

      while (text.length > 0) {
        // if the text is still longer than the max_width, then run again.
        if ($this.context.measureText(text).width > max_width) {
          strings[index] = "";

          // while the text is still too long, find a suitable substring that is less than 5px over max width..
          do {
            strings[index] += text.substr(x, 5);
            x += 5;
          } while (x < text.length && $this.context.measureText(strings[index]).width < max_width);

          // the line will usually be slightly too big. If so, slice it to the last interval (-5).
          if ($this.context.measureText(strings[index]).width > max_width) {
            x -= 5;
            strings[index].slice(0, -5);
          }

          // now trail backwards to find the nearest space.
          while (strings[index].charCodeAt(x - offset) !== 32 && (x - offset > 0)) {
            offset++;
          }

          // slice from the start to the desired space marker.
          strings[index] = strings[index].slice(0, x - offset);

          // slice at where we cut off, and remove leading space.
          text = text.slice(x - offset + 1);

          // next string index.
          index++;
          x = 0;
          offset = 0;

        // otherwise, just append the entirity left of the text as it's short enough.
        } else {
          strings.push(text);
          text = "";
        }
      }

      return strings;
    }
  };
};

Sheet.prototype = {
  define: function (text, style) {

  },
  text: function (text, x, y, style) {
    var $this = this;

    this.context.textBaseline = "bottom";
    this.context.font = style["font-weight"] + " " + style["font-size"] * STYLE.meta.scale + "px " + style["font-family"];
    this.context.fillStyle = style.color || "#000";

    var max_width = style["max-width"] || this.canvas.width - x;
    var line_width = this.context.measureText(text).width;
    var height_offset = 0;

    if (line_width > max_width) {
      var points = this.utils.findWrapPoints(text, line_width, max_width);
      points.forEach(function (line) {
        height_offset += $this.utils.getHeight(style);
        $this.context.fillText(line, x, y + height_offset);
      });
    } else {
      this.context.fillText(text, x, y);
    }

    return height_offset;
  }
};


var sheet = new Sheet();
