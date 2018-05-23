// for phoenix_html support, including form and button helpers
// copy the following scripts into your javascript bundle:
// * https://raw.githubusercontent.com/phoenixframework/phoenix_html/v2.10.0/priv/static/phoenix_html.js
function uid(len) {
  len = len || 7;
  return Math.random().toString(35).substr(2, len);
}
function getTimeInterval(startTime, endTime){
    var start = moment(startTime);
    var end = moment(endTime);
    console.log(start, end)
    return moment.duration(end.diff(start)).humanize(true);

}

function detectmob() {
 if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
 ){
    return true;
  }
 else {
    return false;
  }
}

String.prototype.removeAccents = function(){
 return this
         .replace(/[áàãâä]/gi,"a")
         .replace(/[éè¨ê]/gi,"e")
         .replace(/[íìïî]/gi,"i")
         .replace(/[óòöôõ]/gi,"o")
         .replace(/[úùüû]/gi, "u")
         .replace(/[ç]/gi, "c")
         .replace(/[ñ]/gi, "n")
         .replace(/[^a-zA-Z0-9]/g," ");
}
__site_state__ = {
  new_users: trkl(0),
  outra: trkl(0)
}
SHOTGUN.listen('notifications/new_users', function (op,qtd, u) {
  var u = JSON.parse(u);
  console.log(qtd, op, u)
  if(op=="+"){
    AlertaTiny.info("Novo usuário!");
    __site_state__.new_users(__site_state__.new_users()+parseInt(qtd));
  };
  if(op=="-"){
    if(u.a)
      AlertaTiny.info("Usuário <b>"+u.nome+"</b> ACEITO com sucesso por <i>"+u.admin+"</i>.");
    else
      AlertaTiny.info("Usuário <b>"+u.nome+"</b> RECUSADO com sucesso por <i>"+u.admin+"</i>.");
    __site_state__.new_users(__site_state__.new_users()-parseInt(qtd));
  };



});

__site_state__.new_users.subscribe(function(new_value){
  var dom = document.getElementById("notification_new_users");
  var soma = document.getElementById("notification_new_users_soma");
  if(dom){
    if(new_value)
      dom.innerText = "("+new_value+")";
    else
      dom.innerText = "";

  }
  if(soma){

    if(new_value+__site_state__.outra())
      soma.innerText = "("+(new_value+__site_state__.outra())+")";
    else {
      soma.innerText = "";
    }
  }
});
