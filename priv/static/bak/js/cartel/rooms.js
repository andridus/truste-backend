console.log("WINDOW PLAYER", window.PLAYER);

var socket = new Phoenix.Socket("/socket", {params: {uid: window.PLAYER.uid}})
    socket.connect()

var presences = {};
var base = socket.channel("base", {uid: window.PLAYER.uid})
    
    /*setInterval(function(){
      channel.push("estou_vivo", {uid: window.PLAYER.uid, timestamp: moment().unix()}, 10000)
    },8000);*/
    
     base.on("base_entrou", function(resp){
          //AlertaTiny.info("Entrou jogador #"+resp.player.uid)
        
     })
     base.on("presence_state",function(state){
      presences = Phoenix.Presence.syncState(presences, state)
      Object.keys(presences).map(function (key) {
        presences[key].uid = key;
        Jogadores.override(presences[key]);
      });
     });
     base.on("presence_diff",function(diff){
      presences = Phoenix.Presence.syncDiff(presences, diff);
      Object.keys(presences).map(function (key) { 
        presences[key].uid = key;
        Jogadores.override(presences[key]); 
      });
     });
     base.on("salas", function(resp){
        window.salas = resp.salas;
        //store.set("salas", window.salas);
        window.projector.renderNow();

       })
     base.on("sala", function(resp){
      var idx = R.findIndex(R.propEq('uid', resp.sala.uid))(window.salas);
        if(idx == -1){
          window.salas.push(resp.sala)
        }else{
          window.salas[idx].iniciado = resp.sala.iniciado;
        }
        window.projector.renderNow();

       })
     base.on("sala_out", function(resp){
      console.log(resp)
      var idx = R.findIndex(R.propEq('uid', resp.sala.uid))(window.salas);
        if(idx != -1){
          window.salas.splice(idx, 1)
        }
        window.projector.renderNow();

       })
   base.join()
     .receive("ok", function(resp){
      if(typeof player == "function")
       window.PLAYER = player(resp.player.uid);

     })
     .receive("error", ({reason}) => Alerta.info("Erro de Conexão", "Você não está mais conectado!") )
