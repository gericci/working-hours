/* Write working hours range in svg */

function creatRect(zX, zY, zW, zH, zColor, zSVG) {
  var svgNS = "http://www.w3.org/2000/svg";
  var zRect = document.createElementNS(svgNS,"rect");
  var zId = "rect-" + Math.floor(Math.random() * (900 - 10) + 5);

  zRect.setAttributeNS(null,"x", zX);
  zRect.setAttributeNS(null,"y", zY);
  zRect.setAttributeNS(null,"width", zW);
  zRect.setAttributeNS(null,"height", zH);
  zRect.setAttributeNS(null,"fill",zColor);
  zRect.setAttributeNS(null,"id",zId);

  zSVG.appendChild(zRect);

  return(zId);
}

window.onload = function transf() {
  if(document.getElementById('mySVG'))
    {
      if (document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Structure", "1.1")) {
      var svgNS = "http://www.w3.org/2000/svg";

      document.getElementById('the-canvas').style.display = 'block';

      var zFromEl = document.getElementById('timef');
      var zToEl = document.getElementById('timeto');
      var ztFromEl = document.getElementById('ttimef');
      var ztToEl = document.getElementById('ttimeto');
      var zFrom = zFromEl.getAttribute("data-value");
      var zTo = zToEl.getAttribute("data-value");
      var ztFrom = ztFromEl.getAttribute("data-value");
      var ztTo = ztToEl.getAttribute("data-value");
      var zSVG = document.getElementById('mySVG');

      var zPace = 240 / 24;

      var zTMZ1 = creatRect(30, 30, '240', 40, "#34839D", zSVG);
      var zTMZ2 = creatRect(30, 80, '240', 40, "#47C287", zSVG);

      for (var i = 0; i <= 24; i++) {
          creatRect((zPace * i)+30, 30, 1, 5, "#FFF", zSVG);
          if(i == Math.round(zFrom)) {
              var ztext = document.createElementNS(svgNS, "text");
              ztext.setAttributeNS(null, "x", (zPace * zFrom)+30);
              ztext.setAttributeNS(null, "y", 25);
              ztext.setAttribute("class", "from-h");
              zSVG.appendChild(ztext);
              ztext.textContent = zFromEl.innerHTML;
          }

          if(i == Math.round(zTo)) {
              var ztext = document.createElementNS(svgNS, "text");
              ztext.setAttributeNS(null, "x", (zPace * zTo)+30);
              ztext.setAttributeNS(null, "y", 25);
              zSVG.appendChild(ztext);
              ztext.textContent = zToEl.innerHTML;
          }

          if(i == Math.round(ztFrom)) {
              var ztext = document.createElementNS(svgNS, "text");
              ztext.setAttributeNS(null, "x", (zPace * zFrom)+30);
              ztext.setAttributeNS(null, "y", 165);
              ztext.setAttribute("class", "from-h");
              zSVG.appendChild(ztext);
              ztext.textContent = ztFromEl.innerHTML;
          }

          if(i == Math.round(ztTo)) {
              var ztext = document.createElementNS(svgNS, "text");
              ztext.setAttributeNS(null, "x", (zPace * zTo)+30);
              ztext.setAttributeNS(null, "y", 165);
              zSVG.appendChild(ztext);
              ztext.textContent = ztToEl.innerHTML;
          }

          var proot = (zTo - zFrom) * zPace;

      }

      var zRange = creatRect((zPace * zFrom)+30, 30, proot, 120, "rgba(255,255,255,.3)", zSVG);
    }
  }
};
