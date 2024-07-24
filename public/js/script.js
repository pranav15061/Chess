const socket = io();

const chess = new Chess();

const boardElement = document.querySelector(".chessboard");
const head = document.querySelector("#currentMove");
let color=chess.turn()==="w"?"white":"black"
head.innerText = `Current Move: ${color}`;
// head.innerText=`${chess.turn()}`

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderboard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";

  board.forEach((row, rowindex) => {
    row.forEach((square, squareindex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        (rowindex + squareindex) % 2 === 0 ? "light" : "dark"
      );

      squareElement.dataset.row = rowindex;
      squareElement.dataset.col = squareindex;

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceElement.innerText = getPieceUnicode(square);
        pieceElement.draggable = playerRole === square.color;

        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { row: rowindex, col: squareindex };
            e.dataTransfer.setData("text/plain", "");
          }
        });

        pieceElement.addEventListener("dragend", (e) => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      squareElement.addEventListener("drop", (e) => {
        e.preventDefault();

        if (draggedPiece) {
          const targetSource = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
          };

          handleMove(sourceSquare, targetSource);
        }
      });

      boardElement.appendChild(squareElement);
    });
  });

  if (playerRole === "b") {
    boardElement.classList.add("flipped");
  } else {
    boardElement.classList.remove("flipped");
  }
};

const handleMove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
    promotion: "q",
  };

  socket.emit("move", move);
};

const getPieceUnicode = (piece) => {
  const chessPieces = {
    p: "♙", //  Pawn
    r: "♜", //   Rook
    n: "♞", //   Knight
    b: "♝", //   Bishop
    q: "♛", //   Queen
    k: "♚", //   King
  };

  return chessPieces[piece.type] || "";
};

socket.on("playerRole", (role) => {
  playerRole = role;
  let color=playerRole==="w"?"white":"black"
  renderboard();
  alert(`New player Joined with color: ${color}`)
});

socket.on("spectatorRole", () => {
  playerRole = null;
  renderboard();
  alert(`New player Joined as Spectator:`)
});

socket.on("boardState", (fen) => {
  chess.load(fen);
  renderboard();
});

socket.on("move", (move) => {
  chess.move(move);
  renderboard();

  // head.innerText=`${chess.turn()}`
   let color=chess.turn()==="w"?"white":"black"
  head.innerText = `Current Move: ${color}`;

});

// socket.emit("invalidMove", move);
socket.on("invalidMove", (move) => {
  alert(`Invalid move ${move.from} to ${move.to}`);
  console.log(move);
  // return
});

renderboard();

