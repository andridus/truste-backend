var InicialChannels ={

  choose_pic: function (ev){
    AlertaCartel.choose_pic(function(img){
      var player = Jogadores.me();
      player.avatar = img;
      channel.push("change_pic",{avatar: img, uid: player.uid }, 10000)

    }, "/images/players/player", 16)
  },
  chutar_usuario: function(ev){
    var item = ev.target.item;
    var jogador = Jogadores.get(item.uid)
    Jogadores.pop(jogador);
    channel.push("player_pull_out", {uid: item.uid}, 10000);
  },
  change_name: function (ev){
    var item = ev.target.item;
    var value = ev.target.value;
    var player = Jogadores.me();
    player.nome = value;
    channel.push("change_name",{nome: value, uid: item.uid }, 10000)  
  },
  estou_pronto: function (ev){
    var item = ev.target.item;
    //window.players[pidx].pronto = item.pronto ? false : true ;
    channel.push("estou_pronto",{uid: item.uid, pronto: item.pronto ? false : true }, 10000)
  },
  prepara_jogo: function (ev){
    var item = ev.target.item;
    channel.push("prepara_jogo",{ uid: item.uid }, 10000)
  },
  inicia_jogo: function (ev){
    var item = ev.target.item;
    channel.push("inicia_jogo",{ uid: item.uid }, 10000)
  }

}
