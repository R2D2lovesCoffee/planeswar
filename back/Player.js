function Player(id, nickname, mmr, winstreak, socketID, inGame){
    this.id = id;
    this.nickname = nickname;
    this.mmr = mmr;
    this.winstreak = winstreak;
    this.socketID = socketID;
    this.inGame=inGame;
}

module.exports = Player;