(function() {
  var width = 940, height = 540;
  var svg = d3.select("svg").attr({
    width: width, height: height, style: "background-color: whitesmoke;"
  });
  var klass = 1;
  var colors = ["#51a351", "#f89406"];
  var datasets = [];

  d3.selectAll("#klass-selector-group button").on("click", function() {
    var id = d3.select(this).attr('id');
    if (id == "klass-selector-1") {
      klass = 1;
    }
    else if (id == "klass-selector-2") {
      klass = 2;
    }
    else {
      console.dir(this);
    }
  });

  var addDatum = function(klass, point) {
    datasets.push({
      klass: klass,
      fv: [1.0, 1.0 * point[0] / width, 1.0 * point[1] / height]
    });
    svg.selectAll("circle").data(datasets).enter()
      .append("circle").attr({
        cx: function(d, i) {
          return d.fv[1]*width;
        },
        cy: function(d, i) {
          return d.fv[2]*height;
        },
        r: function(d, i) {
          return 15;
        },
        fill: function(d, i) {
          return colors[d.klass - 1];
        }
      });
  };

  svg.on("click", function() {
    var position = d3.mouse(this);
    addDatum(klass, position);
  });

  var perceptron = {
    eta: 1.0,
    weight: [0.0, 0.0, 0.0],
    index: 0,
    clear: function() {
      weight = [0.0, 0.0, 0.0];
      index = 0;
    },
    predict: function(fv) {
      return fv[0]*this.weight[0] + fv[1]*this.weight[1] + fv[2]*this.weight[2];
    },
    fit: function(fv) {
      if(this.predict(fv) <= 0) {
        this.weight[0] += this.eta * fv[0];
        this.weight[1] += this.eta * fv[1];
        this.weight[2] += this.eta * fv[2];
      }
    }
  };

  var clearDatasets = function() {
    // http://stackoverflow.com/questions/1232040/empty-an-array-in-javascript
    datasets = [];
    svg.selectAll("circle").remove();
    perceptron.clear();
    svg.select("line").remove();
  };

  d3.select("#button-clear").on("click", clearDatasets);

  var learn = function() {
    if(datasets.length == 0) return;
    perceptron.index %= datasets.length;
    var fv = datasets[perceptron.index].fv.concat();
    if(datasets[perceptron.index].klass == 2) {
      fv[0] *= -1;
      fv[1] *= -1;
      fv[2] *= -1;
    }
    perceptron.fit(fv);
    perceptron.index++;
  };

  var getPoints = function() {
    var w = perceptron.weight.concat();
    if(w[1] == 0 && w[2] == 0) {
      return {
        x1: 0,
        y1: height / 2,
        x2: width,
        y2: height / 2
      };
    }
    if(w[1] == 0) {
      return {
        x1: 0,
        y1: -w[0] / w[2] * height,
        x2: width,
        y2: -w[0] / w[2] * height
      };
    }
    if(w[2] == 0) {
      return {
        x1: -w[0] / w[1] * width,
        y1: 0,
        x2: -w[0] / w[1] * width,
        y2: height
      };
    }
    var y1 = -w[0] / w[2];
    var y2 = -(w[1] + w[0]) / w[2];
    return {
      x1: 0,
      y1: y1*height,
      x2: width,
      y2: y2*height
    };
  };

  var render = function() {
    var p = getPoints();
    if (svg.select("line").empty()) {
      svg.append("line");
    }
    svg.select("line").attr({
      stroke: "tomato",
      "stroke-width": 4,
      x1: p.x1, y1: p.y1, x2: p.x2, y2: p.y2
    });
  };

  d3.select("#button-gt").on("click", function() {
    learn();
    render();
  });

  d3.select("#button-gtgt").on("click", function() {
    for(var c = 0; c < datasets.length * 100; c++) {
      learn();
      render();
      var flag = true
      for(var i = 0; i < datasets.length; i++) {
        if(datasets[i].klass == 1 && perceptron.predict(datasets[i].fv) < 0) {
          flag = false;
          break;
        }
        if(datasets[i].klass == 2 && perceptron.predict(datasets[i].fv) > 0) {
          flag = false;
          break;
        }
      }
      if(flag) {
        break;
      }
    }
  });

  d3.select("#button-random").on("click", function() {
    clearDatasets();
    var centerx = Math.floor(Math.random() * width);
    var centery = Math.floor(Math.random() * height);
    var theta = Math.random() * Math.PI;
    var px = Math.cos(theta);
    var py = Math.sin(theta);
    for(var i = 0; i < 50; i++) {
      var x = Math.floor(Math.random() * width);
      var y = Math.floor(Math.random() * height);
      var dx = x - centerx;
      var dy = y - centery;
      var sgn = px * dy - py * dx;
      var k;
      if(sgn >= 0) {
        k = 1;
      }
      else {
        k = 2;
      }
      addDatum(k, [x, y]);
    }
  });

})();
