(function(window, document, undefined) {
  "use strict";

  var desk = document.getElementById("backgammon"),
      points = [].slice.call(desk.querySelectorAll(".point")),
      checkers = [].slice.call(document.getElementsByClassName("checker")),
      randNums = [],
      isWhiteMoves = true,
      draggedEle = null,
      btnStart = document.getElementById("btnStart"),
      btnRoll = document.getElementById("btnRoll"),
      btnChangeColor = document.getElementById("btnChangeColor"),
      movesLeft = document.getElementById("movesLeft"),
      turnOf = document.getElementById("turnOf"),
      jail = document.getElementById("jail"),
      colorPicker = document.getElementById("colorPicker"),
      colorOptions = document.getElementById("colorOptions"),
      btnCloseColorPicker = document.getElementById("btnCloseColorPicker"),
      selectedColors = { white: null, black: null };

  btnStart.addEventListener("click", startTimer);
  btnRoll.addEventListener("click", roll);
  btnChangeColor.addEventListener("click", showColorPicker);
  btnCloseColorPicker.addEventListener("click", hideColorPicker);

  function move() {
    // Implement game move logic here
  }

  function roll(e) {
    if (typeof roll.id === "undefined") {
        roll.id = 0;
        points.forEach(function(ele) {
            ele.addEventListener("dragover", handleDragOver);
            ele.addEventListener("dragenter", handleDragEnter);
            ele.addEventListener("dragleave", handleDragLeave);
            ele.addEventListener("drop", handleDrop);
        });

        checkers.forEach(function(ele) {
            ele.draggable = true;
            ele.addEventListener("dragstart", handleDragStart);
            ele.addEventListener("dragend", handleDragEnd);
        });
    }

    if (roll.id !== 0) {
        isWhiteMoves = !isWhiteMoves;
    }

    toggleDraggability(isWhiteMoves);
    this.disabled = true;

    rollDice();
    showNumbers();
    roll.id++;

    if (!hasAvailableMoves(isWhiteMoves)) {
        randNums.length = 0;
        this.disabled = false;
    }
  }

  function hasAvailableMoves(type) {
    return points.some(function(p) {
        var t = type ? "white" : "black",
            e = p.firstElementChild,
            from = +p.dataset.id,
            to1 = 0,
            to2 = 0;

        if (type) {
            to1 = from + randNums[0];
            to2 = from + randNums[1];
        } else {
            to1 = from - randNums[0];
            to2 = from - randNums[1];
        }

        if (e != null && e.dataset.type === t &&
            ((to1 > 0 && to1 < 25) || (to2 > 0 && to2 < 25))) {
            var target = getPoint(points, to1);
            if (target &&
                (target.childElementCount === 0 ||
                    target.childElementCount === 1 ||
                    (target.firstElementChild &&
                        target.firstElementChild.dataset.type === t)
                )) {
                return true;
            }

            target = getPoint(points, to2);
            if (target &&
                (target.childElementCount === 0 ||
                    target.childElementCount === 1 ||
                    (target.firstElementChild &&
                        target.firstElementChild.dataset.type === t)
                )) {
                return true;
            }
        }
        return false;
    });
  }

  function start() {
    getStarter();
    showNumbers(true);
  }

  function getPoint(points, id) {
    var p = null;
    points.forEach(function(v) {
        if (+v.dataset.id === id) {
            p = v;
        }
    });
    return p;
  }

  function showNumbers(isStart) {
    movesLeft.firstElementChild.innerHTML = randNums[0];
    movesLeft.lastElementChild.innerHTML = randNums[1];
    if (isStart) {
        turnOf.innerHTML = isWhiteMoves ? "White starts!" : "Black starts!";
        randNums.length = 0;
    } else if (roll.id > 0) {
        turnOf.innerHTML = isWhiteMoves ? "White moves!" : "Black moves!";
    }
  }

  function startTimer(e) {
    if (typeof startTimer.i === "undefined") {
        startTimer.i = 5;
    }

    btnStart.textContent = startTimer.i--;

    if (startTimer.i < 5) {
        [].forEach.call(document.querySelectorAll(".hidden"), function(ele) {
            ele.classList.remove("hidden");
        });
        btnStart.classList.add("hidden");
        start();
    } else {
        setTimeout(startTimer, 1000);
    }
  }

  function validate(type, from, to, n) {
    return ((isWhiteMoves && from > to && (from - to) === n) ||
        (!isWhiteMoves && from < to && (to - from) === n));
  }

  function toggleDraggability(isWhite) {
    checkers.forEach(function(c) {
        if ((c.dataset.type === "white" && isWhite) ||
            (c.dataset.type === "black" && !isWhite)) {
            c.removeEventListener("dragstart", handleDragStartDisabler);
            c.addEventListener("dragstart", handleDragStart);
        } else {
            c.addEventListener("dragstart", handleDragStartDisabler);
            c.removeEventListener("dragstart", handleDragStart);
        }
    });
  }

  function handleDragStartDisabler(e) {
    e.preventDefault();
    return false;
  }

  function handleDragEnd(e) {
    this.style.opacity = 1;
    points.forEach(function(ele) {
        if (ele.classList.contains("over")) {
            ele.classList.remove("over");
        }
    });
  }

  function handleDrop(e) {
    e.stopPropagation();
    var parent = draggedEle.parentNode,
        i;

    if (jail.childElementCount > 0 && draggedEle.parentNode != jail && jail.querySelector('[data-type="' + draggedEle.dataset.type + '"]')) {
        return false;
    }

    if (parent != this &&
        ((draggedEle.dataset.type === "black" &&
                +parent.dataset.id > +this.dataset.id) ||
    (draggedEle.dataset.type === "white" &&
        +parent.dataset.id < +this.dataset.id))) {
        i = randNums.indexOf(Math.abs(parent.dataset.id - this.dataset.id));
        if (i > -1) {
            if (this.querySelector('[data-type="' + draggedEle.dataset.type + '"]') != null || this.childElementCount === 0) {
                pickNum(i);
                this.appendChild(draggedEle);
            } else if (this.childElementCount === 1) {
                jail.appendChild(this.firstElementChild);
                pickNum(i);
                this.appendChild(draggedEle);
            }
        }
    } else if (parent === jail) {
        i = randNums.indexOf(this.dataset.id < 7 ? +this.dataset.id : 6 - (this.dataset.id % 6) + 1);
        if (this.dataset.home !== draggedEle.dataset.type && i > -1) {
            if (this.querySelector('[data-type="' + draggedEle.dataset.type + '"]') != null || this.childElementCount === 0) {
                pickNum(i);
                this.appendChild(draggedEle);
            } else if (this.childElementCount === 1) {
                jail.appendChild(this.firstElementChild);
                pickNum(i);
                this.appendChild(draggedEle);
            }
        }
    }

    if (randNums.length === 0) {
        btnRoll.disabled = false;
    }

    return false;
  }

  function handleDragLeave(e) {
    if (this.classList.contains("over")) {
        this.classList.remove("over");
    }
  }

  function handleDragEnter(e) {
    // Optional: Implement visual feedback for dragging over a point
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  function handleDragStart(e) {
    this.style.opacity = "0.4";
    draggedEle = this;
  }

  function getStarter() {
    var toss = {
        white: getRandom(),
        black: getRandom()
    };

    if (toss.white === toss.black) {
        getStarter();
    } else {
        isWhiteMoves = toss.white > toss.black;
        randNums.push(toss.white, toss.black);
    }
  }

  function rollDice() {
    while (randNums.length < 2) {
        randNums.push(getRandom());
        if (randNums[0] === randNums[1]) {
            randNums.push.apply(randNums, randNums);
        }
    }
  }

  function pickNum(i) {
    var n = randNums[i];
    randNums.splice(i, 1);
    return n;
  }

  function getRandom() {
    return Math.floor(Math.random() * 6 + 1);
  }

  function showColorPicker() {
    colorPicker.classList.remove("hidden");
    populateColorOptions();
  }

  function hideColorPicker() {
    colorPicker.classList.add("hidden");
    selectedColors = { white: null, black: null }; // Reset selected colors when hiding the picker
  }

  function populateColorOptions() {
    colorOptions.innerHTML = '';
    var colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];
    colors.forEach(function(color) {
        var div = document.createElement('div');
        div.classList.add('color-option');
        div.style.backgroundColor = color;
        div.addEventListener('click', function() {
            if (!selectedColors.white) {
                selectColor(color, 'white');
            } else if (!selectedColors.black) {
                selectColor(color, 'black');
            }
        });
        colorOptions.appendChild(div);
    });
  }

  function selectColor(color, type) {
    selectedColors[type] = color;
    if (selectedColors.white && selectedColors.black) {
        changeCheckerColors(selectedColors.white, selectedColors.black);
    }
  }

  function changeCheckerColors(whiteColor, blackColor) {
    checkers.forEach(function(checker) {
        if (checker.dataset.type === 'white') {
            checker.style.backgroundColor = whiteColor;
        } else if (checker.dataset.type === 'black') {
            checker.style.backgroundColor = blackColor;
            
        }
    });
    hideColorPicker();
  }

})(window, document);
