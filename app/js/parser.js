var Parser = function () {
  this.utils = {
    /* tokenizeMargin accepts a value like "35px" and returns the parsed float
       value and the units it is in. */
    tokenizeMargin: function (val) {
      if (/px/.test(val)) {
        return {
          value: parseFloat(val.replace(/[^0-9]/g, "")),
          type: "px"
        };
      } else if (/\%/.test(val)) {
        return {
          value: parseFloat(val.replace(/[^0-9]/g, "")),
          type: "px"
        };
      }
    },

    /* this gets the margin attribute from the STYLE variable in manifest.json. */
    getMargin: function (tag, position) {
      var val = STYLE.tags[tag];
      return this.tokenizeMargin(val["margin-" + position] || "0px");
    },

    /* this gets the height of text from the font-size in px. */
    getHeight: function (tag) {
      var val = STYLE.tags[tag]["font-size"];
      return this.tokenizeMargin(val);
    },

    getAttr: function (tag, attr, def_val) {
      return STYLE.tags[tag][attr] || def_val;
    },

    /* recurse through the tree and add a parent and sibling to each node
       to make it easy to traverse though once constructing and rendering the HTML. */
    addParents: function (tree, parent, recursion) {
      tree.forEach((function (o, i) {
        o.parent = parent || null;
        o.next = tree[i + 1] || null;

        if (typeof o.children !== "undefined") {
          recursion.start();
          this.addParents(o.children, o, recursion);
        }
      }).bind(this));

      recursion.finish();
    },

    /* start with a call stack of zero, for each new function increase the counter.
       if a function ends, decrease the counter. Once it hits -1 all are done. */
    RecursionCounter: function (callback) {
      var counter = 0;

      return {
        start: function () {
          counter++;
        },
        finish: function () {
          counter--;
          if (counter === -1) { this.end(); }
        },
        end: function () {
          callback();
        }
      };
    },

    /* This iterates through the tree and provides a callback for drawing. */
    iterate: function (tree, coords, callback) {
      var pointer = tree,
          height = 0,
          left = 0,
          $this = this;

      var actions = {
        deeperLevel: function (pointer) {
          if (pointer.seen) return false;
          else {
            pointer.seen = true;
            if (pointer.children) {
              left += $this.getMargin(pointer.type, "left").value;
              return pointer.children[0];
            } else return false;
          }
        },

        nextSibling: function (pointer) {
          return (pointer.next) ? pointer.next : false;
        },

        shallowerLevel: function (pointer) {
          if (pointer && pointer.parent) {
            left -= $this.getMargin(pointer.parent.type, "left").value;
            height += $this.getMargin(pointer.parent.type, "bottom").value;
            return pointer.parent;
          } else return false;
        }
      };

      while (pointer) {
        pointer = actions.deeperLevel(pointer) || actions.nextSibling(pointer) || actions.shallowerLevel(pointer);

        if (!pointer.seen && pointer) {
          height += this.getMargin(pointer.type, "top").value;
          if (pointer.text.length > 0) {
            height += this.getHeight(pointer.type).value * this.getAttr(pointer.type, "line-height", 1);
          }
          height += callback(coords, pointer, height, left) || 0;
        }
      }
    },

    getLevel: function (line) {
      var x = 0;
      while (line[x] && line.charCodeAt(x) == 32) {
        x++;
      }

      return x;
    },

    replaceSpacing: function (line) {
      return line.replace(/^(\s)+/g, "");
    },

    parseLine: function (line) {
      line = line.split(/\~/g);
      var _meta = line[0],
          html = line[1] || "";

      _meta = _meta.split(/\./g);

      var tagName = _meta[0];
      var className = _meta[1] || "";

      return {
        tag: tagName,
        class: className,
        text: html
      };
    },

    last: function (arr) {
      return arr[arr.length - 1];
    },

    lineDifferential: function (meta, newLevel, spaces) {
      var diff = (newLevel - meta.level) / spaces;
      meta.level = newLevel;

      return diff;
    },

    parse: function (input) {
      var $this = this;

      var DOCUMENT = {
        "type": "document",
        "children": []
      },
          meta = {
            level: -2,
            levels: [DOCUMENT]
          },
          diff;

      input = input.split(/\n/g);
      input.forEach(function (line) {
        if ($this.replaceSpacing(line).length > 0) {
          diff = $this.lineDifferential(meta, $this.getLevel(line), 2);
          $this.addToStructure(line, meta, diff);
        }
      });

      return DOCUMENT;
    },

    addToStructure: function (line, meta, diff) {
      var node;

      line = this.replaceSpacing(line);
      var parsed = this.parseLine(line);

      if (diff > 0) {
        node = {
          type: parsed.tag,
          class: parsed.class,
          text: parsed.text,
          children: []
        };
        this.last(meta.levels).children.push(node);
        meta.levels.push(node);
      } else {
        // pop a layer if the same, and one for each new layer
        for (var x = 0; x <= Math.abs(diff); x++) {
          meta.levels.pop();
        }

        node = {
          type: parsed.tag,
          class: parsed.class,
          text: parsed.text,
          children: []
        };
        this.last(meta.levels).children.push(node);
        meta.levels.push(node);
      }
    }
  };
};

Parser.prototype = {
  render: function (tree, coords, callback) {
    var recursion = this.utils.RecursionCounter((function () {
      this.utils.iterate(tree, coords, callback);
    }).bind(this));

    this.utils.addParents(tree.children, tree, recursion);
  },
  parse: function (input) {
    return this.utils.parse(input);
  }
};
