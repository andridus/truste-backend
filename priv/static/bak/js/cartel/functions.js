var _jogadores = [];
var Jogadores = {
  me: function(){
    var idx = R.findIndex(R.propEq('uid', window.PLAYER.uid))(_jogadores);
    //console.warn("ME:", idx == -1 ? null : _jogadores[idx]);
    return idx == -1 ? null : _jogadores[idx]; 
  },

  get: function(uid){
    var idx = R.findIndex(R.propEq('uid', uid))(_jogadores);
    //console.warn("GET:", idx == -1 ? null : _jogadores[idx]);
    return idx == -1 ? null : _jogadores[idx];     
  },
  getOnTurn: function(){
    var idx = R.findIndex(R.propEq('vez', true))(_jogadores);
    //console.warn("GET:", idx == -1 ? null : _jogadores[idx]);
    return idx == -1 ? null : _jogadores[idx];     
  },
  getAll: function(jogo_id){
    //console.warn("GET ALL:", _jogadores, jogo_id);
    if(jogo_id)
    {
    
      return _jogadores.filter(function(x){ return x.jogo == jogo_id})
    
    }else{
    
      return _jogadores;  
    
    }
  },
  push: function(jogador){
    //console.warn("PUSH:", jogador);
    _jogadores.push(jogador);
    projector.renderNow();
  },
  pop: function(jogador){
    var idx = R.findIndex(R.propEq('uid', jogador.uid))(_jogadores);
    console.log(idx)
    if(idx!= -1){
      _jogadores.splice(idx, 1);  
      return true;
    }else{
      return false;
    }
    projector.renderNow();
  },
  override: function(jogador){
    var idx = R.findIndex(R.propEq('uid', jogador.uid))(_jogadores);
    //console.warn("OVERRIDE:", jogador);
    if(idx == -1){
      _jogadores.push(jogador);  
    }else{
      _jogadores[idx] = jogador;  
    }
    projector.renderNow();
    return jogador;
    
  },
  overrideAll: function(jogadores){
    //console.warn("OVERRIDEALL:", jogadores);
    _jogadores = jogadores;
    projector.renderNow();
    return _jogadores;
    
  },
  prop: function(prop, jogador){
    var idx = R.findIndex(R.propEq('uid', jogador.uid))(_jogadores);
    //console.warn("PROP:", prop, jogador);
    if(idx == -1){
      _jogadores.push(jogador);
      projector.renderNow();
      return jogador;
    }else{
      _jogadores[idx][prop] = jogador[prop];
      projector.renderNow();
      return _jogadores[idx][prop];
    }

    
  }
};