defmodule CartelWeb.Router do
  use CartelWeb, :router

  pipeline :browser do
    
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug CORSPlug, origin: ["http://localhost:3000"]
    plug :accepts, ["json"]
  end

  scope "/api", CartelWeb do
    pipe_through :api # Use the default browser stack

    get "/uid", PageController, :uid
  end

  scope "/", CartelWeb do
    pipe_through :browser # Use the default browser stack

    get "/jogo/:uid/:jogo", PageController, :jogo_criador
    get "/jogo/:jogo", PageController, :jogo
    get "/", PageController, :index
  end

  # Other scopes may use custom stacks.
  # scope "/api", CartelWeb do
  #   pipe_through :api
  # end
end
