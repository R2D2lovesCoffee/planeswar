function Room(player1, player2){
    this.player1 = player1;
    this.player2 = player2;
    this.name = `${player1.id}_${player2.id}`;
}

Room.prototype.giveOpponent = (player)=>{
    if(player.id==this.player1.id)
        return this.player2
    if(player.id==this.player2.id)
        return this.player1;
}

module.exports = Room;
