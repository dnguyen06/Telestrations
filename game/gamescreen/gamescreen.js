let vueMain;
let gameRoomCode = Cookies.get('roomCode');
let isLeader = Cookies.get('isLeader') === "true";
let socket = io();

window.onload = async () => {
  vueMain = new Vue({
    el: '#app',
    data: {
      playerList: [''],
      timers: [''],
      wordList: ['']
    },
    mounted() {
      this.getPlayerList();
      this.getTimeLimit();
      this.getWordList();
    },
    methods: {

      async getPlayerList() {
        return this.playerList = await getPlayersInRoom(gameRoomCode);
      },
      async getTimeLimit() {
        return this.timers = await getTimeLimit(gameRoomCode);
      },
      async getWordList() {
        return this.wordList = await getWordList();
      },
    }
  })

  //startGame();
}

Vue.component("timercomponent", {
  template: "#timer-component",
  props: ['value'],
});

Vue.component("playerlist", {
  template: "#player-list",
  props: ['name'],
});

let startButton = new Vue({
  el: "#startgame",
  data: {
    isLeader: false,
  },
});
startButton.isLeader = isLeader;

let pickedWord = false;

let assignWord = (word = vueMain.wordList[0].trim()) => {
  document.getElementById("selectedWord").innerHTML = word;
  socket.emit('wordChosen', { user: Cookies.get('username') });
  pickedWord = true;
  document.getElementById("overlay").style.display = "none";
}

socket.on("changedRound", data => {
  console.log('Changed round', data);
});

socket.on("connect", () => {
  // setPreviousBooks();
  socket.emit('gameConnect', { roomCode: gameRoomCode });
});

let changeRound = async () => {
  console.log('Round done');
  if (isLeader) {
    console.log('Changing round');
    let bookOwners = await getPlayersInRoom(gameRoomCode);
    socket.emit("roundChange", { gameRoomCode, bookOwners });
  }
};

socket.on("pickaword", function () {
  document.getElementById("overlay").style.display = "block";
});

socket.on("updateTimer", function (data) {
  if (data === "DRAW!") {
    if (!pickedWord) {
      assignWord();
    }
    console.log('Start drawing');
    document.getElementById("waitOverlay").style.display = "none";
  } else if (data === "Time's up") {
    changeRound();
  }
  document.getElementById("timer").innerHTML = data;
});

// start game called on click
async function startGame() {
  //Socket connects to the namespace of the gameroom
  document.getElementById("startgame").style.display = 'none';
  console.log('start game pressed');

  let rounds = await getRoomLimit(gameRoomCode);
  let drawLimit = await getTimeLimit(gameRoomCode);

  Promise.all([rounds, drawLimit]).then(() => {
    let roomInfo = {
      rounds,
      drawLimit,
      roomCode: gameRoomCode,
    };
    socket.emit('loadGame', roomInfo);
  });

  // var rounds = await getRoomLimit("GCWD");
  // console.log('Rounds after promise', rounds);
  // var drawLimit = await getTimeLimit("GCWD");
  // console.log('Draw limit after promise', drawLimit[0]);

  // let roomInfo = {};
  // let setObj = async function (maxRounds, drawTime) {
  //   roomInfo.maxRounds = maxRounds;
  //   roomInfo.drawTime = drawTime;
  // }
}

// async function getAsyncRoomLimit(roomCode) {
//   return await getRoomLimit();
// }

  //pickTimer();
/*
while (game_over != true) {

  if (round == roundLimit) {
      game_over = true;
  }
  pickWord(round);

  console.log(round);
    //pickWord();

  /* have people pick a word for 15 seconds */

/* draw for 50 seconds */

/* guess for 30 seconds */

