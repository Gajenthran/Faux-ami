import React, { useState, useEffect } from 'react'
import queryString from 'query-string'

import socket from '../../config/socket'

import Lobby from '../Lobby/Lobby'
import Profile from '../Profile/Profile'
import Game from '../Game/Game'
import Navbar from '../Navbar/Navbar'

const PROFILE_STATE = 0
const LOBBYSTATE = 1
const GAMESTATE = 2

const FauxAmi = ({ location }) => {
  const [gameState, setGameState] = useState({ users: [] })
  const [users, setUsers] = useState([])
  const [user, setUser] = useState({})
  const [lobbyChecked, setLobbyChecked] = useState(false)
  const [playState, setPlayState] = useState(LOBBYSTATE)

  const onFullscreen = () => {
    const elem = document.getElementById('game-board')

    // Firefox
    if (document.mozFullScreenEnabled) {
      if (!document.mozFullScreenElement) {
        elem.mozRequestFullScreen();
      } else {
        document.mozCancelFullScreen();
      }
    }

    if (document.fullscreenElement) {
      if (!document.fullscreenElement) {
        elem.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }

    // Safari
    if (document.webkitFullscreenEnabled) {
      if (!document.webkitFullscreenElement) {
        elem.webkitRequestFullscreen();
      } else {
        document.webkitExitFullscreen();
      }
    }

    // Edge
    if (document.msFullscreenEnabled) {
      if (!document.msFullscreenElement) {
        elem.msRequestFullscreen();
      } else {
        document.msExitFullscreen();
      }
    }
  }


  useEffect(() => {
    socket.on('lobby:create-response', ({ user }) => {
      setUser(user)
      setUsers([user])
      setPlayState(LOBBYSTATE)
    })
  })

  useEffect(() => {
    socket.on(
      'lobby:join-response-user',
      ({ user, users }) => {
        setUser(user)
        setUsers(users)
        setPlayState(LOBBYSTATE)
      }
    )
  }, [])

  useEffect(() => {
    socket.on('lobby:join-response-all', ({ users }) => {
      setUsers(users)
    })
  }, [])

  useEffect(() => {
    const { room } = queryString.parse(location.search)
    if (!lobbyChecked && room) {
      socket.emit('lobby:check', { room })
      socket.on('lobby:check-response', ({ error, roomExist, userExist }) => {
        if (error) window.location.href = '/'
        else {
          let state = null
          if (roomExist && userExist) state = LOBBYSTATE
          else state = PROFILE_STATE
          setPlayState(state)
          setLobbyChecked(true)
        }
      })
    }
  }, [location.search, lobbyChecked])

  useEffect(() => {
    socket.on('game:new-game', ({ users, gameState }) => {
      setUser(users.find((usr) => usr.id === socket.id))
      setUsers(users)
      setGameState(gameState)
      setPlayState(GAMESTATE)
    })
  }, [])

  useEffect(() => {
    socket.on('game:new-round', ({ users, gameState }) => {
      setUser(users.find((usr) => usr.id === socket.id))
      setUsers(users)
      setGameState(gameState)
    })
  }, [])

  useEffect(() => {
    socket.on('game:restart-response', () => {
      setPlayState(LOBBYSTATE)
    })
  }, [])

  useEffect(() => {
    socket.on('game:disconnect', ({ users, gameState }) => {
      setUsers(users)
      if(gameState)
        setGameState((prevGameState) => ({ ...prevGameState, ...gameState }))
    })
  }, [])

  useEffect(() => {
    socket.on('game:end-game', ({ users }) => {
      setUsers(users)
      setUser(users.find((user) => user.id === socket.id))
    })
  }, [])
  

  useEffect(() => {
    socket.on('game:choose-card-response', ({ users, gameState }) => {
      setUsers(users)
      setUser(users.find((user) => user.id === socket.id))
      setGameState((prevGameState) => ({ ...prevGameState, ...gameState }))
      setTimeout(() => {
        socket.emit("game:update")        
      }, 1000);
    })
  }, [])

  useEffect(() => {
    socket.on('game:end-turn', ({ gameState }) => {
      setGameState((prevGameState) => ({ ...prevGameState, ...gameState }))
    })
  }, [])

  useEffect(() => {
    socket.on('game:end-round', ({ gameState }) => {
      setGameState((prevGameState) => ({ ...prevGameState, ...gameState }))
    })
  }, [])

  useEffect(() => {
    socket.on('game:vote-response', ({ users }) => {
      setUsers(users)
      setUser(users.find((user) => user.id === socket.id))
    })
  }, [])

  useEffect(() => {
    socket.on('game:confirm-vote-response', ({ users }) => {
      setUsers(users)
      setUser(users.find((user) => user.id === socket.id))
    })
  }, [])

  useEffect(() => {
    socket.on('game:end-vote', ({ users }) => {
      setUsers(users)
      setUser(users.find((user) => user.id === socket.id))
    })
  }, [])

  return (
    <>
      {playState !== GAMESTATE && <Navbar />}
      {playState === PROFILE_STATE ? (
        <Profile location={location} />
      ) : playState === LOBBYSTATE ? (
        <Lobby location={location} user={user} users={users} />
      ) : playState === GAMESTATE ? (
        <Game
          socket={socket}
          user={user}
          users={users}
          gameState={gameState}
          onFullscreen={onFullscreen}
        />
      ) : null}
    </>
  )
}

export default FauxAmi
