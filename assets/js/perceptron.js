// 原点を通る超平面に限定したほうが良さそう…
// scaleを合わせないとまともに学習できなさそう
(function() {
  var width = 940, height = 540;
  var svg = d3.select("#svgArea").attr({
    width: width, height: height, style: "background-color: whitesmoke;"
  });
  svg.append("line").attr({
    stroke: "tomato",
    "stroke-width": 3,
    x1: 0, y1: height/2, x2: width, y2: height/2
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

  svg.on("click", function() {
    var mode = null;
    var position = d3.mouse(this);
    datasets.push({
      klass: klass,
      fv: [100.0, position[0], position[1]]
    });
    svg.selectAll("circle").data(datasets).enter()
      .append("circle").attr({
        cx: function(d, i) {
          return d.fv[1];
        },
        cy: function(d, i) {
          return d.fv[2];
        },
        r: function(d, i) {
          return 15;
        },
        fill: function(d, i) {
          return colors[d.klass - 1];
        }
      });
  });

  var perceptron = {
    eta: 0.1,
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

  d3.select("#button-clear").on("click", function() {
    // http://stackoverflow.com/questions/1232040/empty-an-array-in-javascript
    datasets = [];
    svg.selectAll("circle").remove();
    perceptron.clear();
    svg.select("line").attr({
      x1: 0, y1: height/2, x2: width, y2: height/2
    });
  });

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
    w[0] *= 100.0;
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
        y1: -w[0] / w[2],
        x2: 0,
        y2: -w[0] / w[2]
      };
    }
    if(w[2] == 0) {
      return {
        x1: -w[0] / w[1],
        y1: 0,
        x2: -w[0] / w[1],
        y2: 0
      };
    }
    var y1 = -w[0]/w[2];
    var y2 = -(w[1]*width + w[0])/w[2];
    return {
      x1: 0,
      y1: y1,
      x2: width,
      y2: y2
    };
  };

  var render = function() {
    var p = getPoints();
    svg.select("line").attr({
      x1: p.x1, y1: p.y1, x2: p.x2, y2: p.y2
    });
  };

  d3.select("#button-gt").on("click", function() {
    learn();
    render();
    console.log(perceptron.weight);
    var ok = 0;
    for(var i = 0; i < datasets.length; i++){
      var fv = datasets[i].fv;
      if(datasets[i].klass == 1 && perceptron.predict(fv) > 0) ok++;
      if(datasets[i].klass == 2 && perceptron.predict(fv) < 0) ok++;
    }
    console.log("ok = " + ok);
  });

})();