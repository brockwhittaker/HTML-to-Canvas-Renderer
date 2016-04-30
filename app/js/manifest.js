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
    "document": {},
    "body": {
      "font-family": "Roboto",
      "font-size": "12px",
      "font-weight": "300",
      "margin-top": "0px"
    },
    "div": {
      "font-family": "Roboto",
      "font-size": "12px",
      "font-weight": "300",
      "margin-top": "20px",
      "margin-left": "20px",
      "margin-bottom": "20px",
    },
    "h1": {
      "font-family": "Roboto",
      "font-size": "24px",
      "font-weight": "800",
      "margin-top": "50px"
    },
    "h3": {
      "font-family": "Roboto",
      "font-size": "16px",
      "font-weight": "800",
      "margin-top": "20px",
      "max-width": "500px"
    },
    "p": {
      "font-family": "Roboto",
      "font-size": "12px",
      "font-weight": "400",
      "margin-top": "2px",
      "max-width": "500px",
      "line-height": 1.5
    },
    "span": {
      "font-family": "Roboto",
      "font-size": "12px",
      "font-weight": "400",
      "margin-top": "0px"
    }
  }
};
