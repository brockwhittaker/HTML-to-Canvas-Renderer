/*

body
  div
    h1~Some title text.
    h3~This is a subtitle.
  div
    p~The quick brown fox jumped over the lazy dog.
    p~Here's a second paragraph, that should have no real margin.
    h1~Whereas this one has margin.

This is an example of what the above html turns into in object form.

{
  "type": "body",
  "class": "",
  "text": "",
  "children": [
    {
      "type": "div",
      "class": "",
      "text": "",
      "children": [
        {
          "type": "h1",
          "class": "",
          "text": "Some title text."
        },
        {
          "type": "h3",
          "class": "red",
          "text": "This is a subtitle."
        }
      ]
    },
    {
      "type": "div",
      "class": "",
      "text": "",
      "children": [
        {
          "type": "p",
          "class": "",
          "text": "The quick brown fox jumped over the lazy dog."
        },
        {
          "type": "p",
          "class": "",
          "text": "Here's a second paragraph, that should have no real margin."
        },
        {
          "type": "h1",
          "class": "",
          "text": "Whereas this one has margin."
        }
      ]
    }
  ]
}
*/
var STYLE = {
  "tags": {
    "document": {
      "color": "#444"
    },
    "body": {
      "font-family": "Roboto",
      "font-size": 12,
      "font-weight": 300,
      "margin-top": 0
    },
    "div": {
      "font-family": "Roboto",
      "font-size": 12,
      "font-weight": 300,
      "margin-top": 20,
      "margin-left": 20,
      "margin-bottom": 20
    },
    "h1": {
      "font-family": "Roboto",
      "font-size": 24,
      "font-weight": 800,
      "margin-top": 0
    },
    "h3": {
      "font-family": "Roboto",
      "font-size": 16,
      "font-weight": 800,
      "margin-top": 20,
    },
    "p": {
      "font-family": "Roboto",
      "font-size": 12,
      "font-weight": 400,
      "margin-top": 0,
      "line-height": 1
    },
    "span": {
      "font-family": "Roboto",
      "font-size": 12,
      "font-weight": 400,
      "margin-top": 0
    },
    "br": {
      "margin-top": 12
    }
  },
  "class": {
    "red": {
      "color": "red"
    },
    "thin": {
      "font-weight": 200
    },
    "light": {
      "font-weight": 300
    },
    "thick": {
      "font-weight": 600
    },
    "fs-large": {
      "font-size": 48
    },
    "fs-small": {
      "font-size": 9
    },
    "half-margin": {
      "margin-top": 6
    }
  },
  "meta": {
    "scale": 4
  }
};
