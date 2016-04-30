var parser = new Parser();
var $ = _;
$.get("public/demo/input.txt", function (response) {
  response = parser.parse(response);
  var body = response.children[0];
  parser.render(body, {x: 0, y: 0}, function (coords, o, h, l, i) {
    var x = 10 + l + (coords.x || 0);
    var y = h + (coords.y || 0);

    var height = sheet.text(o.text, x, y, STYLE.tags[o.type]);
    console.log(new Date() * 1);
    return height;
  });

});
