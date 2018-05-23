defmodule CartelWeb.Presence do
  use Phoenix.Presence, otp_app: :cartel,
                        pubsub_server: Cartel.PubSub
end