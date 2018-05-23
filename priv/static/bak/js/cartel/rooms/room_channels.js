var RoomChannels ={

  choose_pic: function (ev){
    var sala = ev.target.item;
    AlertaCartel.choose_pic(function(img){
      sala.emblema = img;
     // channel.push("change_pic",{avatar: img, uid: player.uid }, 10000)
     projector.renderNow();

    }, "/images/emblems/emblem", 14)
  },
  change_title: function (ev){
    var item = ev.target.item;
    item.title = ev.target.value;
  },
  change_max: function (ev){
    var item = ev.target.item;
    item.max = ev.target.value;
  },
  nova_sala: function (ev){
    window.nova_sala = {uid: uid(10), max: 6, player_id: window.PLAYER.uid,room: window.salas.length, title: "sem título "+window.salas.length, players: [], emblema: "/images/emblems/no-image.png"}
    
  },
  criar: function (ev){
    
    window.nova_sala.players.push(window.PLAYER);
    window.salas.push(window.nova_sala);
    save_salas();
    window.location.href="/jogo/"+window.PLAYER.uid+"/"+ window.nova_sala.uid
    store.set("sala", window.nova_sala)
  },
  enter_room: function (e){
    console.log(e)
    var sala = e.target.sala;
    if(sala){
      sala.players.push(window.PLAYER);
      save_salas();
      if(sala.player_id == window.PLAYER.uid){
        window.location.href="/jogo/"+window.PLAYER.uid+"/"+ sala.uid
      }else{
        window.location.href="/jogo/"+ sala.uid
      }
      
    }else{
      Alerta.danger("Error","Não é possível entrar nessa sala")
    }
    
  },
  remover: function (ev){
    window.nova_sala = null;
  },
  remover_da_lista: function (ev){
    var item = ev.target.item;
    
    Alerta.confirm("Remover Sala", "Tem certeza de que deseja remover essa sala?", function(){
      var s = window.salas.indexOf(item);
      console.log(s);
      window.salas.splice(s, 1); 
      save_salas();
    })
    

  }
  

}
