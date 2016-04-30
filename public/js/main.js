var parser = new Parser();
var $ = _;
$.get("public/demo/stocks.txt", function (response) {
  response = parser.parse(response);
  var body = response;

  console.log(response);

  parser.render(body, {x: 0, y: 0}, function (coords, o, h, l, style) {
    var x = l + (coords.x || 0);
    var y = h + (coords.y || 0);

    var height = sheet.text(o.text, x, y, style);
    console.log(new Date() * 1);
    return height;
  });
});
