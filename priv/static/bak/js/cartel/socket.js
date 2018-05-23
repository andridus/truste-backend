
console.log("WINDOW PLAYER", window.PLAYER);

var room = new Phoenix.Socket("/socket", {params: {uid: window.PLAYER.uid}})
    room.connect()

var presences = {};
var presences1 = [];


var socket = new Phoenix.Socket("/jogo", {params: {userToken: window.PLAYER.uid, jogo: jogo_id}})
    socket.connect()

var channel = socket.channel("jogo:"+jogo_id, {uid: window.PLAYER.uid})
    channel.join()
     .receive("ok", function(resp){
     })
     .receive("error", ({reason}) => Alerta.info("Erro de Conexão", "Você não está mais conectado!") )
    



////COMECO DO PRESENCES

    channel.on("presence_state",function(state){
      
      if(window.jogo && jogo.criador == window.PLAYER.uid)
      {
        channel.push("sala", {sala: window.sala}, 10000)
      }
      
      presences = Phoenix.Presence.syncState(presences, state)
      var players1 = Object.keys(presences).map(function (key) { 
        presences[key].uid = key;
        return presences[key]; 
      });
      players1.forEach(function(x){
        var player = Jogadores.get(x.uid);
        if(!player){
          if(window.jogo && window.jogo.iniciado && jogo.criador != window.PLAYER.uid){
              channel.push("player_pull_out", {uid: x.uid}, 10000);
              return true;
          }
          var player = JogoFunctions.new_player(x.uid);
          player.meta = x.meta;
          player.jogo = jogo_id;
          if(x.uid == window.criador){
            player.criador = true;
          }
          Jogadores.override(player);
        }else{
          player.leave = true;
          Jogadores.override(player);
        }
      })

     });





     channel.on("presence_diff",function(diff){

      //ENVIA O JOGO CRIADO PARA A TELA INICIAL DO CARTEL
      if(window.jogo && jogo.criador == window.PLAYER.uid)
      {
        channel.push("sala", {sala: window.sala}, 10000)
      }


      // VERIFICA SE É O CRIADOR QUEM ESTÁ RECEBENDO
      if(typeof(criador) !="undefined" && criador == window.PLAYER.uid){
        //CONVERTE OS JOINS E OS LEAVES
        var joins = Object.keys(diff.joins).map(function (key) { 
          diff.joins[key].uid = key;
          return diff.joins[key]; 
        });
        var leaves = Object.keys(diff.leaves).map(function (key) { 
          diff.leaves[key].uid = key;
          return diff.leaves[key]; 
        });

        /////////


        ///ADICIONA OS NOVOS JOGADORES AO GRUPO DE JOGADORES
        joins.forEach(function(x){
          var player = Jogadores.get(x.uid);
          //VERIFICA SE O JOGADOR NÃO EXISTE
          if(!player){
            //VERIFICA SE O JOGO JÁ FOI INICIANDO, ENTÃO NINGUEM MAIS PODE ENTRAR
            if(window.jogo && window.jogo.iniciado && jogo.criador != window.PLAYER.uid){
              channel.push("player_pull_out", {uid: x.uid}, 10000);
              return true;
            }
            // COLOCANDO O JOGADOR NO JOGO ATUAL
            var player = JogoFunctions.new_player(x.uid);
            player.leave = false;
            player.jogo = jogo_id;
            //SE O JOGADOR FOR O CRIADOR ELE TEM UMA PROPRIEDADE DIZENDO ISSO
            if(x.uid == window.criador){
              player.criador = true;
            }else{
              //SE ELE NÃO FOR O CRIADOR ENTÃO ELE MANDA PARA O NOVO JOGADOR O ESTADO DO JOGO QUE ENTROU
              channel.push("state", {state: window.jogo, uid: x.uid}, 10000)  

            }
            //ADICIONA O JOGADOR AO GRUPO DE JOGADORES
            Jogadores.override(player);

          }else{
            //O JOGADOR JA EXISTE NA LISTA, ENTÃO SÓ MUDA A PROP JOGO DELE, E ATUALIZA
            player.jogo = jogo_id;
            player.leave = false;
            Jogadores.override(player);
            //ENVIA AO JOGADOR O ESTADO DO JOGO
            channel.push("state", {state: window.jogo, uid: x.uid}, 10000);
          }

        });


        //JOGADORES QUE DEIXARAM O JOGO
        leaves.forEach(function(x){
          //PEGA O JOGADOR
          var player = Jogadores.get(x.uid);
          if(player){//SE O JOGADOR EXISTIR
              if(window.jogo && !window.jogo.iniciado){ // VERIFICA SE O JOGO NÃO INICIOU
                Jogadores.pop(player); // EXCLUI O JOGADOR DA LISTA DE JOGADORES
              }else{
                //ATUALIZAD DADO DO JOGADOR
                player.jogo = jogo_id;
                player.leave = false;
                Jogadores.override(player);
                
              }
          }
        })
        //SE O JOGADOR FOR O CRIADOR, ENVIA LISTA DE JOGADOR PARA TODOS O JOGADORES
        if(jogo && jogo.criador == window.PLAYER.uid){
          console.log("ENVIA")
          channel.push("players", {players: Jogadores.getAll(jogo.uid)}, 10000)
        }
      }
     });


//// FIM DO PRESENCES

    ///Atualiza JOGADORES
      channel.on("players", function(resp){
        if(resp.players){
          if(jogo && jogo.criador != window.PLAYER.uid){
              console.log("RECEBE")
              Jogadores.overrideAll(resp.players)
            }
        }

     })

  //ESTOU PRONTO PARA A PARTIDA
      channel.on("estou_pronto", function(resp){
        console.log(resp)
         if(window.jogo != undefined){
            var player = Jogadores.get(resp.uid);
            player.pronto = resp.pronto;
            Jogadores.prop("pronto",player);
         }
       })
      channel.on("update_board", function(resp){
        console.log("UPDATE BOARD", resp)
         if(window.jogo != undefined){
            if(jogo.criador == window.PLAYER.uid){
              jogo._board = jogo.board;
            }
            jogo.board = resp.board
            projector.renderNow();
         }
       })

     channel.on("message_to_player#"+window.PLAYER.uid, function(resp){
          var players = Jogadores.getAll(jogo.uid)
           var from_uid = R.findIndex(R.propEq('uid', resp.from_uid))(players);
           if(from_uid != -1){
              var from = players[from_uid];
              var me_idx =R.findIndex(R.propEq('uid', window.PLAYER.uid))(players);
              players[me_idx].messages = players[me_idx].messages || [];
              players[me_idx].messages.push({from: from, msg: resp.msg, time: resp.time, viewed: false}); 
              projector.renderNow();

           }
           
          
       })
     channel.on("change_name", function(resp){
        //if(window.jogo && jogo.criador == window.PLAYER.uid)
           Jogadores.getAll(jogo.uid).forEach(function(p){
             if(p.uid == resp.uid && resp.uid != window.PLAYER.uid)
              p.nome = resp.nome
           })
           /*if(window.jogo && jogo.criador == window.PLAYER.uid)
            {
              save_model()
            }*/
          projector.renderNow();
       })
     channel.on("encerrar_jogo", function(resp){
         store.clearAll();
         window.location.reload();
       })
     channel.on("sala", function(resp){
       if(typeof criador =="undefined")
          {
            window.sala = resp.sala
          }
          projector.renderNow();
     })
     channel.on("vender_acoes", function(resp){
      var empresa = resp.empresa;
      var player = resp.player
          AlertaTiny.info("<p>O jogador  <b><img width='20'src='"+player.avatar+"'/>"+(player.nome||"Sem nome")+"</b> acabou de receber R$ <b>"+empresa.price+",00</b> pela venda de 1 ação da emrpesa <b><img width='20'src='"+empresa.icon+"'/> "+empresa.name+"</b>.", 0)
     })

     channel.on("falencia_vende_acoes_jogo", function(resp){
      var empresa = resp.empresa;
      var falencia = resp.falencia;
      var quid = resp.quid;

      //RESGATA O JOGADOR ATUAL
      var jogador_atual = Jogadores.getOnTurn();
      console.log(jogador_atual);
      if(jogador_atual.length>1){
        Alerta.danger("Erro!", "Não pode haver mais de dois jogadores jogando no mesmo turno");
        return ;
      }
      if(jogador_atual){
        var jogador = Jogadores.get(resp.player);
        if(jogador){
          var acoes = jogador.acoes.filter(function(a){
              return a.uid == falencia;
          });
          if(acoes.length){
            var empdx = R.findIndex(R.propEq("uid",falencia), jogo.empresas);
            var empresa_falencia = jogo.empresas[empdx];
            var din = empresa_falencia.price*acoes[0].acoes;

            AlertaCartel.confirm_user(jogador.uid, "Vender Ações","<p>Você tem "+acoes[0].acoes+" ações da empresa <b><img width='20'src='"+empresa_falencia.icon+"'/> "+empresa_falencia.name+"</b> que sofreu uma fusão com <b><img width='20'src='"+empresa.icon+"'/> "+empresa.name+"</b></p><p> Você deseja vender suas ações? o valor atual é <b>R$ "+din+"</b>", function(){
              if(jogador_atual.uid != jogador.uid){
                jogador.din += din;  
                jogador.acoes.splice(jogador.acoes.indexOf(acoes[0]),1);
              }
              
              
                channel.push("falencia_vende_acoes_jogo_question", {player: jogador_atual.uid,quid: quid, empresa: empresa, acoes: acoes[0].acoes})
                
              
              //JogoFunctions.jogada(jogador_atual.turn);
            }, function(){
              channel.push("falencia_vende_acoes_jogo_question", {player: jogador_atual.uid,quid: quid, empresa: "*", acoes: 0})
            })
             
          }
          
          
        }else{
          Alerta.danger("Erro","Não foi encontrado o Jogador!")        
        }
      }

      
      
     })
     channel.on("falencia_vende_acoes_jogo_question#"+window.PLAYER.uid, function(resp){
      var jogador = Jogadores.me();
      console.log("asdas dasd ", resp)
      if(jogador){
          var idx1 = R.findIndex(R.propEq('quid', resp.quid))(jogador.turn.outros_usuarios);
          jogador.turn.outros_usuarios[idx1].pendente = false;
          jogador.turn.outros_usuarios[idx1].acoes = resp.acoes;
          jogador.turn.outros_usuarios[idx1].empresa = resp.empresa == "*" ? null : resp.empresa;
          JogoFunctions.jogada(jogador.turn);

      }
      
     })
     channel.on("falencia_vende_acoes", function(resp){
      var empresa = resp.empresa;
      var falencia = resp.falencia;
      var jogadores = Jogadores.getAll(jogo.uid)
      var jogador = Jogadores.get(resp.player.uid)
      if(jogador){
        var acoes = jogador.acoes.filter(function(a){
            return a.uid == falencia.uid;
        });
        if(acoes.length){
          var din = falencia.price*acoes[0].acoes;

          
          
          var alertas = document.querySelectorAll(".alerta_tiny");
          if(empresa != "*"){
            AlertaCartel.confirm_user(jogador.uid, "Vender Ações","<p>Você tem "+acoes[0].acoes+" ações da empresa <b><img width='20'src='"+falencia.icon+"'/> "+falencia.name+"</b> que sofreu uma fusão com <b><img width='20'src='"+empresa.icon+"'/> "+empresa.name+"</b></p><p> Você deseja vender suas ações? a valor atual é R$ "+din, function(){
              jogador.din += din;  
              jogador.acoes.splice(jogador.acoes.indexOf(acoes[0]),1);
              channel.push("alerta_tiny", {a: "<p>A empresa <b><img width='20'src='"+falencia.icon+"'/> "+falencia.name+"</b> sofreu uma fusão com <b><img width='20'src='"+empresa.icon+"'/> "+empresa.name+"</b></p><p> O jogador <b><img width='20'src='"+jogador.avatar+"'/>"+(jogador.nome||"Sem nome")+"</b> vendeu suas "+acoes[0].acoes+" ações por R$ <b>"+din+"</b>"}, 10000);

            })
                 
          }
          else{
            jogador.din += din;  
            jogador.acoes.splice(jogador.acoes.indexOf(acoes[0]),1);
            channel.push("alerta_tiny", {a: "<p>FIM DE JOGO. A empresa <b><img width='20'src='"+falencia.icon+"'/> "+falencia.name+"</b> foi vendida!</p><p> O jogador <b><img width='20'src='"+jogador.avatar+"'/>"+(jogador.nome||"Sem nome")+"</b> recebeu R$ <b>"+din+"</b>"}, 10000);

          }
        }
        
        
      }else{
        Alerta.danger("Erro","Não foi encontrado o Jogador!")        
      }
      
     })

    channel.on("alerta_tiny", function(resp){
      var alertas = document.querySelectorAll(".alerta_tiny");
         AlertaTiny.info(resp.a);
         projector.renderNow();
        if(jogo && jogo.criador == window.PLAYER.uid){
          //save_model();
        }
   })
    channel.on("alerta_tiny#"+window.PLAYER.uid, function(resp){
      var alertas = document.querySelectorAll(".alerta_tiny");
         AlertaTiny.danger(resp.a);
         projector.renderNow();
        if(jogo && jogo.criador == window.PLAYER.uid){
          //save_model();
        }
   })
    channel.on("change_pic", function(resp){
          if(window.jogo != undefined){
         if(jogo && jogo.criador == window.PLAYER.uid){
            var players = Jogadores.getAll(jogo.uid);
           players.forEach(function(p){
               if(p.uid == resp.uid)
                p.avatar = resp.avatar;
             });
           save_model();
         }
         projector.renderNow()
         
         }
       })
     channel.on("state", function(resp){
        if(resp.state){
          if(resp.uid ==window.PLAYER.uid && resp.state.criador != window.PLAYER.uid){
              window.jogo = resp.state;
              window.projector.renderNow();
          }else if(resp.uid == "*" && resp.state.criador != window.PLAYER.uid){
            window.jogo = resp.state;
            window.projector.renderNow();
          }
        }

     })
     channel.on("finaliza_jogada", function(resp){
        console.log("SADSADAD ", resp)
        if(resp.state){
          if(resp.state.criador == window.PLAYER.uid){
              //window.jogo = resp.state;
              jogo.historico = jogo.historico || [];
              jogo.historico.push(resp.turn);
              var ordem = resp.player.ordem;
              var player = resp.player;
              var players = Jogadores.getAll(jogo.uid);
              console.log("sumiu", player.pieces.indexOf(resp.turn.peca));
              var idpc = -1;
              player.pieces.forEach(function(p,i){
                if(p.column == resp.turn.peca.column && p.row == resp.turn.peca.row)
                    idpc = i;

              })
              console.log(idpc)
                player.pieces.splice(idpc, 1);
                player.pieces.push(resp.turn.nova_peca)


              player.vez = false;
              var idx = R.findIndex(R.propEq("ordem",ordem+1), players);
              if(idx != -1){

                players[idx].vez = true;
                players[idx].alerta = false;

              }else{
                players[0].vez = true;
                players[0].alerta = false;
              }

              Jogadores.override(player);
              window.jogo = resp.state;
              window.projector.renderNow();
              save_model();
          }
        }

     })
     
    channel.on("fim_do_jogo", function(resp){
      console.log("FIM DO JOGO PUSH")
      Alerta.process("FIM DO JOGO", "<h3>O JOGO TERMINOU!</h3><p>Processando dados do jogo...</p> <p>Aguarde...</p>");
      if(jogo && jogo.criador == window.PLAYER.uid){
        save_model();
      }
      setTimeout(function(){
        Alerta.fechar();
        window.jogo.fim_do_jogo = true; 
        window.projector.renderNow();
        
      }, 10000)


     })
     channel.on("state_cliente", function(resp){
        if(resp.state){
          if(resp.state.criador == window.PLAYER.uid){
              window.jogo = resp.state;
              var p = resp.player;

              var player = Jogadores.get(p.uid)

              player = p;
              save_model();
          }
        }

     })
     
     
     
     
     channel.on("player_pull_out#"+window.PLAYER.uid, function(resp){
       store.clearAll();
       window.location.href="/";
     })
     channel.on("inicia_jogo", function(resp){
       if(window.jogo != undefined){
         if(jogo && jogo.criador == window.PLAYER.uid){
           window.jogo.iniciado = true;
           setTimeout(function(){
            save_model();
          }, 1000);
            
         }
         //projector.renderNow()
         
       }
     })
     channel.on("prepara_jogo", function(resp){
      if(window.jogo != undefined){
         if(jogo && jogo.criador == window.PLAYER.uid){
            window.sala.iniciado = true;
            base.push("sala", {sala: window.sala}, 10000)
           window.jogo.preparando = true;
           JogoFunctions.init()
           //save_model();
         }
         projector.renderNow()
         
       }
      })

     // $input.onEnter( e => {
     //   channel.push("new_msg", {body: e.target.val}, 10000)
        // .receive("ok", (msg) => console.log("created message", msg) )
        // .receive("error", (reasons) => console.log("create failed", reasons) )
        // .receive("timeout", () => console.log("Networking issue...") )
     // })
     
