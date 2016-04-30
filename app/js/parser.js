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
          $this = this,
          container_index = 0;

      /* the three tree traversal motions:
        - deeperLevel: Go a level deeper into the tree.
        - nextSibling: Move horizontally through the tree to a sibling node.
        - shallowerLevel: Move up a level towards the base.
      */
      var actions = {
        /* If the pointer has been seen, don't revisit the node, else return
           the first child node and add to the left margin. */
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

        /* move to the next sibling unless it's the last sibling, in which case
           return false. */
        nextSibling: function (pointer) {
          return (pointer.next) ? pointer.next : false;
        },

        /* move up a level. If you can't move up any more, you are at the end of
           the tree. */
        shallowerLevel: function (pointer) {
          if (pointer && pointer.parent) {
            left -= $this.getMargin(pointer.parent.type, "left").value;
            height += $this.getMargin(pointer.parent.type, "bottom").value;
            return pointer.parent;
          } else return false;
        }
      };

      /* the pointer should exist as long as it can traverse through the tree. */
      while (pointer) {
        /* first try to go deeper (heh), then if you can't go to the next sibling (heh),
           and then if there's no deeper node and no sibling pull out. */
        pointer = actions.deeperLevel(pointer) || actions.nextSibling(pointer) || actions.shallowerLevel(pointer);

        /* if the pointer isn't visited yet but also exists..
              - this is important because some nodes get revisited because they
                have to be.
        */
        if (pointer && !pointer.seen) {
          /* if it is traversing over a root element, recenter the height and
             left offset. */
          if (pointer.parent.type == "document") {
            height = tree.containers[container_index][1];
            left = tree.containers[container_index][0];
            container_index++;
          }

          height += this.getMargin(pointer.type, "top").value;

          /* only add the height of valid lines. If there's no text, don't add
             any height. */
          if (pointer.text.length > 0) {
            height += this.getHeight(pointer.type).value * this.getAttr(pointer.type, "line-height", 1);
          }

          /* provide a callback with all the info needed to draw the line. */
          height += callback(coords, pointer, height, left) || 0;
        }
      }
    },

    /* get the current level you're on by checking the number of spaces before
       the line starts. */
    getLevel: function (line) {
      var x = 0;
      while (line[x] && line.charCodeAt(x) == 32) {
        x++;
      }

      return x;
    },

    /* when parsing the line, remove the leading whitespace first. */
    replaceSpacing: function (line) {
      return line.replace(/^(\s)+/g, "");
    },

    /* parse a line like:
         - "h2.red~Some html" => {tag: "h2", class: "red", text: "Some html"}
    */
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

    /* utility function to get last array element. */
    last: function (arr) {
      return arr[arr.length - 1];
    },

    /* figure how many levels ahead or behind the nested object is from the last. */
    lineDifferential: function (meta, newLevel, spaces) {
      var diff = (newLevel - meta.level) / spaces;
      meta.level = newLevel;

      return diff;
    },

    /* the general parse function for line-by-line parsing. */
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

      /* split input into lines by \n. */
      input = input.split(/\n/g);
      input.forEach(function (line) {
        /* if the line contains no real characters other than " ", skip. */
        if ($this.replaceSpacing(line).length > 0) {
          /* get the difference in level. */
          diff = $this.lineDifferential(meta, $this.getLevel(line), 2);
          /* add the line to the tree structure. */
          $this.addToStructure(line, meta, diff, DOCUMENT);
        }
      });

      return DOCUMENT;
    },

    /* check if a line is a new container block with new coordinate pos. */
    checkIfContainer: function (line) {
      /* check if a line starts a new container block. */
      if (/^container\{\d+,\d+\}/.test(line)) {
        /* this is a fucking mess. */
        return line
          .match(/\{\d+,\d+\}/g)[0]
          .replace(/{|}/g, "")
          .split(/,/g)
          .map(function (o) {
            return parseFloat(o);
          });
      } else return false;
    },

    /* add a single line to the tree structure. */
    addToStructure: function (line, meta, diff, DOCUMENT) {
      var node;

      /* remove the tabs -- not necessary anymore. */
      line = this.replaceSpacing(line);

      /* check if a new container block. */
      var isContainer = this.checkIfContainer(line);

      /* if it's a container, isContainer is set to an array like [x,y]. */
      if (isContainer) {
        /* push the x,y specs to the tree to retrieve later. */
        if (DOCUMENT.containers) {
          DOCUMENT.containers.push(isContainer);
        } else {
          DOCUMENT.containers = [isContainer];
        }
        /* reset back to the base level. */
        meta.levels = [DOCUMENT];
      } else {
        /* if not a container, parse the line like normal. */
        var parsed = this.parseLine(line);

        /* if the node is nested.. */
        if (diff > 0) {
          node = {
            type: parsed.tag,
            class: parsed.class,
            text: parsed.text,
            children: []
          };

          /* make the node a child of the current "pointer". */
          this.last(meta.levels).children.push(node);
          meta.levels.push(node);
        } else {
          /* pop a layer if the same, and one for each tab difference.
              - This means if you go like:
                div
                  div
                    h2
                div
                It will pop out three times back to the parent of div.
          */
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
    }
  };
};

Parser.prototype = {
  render: function (tree, coords, callback) {
    /* add the recursion mechanism for the addParents function. */
    var recursion = this.utils.RecursionCounter((function () {
      /* when the recursive addParents function is done, run the iterate
         function. */
      this.utils.iterate(tree, coords, callback);
    }).bind(this));

    /* link the parents and siblings in the object. */
    this.utils.addParents(tree.children, tree, recursion);
  },
  parse: function (input) {
    return this.utils.parse(input);
  }
};
