defmodule CartelWeb.PageController do
  use CartelWeb, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
  def jogo_criador(conn, %{"uid"=>uid, "jogo" => jogo}) do
    render conn, "criador.html", jogo: jogo, uid: uid
  end
  def jogo(conn, %{"jogo" => jogo}) do
    render conn, "jogo.html", jogo: jogo
  end
  def uid(conn, _params) do
   
    json conn, %{uid: ""}
  end
end
