import React, { useEffect, useState } from 'react'
import RangeSlider from 'react-bootstrap-range-slider'
import { Link, Redirect } from 'react-router-dom'

import socket from './../../config/socket'

import 'rc-slider/assets/index.css';

import './Lobby.css'
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css'

/**
 * Lobby component to manage the game options and
 * start the game.
 *
 * @param {object} lobbyUsers - lobby users
 * @param {string} [lobbyUsers.name] - username
 * @param {string} [lobbyUsers.room] - user room
 * @param {array} users - others users in the room
 */
const Lobby = ({ user, users }) => {
  const [nbPlayer, setNbPlayer] = useState(users.length || 4)
  const [nbKeywords, setNbKeywords] = useState(3)
  const [countdown, setCountdown] = useState(45)
  const [nbTurn, setNbTurn] = useState(2)
  const [nbRound, setNbRound] = useState(2)
  const [invitedMessage, setInvitedMessage] = useState(false)

  useEffect(() => {
    socket.on('lobby:create-response', ({ user }) => {
      if (user === undefined || !(user.roomId || user.name)) 
        return <Redirect to="/" />
    })
  })

  /**
   * Start the game and emit options game to the server.
   *
   * @param {object} event - event
   */
  const startGame = () => {
    socket.emit('game:start', { 
      nbPlayer, nbKeywords, 
      countdown, nbTurn, nbRound
    })
  }

  const copyToClipboard = (e) => {
    navigator.clipboard.writeText(window.location.href)
    e.target.focus()
    setInvitedMessage(true)
    setTimeout(() => {
      setInvitedMessage(false)
    }, 2000);
  }

  /**
   * Render all users in the lobby.
   */
  const renderUsers = () => {
    return (
      <div className="lobby-users-list">
        <h3> JOUEURS ({users.length}) </h3>
          <div className="lobby-users--list-row">
            <div className="lobby-users--infos-list" key={socket.id}>
              <div className="lobby-users--name">
                <img src={user.img} alt="avatar" />
                {user.name}
              </div>
            </div>
            {users.map((user) =>
              user.id !== socket.id && (
                <div className="lobby-users--infos-list" key={user.id}>
                  <div className="lobby-users--name">
                    <img src={user.img} alt="avatar" />
                    {user.name}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
    )
  }

  /**
   * Render game options.
   */
  const renderOptions = () => {
    return (
      <div className="lobby-users-options">
        <h3> OPTIONS </h3>
        <div className="lobby-users-options-list">
          <div className="lobby-users-options-element">
            <h6> JOUEURS max. dans une partie</h6>
            <RangeSlider
              min={4}
              max={6}
              value={nbPlayer}
              onChange={(e) => setNbPlayer(Number(e.target.value))}
            />
          </div>
          <div className="lobby-users-options-element">
            <h6> nombre de MOTS CLEFS </h6>
            <RangeSlider
              min={2}
              max={6}
              value={nbKeywords}
              onChange={(e) => setNbKeywords(Number(e.target.value))}
            />
          </div>
          <div className="lobby-users-options-element">
            <h6> TEMPS DE PAROLE (en seconde) </h6>
            <RangeSlider
              min={3}
              max={300}
              value={countdown}
              onChange={(e) => setCountdown(Number(e.target.value))}
            />
          </div>
          <div className="lobby-users-options-element">
            <h6> nombre d'ENQUÊTES </h6>
            <RangeSlider
              min={2}
              max={5}
              value={nbRound}
              onChange={(e) => setNbRound(Number(e.target.value))}
            />
          </div>
          <div className="lobby-users-options-element">
            <h6> TOURS DE TABLE pour une enquête</h6>
            <RangeSlider
              min={1}
              max={3}
              value={nbTurn}
              onChange={(e) => setNbTurn(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="lobby-screen">
        {user ? (
          <div className="div-lobby">
            <Link to={'/'}>
              <h3 className="lobby--title"> Faux-Ami </h3>
            </Link>
            <div className="lobby--container">
              {renderOptions()}
              {renderUsers()}
            </div>

            <div className="lobby-start-game">
              <button onClick={(e) => startGame(e)}> LANCER LA PARTIE </button>
              <button 
                className="lobby--invite-btn"
                onClick={(e) => copyToClipboard(e)}> 
                INVITER {invitedMessage && <span> copié </span>}
              </button>
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </>
  )
}

export default Lobby
